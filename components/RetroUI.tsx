import React from 'react';
import { motion } from 'framer-motion';

export const HUDCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  accent?: 'primary' | 'secondary' | 'tertiary' | 'blue' | 'pink' | 'orange';
}> = ({ children, className = '', title, accent = 'primary' }) => {
  
  const accentColors: Record<string, { border: string; glow: string; text: string }> = {
    primary: { border: 'var(--color-primary)', glow: 'var(--glow-primary)', text: 'var(--color-primary)' },
    secondary: { border: 'var(--color-pink)', glow: 'var(--glow-pink)', text: 'var(--color-pink)' },
    tertiary: { border: 'var(--color-orange)', glow: 'var(--glow-orange)', text: 'var(--color-orange)' },
    blue: { border: 'var(--color-primary)', glow: 'var(--glow-primary)', text: 'var(--color-primary)' },
    pink: { border: 'var(--color-pink)', glow: 'var(--glow-pink)', text: 'var(--color-pink)' },
    orange: { border: 'var(--color-orange)', glow: 'var(--glow-orange)', text: 'var(--color-orange)' }
  };

  const colors = accentColors[accent] || accentColors.primary;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative p-1 backdrop-blur-md ${className}`}
      style={{ 
        backgroundColor: 'var(--color-bg-card)', 
        border: `1px solid ${colors.border}`,
        boxShadow: colors.glow
      }}
    >
      {/* Corner Accents */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 bg-transparent" style={{ borderColor: colors.border }} />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 bg-transparent" style={{ borderColor: colors.border }} />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 bg-transparent" style={{ borderColor: colors.border }} />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 bg-transparent" style={{ borderColor: colors.border }} />
      
      {/* Title Bar */}
      {title && (
        <div 
          className="absolute -top-4 left-4 px-2 text-xs font-bold uppercase tracking-widest"
          style={{ 
            backgroundColor: 'var(--color-bg)', 
            border: `1px solid ${colors.border}`,
            color: colors.text
          }}
        >
          {title}
        </div>
      )}

      <div className="p-4 h-full relative z-10">
        {children}
      </div>
      
      {/* Scanline grid background inside card */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none opacity-20"></div>
    </motion.div>
  );
};

export const HUDButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' }> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "relative px-6 py-3 font-bold uppercase tracking-widest transition-all duration-200 overflow-hidden group";
  
  const variantStyles = {
    primary: {
      bg: 'rgba(245, 166, 35, 0.1)',
      bgHover: 'var(--color-primary)',
      border: 'var(--color-primary)',
      text: 'var(--color-primary)',
      textHover: 'var(--color-bg)',
      glow: 'var(--glow-primary)'
    },
    danger: {
      bg: 'rgba(214, 69, 69, 0.1)',
      bgHover: 'var(--color-red)',
      border: 'var(--color-red)',
      text: 'var(--color-red)',
      textHover: 'var(--color-bg)',
      glow: '0 0 20px rgba(214, 69, 69, 0.6)'
    }
  };

  const vs = variantStyles[variant];

  return (
    <button 
      className={`${baseStyle} ${className}`}
      style={{ 
        backgroundColor: vs.bg, 
        border: `1px solid ${vs.border}`,
        color: vs.text
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = vs.bgHover;
        e.currentTarget.style.color = vs.textHover;
        e.currentTarget.style.boxShadow = vs.glow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = vs.bg;
        e.currentTarget.style.color = vs.text;
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
    </button>
  );
};

export const GlitchText: React.FC<{ text: string, as?: 'h1' | 'h2' | 'h3' | 'p' }> = ({ text, as = 'p' }) => {
  const Component = as;
  return (
    <Component className="relative inline-block group hover:animate-pulse">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -ml-1 opacity-50 animate-pulse hidden group-hover:block" style={{ color: 'var(--color-red)' }} aria-hidden="true">{text}</span>
      <span className="absolute top-0 left-0 ml-1 opacity-50 animate-pulse delay-75 hidden group-hover:block" style={{ color: 'var(--color-primary)' }} aria-hidden="true">{text}</span>
    </Component>
  );
};
