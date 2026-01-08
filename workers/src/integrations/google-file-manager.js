/**
 * Google File Manager Integration
 * 
 * Purpose: Memory & Context Repository for II-Agents
 * - Stores: Documents, sessions, decision logs, code versions
 * - Retrieves: Context for multi-turn conversations
 * - Benefit: Agents remember what they did (Flight Recorder)
 * 
 * Uses Google Drive API for persistent storage
 */

// ============================================================
// TYPE DEFINITIONS
// ============================================================

/**
 * @typedef {Object} FileManagerConfig
 * @property {string} folderId - Root folder ID for all NURDS files
 * @property {Object} credentials - Google service account credentials
 */

/**
 * @typedef {Object} SessionContext
 * @property {string} sessionId
 * @property {string} userId
 * @property {Object} state - Current execution state
 * @property {Array} decisions - Decision log
 * @property {Array} artifacts - Generated artifacts
 * @property {string} timestamp
 */

// ============================================================
// GOOGLE FILE MANAGER CLASS
// ============================================================

export class GoogleFileManager {
  constructor(config = {}) {
    this.folderId = config.folderId || null;
    this.credentials = config.credentials || null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.initialized = false;
  }

  /**
   * Initialize the file manager
   */
  async initialize(config) {
    if (config) {
      this.folderId = config.folderId;
      this.credentials = config.credentials;
    }

    if (!this.credentials) {
      console.warn('Google credentials not provided - using in-memory fallback');
      this.useInMemoryFallback = true;
      this.memoryStore = new Map();
      this.initialized = true;
      return;
    }

    // Get access token
    await this.refreshAccessToken();
    this.initialized = true;
  }

  /**
   * Refresh OAuth2 access token using service account
   */
  async refreshAccessToken() {
    if (!this.credentials) return;

    const now = Date.now();
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    // Create JWT for service account
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/drive',
      aud: 'https://oauth2.googleapis.com/token',
      iat: Math.floor(now / 1000),
      exp: Math.floor(now / 1000) + 3600
    };

    // Note: In production, use proper JWT signing with private key
    // For Workers, use Web Crypto API
    const jwt = await this.signJWT(header, payload, this.credentials.private_key);

    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = now + (data.expires_in * 1000) - 60000; // 1 min buffer

