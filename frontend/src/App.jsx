import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import api from './services/api';
import DisclaimerBanner from './components/DisclaimerBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Profile from './pages/Profile';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import TrackerPage from './pages/TrackerPage';
import AssistantPage from './pages/AssistantPage';

export default function App() {
  const [wakeupNotice, setWakeupNotice] = useState(false);

  // Background Ping: Call GET /api/health once on initial load to silently wake up Render backend
  useEffect(() => {
    api.get('/health', { skipRetry: true }).catch(() => {
      // Background silent warmup; errors ignored
    });
  }, []);

  // Listen for non-blocking server wakeup events dispatched during 502/cold-start retries
  useEffect(() => {
    const handleWakeup = (e) => {
      setWakeupNotice(Boolean(e.detail?.active));
    };
    window.addEventListener('server-wakeup-notice', handleWakeup);
    return () => window.removeEventListener('server-wakeup-notice', handleWakeup);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
          {/* Non-blocking friendly cold-start notice */}
          {wakeupNotice && (
            <aside
              role="status"
              aria-live="polite"
              className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/90 text-white rounded-xl shadow-xl border border-slate-700/60 text-xs font-semibold backdrop-blur-md transition-all pointer-events-none"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Server is waking up. Connecting...</span>
            </aside>
          )}

          {/* Top Sticky Disclaimer */}
          <DisclaimerBanner />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Page Content */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/schemes/:id" element={<SchemeDetailPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracker"
                element={
                  <ProtectedRoute>
                    <TrackerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistant"
                element={
                  <ProtectedRoute>
                    <AssistantPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer with Persistent Statutory Notice */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
