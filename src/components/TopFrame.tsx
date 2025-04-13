// src/components/TopFrame.tsx
import React from 'react';
import wuaiLogo from '../assets/images/wuai-square.svg';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const TopFrame: React.FC = () => {
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="top-frame">
      <div className="frame-content">
        <SiteBranding />
        <ExternalLinks toggleTheme={toggleTheme} theme={theme} />
      </div>
    </div>
  );
};

export default TopFrame;

/* =============== Subcomponentes internos =============== */

function SiteBranding() {
  return (
    <div className="site-branding">
      <img
        src={wuaiLogo}
        alt="WuAI Icon"
        className="site-icon"
      />
      <h1 className="site-title">WuAI Character Generator</h1>
    </div>
  );
}

function ExternalLinks({ toggleTheme }: { toggleTheme: () => void, theme: 'light' | 'dark' }) {
  const { isAuthenticated, logout } = useAuth(); 
  return (
    <div className="external-links">
      <a
        href="/dashboard"
        title="WuAI Main Repository"
        rel="noopener"
      >
        Dashboard
      </a>
      <a
        href="/agent/character"
        title="WuAI Main Repository"
        rel="noopener"
      >
        Create agent
      </a>
      {isAuthenticated ? (
        <a
          href="#"
          title="WuAI Main Repository"
          rel="noopener"
          onClick={logout}
        >
          Logout
        </a>
      ) : (
        <a
          href="/login"
          title="WuAI Main Repository"
          rel="noopener"
        >
          Login
        </a>
      )}
      <a
        href="https://github.com/WuAIBSC"
        title="WuAI Main Repository"
        target="_blank"
        rel="noopener"
      >
        <i className="fa-brands fa-github external-icon"></i>
      </a>
      <a
        href="https://github.com/WuAIBSC"
        title="WuAI Installer"
        target="_blank"
        rel="noopener"
      >
        <i className="fa-solid fa-download external-icon"></i>
      </a>
      {/* 
        Si tenías más enlaces comentados, introdúcelos aquí 
        o déjalos comentados si no los necesitas 
      */}
      <button
        id="theme-toggle"
        className="theme-toggle"
        title="Toggle dark mode"
        onClick={toggleTheme}
      >
        <i className="fa-solid fa-moon theme-icon"></i>
      </button>
    </div>
  );
}
