import React from 'react';

interface PersonaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  showBadge?: boolean;
  subtitle?: string;
}

export const PersonaLogo: React.FC<PersonaLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  showBadge = true,
  subtitle,
}) => {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Dynamic Scalable Vector Logo Mark (Non-Letter Cyber Shield Prism) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
      >
        <defs>
          <linearGradient id="pLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#080B15" />
            <stop offset="35%" stopColor="#0D1124" />
            <stop offset="70%" stopColor="#140E2C" />
            <stop offset="100%" stopColor="#090C16" />
          </linearGradient>

          <linearGradient id="pLogoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#818CF8" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#C084FC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="pShieldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="75%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          <linearGradient id="pShieldRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="30%" stopColor="#A855F7" />
            <stop offset="70%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="pLogoBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#C084FC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
          </linearGradient>

          <radialGradient id="pLogoHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Base */}
        <rect width="512" height="512" rx="122" fill="url(#pLogoBg)" />
        <rect width="506" height="506" x="3" y="3" rx="119" stroke="url(#pLogoBorder)" strokeWidth="2.5" />

        {/* Ambient Halo */}
        <circle cx="256" cy="250" r="150" fill="url(#pLogoHalo)" />

        {/* Voice Waves */}
        <path d="M 408 175 A 95 95 0 0 1 408 325" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
        <path d="M 104 175 A 95 95 0 0 0 104 325" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" opacity="0.85" />

        {/* Cybernetic Shield Facets */}
        <path d="M 256 94 L 140 160 C 134 246 160 340 256 414 L 256 94 Z" fill="url(#pShieldLeft)" stroke="url(#pLogoBevel)" strokeWidth="2.5" />
        <path d="M 256 94 L 372 160 C 378 246 352 340 256 414 L 256 94 Z" fill="url(#pShieldRight)" stroke="url(#pLogoBevel)" strokeWidth="2.5" />

        {/* Inner Diamond Core Chamber */}
        <polygon points="256,156 332,250 256,344 180,250" fill="#080C18" stroke="#38BDF8" strokeWidth="3" />

        {/* Central Neural AI Spark */}
        <g transform="translate(256, 250)">
          <path d="M 0 -36 Q 0 0 36 0 Q 0 0 0 36 Q 0 0 -36 0 Q 0 0 0 -36 Z" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="8" fill="#38BDF8" />
        </g>
      </svg>

      {/* Typography */}
      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg text-white tracking-tight">Persona</span>
            {showBadge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                AI
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};
