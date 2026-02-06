import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Navigation } from './pages/Navigation';
import { MailSummarizer } from './pages/Mail';
import { DailyPulse } from './pages/DailyPulse';
import { StudentExchange } from './pages/StudentExchange';
import { ExplorerGuide } from './pages/ExplorerGuide';
import { AcademicCockpit } from './pages/AcademicCockpit';
import { AIChatbot } from './components/AIChatbot';
import { api, setToken, getToken } from './services/api';
import { UserProfile } from './types';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.me();
        setUser(response.user);
      } catch (err) {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, []);

  const handleLogin = (payload: { user: UserProfile; token: string }) => {
    setUser(payload.user);
    setToken(payload.token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#050b14] flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">INITIALIZING SYSTEM...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={
          user ? (
            <Layout user={user} onLogout={handleLogout}>
              <Dashboard user={user} />
            </Layout>
          ) : <Navigate to="/auth" replace />
        } />

        <Route
          path="/daily"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <DailyPulse user={user} />
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/exchange"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <StudentExchange user={user} />
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/explorer"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <ExplorerGuide />
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/academics"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <AcademicCockpit user={user} />
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/navigation"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Navigation />
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/mail"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <MailSummarizer />
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <AIChatbot />}
    </Router>
  );
}

export default App;
