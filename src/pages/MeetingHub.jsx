import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Video, Users, Calendar, ExternalLink, Copy, CheckCircle, Loader } from 'lucide-react';

export default function MeetingHub() {
  const { user } = useUser();
  const [userTier, setUserTier] = useState('free');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('zoom'); // 'zoom' or 'teams'

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Demo mode
      setLoading(false);
      setUserTier('free');
      setMeetings([]);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Get user tier
      const tierResponse = await fetch(`${apiBase}/api/user/tier/${user?.id || 'demo'}`);
      const tierData = await tierResponse.json();
      setUserTier(tierData.tier || 'free');

      // Load meeting history
      const meetingsResponse = await fetch(`${apiBase}/api/meetings/history/${user?.id || 'demo'}`);
      const meetingsData = await meetingsResponse.json();
      setMeetings(meetingsData.meetings || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-[#E68961]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Permanent Marker, cursive' }}>
            Meeting Hub
          </h1>
          <p className="text-gray-400">
            Host and join Zoom sessions or Microsoft Teams meetings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Platform Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('zoom')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'zoom'
                ? 'bg-[#2D8CFF] text-white'
                : 'bg-zinc-900 text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-5 h-5" />
            Zoom
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'teams'
                ? 'bg-[#5B5FC7] text-white'
                : 'bg-zinc-900 text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            Microsoft Teams
          </button>
        </div>

        {/* Content */}
        {activeTab === 'zoom' ? (
          <ZoomPanel userTier={userTier} userId={user.id} />
        ) : (
          <TeamsPanel userTier={userTier} userId={user.id} />
        )}

        {/* Meeting History */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
          {meetings.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No meetings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Zoom Panel Component
function ZoomPanel({ userTier, userId }) {
  const [meetingNumber, setMeetingNumber] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [hosting, setHosting] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  const joinMeeting = async () => {
    if (!meetingNumber) {
      alert('Please enter a meeting number');
      return;
    }

    setJoining(true);
    try {
      // Get Zoom SDK token
      const response = await fetch(`${apiBase}/api/zoom/sdk-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          meetingNumber,
          role: 'participant'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Initialize Zoom SDK
        window.location.href = `/zoom/join?meeting=${meetingNumber}&token=${data.token}`;
      } else {
        alert(data.error || 'Failed to join meeting');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
      alert('Failed to join meeting');
    } finally {
      setJoining(false);
    }
  };

  const hostMeeting = async () => {
    if (userTier === 'free') {
      alert('Pro tier required to host meetings. Please upgrade your account.');
      return;
    }

    setHosting(true);
    try {
      // Create new meeting
      const response = await fetch(`${apiBase}/api/zoom/create-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topic: 'NURDSCODE Collaboration Session',
          duration: 60
        })
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = `/zoom/host?meeting=${data.meetingNumber}&token=${data.token}`;
      } else {
        alert(data.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
      alert('Failed to create meeting');
    } finally {
      setHosting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Join Meeting Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Join a Meeting</h3>
        <p className="text-sm text-gray-400 mb-4">
          Enter a meeting ID to join an existing session
        </p>

        <input
          type="text"
          value={meetingNumber}
          onChange={(e) => setMeetingNumber(e.target.value)}
          placeholder="123 456 7890"
          className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#2D8CFF]"
        />

        <button
          onClick={joinMeeting}
          disabled={joining || !meetingNumber}
          className="w-full bg-[#2D8CFF] text-white font-semibold py-3 rounded-lg hover:bg-[#2D8CFF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {joining ? 'Joining...' : 'Join Meeting'}
        </button>
      </div>

      {/* Host Meeting Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Host a Meeting</h3>
          {userTier === 'free' && (
            <span className="text-xs px-2 py-1 bg-yellow-400/10 text-yellow-400 rounded">
              Pro Required
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Start an instant meeting and invite your team
        </p>

        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
          <div className="text-xs text-gray-400 mb-2">Features:</div>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-[#E68961]">✓</span>
              HD video and audio
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#E68961]">✓</span>
              Screen sharing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#E68961]">✓</span>
              Recording {userTier === 'enterprise' ? '(Unlimited)' : '(30 days)'}
            </li>
          </ul>
        </div>

        <button
          onClick={hostMeeting}
          disabled={hosting || userTier === 'free'}
          className="w-full bg-[#E68961] text-black font-semibold py-3 rounded-lg hover:bg-[#D4A05F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hosting ? 'Creating...' : 'Start Meeting'}
        </button>

        {userTier === 'free' && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Upgrade to Pro ($29.99/mo) to host meetings
          </p>
        )}
      </div>
    </div>
  );
}

// Teams Panel Component
function TeamsPanel({ userTier, userId }) {
  const [meetingLink, setMeetingLink] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  const createTeamsMeeting = async () => {
    if (userTier !== 'enterprise') {
      alert('Enterprise tier required for Microsoft Teams integration. Please contact sales.');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${apiBase}/api/teams/create-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject: 'NURDSCODE Collaboration Session',
          startDateTime: new Date().toISOString(),
          endDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMeetingLink(data.joinUrl);
      } else {
        alert(data.error || 'Failed to create Teams meeting');
      }
    } catch (error) {
      console.error('Failed to create Teams meeting:', error);
      alert('Failed to create Teams meeting');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Microsoft Teams Meeting</h3>
        {userTier !== 'enterprise' && (
          <span className="text-xs px-2 py-1 bg-purple-400/10 text-purple-400 rounded">
            Enterprise Only
          </span>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Create a Teams meeting with full enterprise features including recording and compliance
      </p>

      {meetingLink ? (
        <div className="space-y-4">
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Meeting Link:</span>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 text-sm text-[#E68961] hover:underline"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="text-sm text-white break-all">{meetingLink}</div>
          </div>

          <button
            onClick={() => window.open(meetingLink, '_blank')}
            className="w-full flex items-center justify-center gap-2 bg-[#5B5FC7] text-white font-semibold py-3 rounded-lg hover:bg-[#5B5FC7]/90 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Open in Teams
          </button>

          <button
            onClick={() => setMeetingLink('')}
            className="w-full bg-zinc-800 text-white py-2 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Create Another Meeting
          </button>
        </div>
      ) : (
        <button
          onClick={createTeamsMeeting}
          disabled={creating || userTier !== 'enterprise'}
          className="w-full bg-[#5B5FC7] text-white font-semibold py-3 rounded-lg hover:bg-[#5B5FC7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating Meeting...' : 'Create Teams Meeting'}
        </button>
      )}

      {userTier !== 'enterprise' && (
        <div className="mt-6 p-4 bg-purple-400/10 border border-purple-400/30 rounded-lg">
          <p className="text-sm text-purple-400 mb-2">Enterprise Features:</p>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>• Microsoft Teams integration</li>
            <li>• Unlimited recording storage</li>
            <li>• Meeting transcription</li>
            <li>• Compliance & archiving</li>
            <li>• Azure AD authentication</li>
          </ul>
          <button className="mt-4 text-sm text-[#E68961] hover:underline">
            Contact Sales for Enterprise
          </button>
        </div>
      )}
    </div>
  );
}

// Meeting Card Component
function MeetingCard({ meeting }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            meeting.platform === 'zoom' ? 'bg-[#2D8CFF]/10' : 'bg-[#5B5FC7]/10'
          }`}>
            {meeting.platform === 'zoom' ? (
              <Video className="w-5 h-5 text-[#2D8CFF]" />
            ) : (
              <Users className="w-5 h-5 text-[#5B5FC7]" />
            )}
          </div>
          <div>
            <div className="font-medium">{meeting.meeting_id || 'Meeting'}</div>
            <div className="text-sm text-gray-400">
              {new Date(meeting.started_at).toLocaleString()} • {meeting.duration_minutes || 0} min
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{meeting.participants_count || 0} participants</span>
          {meeting.recording_url && (
            <button className="text-sm text-[#E68961] hover:underline">
              View Recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
