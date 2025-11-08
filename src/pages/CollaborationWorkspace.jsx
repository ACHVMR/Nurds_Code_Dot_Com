import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Users, Video, VideoOff, Mic, MicOff, MonitorUp, Share2, 
  MessageSquare, Settings, UserPlus, ChevronRight, Save,
  Play, Loader, CheckCircle, AlertCircle
} from 'lucide-react';

export default function CollaborationWorkspace() {
  const { projectId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const wsRef = useRef(null);

  // Project state
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  // Collaboration state
  const [cursors, setCursors] = useState({}); // Other users' cursor positions
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);

  // Video state
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [videoParticipants, setVideoParticipants] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    if (projectId && user) {
      loadProject();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId, user]);

  const loadProject = async () => {
    try {
      const [projectRes, membersRes, filesRes] = await Promise.all([
        fetch(`${apiBase}/api/collaboration/projects/${projectId}`),
        fetch(`${apiBase}/api/collaboration/projects/${projectId}/members`),
        fetch(`${apiBase}/api/collaboration/projects/${projectId}/files`)
      ]);

      const projectData = await projectRes.json();
      const membersData = await membersRes.json();
      const filesData = await filesRes.json();

      setProject(projectData);
      setMembers(membersData);
      setFiles(filesData);

      if (filesData.length > 0) {
        loadFile(filesData[0]);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = `wss://your-worker.workers.dev/api/collaboration/ws/${projectId}?user_id=${user.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        type: 'join',
        user_id: user.id,
        user_name: user.fullName
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'code_change':
        if (message.user_id !== user.id && message.file_id === activeFile?.id) {
          setCode(message.code);
        }
        break;

      case 'cursor_move':
        if (message.user_id !== user.id) {
          setCursors(prev => ({
            ...prev,
            [message.user_id]: {
              line: message.line,
              column: message.column,
              user_name: message.user_name
            }
          }));
        }
        break;

      case 'chat_message':
        setChatMessages(prev => [...prev, message]);
        break;

      case 'member_join':
        setMembers(prev => [...prev, message.member]);
        break;

      case 'member_leave':
        setMembers(prev => prev.filter(m => m.user_id !== message.user_id));
        setCursors(prev => {
          const updated = { ...prev };
          delete updated[message.user_id];
          return updated;
        });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const loadFile = async (file) => {
    setActiveFile(file);
    setCode(file.content || '');
    setLanguage(file.language || 'javascript');
  };

  const handleCodeChange = (value) => {
    setCode(value || '');
    
    // Send code change to other users
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'code_change',
        file_id: activeFile?.id,
        code: value,
        user_id: user.id
      }));
    }
  };

  const handleCursorChange = (position) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_move',
        line: position.lineNumber,
        column: position.column,
        user_id: user.id,
        user_name: user.fullName
      }));
    }
  };

  const saveFile = async () => {
    if (!activeFile) return;

    setSaving(true);
    try {
      await fetch(`${apiBase}/api/collaboration/files/${activeFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: code,
          updated_by: user.id
        })
      });
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const message = {
      type: 'chat_message',
      user_id: user.id,
      user_name: user.fullName,
      message: chatInput,
      timestamp: new Date().toISOString()
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      setChatMessages(prev => [...prev, message]);
      setChatInput('');
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    // Implement actual video SDK integration here (Daily.co, Agora, etc.)
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // Implement actual audio SDK integration here
  };

  const toggleScreenShare = () => {
    setScreenSharing(!screenSharing);
    // Implement screen sharing here
  };

  const inviteMember = async (email, role, billingType) => {
    try {
      const response = await fetch(`${apiBase}/api/collaboration/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          inviter_user_id: user.id,
          invitee_email: email,
          role,
          billing_type: billingType
        })
      });

      const data = await response.json();
      alert('Invitation sent!');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#E68961] mx-auto mb-4" />
          <p className="text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">{project?.name || 'Untitled Project'}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{members.length} members</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Video Controls */}
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-lg transition-colors ${
              videoEnabled ? 'bg-[#E68961] text-black' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg transition-colors ${
              audioEnabled ? 'bg-[#E68961] text-black' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-2 rounded-lg transition-colors ${
              screenSharing ? 'bg-[#E68961] text-black' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
            title={screenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-zinc-700 mx-2"></div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#E68961] text-black rounded-lg hover:bg-[#D4A05F] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Invite</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">FILES</h2>
            <div className="space-y-1">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => loadFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeFile?.id === file.id
                      ? 'bg-zinc-800 text-white'
                      : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">TEAM MEMBERS</h2>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.user_id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E68961]"></div>
                  <span className="text-sm text-gray-300">{member.user_id}</span>
                  {member.verified && (
                    <CheckCircle className="w-3 h-3 text-[#E68961]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{activeFile?.filename || 'No file selected'}</span>
              {activeFile && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="capitalize">{language}</span>
                </>
              )}
            </div>

            <button
              onClick={saveFile}
              disabled={saving || !activeFile}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#E68961] text-black text-sm font-medium rounded-lg hover:bg-[#D4A05F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleCodeChange}
              onMount={(editor) => {
                editorRef.current = editor;
                
                // Track cursor position
                editor.onDidChangeCursorPosition((e) => {
                  handleCursorChange(e.position);
                });
              }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                lineNumbers: 'on',
                wordWrap: 'on',
                formatOnPaste: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
              }}
            />

            {/* Other users' cursors */}
            {Object.entries(cursors).map(([userId, cursor]) => (
              <div
                key={userId}
                className="absolute pointer-events-none"
                style={{
                  // Position based on cursor.line and cursor.column
                  // This is simplified - actual implementation needs editor coordinates
                }}
              >
                <div className="flex items-center gap-1 bg-[#E68961] text-black text-xs px-2 py-1 rounded">
                  {cursor.user_name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col">
            <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4">
              <h2 className="font-semibold text-sm">Team Chat</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#E68961]">{msg.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E68961]"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-4 py-2 bg-[#E68961] text-black rounded-lg hover:bg-[#D4A05F] transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={inviteMember}
        />
      )}
    </div>
  );
}

// Invite Modal Component
function InviteModal({ onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [billingType, setBillingType] = useState('daily');

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite(email, role, billingType);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E68961]"
              placeholder="colleague@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E68961]"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Billing Type</label>
            <select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value)}
              className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E68961]"
            >
              <option value="daily">Daily ($1/day)</option>
              <option value="monthly">Monthly (discounted)</option>
            </select>
          </div>

          <div className="bg-zinc-800 rounded-lg p-3 text-sm text-gray-400">
            <p className="mb-1">💡 <strong>Pricing:</strong></p>
            <p>• Daily: $1.00/day per member</p>
            <p>• Monthly: Save up to 56% with 5+ members</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#E68961] text-black font-medium rounded-lg hover:bg-[#D4A05F] transition-colors"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
