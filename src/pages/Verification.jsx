import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Camera, Building } from 'lucide-react';

export default function Verification() {
  const { user } = useUser();
  const [verification, setVerification] = useState(null);
  const [trustProfile, setTrustProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [verificationType, setVerificationType] = useState('seller');

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(`${apiBase}/api/verify/status/${user.id}`);
      const data = await response.json();
      
      setVerification(data.verification);
      setTrustProfile(data.trust_profile);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateVerification = async () => {
    setInitiating(true);
    try {
      const response = await fetch(`${apiBase}/api/verify/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          verification_type: verificationType,
          country: 'US',
          email: user.primaryEmailAddress?.emailAddress
        })
      });

      const data = await response.json();
      
      if (data.verification_url) {
        // Open Shufti Pro verification in modal or new tab
        window.open(data.verification_url, 'shufti_verification', 'width=800,height=900');
        
        // Poll for verification completion
        const interval = setInterval(async () => {
          await fetchVerificationStatus();
          if (verification?.status === 'verified' || verification?.status === 'declined') {
            clearInterval(interval);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to initiate verification:', error);
      alert('Failed to start verification. Please try again.');
    } finally {
      setInitiating(false);
    }
  };

  const getTrustBadge = () => {
    if (!trustProfile) return null;

    const badges = {
      verified_trusted: {
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Verified Trusted Seller',
        color: 'text-[#E68961]',
        bgColor: 'bg-[#E68961]/10',
        borderColor: 'border-[#E68961]'
      },
      standard_verified: {
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Verified User',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400'
      },
      unverified: {
        icon: <AlertTriangle className="w-5 h-5" />,
        label: 'Unverified',
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
        borderColor: 'border-gray-400'
      }
    };

    const badge = badges[trustProfile.tier] || badges.unverified;

    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${badge.bgColor} ${badge.borderColor}`}>
        <span className={badge.color}>{badge.icon}</span>
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${badge.color}`}>{badge.label}</span>
          <span className="text-xs text-gray-400">Trust Score: {trustProfile.trust_score}/100</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#E68961]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-[#E68961]" />
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Permanent Marker, cursive' }}>
            Identity Verification
          </h1>
        </div>

        {/* Trust Badge Display */}
        {trustProfile && (
          <div className="mb-8">
            {getTrustBadge()}
          </div>
        )}

        {/* Verification Status Card */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-8">
          <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
          
          {verification ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <div className="flex items-center gap-2">
                  {verification.status === 'verified' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-[#E68961]" />
                      <span className="text-[#E68961]">Verified</span>
                    </>
                  )}
                  {verification.status === 'pending' && (
                    <>
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400">Pending</span>
                    </>
                  )}
                  {verification.status === 'declined' && (
                    <>
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400">Declined</span>
                    </>
                  )}
                </div>
              </div>

              {verification.verification_type && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verification Type</span>
                  <span className="text-white capitalize">{verification.verification_type}</span>
                </div>
              )}

              {verification.document_type && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Document Used</span>
                  <span className="text-white capitalize">{verification.document_type.replace('_', ' ')}</span>
                </div>
              )}

              {verification.face_match_score && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Face Match Score</span>
                  <span className="text-white">{verification.face_match_score}%</span>
                </div>
              )}

              {verification.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verified On</span>
                  <span className="text-white">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">You haven't completed identity verification yet.</p>
              <p className="text-sm text-gray-500">
                Verification is required to become a seller or access premium features.
              </p>
            </div>
          )}
        </div>

        {/* Verification Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <FileText className="w-8 h-8 text-[#E68961] mb-3" />
            <h3 className="font-semibold mb-2">Seller Access</h3>
            <p className="text-sm text-gray-400">
              List and sell your AI plugins, templates, and tools in the marketplace.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <Shield className="w-8 h-8 text-[#E68961] mb-3" />
            <h3 className="font-semibold mb-2">Trusted Badge</h3>
            <p className="text-sm text-gray-400">
              Display verified badge on your profile and listings to build trust.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <Camera className="w-8 h-8 text-[#E68961] mb-3" />
            <h3 className="font-semibold mb-2">Collaboration</h3>
            <p className="text-sm text-gray-400">
              Join verified teams and access premium collaboration features.
            </p>
          </div>
        </div>

        {/* Initiate Verification */}
        {(!verification || verification.status === 'declined' || verification.status === 'expired') && (
          <div className="bg-gradient-to-r from-[#E68961]/10 to-[#D4A05F]/10 rounded-xl p-6 border border-[#E68961]/30">
            <h2 className="text-xl font-semibold mb-4">Start Verification Process</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Verification Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setVerificationType('seller')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    verificationType === 'seller'
                      ? 'border-[#E68961] bg-[#E68961]/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2 text-[#E68961]" />
                  <div className="text-sm font-medium">Seller</div>
                  <div className="text-xs text-gray-400 mt-1">Document + Face</div>
                </button>

                <button
                  onClick={() => setVerificationType('business')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    verificationType === 'business'
                      ? 'border-[#E68961] bg-[#E68961]/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <Building className="w-6 h-6 mx-auto mb-2 text-[#E68961]" />
                  <div className="text-sm font-medium">Business</div>
                  <div className="text-xs text-gray-400 mt-1">Full KYB</div>
                </button>

                <button
                  onClick={() => setVerificationType('moderator')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    verificationType === 'moderator'
                      ? 'border-[#E68961] bg-[#E68961]/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <Shield className="w-6 h-6 mx-auto mb-2 text-[#E68961]" />
                  <div className="text-sm font-medium">Moderator</div>
                  <div className="text-xs text-gray-400 mt-1">Identity Check</div>
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-3">What You'll Need:</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#E68961]" />
                  Valid government-issued ID (Passport, Driver's License, or ID Card)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#E68961]" />
                  Device with camera for face verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#E68961]" />
                  Good lighting and stable internet connection
                </li>
                {verificationType === 'business' && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#E68961]" />
                    Business registration documents and license
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={initiateVerification}
              disabled={initiating}
              className="w-full bg-[#E68961] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#D4A05F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initiating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-black"></div>
                  Starting Verification...
                </span>
              ) : (
                'Start Verification'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Powered by Shufti Pro • Secure & GDPR Compliant • Typical completion time: 2-5 minutes
            </p>
          </div>
        )}

        {/* Re-verification */}
        {verification && verification.status === 'verified' && (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="font-semibold mb-2">Need to Update Verification?</h3>
            <p className="text-sm text-gray-400 mb-4">
              If your information has changed or you need to update your verification, you can re-verify at any time.
            </p>
            <button
              onClick={initiateVerification}
              className="text-[#E68961] text-sm hover:underline"
            >
              Re-verify Identity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
