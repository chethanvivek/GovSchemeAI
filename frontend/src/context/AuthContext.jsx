import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Completely clear all stored credentials and cached onboarding flags
export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('onboarding');
  localStorage.removeItem('onboarding_completed');
  localStorage.removeItem('scheme_auth_token');
  localStorage.removeItem('scheme_user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from stored token dynamically validating against backend
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('scheme_auth_token');
      if (storedToken) {
        try {
          // Dynamic lookup by token via /api/user/me
          const res = await api.get('/user/me');
          if (res.data.success && res.data.data?.user) {
            const userData = res.data.data.user;
            setUser(userData);

            // Fetch dynamic profile specifically for this authenticated user ID
            try {
              const profRes = await api.get('/profile');
              if (profRes.data.success && profRes.data.data?.profile) {
                const prof = profRes.data.data.profile;
                const compPct = profRes.data.data.completion_percentage || 0;
                setProfile(prof);
                setProfileCompletion(compPct);
                setIsProfileComplete(Boolean(profRes.data.profileComplete || profRes.data.data.is_complete || compPct === 100));
              } else {
                setProfile(null);
                setProfileCompletion(0);
                setIsProfileComplete(false);
              }
            } catch {
              setProfile(null);
              setProfileCompletion(0);
              setIsProfileComplete(false);
            }
          } else {
            clearAuthStorage();
            setUser(null);
            setProfile(null);
            setProfileCompletion(0);
            setIsProfileComplete(false);
          }
        } catch {
          clearAuthStorage();
          setUser(null);
          setProfile(null);
          setProfileCompletion(0);
          setIsProfileComplete(false);
        }
      } else {
        clearAuthStorage();
      }
      setIsLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    // 1. Immediately reset in-memory state to avoid state bleed from previous user
    setUser(null);
    setProfile(null);
    setProfileCompletion(0);
    setIsProfileComplete(false);
    clearAuthStorage();

    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: userData, token } = res.data.data;

      // 2. Overwrite token and user in storage for current user
      localStorage.setItem('token', token);
      localStorage.setItem('scheme_auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('scheme_user', JSON.stringify(userData));

      setUser(userData);

      // 3. Fetch profile and onboarding status dynamically from backend for this user ID
      try {
        const profRes = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profRes.data.success && profRes.data.data?.profile) {
          const prof = profRes.data.data.profile;
          const compPct = profRes.data.data.completion_percentage || 0;
          const complete = Boolean(profRes.data.profileComplete || profRes.data.data.is_complete || compPct === 100);
          setProfile(prof);
          setProfileCompletion(compPct);
          setIsProfileComplete(complete);
        } else {
          setProfile(null);
          setProfileCompletion(0);
          setIsProfileComplete(false);
        }
      } catch {
        setProfile(null);
        setProfileCompletion(0);
        setIsProfileComplete(false);
      }
    }
    return res.data;
  };

  const register = async (email, password) => {
    // 1. Reset in-memory state and clear storage
    setUser(null);
    setProfile(null);
    setProfileCompletion(0);
    setIsProfileComplete(false);
    clearAuthStorage();

    const res = await api.post('/auth/register', { email, password });
    if (res.data.success) {
      const { user: userData, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('scheme_auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('scheme_user', JSON.stringify(userData));

      setUser(userData);
      setProfile(null);
      setProfileCompletion(0);
      setIsProfileComplete(false);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue cleanup on client
    }
    // Completely clear all auth tokens and cached profile/onboarding items
    clearAuthStorage();
    setUser(null);
    setProfile(null);
    setProfileCompletion(0);
    setIsProfileComplete(false);
  };

  const refreshProfile = useCallback(async () => {
    try {
      const profRes = await api.get('/profile');
      if (profRes.data.success && profRes.data.data?.profile) {
        const prof = profRes.data.data.profile;
        const compPct = profRes.data.data.completion_percentage || 0;
        setProfile(prof);
        setProfileCompletion(compPct);
        setIsProfileComplete(Boolean(profRes.data.profileComplete || profRes.data.data.is_complete || compPct === 100));
      } else {
        setProfile(null);
        setProfileCompletion(0);
        setIsProfileComplete(false);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      setProfile(null);
      setProfileCompletion(0);
      setIsProfileComplete(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileCompletion,
        isProfileComplete,
        profileComplete: isProfileComplete,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        fetchProfile: refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
