import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Mail, LogOut, Menu, Radar, Store, Compass, GraduationCap, ChevronDown, ChevronRight, Home, Users, MapPin, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  onLogout: () => void;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        borderLeftColor: isActive ? 'var(--color-primary)' : 'transparent',
        backgroundColor: isActive ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
        color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
        boxShadow: isActive ? 'var(--glow-primary)' : 'none'
      })}
      className="flex items-center gap-3 p-2.5 pl-8 rounded-sm border-l-4 transition-all duration-300 font-mono text-xs uppercase tracking-wider hover:bg-white/5"
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  );
};

interface NavSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const NavSection: React.FC<NavSectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-sm transition-all duration-300 font-mono text-xs uppercase tracking-wider hover:bg-white/5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {icon}
        <span className="hidden md:inline flex-1 text-left">{title}</span>
        <span className="hidden md:inline">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {isOpen && (
        <div className="mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      
      {/* Background Grid */}
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(245, 166, 35, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 166, 35, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-30 h-full w-64 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ backgroundColor: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border)' }}
      >
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex flex-col">
            <span className="font-bold font-['Orbitron'] text-lg tracking-widest" style={{ color: 'var(--color-primary)' }}>IIT ROPAR</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>CAMPUS NAV</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden" style={{ color: 'var(--color-text-muted)' }}>
            <LogOut size={20} className="rotate-180"/>
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Dashboard - always visible */}
          <NavLink 
            to="/" 
            style={({ isActive }) => ({
              borderLeftColor: isActive ? 'var(--color-primary)' : 'transparent',
              backgroundColor: isActive ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
              color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
              boxShadow: isActive ? 'var(--glow-primary)' : 'none'
            })}
            className="flex items-center gap-3 p-3 mb-3 rounded-sm border-l-4 transition-all duration-300 font-mono text-xs uppercase tracking-wider hover:bg-white/5"
          >
            <LayoutDashboard size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </NavLink>

          {/* Campus Life Section */}
          <NavSection title="Campus Life" icon={<Users size={18} />} defaultOpen={true}>
            <NavItem to="/daily" icon={<Radar size={16} />} label="Daily Pulse" />
            <NavItem to="/exchange" icon={<Store size={16} />} label="Exchange" />
          </NavSection>

          {/* Explore Section */}
          <NavSection title="Explore" icon={<MapPin size={18} />} defaultOpen={true}>
            <NavItem to="/explorer" icon={<Compass size={16} />} label="Explorer" />
            <NavItem to="/navigation" icon={<Map size={16} />} label="Navigation" />
          </NavSection>

          {/* Academic Section */}
          <NavSection title="Academic" icon={<BookOpen size={18} />} defaultOpen={true}>
            <NavItem to="/academics" icon={<GraduationCap size={16} />} label="Academics" />
            <NavItem to="/mail" icon={<Mail size={16} />} label="Mail" />
          </NavSection>
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-sm overflow-hidden" style={{ border: '1px solid var(--color-primary)', opacity: 0.7 }}>
              <img src={user?.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=fallback'} alt="User" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate" style={{ color: 'var(--color-primary-light)' }}>{user?.username || 'GUEST'}</span>
              <span className="text-xs uppercase" style={{ color: 'var(--color-primary-dark)' }}>{user?.role || 'UNAUTHORIZED'}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2 text-xs font-bold uppercase transition-colors hover:bg-red-950/30"
            style={{ border: '1px solid var(--color-red)', color: 'var(--color-red)', opacity: 0.8 }}
          >
            <LogOut size={14} /> Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* Mobile Header */}
        <header 
          className="md:hidden h-16 flex items-center px-4 justify-between backdrop-blur-sm"
          style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(15, 13, 10, 0.9)' }}
        >
          <span className="font-['Orbitron'] font-bold" style={{ color: 'var(--color-primary)' }}>IIT ROPAR</span>
          <button onClick={() => setMobileMenuOpen(true)} style={{ color: 'var(--color-primary)' }}>
            <Menu />
          </button>
        </header>

        {/* Page Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </div>

        {/* Footer status bar */}
        <div 
          className="h-6 flex items-center justify-between px-4 text-[10px] font-mono select-none"
          style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <span>CONN: STABLE</span>
          <span className="animate-pulse" style={{ color: 'var(--color-primary-dark)' }}>● LIVE FEED</span>
          <span>SECURE LINK ESTABLISHED</span>
        </div>
      </main>
    </div>
  );
};
