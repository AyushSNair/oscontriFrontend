import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, LogOut, Settings, Github } from 'lucide-react';

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-message">{error}</div>
          <button onClick={handleLogout} className="auth-button">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Github className="auth-icon" />
          <h2>Profile</h2>
          <p>Your account information</p>
        </div>

        <div className="profile-content">
          <div className="profile-info">
            <div className="info-item">
              <User className="info-icon" />
              <div>
                <label>Username</label>
                <p>{user?.username}</p>
              </div>
            </div>

            <div className="info-item">
              <Mail className="info-icon" />
              <div>
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="info-item">
              <Calendar className="info-icon" />
              <div>
                <label>Member Since</label>
                <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="profile-button secondary">
              <Settings className="button-icon" />
              Settings
            </button>
            
            <button onClick={handleLogout} className="profile-button danger">
              <LogOut className="button-icon" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
