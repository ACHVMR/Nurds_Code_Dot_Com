import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWeeklyIdeas();
  }, []);

  const fetchWeeklyIdeas = async () => {
    try {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch('/api/admin/ideas', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBuilding = (idea) => {
    navigate(`/acheevy/${idea.id}`, { 
      state: { idea } 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading weekly app ideas...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      <header className="dashboard-header">
        <h1>🎯 Weekly App Ideas Engine</h1>
        <p>Generated every Monday • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="ideas-grid">
        {ideas.map((idea, idx) => (
          <div
            key={idea.id}
            className="idea-ticket"
            style={{ animationDelay: `${idx * 0.1}s` }}
            onClick={() => setSelectedIdea(idea)}
          >
            <div className="ticket-header">
              <span className="ticket-number">#{String(idx + 1).padStart(2, '0')}</span>
              <span className={`complexity-badge ${idea.complexity}`}>
                {idea.complexity?.toUpperCase()}
              </span>
            </div>
            
            <h3 className="idea-title">{idea.title}</h3>
            <p className="idea-description">{idea.description}</p>
            
            <div className="idea-footer">
              <span className="category-tag">{idea.category}</span>
              <button 
                className="build-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartBuilding(idea);
                }}
              >
                🎤 Build This
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedIdea && (
        <div className="idea-modal" onClick={() => setSelectedIdea(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn" 
              onClick={() => setSelectedIdea(null)}
            >
              ✕
            </button>
            
            <h2>{selectedIdea.title}</h2>
            
            <div className="modal-metadata">
              <span className={`badge complexity-${selectedIdea.complexity}`}>
                {selectedIdea.complexity}
              </span>
              <span className="badge">{selectedIdea.category}</span>
            </div>
            
            <p className="full-description">{selectedIdea.description}</p>
            
            {selectedIdea.keywords && (
              <div className="keywords-section">
                <h4>Keywords:</h4>
                <div className="keyword-tags">
                  {JSON.parse(selectedIdea.keywords || '[]').map(kw => (
                    <span key={kw} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              className="primary-btn"
              onClick={() => handleStartBuilding(selectedIdea)}
            >
              🎤 Start Building with ACHEEVY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
