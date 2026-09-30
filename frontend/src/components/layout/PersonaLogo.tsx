import React from 'react';

interface PersonaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
}

export const PersonaLogo: React.FC<PersonaLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  showBadge = true,
  badgeText = 'AGENT',
  subtitle,
}) => {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* High-Quality Scalable Vector Logo Mark: Vocal Persona (Representative + Voice Acoustics) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
      >
        <defs>
          <linearGradient id="pLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#0A0E1A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="pTorsoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>

          <linearGradient id="pHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          <linearGradient id="pWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <filter id="pCleanShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Squircle Base */}
        <rect width="512" height="512" rx="120" fill="url(#pLogoBg)" />
        <rect width="506" height="506" x="3" y="3" rx="117" stroke="#334155" strokeWidth="1.8" strokeOpacity="0.5" />

        {/* Representative Persona Silhouette with Acoustic Broadcast Waves */}
        <g transform="translate(220, 256)" filter="url(#pCleanShadow)">
          {/* Persona Torso / Shoulders */}
          <path
            d="M -115 135 C -115 35 -65 0 0 0 C 65 0 115 35 115 135 C 115 144 108 152 98 152 H -98 C -108 152 -115 144 -115 135 Z"
            fill="url(#pTorsoGrad)"
          />

          {/* Persona Head / Mind */}
          <circle cx="0" cy="-68" r="48" fill="url(#pHeadGrad)" />

          {/* Central Identification Node */}
          <circle cx="0" cy="56" r="14" fill="#FFFFFF" />

          {/* Voice Waves (Acoustic Arcs) */}
          <g fill="none" stroke="url(#pWaveGrad)" strokeLinecap="round">
            <path d="M 88 -90 C 114 -72 114 -32 88 -14" strokeWidth="13" />
            <path d="M 124 -112 C 160 -86 160 -18 124 8" strokeWidth="13" />
            <path d="M 160 -134 C 206 -100 206 -4 160 30" strokeWidth="11" opacity="0.65" />
          </g>
        </g>
      </svg>

      {/* Typography */}
      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg text-white tracking-tight">Persona</span>
            {showBadge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};
