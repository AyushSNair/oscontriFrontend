import React, { useState, useEffect } from 'react';
import { Github, Star, GitBranch, Calendar, Trophy, ExternalLink, RefreshCw, Share2, Copy, Check } from 'lucide-react';

const Profile = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [githubUsername, setGithubUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setGithubUsername(data.user.githubUsername || '');
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updateGitHubUsername = async (e) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    setIsUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profile/update-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ githubUsername: githubUsername.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update GitHub username');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshContributions = async () => {
    if (!profile?.githubUsername) return;

    setIsRefreshing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profile/refresh-contributions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          contributions: data.contributions
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to refresh contributions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyProfileLink = async () => {
    if (profile?.profileUrl) {
      const profileLink = `${window.location.origin}/profile/${profile.profileUrl}`;
      try {
        await navigator.clipboard.writeText(profileLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = profileLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1>Welcome, {profile?.username}!</h1>
          <p>Track your open source contributions and earn points</p>
        </div>
        <div className="profile-actions">
          {profile?.profileUrl && (
            <button 
              className="action-btn share-btn"
              onClick={copyProfileLink}
              title="Copy profile link"
            >
              {copied ? <Check /> : <Share2 />}
              {copied ? 'Copied!' : 'Share Profile'}
            </button>
          )}
          <button className="action-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* GitHub Username Setup */}
      {!profile?.githubUsername && (
        <div className="github-setup">
          <h2>Connect Your GitHub Account</h2>
          <p>Add your GitHub username to start tracking contributions</p>
          <form onSubmit={updateGitHubUsername} className="github-form">
            <div className="input-group">
              <Github className="input-icon" />
              <input
                type="text"
                placeholder="Enter your GitHub username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="primary-btn"
              disabled={isUpdating}
            >
              {isUpdating ? 'Connecting...' : 'Connect GitHub'}
            </button>
          </form>
        </div>
      )}

      {/* Profile Stats */}
      {profile?.githubUsername && (
        <div className="profile-stats">
          <div className="stats-header">
            <h2>Contribution Statistics</h2>
            <button 
              className="refresh-btn"
              onClick={refreshContributions}
              disabled={isRefreshing}
              title="Refresh contributions"
            >
              <RefreshCw className={isRefreshing ? 'spinning' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card total-points">
              <Trophy className="stat-icon" />
              <div className="stat-content">
                <h3>{profile.contributions?.totalPoints || 0}</h3>
                <p>Total Points</p>
              </div>
            </div>
            <div className="stat-card repositories">
              <GitBranch className="stat-icon" />
              <div className="stat-content">
                <h3>{profile.contributions?.repositories?.length || 0}</h3>
                <p>Repositories</p>
              </div>
            </div>
            <div className="stat-card contributions">
              <Star className="stat-icon" />
              <div className="stat-content">
                <h3>{profile.contributions?.repositories?.reduce((sum, repo) => sum + repo.contributions, 0) || 0}</h3>
                <p>Total Contributions</p>
              </div>
            </div>
            <div className="stat-card last-updated">
              <Calendar className="stat-icon" />
              <div className="stat-content">
                <h3>{profile.contributions?.lastUpdated ? new Date(profile.contributions.lastUpdated).toLocaleDateString() : 'Never'}</h3>
                <p>Last Updated</p>
              </div>
            </div>
          </div>

          {/* Repository Contributions */}
          {profile.contributions?.repositories?.length > 0 && (
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

          {/* Profile Link */}
          {profile.profileUrl && (
            <div className="profile-link-section">
              <h3>Share Your Profile</h3>
              <p>Your public profile link:</p>
              <div className="profile-link">
                <code>{window.location.origin}/profile/{profile.profileUrl}</code>
                <button 
                  className="copy-btn"
                  onClick={copyProfileLink}
                  title="Copy link"
                >
                  {copied ? <Check /> : <Copy />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