    return this.accessToken;
  }

  /**
   * Sign JWT with RSA private key (Web Crypto API)
   */
  async signJWT(header, payload, privateKeyPem) {
    const encoder = new TextEncoder();
    
    // Base64URL encode
    const base64url = (obj) => {
      const json = JSON.stringify(obj);
      const base64 = btoa(json);
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const headerB64 = base64url(header);
    const payloadB64 = base64url(payload);
    const message = `${headerB64}.${payloadB64}`;

    // Import private key
    const pemContents = privateKeyPem
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const key = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      encoder.encode(message)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${message}.${signatureB64}`;
  }

  /**
   * Make authenticated request to Google Drive API
   */
  async driveRequest(path, options = {}) {
    if (this.useInMemoryFallback) {
      throw new Error('Google Drive not available - using in-memory fallback');
    }

    await this.refreshAccessToken();

    const url = `https://www.googleapis.com/drive/v3${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Drive API error: ${error.error?.message || response.statusText}`);
    }

    return response;
  }

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  /**
   * Save document to Google Drive (or fallback)
   */
  async saveDocument(name, content, mimeType = 'text/plain', metadata = {}) {
    if (this.useInMemoryFallback) {
      const id = crypto.randomUUID();
      this.memoryStore.set(id, {
        id,
        name,
        content,
        mimeType,
        metadata,
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString()
      });
      return id;
    }

    // Create file metadata
    const fileMetadata = {
      name,
      mimeType,
      parents: [this.folderId],
      properties: metadata
    };

    // Multipart upload
    const boundary = '-------' + crypto.randomUUID();
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(fileMetadata),
      `--${boundary}`,
      `Content-Type: ${mimeType}`,
      '',
      content,
      `--${boundary}--`
    ].join('\r\n');

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body
    });

    const data = await response.json();
    return data.id;
  }

  /**
   * Get document from Google Drive (or fallback)
   */
  async getDocument(fileId) {
    if (this.useInMemoryFallback) {
      const file = this.memoryStore.get(fileId);
      return file?.content || null;
    }

    const response = await this.driveRequest(`/files/${fileId}?alt=media`);
    return await response.text();
  }

  /**
   * List all documents in folder
   */
  async listDocuments(query = {}) {
    if (this.useInMemoryFallback) {
      return Array.from(this.memoryStore.values()).map(f => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        createdTime: f.createdTime,
        modifiedTime: f.modifiedTime
      }));
    }

    let q = `'${this.folderId}' in parents and trashed=false`;
    if (query.nameContains) {
      q += ` and name contains '${query.nameContains}'`;
    }

    const response = await this.driveRequest(
      `/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,createdTime,modifiedTime,properties)`
    );

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Update document content
   */
  async updateDocument(fileId, content, mimeType = 'text/plain') {
    if (this.useInMemoryFallback) {
      const file = this.memoryStore.get(fileId);
      if (file) {
        file.content = content;
        file.modifiedTime = new Date().toISOString();
      }
      return fileId;
    }

    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': mimeType
      },
      body: content
    });

    const data = await response.json();
    return data.id;
  }

  /**
   * Delete document
   */
  async deleteDocument(fileId) {
    if (this.useInMemoryFallback) {
      return this.memoryStore.delete(fileId);
    }

    await this.driveRequest(`/files/${fileId}`, { method: 'DELETE' });
    return true;
  }

  // ============================================================
  // SESSION CONTEXT (Flight Recorder)
  // ============================================================

  /**
   * Save session context
   */
  async saveSessionContext(sessionId, context) {
    const fileName = `session-${sessionId}-context.json`;
    const content = JSON.stringify({
      ...context,
      sessionId,
      savedAt: new Date().toISOString()
    }, null, 2);

    // Check if session file exists
    const existing = await this.findSessionFile(sessionId);
    
    if (existing) {
      return await this.updateDocument(existing.id, content, 'application/json');
    }

    return await this.saveDocument(fileName, content, 'application/json', {
      type: 'session-context',
      sessionId
    });
  }

  /**
   * Get session context
   */
  async getSessionContext(sessionId) {
    const file = await this.findSessionFile(sessionId);
    if (!file) return null;

    const content = await this.getDocument(file.id);
    return JSON.parse(content);
  }

  /**
   * Find session file by session ID
   */
  async findSessionFile(sessionId) {
    const files = await this.listDocuments({ nameContains: `session-${sessionId}` });
    return files.find(f => f.name === `session-${sessionId}-context.json`);
  }

  /**
   * Append to session log (Flight Recorder pattern)
   */
  async appendToSessionLog(sessionId, entry) {
    const context = await this.getSessionContext(sessionId) || {
      sessionId,
      log: [],
      createdAt: new Date().toISOString()
    };

    context.log.push({
      ...entry,
      timestamp: new Date().toISOString()
    });

    return await this.saveSessionContext(sessionId, context);
  }

  // ============================================================
  // DECISION LOG
  // ============================================================

  /**
   * Log a decision for audit trail
   */
  async logDecision(sessionId, decision) {
    return await this.appendToSessionLog(sessionId, {
      type: 'decision',
      decision: decision.description,
      rationale: decision.rationale,
      alternatives: decision.alternatives,
      impact: decision.impact,
      agent: decision.agent || 'unknown'
    });
  }

  /**
   * Get all decisions for a session
   */
  async getDecisions(sessionId) {
    const context = await this.getSessionContext(sessionId);
    if (!context?.log) return [];

    return context.log.filter(entry => entry.type === 'decision');
  }

  // ============================================================
  // ARTIFACT STORAGE
  // ============================================================

  /**
   * Save an artifact (code, spec, etc.)
   */
  async saveArtifact(sessionId, artifact) {
    const fileName = `artifact-${sessionId}-${artifact.name}`;
    const mimeType = this.getMimeType(artifact.type);

    const fileId = await this.saveDocument(
      fileName,
      typeof artifact.content === 'string' 
        ? artifact.content 
        : JSON.stringify(artifact.content, null, 2),
      mimeType,
      {
        type: 'artifact',
        sessionId,
        artifactType: artifact.type
      }
    );

    // Link artifact to session
    await this.appendToSessionLog(sessionId, {
      type: 'artifact',
      name: artifact.name,
      artifactType: artifact.type,
      fileId
    });

    return fileId;
  }

  /**
   * Get MIME type for artifact type
   */
  getMimeType(artifactType) {
    const mimeTypes = {
      'code': 'text/plain',
      'spec': 'application/json',
      'markdown': 'text/markdown',
      'json': 'application/json',
      'html': 'text/html',
      'css': 'text/css',
      'javascript': 'application/javascript',
      'typescript': 'application/typescript'
    };
    return mimeTypes[artifactType] || 'text/plain';
  }

  // ============================================================
  // SEARCH & RETRIEVAL
  // ============================================================

  /**
   * Search documents by tag/property
   */
  async searchByTag(tag, value) {
    if (this.useInMemoryFallback) {
      return Array.from(this.memoryStore.values())
        .filter(f => f.metadata?.[tag] === value);
    }

    const q = `'${this.folderId}' in parents and properties has { key='${tag}' and value='${value}' }`;
    const response = await this.driveRequest(
      `/files?q=${encodeURIComponent(q)}&fields=files(id,name,properties)`
    );

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Get recent sessions
   */
  async getRecentSessions(limit = 10) {
    const files = await this.listDocuments({ nameContains: 'session-' });
    
    return files
      .filter(f => f.name.endsWith('-context.json'))
      .sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime))
      .slice(0, limit);
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let fileManagerInstance = null;

export function getFileManager(config) {
  if (!fileManagerInstance) {
    fileManagerInstance = new GoogleFileManager(config);
  }
  return fileManagerInstance;
}

// ============================================================
// WORKER INTEGRATION
// ============================================================

/**
 * Initialize file manager in worker context
 */
export async function initializeFileManager(env) {
  const config = {
    folderId: env.GOOGLE_DRIVE_FOLDER_ID,
    credentials: env.GOOGLE_CREDENTIALS 
      ? JSON.parse(env.GOOGLE_CREDENTIALS) 
      : null
  };

  const fileManager = getFileManager(config);
  await fileManager.initialize(config);
  
  return fileManager;
}

/**
 * Middleware to inject file manager
 */
export function withFileManager(handler) {
  return async (request, env, ctx) => {
    const fileManager = await initializeFileManager(env);
    request.fileManager = fileManager;
    return handler(request, env, ctx);
  };
}
