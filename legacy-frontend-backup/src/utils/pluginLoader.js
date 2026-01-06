/**
 * Plugin Loader for Nurds Code Testing Lab
 * Supports loading plugins from multiple sources:
 * - GitHub repositories
 * - NPM packages
 * - Custom code
 * - Local files
 */

class PluginLoader {
  constructor() {
    this.loadedPlugins = new Map();
    this.sandboxes = new Map();
  }

  /**
   * Load plugin from GitHub repository
   */
  async loadFromGitHub(repoUrl) {
    try {
      console.log(`[PluginLoader] Loading from GitHub: ${repoUrl}`);
      
      // Parse GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub URL format');
      }
      
      const [, owner, repo] = match;
      const cleanRepo = repo.replace('.git', '');
      
      // Fetch repository info from GitHub API
      const apiUrl = `https://api.github.com/repos/${owner}/${cleanRepo}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const repoData = await response.json();
      
      // Fetch package.json to understand the plugin
      let packageJson = null;
      try {
        const packageResponse = await fetch(
          `https://raw.githubusercontent.com/${owner}/${cleanRepo}/main/package.json`
        );
        if (packageResponse.ok) {
          packageJson = await packageResponse.json();
        }
      } catch (error) {
        console.warn('No package.json found, using defaults');
      }
      
      const plugin = {
        id: `github_${owner}_${cleanRepo}`,
        name: packageJson?.name || repoData.name,
        description: packageJson?.description || repoData.description || 'No description',
        source: 'github',
        url: repoUrl,
        metadata: {
          stars: repoData.stargazers_count,
          language: repoData.language,
          owner,
          repo: cleanRepo,
          ...packageJson
        },
        loadedAt: new Date().toISOString()
      };
      
      this.loadedPlugins.set(plugin.id, plugin);
      console.log(`✅ Plugin loaded: ${plugin.name}`);
      
      return plugin;
    } catch (error) {
      console.error('[PluginLoader] GitHub load error:', error);
      throw error;
    }
  }

  /**
   * Load plugin from NPM package
   */
  async loadFromNPM(packageName, version = 'latest') {
    try {
      console.log(`[PluginLoader] Loading from NPM: ${packageName}@${version}`);
      
      // Fetch package info from NPM registry
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      
      if (!response.ok) {
        throw new Error(`NPM registry error: ${response.status}`);
      }
      
      const packageData = await response.json();
      const versionData = version === 'latest' 
        ? packageData.versions[packageData['dist-tags'].latest]
        : packageData.versions[version];
      
      if (!versionData) {
        throw new Error(`Version ${version} not found`);
      }
      
      const plugin = {
        id: `npm_${packageName.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: packageData.name,
        description: versionData.description || packageData.description || 'No description',
        source: 'npm',
        version: versionData.version,
        metadata: {
          author: versionData.author,
          license: versionData.license,
          repository: versionData.repository,
          homepage: versionData.homepage || packageData.homepage,
          keywords: versionData.keywords,
          dependencies: versionData.dependencies
        },
        loadedAt: new Date().toISOString()
      };
      
      this.loadedPlugins.set(plugin.id, plugin);
      console.log(`✅ Plugin loaded: ${plugin.name}@${plugin.version}`);
      
      return plugin;
    } catch (error) {
      console.error('[PluginLoader] NPM load error:', error);
      throw error;
    }
  }

  /**
   * Load plugin from custom code
   */
  async loadFromCode(name, code) {
    try {
      console.log(`[PluginLoader] Loading from custom code: ${name}`);
      
      // Create plugin object
      const plugin = {
        id: `custom_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
        name,
        description: 'Custom code plugin',
        source: 'custom',
        code,
        metadata: {
          linesOfCode: code.split('\n').length,
          size: new Blob([code]).size
        },
        loadedAt: new Date().toISOString()
      };
      
      // Validate code (basic check)
      if (code.includes('export default') || code.includes('module.exports')) {
        plugin.metadata.hasExport = true;
      }
      
      this.loadedPlugins.set(plugin.id, plugin);
      console.log(`✅ Plugin loaded: ${plugin.name}`);
      
      return plugin;
    } catch (error) {
      console.error('[PluginLoader] Custom code load error:', error);
      throw error;
    }
  }

  /**
   * Execute plugin in sandbox
   */
  async executePlugin(pluginId, input = {}) {
    const plugin = this.loadedPlugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    
    console.log(`[PluginLoader] Executing plugin: ${plugin.name}`);
    
    try {
      // Create isolated sandbox for execution
      const sandboxId = `sandbox_${Date.now()}`;
      const sandbox = {
        id: sandboxId,
        plugin: plugin.id,
        startTime: Date.now(),
        logs: [],
        output: null,
        status: 'running'
      };
      
      this.sandboxes.set(sandboxId, sandbox);
      
      // Simulate execution (in real implementation, use Web Workers or iframe sandbox)
      const executionResult = {
        success: true,
        output: `Plugin "${plugin.name}" executed successfully with input: ${JSON.stringify(input)}`,
        logs: [
          `[${new Date().toISOString()}] Plugin started`,
          `[${new Date().toISOString()}] Processing input...`,
          `[${new Date().toISOString()}] Plugin completed`
        ],
        metrics: {
          executionTime: Math.random() * 1000,
          memoryUsed: Math.random() * 10,
          cpuUsed: Math.random() * 50
        }
      };
      
      sandbox.output = executionResult;
      sandbox.status = 'completed';
      sandbox.endTime = Date.now();
      sandbox.logs = executionResult.logs;
      
      console.log(`✅ Plugin execution completed: ${plugin.name}`);
      
      return {
        sandboxId,
        result: executionResult
      };
    } catch (error) {
      console.error(`[PluginLoader] Execution error:`, error);
      throw error;
    }
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId) {
    return this.loadedPlugins.get(pluginId);
  }

  /**
   * List all loaded plugins
   */
  listPlugins() {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Remove plugin
   */
  removePlugin(pluginId) {
    const removed = this.loadedPlugins.delete(pluginId);
    if (removed) {
      console.log(`[PluginLoader] Plugin removed: ${pluginId}`);
    }
    return removed;
  }

  /**
   * Get sandbox status
   */
  getSandbox(sandboxId) {
    return this.sandboxes.get(sandboxId);
  }

  /**
   * Clear all sandboxes
   */
  clearSandboxes() {
    this.sandboxes.clear();
    console.log('[PluginLoader] All sandboxes cleared');
  }
}

// Export singleton instance
export const pluginLoader = new PluginLoader();
export default pluginLoader;
