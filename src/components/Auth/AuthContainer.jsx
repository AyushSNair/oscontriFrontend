import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const AuthContainer = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup'

  const handleLoginSuccess = (userData) => {
    onAuthSuccess(userData);
  };

  const handleSignupSuccess = (userData) => {
    onAuthSuccess(userData);
  };

  const switchToSignup = () => setAuthMode('signup');
  const switchToLogin = () => setAuthMode('login');

  // Show login or signup based on mode
  return authMode === 'login' ? (
    <Login onSwitchToSignup={switchToSignup} onLoginSuccess={handleLoginSuccess} />
  ) : (
    <Signup onSwitchToLogin={switchToLogin} onSignupSuccess={handleSignupSuccess} />
  );
};

export default AuthContainer;
