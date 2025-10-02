import React, { useState } from 'react';
import { 
  Search, GitBranch, Star, GitPullRequest, MessageSquare, 
  Calendar, AlertCircle, BarChart3, Code, RefreshCw 
} from 'lucide-react';

const Analyze = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

  const GITHUB_API = import.meta.env.VITE_GITHUB_API || 'https://api.github.com';
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
  
  // Simple in-memory cache to reduce API calls
  const cache = {};
  
  const fetchGitHubData = async (endpoint) => {
    // Check cache first
    if (cache[endpoint]) {
      const { data, timestamp } = cache[endpoint];
      // Cache for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }

    // Always include Accept header, add Authorization if token exists
    const headers = {
      Accept: "application/vnd.github+json",
      ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {})
    };

    const response = await fetch(`${GITHUB_API}${endpoint}`, { headers });
    
    // Debug: Log rate limit headers
    console.log('API Response for:', endpoint, {
      status: response.status,
      rateLimit: response.headers.get('x-ratelimit-limit'),
      rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
      rateLimitReset: response.headers.get('x-ratelimit-reset'),
      rateLimitUsed: response.headers.get('x-ratelimit-used')
    });
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        const resetTime = response.headers.get('x-ratelimit-reset');
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString() : 'unknown';
        throw new Error(`GitHub API rate limit exceeded. Resets at: ${resetDate}. Using authenticated requests: ${!!GITHUB_TOKEN}`);
      }
      throw new Error(`GitHub API Error: ${response.status}`);
    }
    
    const data = await response.json();
    // Cache the response
    cache[endpoint] = { data, timestamp: Date.now() };
    return data;
  };

  const calculateImpact = (repo, contribution) => {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    let impactScore = 0;
    
    if (stars > 10000 || forks > 1000) impactScore += 4;
    else if (stars > 1000 || forks > 100) impactScore += 2;
    else if (stars > 100) impactScore += 1;
    
    if (contribution.type === 'PullRequest' && contribution.merged_at) impactScore += 3;
    else if (contribution.type === 'PullRequest') impactScore += 1;
    else if (contribution.type === 'Issue' && contribution.closed_at) impactScore += 2;
    
    const isTrending = repo.updated_at && new Date(repo.updated_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    if (isTrending) impactScore += 1;
    
    return impactScore >= 6 ? 'Critical' : impactScore >= 4 ? 'High' : impactScore >= 2 ? 'Medium' : 'Low';
  };

  const formatContribution = (repo, event) => {
    const typeMap = {
      PullRequestEvent: 'Pull Request',
      IssuesEvent: 'Issue',
      PushEvent: 'Push',
      CreateEvent: 'Created'
    };
    
    const type = typeMap[event.type] || 'Other';
    const payload = event.payload;
    let title, status, linesChanged = 0;
    
    if (event.type === 'PullRequestEvent') {
      title = payload.pull_request?.title || 'Pull Request';
      status = payload.pull_request?.merged_at ? 'Merged' : payload.pull_request?.closed_at ? 'Closed' : 'Open';
      linesChanged = (payload.pull_request?.additions || 0) + (payload.pull_request?.deletions || 0);
    } else if (event.type === 'IssuesEvent') {
      title = payload.issue?.title || 'Issue';
      status = payload.issue?.state === 'closed' ? 'Closed' : 'Open';
    } else if (event.type === 'PushEvent') {
      title = `Pushed ${payload.commits?.length || 1} commit(s)`;
      status = 'Pushed';
    } else {
      title = `${type} activity`;
      status = 'Completed';
    }

    return {
      repo: repo.full_name,
      type,
      title,
      impact: calculateImpact(repo, { type, merged_at: payload.pull_request?.merged_at, closed_at: payload.issue?.closed_at }),
      linesChanged,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      date: event.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      status,
      description: `${type} in ${repo.name}`,
      repoOwner: repo.owner?.login || ''
    };
  };

  const analyzeContributions = (contributions) => {
    if (!contributions?.length) {
      return { totalRepos: 0, totalContributions: 0, highImpactContributions: 0, avgStars: 0, impactScore: 0, collaborationScore: 0 };
    }

    const totalRepos = new Set(contributions.map(c => c.repo)).size;
    const totalContributions = contributions.length;
    const highImpactContributions = contributions.filter(c => ['High', 'Critical'].includes(c.impact)).length;
    const avgStars = Math.round(contributions.reduce((sum, c) => sum + (c.stars || 0), 0) / contributions.length) || 0;
    const collaborationScore = Math.min(100, Math.round((totalRepos * 10) + (highImpactContributions * 15)));
    
    return {
      totalRepos,
      totalContributions,
      highImpactContributions,
      avgStars,
      impactScore: totalContributions > 0 ? Math.round((highImpactContributions / totalContributions) * 100) : 0,
      collaborationScore
    };
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const user = await fetchGitHubData(`/users/${username}`);
      setUserData(user);
      
      // Fetch events and search contributions in parallel
      const [events1, events2, events3, prSearch, issueSearch] = await Promise.allSettled([
        fetchGitHubData(`/users/${username}/events?per_page=100&page=1`),
        fetchGitHubData(`/users/${username}/events?per_page=100&page=2`),
        fetchGitHubData(`/users/${username}/events?per_page=100&page=3`),
        fetchGitHubData(`/search/issues?q=type:pr+author:${username}&sort=updated&per_page=50`),
        fetchGitHubData(`/search/issues?q=type:issue+author:${username}&sort=updated&per_page=30`)
      ]);
      
      const allEvents = [
        ...(events1.status === 'fulfilled' ? events1.value : []),
        ...(events2.status === 'fulfilled' ? events2.value : []),
        ...(events3.status === 'fulfilled' ? events3.value : [])
      ];
      
      const searchItems = [
        ...(prSearch.status === 'fulfilled' ? prSearch.value.items || [] : []),
        ...(issueSearch.status === 'fulfilled' ? issueSearch.value.items || [] : [])
      ];
      
      // Filter external contributions
      const otherUsersEvents = allEvents.filter(event => {
        const repoOwner = event.repo?.name?.split('/')[0];
        return repoOwner && repoOwner.toLowerCase() !== username.toLowerCase();
      });
      
      const externalSearchContributions = searchItems.filter(item => {
        const repoOwner = item.repository_url?.split('/').slice(-2)[0];
        return repoOwner && repoOwner.toLowerCase() !== username.toLowerCase();
      });
      
      // Get unique repo names
      const repoNames = [...new Set([
        ...otherUsersEvents.map(event => event.repo?.name).filter(Boolean),
        ...externalSearchContributions.map(item => {
          const parts = item.repository_url?.split('/');
          return parts ? `${parts[parts.length-2]}/${parts[parts.length-1]}` : null;
        }).filter(Boolean)
      ])].slice(0, 25);
      
      // Fetch repo details
      const repos = await Promise.allSettled(
        repoNames.map(name => fetchGitHubData(`/repos/${name}`))
      );
      
      const repoMap = {};
      repos.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          repoMap[result.value.full_name] = result.value;
        }
      });
      
      // Process contributions
      const eventContributions = otherUsersEvents
        .filter(event => event.repo?.name && repoMap[event.repo.name])
        .filter(event => ['PullRequestEvent', 'IssuesEvent', 'PushEvent', 'CreateEvent'].includes(event.type))
        .map(event => formatContribution(repoMap[event.repo.name], event))
        .filter(contrib => contrib.repoOwner.toLowerCase() !== username.toLowerCase());
      
      const searchContributions = externalSearchContributions
        .filter(item => {
          const repoName = item.repository_url?.split('/').slice(-2).join('/');
          return repoName && repoMap[repoName];
        })
        .map(item => {
          const repoName = item.repository_url.split('/').slice(-2).join('/');
          const repo = repoMap[repoName];
          return {
            repo: repo.full_name,
            type: item.pull_request ? 'Pull Request' : 'Issue',
            title: item.title,
            impact: calculateImpact(repo, { type: item.pull_request ? 'PullRequest' : 'Issue', merged_at: item.pull_request?.merged_at, closed_at: item.closed_at }),
            linesChanged: 0,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            date: (item.updated_at || item.created_at || new Date().toISOString()).split('T')[0],
            status: item.state === 'closed' ? (item.pull_request?.merged_at ? 'Merged' : 'Closed') : 'Open',
            description: `${item.pull_request ? 'Pull Request' : 'Issue'} in ${repo.name}`,
            repoOwner: repo.owner?.login || ''
          };
        })
        .filter(contrib => contrib.repoOwner.toLowerCase() !== username.toLowerCase());
      
      // Combine and deduplicate
      const allContributions = [...eventContributions, ...searchContributions];
      const uniqueContributions = allContributions.filter((contrib, index, arr) => 
        arr.findIndex(c => c.title === contrib.title && c.repo === contrib.repo) === index
      );
      
      const sortedContributions = uniqueContributions
        .sort((a, b) => {
          const impactOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
          return impactDiff !== 0 ? impactDiff : new Date(b.date) - new Date(a.date);
        })
        .slice(0, 50);
      
      setContributions(sortedContributions);
      setStats(analyzeContributions(sortedContributions));
      
      if (sortedContributions.length === 0) {
        setError('No open source contributions found. This could be because: 1) No contributions to other users\' repositories, 2) All repositories are private, or 3) Contributions are very old.');
      }
      
    } catch (err) {
      console.error('API Error:', err);
      if (err.message.includes('404')) {
        setError('User not found. Please check the username and try again.');
      } else if (err.message.includes('403') || err.message.includes('rate limit')) {
        setError('GitHub API rate limit exceeded. To continue analyzing contributions, please add a GitHub Personal Access Token to your .env file (see env.example for instructions), or try again in an hour.');
      } else {
        setError('Failed to fetch data. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getImpactClass = (impact) => {
    return `tag impact-${impact.toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    return `tag status-${status.toLowerCase()}`;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Pull Request': <GitPullRequest className="w-4 h-4" />,
      'Issue': <MessageSquare className="w-4 h-4" />,
      'Bug Report': <AlertCircle className="w-4 h-4" />
    };
    return icons[type] || <GitBranch className="w-4 h-4" />;
  };

  return (
    <div>
      {/* User Search */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search style={{ width: '20px', height: '20px' }} />
          Analyze Open Source Contributions
        </h2>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              GitHub Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter GitHub username..."
              className="form-input"
              style={{ fontSize: '16px' }}
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', height: '48px' }}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Analyze
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: '1px', borderStyle: 'solid', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
              <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Stats */}
      {userData && (
        <div className="card animate-fadeIn" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
            <img 
              src={userData.avatar_url} 
              alt={userData.name || userData.login}
              style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #e5e7eb' }}
            />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {userData.name || userData.login}
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '8px' }}>@{userData.login}</p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>{userData.bio || 'No bio available'}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div className="stat-card">
              <div className="stat-number gradient-text">{stats.totalRepos}</div>
              <div className="stat-label">Repositories</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">{stats.totalContributions}</div>
              <div className="stat-label">Contributions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">{stats.highImpactContributions}</div>
              <div className="stat-label">High Impact</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">{stats.avgStars}</div>
              <div className="stat-label">Avg Stars</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">{stats.impactScore}%</div>
              <div className="stat-label">Impact Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">{stats.collaborationScore}</div>
              <div className="stat-label">Collaboration</div>
            </div>
          </div>
        </div>
      )}

      {/* Contributions List */}
      {contributions.length > 0 && (
        <div className="card animate-fadeIn" style={{ marginBottom: '32px' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Recent Open Source Contributions
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              Showing {contributions.length} contributions across {stats.totalRepos} repositories
            </p>
          </div>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {contributions.map((contribution, index) => (
              <div key={index} className="contribution-item">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {getTypeIcon(contribution.type)}
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        {contribution.title}
                      </h4>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                      in <strong>{contribution.repo}</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star style={{ width: '14px', height: '14px' }} />
                        {contribution.stars}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        {contribution.date}
                      </div>
                      {contribution.linesChanged > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Code style={{ width: '14px', height: '14px' }} />
                          {contribution.linesChanged} lines
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <span className={getImpactClass(contribution.impact)}>
                      {contribution.impact} Impact
                    </span>
                    <span className={getStatusClass(contribution.status)}>
                      {contribution.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyze;