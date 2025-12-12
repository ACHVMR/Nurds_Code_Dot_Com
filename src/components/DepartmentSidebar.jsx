import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DepartmentContext } from '../context/DepartmentContext';
import './DepartmentSidebar.css';

const DEPARTMENTS = [
  { id: 'home', name: 'Home', icon: '🏠', path: '/' },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    path: '/settings',
    sections: [
      { name: 'General', path: '/settings/general' },
      { name: 'API Keys', path: '/settings/api-keys' },
      { name: 'Integrations', path: '/settings/integrations' },
      { name: 'Preferences', path: '/settings/preferences' },
      { name: 'Billing', path: '/settings/billing' },
    ],
  },
  {
    id: 'deploy',
    name: 'Deploy',
    icon: '🚀',
    path: '/deploy',
    sections: [
      { name: 'Active', path: '/deploy/active' },
      { name: 'History', path: '/deploy/history' },
      { name: 'Environments', path: '/deploy/environments' },
      { name: 'Logs', path: '/deploy/logs' },
      { name: 'Env Variables', path: '/deploy/env-vars' },
    ],
  },
  {
    id: 'testing',
    name: 'Testing Lab',
    icon: '🧪',
    path: '/testing-lab',
    sections: [
      { name: 'Scenarios', path: '/testing-lab/scenarios' },
      { name: 'Run History', path: '/testing-lab/runs' },
      { name: 'Metrics', path: '/testing-lab/metrics' },
      { name: 'Errors', path: '/testing-lab/errors' },
      { name: 'Config', path: '/testing-lab/config' },
    ],
  },
  {
    id: 'vibe',
    name: 'V.I.B.E.',
    icon: '💻',
    path: '/vibe',
    sections: [
      { name: 'Projects', path: '/vibe/projects' },
      { name: 'Agent Builder', path: '/vibe/builder' },
      { name: 'Live Preview', path: '/vibe/preview' },
      { name: 'Console/Logs', path: '/vibe/logs' },
      { name: 'Git Integration', path: '/vibe/git' },
    ],
  },
];

const DepartmentSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentDepartment, userProfile, energyLevel } = useContext(DepartmentContext); // Get energyLevel
  const [expandedDept, setExpandedDept] = useState(null);

  // Helper to determine active department
  const activeDept = currentDepartment;

  const handleDepartmentClick = (dept) => {
    navigate(dept.path);
    // Toggle sub-nav if it exists
    if (dept.sections) {
      setExpandedDept(expandedDept === dept.id ? null : dept.id);
    } else {
      setExpandedDept(null);
    }
  };

  return (
    <aside className={`department-sidebar energy-${energyLevel?.toLowerCase() || 'teacher'}`}>
      {/* User Profile */}
      <div className="sidebar-section profile-section">
        <div className="user-avatar">{userProfile?.avatar || '👤'}</div>
        <div className="user-info">
          <div className="user-name">{userProfile?.name || 'User'}</div>
          <div className="user-org">{userProfile?.organization || 'Org'}</div>
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* Departments */}
      <div className="sidebar-section departments-section">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id}>
            <button
              className={`department-item ${activeDept === dept.id ? 'active' : ''}`}
              onClick={() => handleDepartmentClick(dept)}
              aria-expanded={dept.sections ? (expandedDept === dept.id || activeDept === dept.id) : undefined}
              aria-current={activeDept === dept.id ? 'page' : undefined}
            >
              <span className="dept-icon" aria-hidden="true">{dept.icon}</span>
              <span className="dept-name">{dept.name}</span>
            </button>

            {/* Sub-navigation */}
            {dept.sections && (expandedDept === dept.id || activeDept === dept.id) && (
              <div className="sub-nav" role="group" aria-label={`${dept.name} sections`}>
                {dept.sections.map((section) => (
                  <button
                    key={section.path}
                    className="sub-nav-item"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(section.path);
                    }}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <hr className="sidebar-divider" />

      {/* Resources */}
      <div className="sidebar-section resources-section">
        <button onClick={() => navigate('/docs')} className="resource-link">📚 Docs</button>
        <button onClick={() => navigate('/community')} className="resource-link">💬 Community</button>
        <button onClick={() => navigate('/learning')} className="resource-link">🎓 Learning</button>
        <button onClick={() => navigate('/support')} className="resource-link">🆘 Support</button>
      </div>

      <div style={{ marginTop: 'auto' }}></div> {/* Spacer to push account to bottom */}

      <hr className="sidebar-divider" />

      {/* Account */}
      <div className="sidebar-section account-section">
        <button className="account-item">👤 Profile</button>
        <button className="account-item">🔐 Billing</button>
        <button className="account-item logout">🚪 Logout</button>
      </div>
    </aside>
  );
};

export default DepartmentSidebar;
