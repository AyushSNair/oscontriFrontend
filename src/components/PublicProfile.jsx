import React, { useState, useEffect } from 'react';
import { Github, Star, GitBranch, Calendar, Trophy, ExternalLink, ArrowLeft } from 'lucide-react';

const PublicProfile = ({ profileUrl, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicProfile();
  }, [profileUrl]);

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/profile/${profileUrl}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="public-profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-container">
        <div className="error-state">
          <h2>Profile Not Found</h2>
          <p>{error}</p>
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft />
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-container">
      <div className="public-profile-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft />
            Back
          </button>
        )}
        <div className="profile-badge">
          <Github className="github-icon" />
          <span>Open Source Contributor</span>
        </div>
      </div>

      <div className="public-profile-content">
        <div className="profile-intro">
          <h1>{profile.username}</h1>
          {profile.githubUsername && (
            <p className="github-username">
              <Github />
              @{profile.githubUsername}
            </p>
          )}
          <p className="member-since">
            Member since {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>

        {profile.contributions && (
          <div className="contribution-stats">
            <h2>Contribution Statistics</h2>
            
            <div className="stats-grid">
              <div className="stat-card total-points">
                <Trophy className="stat-icon" />
                <div className="stat-content">
                  <h3>{profile.contributions.totalPoints || 0}</h3>
                  <p>Total Points</p>
                </div>
              </div>
              <div className="stat-card repositories">
                <GitBranch className="stat-icon" />
                <div className="stat-content">
                  <h3>{profile.contributions.repositories?.length || 0}</h3>
                  <p>Repositories</p>
                </div>
              </div>
              <div className="stat-card contributions">
                <Star className="stat-icon" />
                <div className="stat-content">
                  <h3>{profile.contributions.repositories?.reduce((sum, repo) => sum + repo.contributions, 0) || 0}</h3>
                  <p>Total Contributions</p>
                </div>
              </div>
              <div className="stat-card last-updated">
                <Calendar className="stat-icon" />
                <div className="stat-content">
                  <h3>{profile.contributions.lastUpdated ? new Date(profile.contributions.lastUpdated).toLocaleDateString() : 'Never'}</h3>
                  <p>Last Updated</p>
                </div>
              </div>
            </div>

            {profile.contributions.repositories?.length > 0 && (
              <div className="repositories-section">
                <h3>Repository Contributions</h3>
                <div className="repositories-list">
                  {profile.contributions.repositories.map((repo, index) => (
                    <div key={index} className="repository-card">
                      <div className="repo-info">
                        <h4>{repo.owner}/{repo.name}</h4>
                        <p>{repo.contributions} contributions • {repo.points} points</p>
                        {repo.lastContribution && (
                          <p className="last-contribution">
                            Last contribution: {new Date(repo.lastContribution).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="repo-actions">
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="repo-link"
                        >
                          <ExternalLink />
                          View on GitHub
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!profile.githubUsername && (
          <div className="no-github">
            <Github className="github-icon-large" />
            <h3>GitHub Not Connected</h3>
            <p>This user hasn't connected their GitHub account yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
