import React, { useState } from 'react';
import { UserProfile } from '../types';
import { HUDButton, GlitchText } from '../components/RetroUI';
import { motion } from 'framer-motion';
import { api } from '../services/api';

interface AuthProps {
  onLogin: (payload: { user: UserProfile; token: string }) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload =
        mode === 'login'
          ? await api.login(email, password)
          : await api.register(email, password, email.split('@')[0]);
      onLogin(payload);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(245, 166, 35, 0.1) 0%, var(--color-bg) 70%)' }}></div>
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, var(--color-primary) 1px, transparent 2px)' }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="p-8 backdrop-blur-sm" style={{ backgroundColor: 'rgba(26, 22, 18, 0.95)', border: '1px solid rgba(245, 166, 35, 0.3)', boxShadow: '0 0 50px rgba(245, 166, 35, 0.1)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black font-['Orbitron'] mb-2 tracking-widest" style={{ color: 'var(--color-primary)' }}>
              <GlitchText text="IIT ROPAR" as="h1" />
            </h1>
            <p className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Campus Navigation System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase mb-1 font-bold tracking-wider" style={{ color: 'var(--color-primary-dark)' }}>User Identifier (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="STUDENT_ID@INSTITUTE.EDU"
                className="w-full p-3 font-mono transition-all"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-primary-light)' }}
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase mb-1 font-bold tracking-wider" style={{ color: 'var(--color-primary-dark)' }}>Access Key (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full p-3 font-mono transition-all"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-primary-light)' }}
                required
              />
            </div>

            {error && (
              <div className="text-xs font-mono p-2" style={{ color: 'var(--color-orange)', border: '1px solid rgba(244, 162, 97, 0.4)', backgroundColor: 'rgba(244, 162, 97, 0.1)' }}>
                {error}
              </div>
            )}

            <HUDButton type="submit" disabled={loading} className="w-full">
              {loading ? 'AUTHENTICATING...' : mode === 'login' ? 'INITIATE SESSION' : 'CREATE PROFILE'}
            </HUDButton>

            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full text-[10px] font-mono uppercase tracking-widest"
              style={{ color: 'var(--color-primary)' }}
            >
              {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
            </button>

            <div className="text-[10px] text-center font-mono mt-4" style={{ color: 'var(--color-text-muted)' }}>
              <p>UNAUTHORIZED ACCESS IS A VIOLATION OF PROTOCOL 7.2</p>
              <p className="mt-2" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>Demo: admin@campus.edu / pass123</p>
            </div>
          </form>
        </div>

        {/* Decorative corner markers */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: 'var(--color-primary-dark)' }}></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: 'var(--color-primary-dark)' }}></div>
      </motion.div>
    </div>
  );
};
