import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, Code, Zap, BookOpen, Target } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

function DailyInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken, isLoaded, userId } = useAuth();

  const fetchDailyInsights = useCallback(async () => {
    if (!userId) {
      setError('Sign in to view personalized insights.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken?.();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/insights?userId=${encodeURIComponent(userId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to fetch insights');
      }

      const data = await response.json();
      const normalizedInsights = (data.insights || []).map((item) => {
        const actions = Array.isArray(item.actions) && item.actions.length > 0 ? item.actions : [];

        if (!actions.length && item.action_url) {
          actions.push({ label: item.action_label || 'Open', url: item.action_url });
        }

        if (!actions.length && item.action) {
          actions.push({ label: item.action });
        }

        return {
          ...item,
          confidence: item.confidence ?? item.relevance_score ?? 0,
          recommendation: item.recommendation || item.description || '',
          reasoning: item.reasoning || (Array.isArray(item.personalization_factors) ? item.personalization_factors.join(', ') : item.personalization_factors) || '',
          actions,
          createdAt: item.created_at || item.insight_date,
        };
      });

      setInsights(normalizedInsights);
    } catch (err) {
      setError(err.message || 'Failed to load insights');
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    if (!isLoaded) return;
    fetchDailyInsights();
  }, [fetchDailyInsights, isLoaded]);

  const getInsightIcon = (category) => {
    switch (category) {
      case 'project':
        return <Code className="w-5 h-5" />;
      case 'career':
        return <Target className="w-5 h-5" />;
      case 'learning':
        return <BookOpen className="w-5 h-5" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5" />;
      case 'optimization':
        return <Zap className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-[#E68961]';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E68961]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
            <p className="text-red-500">Error: {error}</p>
          </div>
          <button
            onClick={fetchDailyInsights}
            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#E68961] hover:text-black rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-[#E68961]" />
            <h1 className="text-4xl font-bold">Daily Insights</h1>
          </div>
          <p className="text-gray-400">
            Personalized recommendations powered by your context engineering profile
          </p>
        </div>

        {/* Insights Grid */}
        {insights.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Insights Yet</h3>
            <p className="text-gray-400 mb-4">
              Complete your Custom Instructions profile to get personalized recommendations
            </p>
            <a
              href="/custom-instructions"
              className="inline-block bg-[#E68961] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
            >
              Set Up Profile
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#E68961] transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#E68961]/10 flex items-center justify-center text-[#E68961]">
                    {getInsightIcon(insight.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{insight.title}</h3>
                      <span className={`text-sm font-mono ${getConfidenceColor(insight.confidence)}`}>
                        {Math.round((insight.confidence || 0) * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{insight.recommendation}</p>

                    {/* Reasoning */}
                    {insight.reasoning && (
                      <div className="bg-black/50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-400">
                          <span className="font-semibold text-[#E68961]">Why: </span>
                          {insight.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {insight.actions && insight.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {insight.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (action.url) {
                                window.location.href = action.url;
                              }
                            }}
                            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#E68961] hover:text-black rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!action.url}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2a2a2a] text-xs text-gray-500">
                      <span>Category: {insight.category}</span>
                      <span>•</span>
                      <span>Generated: {insight.createdAt ? new Date(insight.createdAt).toLocaleDateString() : 'Recently'}</span>
                      {(() => {
                        const relevanceValue =
                          typeof insight.relevance_score === 'number'
                            ? insight.relevance_score
                            : typeof insight.confidence === 'number'
                            ? insight.confidence
                            : null;

                        if (relevanceValue === null) return null;

                        return (
                          <>
                            <span>•</span>
                            <span>Relevance: {Math.round(relevanceValue * 100)}%</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {insights.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={fetchDailyInsights}
              className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#E68961] hover:text-black rounded-lg font-semibold transition-colors"
            >
              Refresh Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyInsights;
