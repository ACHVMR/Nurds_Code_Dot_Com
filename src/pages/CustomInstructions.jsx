import React, { useState } from 'react';

/**
 * CustomInstructions Component
 * User profile form for context engineering and personalized recommendations
 */
export default function CustomInstructions() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    career_goals: '',
    current_role: '',
    years_experience: '',
    tech_stack: '',
    current_projects: '',
    project_types: '',
    industry: '',
    interests: '',
    learning_goals: '',
    preferred_languages: '',
    company_type: '',
    company_size: '',
    team_size: '',
    communication_style: 'professional',
    code_style: 'idiomatic',
    preferred_tone: 'helpful'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/instructions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Custom Instructions</h1>
          <p className="text-gray-400">
            Help ACHEEVY understand your context for personalized recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Career Context */}
          <section className="bg-gray-900 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#E68961] mb-4">Career Context</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Career Goals</label>
                <textarea
                  name="career_goals"
                  value={formData.career_goals}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Become a senior full-stack engineer, Launch my startup, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Role</label>
                  <input
                    type="text"
                    name="current_role"
                    value={formData.current_role}
                    onChange={handleChange}
                    placeholder="Junior Developer, Tech Lead, etc."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleChange}
                    placeholder="0-20+"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  name="tech_stack"
                  value={formData.tech_stack}
                  onChange={handleChange}
                  placeholder="React, Node.js, PostgreSQL, Docker, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                />
              </div>
            </div>
          </section>

          {/* Project Context */}
          <section className="bg-gray-900 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#E68961] mb-4">Project Context</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Projects</label>
                <textarea
                  name="current_projects"
                  value={formData.current_projects}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your current projects..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Types</label>
                  <input
                    type="text"
                    name="project_types"
                    value={formData.project_types}
                    onChange={handleChange}
                    placeholder="web app, mobile app, API, etc."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="FinTech, HealthTech, E-commerce, etc."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Personal Preferences */}
          <section className="bg-gray-900 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#E68961] mb-4">Personal Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interests (comma-separated)</label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="AI/ML, DevOps, UI/UX, Blockchain, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Learning Goals</label>
                <input
                  type="text"
                  name="learning_goals"
                  value={formData.learning_goals}
                  onChange={handleChange}
                  placeholder="Learn TypeScript, Master Docker, Build SaaS, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Languages</label>
                <input
                  type="text"
                  name="preferred_languages"
                  value={formData.preferred_languages}
                  onChange={handleChange}
                  placeholder="JavaScript, Python, Go, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                />
              </div>
            </div>
          </section>

          {/* Company Context */}
          <section className="bg-gray-900 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#E68961] mb-4">Company Context</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Type</label>
                  <select
                    name="company_type"
                    value={formData.company_type}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  >
                    <option value="">Select...</option>
                    <option value="startup">Startup</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="agency">Agency</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company Size</label>
                  <select
                    name="company_size"
                    value={formData.company_size}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  >
                    <option value="">Select...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-1000">201-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Team Size</label>
                  <input
                    type="number"
                    name="team_size"
                    value={formData.team_size}
                    onChange={handleChange}
                    placeholder="1-50"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Style Preferences */}
          <section className="bg-gray-900 border border-[#E68961]/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#E68961] mb-4">Communication Style</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Communication Style</label>
                  <select
                    name="communication_style"
                    value={formData.communication_style}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="technical">Technical</option>
                    <option value="concise">Concise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Code Style</label>
                  <select
                    name="code_style"
                    value={formData.code_style}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  >
                    <option value="idiomatic">Idiomatic</option>
                    <option value="verbose">Verbose</option>
                    <option value="minimal">Minimal</option>
                    <option value="commented">Commented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Tone</label>
                  <select
                    name="preferred_tone"
                    value={formData.preferred_tone}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E68961]"
                  >
                    <option value="helpful">Helpful</option>
                    <option value="direct">Direct</option>
                    <option value="encouraging">Encouraging</option>
                    <option value="analytical">Analytical</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Your preferences help ACHEEVY provide personalized recommendations
            </p>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#E68961] hover:bg-[#D4A05F] text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </>
              ) : (
                'Save Instructions'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
