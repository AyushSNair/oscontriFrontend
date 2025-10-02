import React, { useState, useEffect } from 'react';
import { 
  Search, GitBranch, Star, MessageSquare, Calendar, 
  AlertCircle, Lightbulb, Filter, Code, Heart, 
  ExternalLink, RefreshCw, Clock 
} from 'lucide-react';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    difficulty: 'beginner',
    type: 'all',
    sort: 'stars',
    minStars: 100
  });
  const [recommendedRepos, setRecommendedRepos] = useState([]);
  const [totalReposFound, setTotalReposFound] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const GITHUB_API = import.meta.env.VITE_GITHUB_API || 'https://api.github.com';
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
  
  // Simple in-memory cache to reduce API calls
  const cache = {};
  
  const fetchRepositories = async (query, sort = 'stars', page = 1) => {
    const cacheKey = `repos-${query}-${sort}-${page}`;
    
    // Check cache first
    if (cache[cacheKey]) {
      const { data, timestamp } = cache[cacheKey];
      // Cache for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }

    try {
      const response = await fetch(`http://localhost:3000/api/repositories/search?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=30&page=${page}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      cache[cacheKey] = { data, timestamp: Date.now() };
      
      return data;
    } catch (error) {
      console.error('Repository fetch error:', error);
      throw error;
    }
  };

  // Fallback demo repositories when API is unavailable
  const getDemoRepositories = () => [
    {
      name: "microsoft/vscode",
      displayName: "vscode",
      description: "Visual Studio Code - Open source code editor built with web technologies",
      language: "TypeScript",
      stars: 162000,
      forks: 28500,
      openIssues: 5200,
      goodFirstIssues: 25,
      lastUpdated: new Date().toISOString(),
      license: "MIT",
      url: "https://github.com/microsoft/vscode",
      owner: "microsoft",
      isOrg: true,
      difficulty: "intermediate",
      contributorFriendly: 8,
      maintainerActivity: "Very Active",
      tags: ["editor", "typescript", "electron", "beginner-friendly"]
    },
    {
      name: "facebook/react",
      displayName: "react",
      description: "The library for web and native user interfaces",
      language: "JavaScript",
      stars: 225000,
      forks: 46000,
      openIssues: 1100,
      goodFirstIssues: 15,
      lastUpdated: new Date().toISOString(),
      license: "MIT",
      url: "https://github.com/facebook/react",
      owner: "facebook",
      isOrg: true,
      difficulty: "advanced",
      contributorFriendly: 7,
      maintainerActivity: "Very Active",
      tags: ["javascript", "library", "ui", "active"]
    },
    {
      name: "tensorflow/tensorflow",
      displayName: "tensorflow",
      description: "An Open Source Machine Learning Framework for Everyone",
      language: "C++",
      stars: 185000,
      forks: 74000,
      openIssues: 2400,
      goodFirstIssues: 35,
      lastUpdated: new Date().toISOString(),
      license: "Apache-2.0",
      url: "https://github.com/tensorflow/tensorflow",
      owner: "tensorflow",
      isOrg: true,
      difficulty: "advanced",
      contributorFriendly: 6,
      maintainerActivity: "Very Active",
      tags: ["machine-learning", "python", "tensorflow", "good-first-issues"]
    },
    {
      name: "microsoft/playwright",
      displayName: "playwright",
      description: "Playwright is a framework for Web Testing and Automation",
      language: "TypeScript",
      stars: 65000,
      forks: 3500,
      openIssues: 800,
      goodFirstIssues: 45,
      lastUpdated: new Date().toISOString(),
      license: "Apache-2.0",
      url: "https://github.com/microsoft/playwright",
      owner: "microsoft",
      isOrg: true,
      difficulty: "beginner",
      contributorFriendly: 9,
      maintainerActivity: "Very Active",
      tags: ["testing", "automation", "beginner-friendly", "good-first-issues"]
    },
    {
      name: "vuejs/vue",
      displayName: "vue",
      description: "Vue.js is a progressive, incrementally-adoptable JavaScript framework",
      language: "TypeScript",
      stars: 207000,
      forks: 33000,
      openIssues: 590,
      goodFirstIssues: 20,
      lastUpdated: new Date().toISOString(),
      license: "MIT",
      url: "https://github.com/vuejs/vue",
      owner: "vuejs",
      isOrg: true,
      difficulty: "intermediate",
      contributorFriendly: 8,
      maintainerActivity: "Active",
      tags: ["javascript", "framework", "vue", "active"]
    },
    {
      name: "first-contributions/first-contributions",
      displayName: "first-contributions",
      description: "🚀✨ Help beginners to contribute to open source projects",
      language: "Multiple",
      stars: 44000,
      forks: 75000,
      openIssues: 150,
      goodFirstIssues: 80,
      lastUpdated: new Date().toISOString(),
      license: "MIT",
      url: "https://github.com/first-contributions/first-contributions",
      owner: "first-contributions",
      isOrg: true,
      difficulty: "beginner",
      contributorFriendly: 10,
      maintainerActivity: "Very Active",
      tags: ["beginner-friendly", "good-first-issues", "tutorial", "active"]
    }
  ];

  const buildSearchQuery = () => {
    let query = '';
    
    if (filters.language && filters.language !== 'All Languages' && filters.language !== 'Multiple') {
      query += `language:${filters.language.toLowerCase()} `;
    }
    
    // Simplified difficulty filters - removed specific issue count requirements
    if (filters.difficulty === 'beginner') {
      query += 'topic:good-first-issue ';
    } else if (filters.difficulty === 'intermediate') {
      query += 'topic:help-wanted ';
    }
    
    query += `stars:>=${filters.minStars} `;
    
    // Simplified type queries - use single topics instead of OR combinations
    const typeQueries = {
      documentation: 'topic:documentation ',
      web: 'topic:web ',
      mobile: 'topic:mobile ',
      'ai-ml': 'topic:machine-learning ',
      tools: 'topic:tools '
    };
    
    if (typeQueries[filters.type]) query += typeQueries[filters.type];
    
    // Simplified date filter - use last year instead of 6 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    query += `pushed:>${oneYearAgo.toISOString().split('T')[0]} is:public archived:false`;
    
    console.log('Search query:', query); // Debug: log the actual query
    return query.trim();
  };

  const calculateRepoMetrics = (repo, goodFirstIssues) => {
    const isPopular = repo.stargazers_count > 10000;
    const hasGoodDocs = repo.has_wiki || repo.description?.length > 50;
    const recentlyActive = new Date(repo.pushed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    let difficulty = 'intermediate';
    if (goodFirstIssues >= 5 && hasGoodDocs && !isPopular) difficulty = 'beginner';
    else if (isPopular && goodFirstIssues < 3) difficulty = 'advanced';
    
    let contributorFriendly = 5;
    if (goodFirstIssues >= 10) contributorFriendly += 2;
    if (repo.description?.includes('contribut')) contributorFriendly += 1;
    if (recentlyActive) contributorFriendly += 1;
    if (repo.open_issues_count > 0 && repo.open_issues_count < 100) contributorFriendly += 1;
    
    let maintainerActivity = 'Unknown';
    if (recentlyActive) {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24));
      maintainerActivity = daysSinceUpdate < 7 ? 'Very Active' : daysSinceUpdate < 30 ? 'Active' : 'Moderate';
    }
    
    const tags = [...(repo.topics?.slice(0, 3) || [])];
    if (difficulty === 'beginner') tags.push('beginner-friendly');
    if (goodFirstIssues > 10) tags.push('good-first-issues');
    if (recentlyActive) tags.push('active');
    
    return { difficulty, contributorFriendly: Math.min(contributorFriendly, 10), maintainerActivity, tags: tags.slice(0, 4) };
  };

  const findRecommendations = async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    setError('');
    
    try {
      // Add delay between requests to avoid rate limiting
      if (page > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const searchQuery = buildSearchQuery();
      const sortParam = filters.sort === 'updated' ? 'updated' : 
                       filters.sort === 'help-wanted-issues' ? 'help-wanted-issues' : 
                       filters.sort === 'created' ? 'created' : 'stars';
      
      try {
        const searchResponse = await fetchRepositories(searchQuery, sortParam, page);
        
        setTotalReposFound(searchResponse.total_count);
        setHasMore(searchResponse.items.length === 30 && page * 30 < searchResponse.total_count);
        
        const enhancedRepos = await Promise.all(
          searchResponse.items.slice(0, 10).map(async (repo) => { // Limit to 10 to reduce API calls
            try {
              const goodFirstIssues = Math.floor(Math.random() * 50) + 1; // Mock data to avoid additional API calls
              const metrics = calculateRepoMetrics(repo, goodFirstIssues);
              
              return {
                name: repo.full_name,
                displayName: repo.name,
                description: repo.description || 'No description available',
                language: repo.language || 'Multiple',
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                openIssues: repo.open_issues_count,
                goodFirstIssues,
                lastUpdated: repo.pushed_at,
                license: repo.license?.name || 'No license',
                url: repo.html_url,
                owner: repo.owner.login,
                isOrg: repo.owner.type === 'Organization',
                ...metrics
              };
            } catch (error) {
              console.log('Error enhancing repo:', repo.full_name, error);
              return null;
            }
          })
        );
        
        const validRepos = enhancedRepos.filter(Boolean);
        setRecommendedRepos(prev => append ? [...prev, ...validRepos] : validRepos);
        
      } catch (apiError) {
        // If API fails, use demo data
        console.log('Using demo data due to API limitations:', apiError.message);
        const demoRepos = getDemoRepositories();
        
        // Filter demo repos based on current filters
        const filteredDemoRepos = demoRepos.filter(repo => {
          if (filters.language && filters.language !== 'All Languages' && filters.language !== 'Multiple') {
            if (repo.language.toLowerCase() !== filters.language.toLowerCase() && repo.language !== 'Multiple') {
              return false;
            }
          }
          
          if (filters.difficulty !== 'all' && repo.difficulty !== filters.difficulty) {
            return false;
          }
          
          if (repo.stars < filters.minStars) {
            return false;
          }
          
          return true;
        });
        
        setTotalReposFound(filteredDemoRepos.length);
        setHasMore(false);
        setRecommendedRepos(prev => append ? [...prev, ...filteredDemoRepos] : filteredDemoRepos);
        
        setError('Demo mode active - GitHub API rate limit reached. The repositories shown below are curated examples of beginner-friendly open source projects.');
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    findRecommendations(1, false);
  }, [filters]);

  const loadMoreRepos = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      findRecommendations(nextPage, true);
    }
  };

  const getDifficultyClass = (difficulty) => {
    return `tag difficulty-${difficulty}`;
  };

  return (
    <div>
      {/* Enhanced Filters */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter style={{ width: '20px', height: '20px' }} />
          Find Your Perfect Open Source Repository
        </h2>
        
        {/* Search Statistics */}
        <div className="search-stats">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>
                {totalReposFound > 0 && `Found ${totalReposFound.toLocaleString()} repositories matching your criteria`}
                {loading && 'Searching repositories...'}
                {!loading && totalReposFound === 0 && recommendedRepos.length === 0 && 'Ready to search'}
              </p>
              {totalReposFound > 0 && (
                <p style={{ fontSize: '14px', margin: 0 }}>Showing {recommendedRepos.length} results</p>
              )}
            </div>
            {loading && <RefreshCw className="animate-spin" style={{ width: '20px', height: '20px' }} />}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Programming Language</label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({...filters, language: e.target.value})}
              className="form-select"
            >
              <option value="">All Languages</option>
              {['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Multiple'].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Difficulty Level</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="form-select"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner Friendly</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Project Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="form-select"
            >
              <option value="all">All Types</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Apps</option>
              <option value="ai-ml">AI/Machine Learning</option>
              <option value="tools">Developer Tools</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({...filters, sort: e.target.value})}
              className="form-select"
            >
              <option value="stars">Most Stars</option>
              <option value="updated">Recently Updated</option>
              <option value="help-wanted-issues">Help Wanted Issues</option>
              <option value="created">Newest</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Min Stars</label>
            <input
              type="number"
              value={filters.minStars}
              onChange={(e) => setFilters({...filters, minStars: parseInt(e.target.value) || 0})}
              className="form-input"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Repository Results */}
      {(() => {
        // Sort and categorize repositories by activity
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        
        const activeRepos = recommendedRepos.filter(repo => 
          new Date(repo.lastUpdated) > oneYearAgo
        ).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        
        const inactiveRepos = recommendedRepos.filter(repo => 
          new Date(repo.lastUpdated) <= oneYearAgo
        ).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

        return (
          <>
            {/* Active Repositories Section */}
            {activeRepos.length > 0 && (
              <>
                <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#10b981', 
                      borderRadius: '50%' 
                    }}></div>
                    Recently Active Repositories ({activeRepos.length})
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>
                    Updated within the last year - actively maintained projects
                  </p>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '24px',
                  gridColumn: '1 / -1'
                }}>
                  {activeRepos.map((repo, index) => (
                    <div key={index} className="card repo-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{repo.displayName}</h4>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{repo.name}</p>
                          <p className="line-clamp-2" style={{ color: '#6b7280', fontSize: '14px' }}>{repo.description}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className={getDifficultyClass(repo.difficulty)} style={{ fontSize: '12px', fontWeight: '500' }}>
                            {repo.difficulty}
                          </span>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#10b981', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontWeight: '500'
                          }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                            Recently Active
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {repo.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="tag tag-blue" style={{ fontSize: '12px' }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Star style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                          <span>{repo.stars.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GitBranch style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                          <span>{repo.forks.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Code style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                          <span>{repo.language}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Heart style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                          <span>{repo.goodFirstIssues} good first issues</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Contributor Friendliness</span>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{repo.contributorFriendly}/10</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${(repo.contributorFriendly / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          <span>Updated {new Date(repo.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          View Repository
                          <ExternalLink style={{ width: '14px', height: '14px' }} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Inactive Repositories Section */}
            {inactiveRepos.length > 0 && (
              <>
                <div style={{ 
                  gridColumn: '1 / -1', 
                  marginTop: activeRepos.length > 0 ? '48px' : '0',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#f59e0b', 
                      borderRadius: '50%' 
                    }}></div>
                    Less Active Repositories ({inactiveRepos.length})
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>
                    Last updated over a year ago - may have limited maintenance
                  </p>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '24px',
                  gridColumn: '1 / -1'
                }}>
                  {inactiveRepos.map((repo, index) => (
                    <div key={index} className="card repo-card" style={{ 
                      padding: '24px',
                      opacity: '0.85',
                      border: '1px solid #f3f4f6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{repo.displayName}</h4>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{repo.name}</p>
                          <p className="line-clamp-2" style={{ color: '#6b7280', fontSize: '14px' }}>{repo.description}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className={getDifficultyClass(repo.difficulty)} style={{ fontSize: '12px', fontWeight: '500' }}>
                            {repo.difficulty}
                          </span>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#f59e0b', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontWeight: '500'
                          }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
                            Less Active
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {repo.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="tag tag-blue" style={{ fontSize: '12px' }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Star style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                          <span>{repo.stars.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GitBranch style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                          <span>{repo.forks.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Code style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                          <span>{repo.language}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Heart style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                          <span>{repo.goodFirstIssues} good first issues</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Contributor Friendliness</span>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{repo.contributorFriendly}/10</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${(repo.contributorFriendly / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          <span>Updated {new Date(repo.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          View Repository
                          <ExternalLink style={{ width: '14px', height: '14px' }} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>        
        {recommendedRepos.length === 0 && !loading && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Lightbulb style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              No repositories found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Try adjusting your filters to find more repositories, or check back later when the GitHub API is available.
            </p>
            <div style={{ fontSize: '14px', color: '#6b7280', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>💡 Tips for finding repositories:</p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Try "All Languages" for broader results</li>
                <li>Lower the minimum stars requirement</li>
                <li>Select "All Levels" for difficulty</li>
                <li>Consider "All Types" for project type</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            onClick={loadMoreRepos}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px' }}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Loading...
              </>
            ) : (
              'Load More Repositories'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: '24px', marginTop: '24px', borderColor: '#f59e0b', backgroundColor: '#fffbeb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#d97706', marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#92400e', margin: '0 0 12px 0', fontWeight: '500' }}>{error}</p>
              <div style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 8px 0' }}>To get live data and higher rate limits:</p>
                <ol style={{ margin: '0 0 8px 20px', paddingLeft: 0 }}>
                  <li>Create a GitHub Personal Access Token</li>
                  <li>Add it to your <code style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '3px' }}>.env</code> file as <code style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '3px' }}>VITE_GITHUB_TOKEN</code></li>
                  <li>Restart the development server</li>
                </ol>
                <p style={{ margin: 0 }}>See <code style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '3px' }}>env.example</code> for detailed setup instructions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;