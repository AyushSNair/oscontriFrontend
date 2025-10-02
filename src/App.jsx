import React, { useState, useEffect } from 'react';
import { Github, Lightbulb, BarChart3, Book, User, LogOut } from 'lucide-react';
import Home from './components/Home.jsx';
import Analyze from './components/Analysis.jsx';
import HowToContribute from './components/HowToContribute.jsx';
import Profile from './components/Profile.jsx';
import PublicProfile from './components/PublicProfile.jsx';
import AuthContainer from './components/Auth/AuthContainer.jsx';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [publicProfileUrl, setPublicProfileUrl] = useState('');

  // Check if user is logged in on app load and handle routing
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // Check if we're viewing a public profile
    const path = window.location.pathname;
    if (path.startsWith('/profile/')) {
      const profileUrl = path.split('/profile/')[1];
      setPublicProfileUrl(profileUrl);
      setCurrentView('public-profile');
      return;
    }
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('main');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setPublicProfileUrl('');
    window.history.pushState({}, '', '/');
  };

  // Show public profile if viewing someone's profile
  if (currentView === 'public-profile') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb, #eff6ff)', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <PublicProfile 
            profileUrl={publicProfileUrl} 
            onBack={handleBackToMain}
          />
        </div>
      </div>
    );
  }

  // Show authentication page if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb, #eff6ff)', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <Github style={{ width: '32px', height: '32px', color: '#374151' }} />
              <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                Open Source Contribution Platform
              </h1>
            </div>
            <p style={{ color: '#6b7280', maxWidth: '768px', margin: '0 auto', fontSize: '16px' }}>
              Your complete toolkit for open source contribution: <strong>Discover perfect repositories</strong> for your skill level, 
              <strong> analyze your impact</strong>, and <strong>learn how to contribute</strong> effectively to the developer community.
            </p>
          </div>
          
          {/* Authentication Container */}
          <AuthContainer onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  // Show main application if user is authenticated
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb, #eff6ff)', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Github style={{ width: '32px', height: '32px', color: '#374151' }} />
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
              Open Source Contribution Platform
            </h1>
          </div>
          <p style={{ color: '#6b7280', maxWidth: '768px', margin: '0 auto', fontSize: '16px' }}>
            Your complete toolkit for open source contribution: <strong>Discover perfect repositories</strong> for your skill level, 
            <strong> analyze your impact</strong>, and <strong>learn how to contribute</strong> effectively to the developer community.
          </p>
          
          {/* User Authentication Section */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#374151', fontSize: '14px' }}>
                Welcome, <strong>{user.username}</strong>!
              </span>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'white'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div className="tab-nav" style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'discover', icon: Lightbulb, label: 'Discover Repos' },
              { id: 'analyze', icon: BarChart3, label: 'Analyze Impact' },
              { id: 'profile', icon: User, label: 'My Profile' },
              { id: 'guide', icon: Book, label: 'How to Contribute' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <tab.icon style={{ width: '16px', height: '16px' }} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'discover' && <Home />}
        {activeTab === 'analyze' && <Analyze />}
        {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} />}
        {activeTab === 'guide' && <HowToContribute />}
      </div>
    </div>
  );
};

export default App;