import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Users, FolderOpen, Calendar, ChevronRight, Shield, CheckCircle, CreditCard, TrendingDown } from 'lucide-react';

export default function CollaborationProjects() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
  useEffect(() => {
    if (user) {
      loadProjects();
      loadSubscription();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${apiBase}/api/collaboration/projects/my-projects?user_id=${user.id}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch(`${apiBase}/api/collaboration/billing`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`${apiBase}/api/collaboration/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          owner_user_id: user.id
        })
      });

      const project = await response.json();
      
      // Refresh projects list and close modal
      await fetchProjects();
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Plus One Subscription Banner */}
        {subscription ? (
          <div className="bg-[#E68961]/10 border border-[#E68961] rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#E68961] mb-2">Plus One Active</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {subscription.collaborators || 0} Collaborators
                  </span>
                  <span className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    {subscription.discount || 0}% Discount
                  </span>
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    ${subscription.monthlyCost || 0}/month
                  </span>
                </div>
              </div>
              <Link
                to="/collaboration/billing"
                className="px-4 py-2 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
              >
                Manage Billing
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Upgrade to Plus One</h3>
                <p className="text-gray-400">Add team members for just $1/day • Save up to 50%</p>
              </div>
              <Link
                to="/pricing/plus-one"
                className="px-4 py-2 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Permanent Marker, cursive' }}>
            Team Collaboration
          </h1>
          <p className="text-gray-400">
            Create projects, invite team members, and code together in real-time
          </p>
        </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-[#E68961] text-black font-semibold rounded-lg hover:bg-[#D4A05F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Plus One Pricing Banner */}
        <div className="bg-gradient-to-r from-[#E68961]/10 to-[#D4A05F]/10 rounded-xl p-6 border border-[#E68961]/30 mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E68961]" />
            Plus One Collaboration - $1/day per member
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#E68961] mb-1">$17.99</div>
              <div className="text-sm text-gray-400">1 member/month</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#E68961] mb-1">$13.99</div>
              <div className="text-sm text-gray-400">2 members/month</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#E68961] mb-1">$10.99</div>
              <div className="text-sm text-gray-400">4 members/month</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#E68961] mb-1">$7.99</div>
              <div className="text-sm text-gray-400">5+ members/month</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            💡 Daily option: Add team members for just $1.00/day (no subscription required)
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first collaboration project to start working with your team
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E68961] text-black font-semibold rounded-lg hover:bg-[#D4A05F] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/collaboration/${project.id}`)}
                className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-[#E68961] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-6 h-6 text-[#E68961]" />
                    <h3 className="font-semibold text-lg group-hover:text-[#E68961] transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#E68961] transition-colors" />
                </div>

                {project.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{project.member_count || 1} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {project.status === 'active' && (
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#E68961] animate-pulse"></div>
                    <span className="text-[#E68961]">Active</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="w-12 h-12 bg-[#E68961]/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#E68961]" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-Time Collaboration</h3>
            <p className="text-sm text-gray-400">
              Code together with live cursor tracking, instant updates, and built-in chat
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="w-12 h-12 bg-[#E68961]/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#E68961]" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Verified Teams</h3>
            <p className="text-sm text-gray-400">
              Work with verified users only. Trust badges display on all team member profiles
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="w-12 h-12 bg-[#E68961]/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-[#E68961]" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Flexible Billing</h3>
            <p className="text-sm text-gray-400">
              Pay daily ($1/day) or monthly with team discounts. No long-term commitments
            </p>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  placeholder="My Awesome Project"
                  className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E68961]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="What's this project about?"
                  rows={3}
                  className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E68961]"
                />
              </div>

              <div className="bg-zinc-800 rounded-lg p-3 text-sm text-gray-400">
                <p className="mb-1">💡 <strong>Next Steps:</strong></p>
                <p>After creating, you can invite team members and set up collaboration pricing</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-[#E68961] text-black font-medium rounded-lg hover:bg-[#D4A05F] transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
