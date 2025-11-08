import React, { useState } from 'react';
import { Video, Calendar, Users, ExternalLink } from 'lucide-react';

function GoogleMeetIntegration() {
  const [loading, setLoading] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingDetails, setMeetingDetails] = useState(null);

  const createMeeting = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meetings/google-meet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: 'ACHEEVY Collaboration',
          duration: 60, // minutes
          attendees: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Google Meet');
      }

      const data = await response.json();
      setMeetingUrl(data.meetingUrl);
      setMeetingDetails(data);
    } catch (err) {
      alert(`Failed to create meeting: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = () => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank');
    }
  };

  const copyMeetingUrl = () => {
    if (meetingUrl) {
      navigator.clipboard.writeText(meetingUrl);
      alert('Meeting URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8 text-[#E68961]" />
            <h1 className="text-4xl font-bold">Google Meet Integration</h1>
          </div>
          <p className="text-gray-400">
            Create and join Google Meet video calls for your team
          </p>
        </div>

        {/* Create Meeting Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Create New Meeting</h2>
          
          {!meetingUrl ? (
            <div className="text-center">
              <Video className="w-16 h-16 text-[#E68961] mx-auto mb-6" />
              <p className="text-gray-400 mb-6">
                Start an instant Google Meet call with your team
              </p>
              <button
                onClick={createMeeting}
                disabled={loading}
                className="px-8 py-4 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>Creating Meeting...</span>
                  </div>
                ) : (
                  'Create Google Meet'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#E68961]/10 border border-[#E68961] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#E68961] mb-3">
                  Meeting Created Successfully!
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Meeting URL:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={meetingUrl}
                        readOnly
                        className="flex-1 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none"
                      />
                      <button
                        onClick={copyMeetingUrl}
                        className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {meetingDetails?.code && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Meeting Code:</p>
                      <p className="text-2xl font-mono font-bold text-[#E68961]">
                        {meetingDetails.code}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={joinMeeting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Join Meeting
                </button>
                <button
                  onClick={() => {
                    setMeetingUrl('');
                    setMeetingDetails(null);
                  }}
                  className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Video className="w-6 h-6 text-[#E68961]" />
              <h3 className="text-lg font-semibold">Instant Meetings</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Create Google Meet calls instantly without scheduling
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-[#E68961]" />
              <h3 className="text-lg font-semibold">Team Collaboration</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Share meeting links with your Plus One collaborators
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-[#E68961]" />
              <h3 className="text-lg font-semibold">Calendar Integration</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Meetings automatically sync with Google Calendar
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <ExternalLink className="w-6 h-6 text-[#E68961]" />
              <h3 className="text-lg font-semibold">External Sharing</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Share meeting links with anyone, not just team members
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500 rounded-lg p-6">
          <p className="text-yellow-500 text-sm">
            <strong>Note:</strong> Google Meet integration requires connecting your Google account.
            You'll be prompted to authorize ACHEEVY when creating your first meeting.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GoogleMeetIntegration;
