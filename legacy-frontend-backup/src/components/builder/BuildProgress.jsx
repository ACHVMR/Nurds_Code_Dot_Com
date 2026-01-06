import React, { useState, useEffect } from 'react';
import './BuildProgress.css';
import { BUILD_PHASES } from '../../config/project-builder';

/**
 * BuildProgress - Real-time window into the development process
 * Shows users exactly what's happening as their app is being built
 */
export default function BuildProgress({ 
  isBuilding, 
  currentPhase, 
  progress, 
  logs = [],
  estimate,
  onCancel 
}) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [expandedLogs, setExpandedLogs] = useState(false);

  useEffect(() => {
    let interval;
    if (isBuilding) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isBuilding]);

  const formatElapsed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isBuilding && !estimate) return null;

  return (
    <div className="build-progress-container">
      {/* Header */}
      <div className="build-header">
        <div className="build-title">
          <span className="build-icon">{isBuilding ? '🔨' : '📊'}</span>
          <h3>{isBuilding ? 'Building Your App' : 'Build Estimate'}</h3>
        </div>
        {isBuilding && (
          <div className="build-timer">
            <span className="timer-label">Elapsed:</span>
            <span className="timer-value">{formatElapsed(elapsedTime)}</span>
          </div>
        )}
      </div>

      {/* Estimate Display */}
      {estimate && (
        <div className="estimate-panel">
          <div className="estimate-row">
            <span className="estimate-label">💰 Estimated Cost</span>
            <span className="estimate-value cost">${estimate.totalCost.toFixed(2)}</span>
          </div>
          <div className="estimate-row">
            <span className="estimate-label">⏱️ Estimated Time</span>
            <span className="estimate-value time">{estimate.estimatedTimeFormatted}</span>
          </div>
          <div className="estimate-row">
            <span className="estimate-label">🎯 Complexity</span>
            <span className="estimate-value">
              {['Simple', 'Moderate', 'Complex', 'Enterprise'][Math.min(Math.floor(estimate.complexity), 3)]}
            </span>
          </div>
          <div className="estimate-features">
            <span className="features-label">Detected Features:</span>
            <div className="feature-tags">
              {estimate.features.map((feature, i) => (
                <span key={i} className="feature-tag">{feature}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phase Progress */}
      {isBuilding && (
        <div className="phases-container">
          {BUILD_PHASES.map((phase, index) => {
            const phaseIndex = BUILD_PHASES.findIndex(p => p.id === currentPhase);
            const isComplete = index < phaseIndex;
            const isCurrent = phase.id === currentPhase;
            const isPending = index > phaseIndex;

            return (
              <div 
                key={phase.id} 
                className={`phase-item ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="phase-icon">
                  {isComplete ? '✓' : phase.icon}
                </div>
                <div className="phase-info">
                  <span className="phase-name">{phase.name}</span>
                  {isCurrent && (
                    <div className="phase-progress-bar">
                      <div 
                        className="phase-progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Logs */}
      {isBuilding && logs.length > 0 && (
        <div className={`logs-container ${expandedLogs ? 'expanded' : ''}`}>
          <div 
            className="logs-header"
            onClick={() => setExpandedLogs(!expandedLogs)}
          >
            <span>📜 Build Logs</span>
            <span className="logs-toggle">{expandedLogs ? '▼' : '▶'}</span>
          </div>
          {expandedLogs && (
            <div className="logs-content">
              {logs.map((log, i) => (
                <div key={i} className={`log-entry ${log.type}`}>
                  <span className="log-time">{log.time}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {isBuilding && onCancel && (
        <div className="build-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel Build
          </button>
        </div>
      )}
    </div>
  );
}
