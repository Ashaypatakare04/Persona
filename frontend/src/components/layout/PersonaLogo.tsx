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
      {/* Dynamic Scalable Vector Logo Mark */}
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
            <stop offset="35%" stopColor="#818CF8" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#C084FC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="pLogoGlyph" x1="10%" y1="90%" x2="90%" y2="15%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="25%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="75%" stopColor="#A855F7" />
            <stop offset="90%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="pLogoBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#C084FC" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
          </linearGradient>

          <radialGradient id="pLogoHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Base */}
        <rect width="512" height="512" rx="122" fill="url(#pLogoBg)" />
        <rect width="506" height="506" x="3" y="3" rx="119" stroke="url(#pLogoBorder)" strokeWidth="2.5" />

        {/* Ambient Halo */}
        <circle cx="265" cy="205" r="145" fill="url(#pLogoHalo)" />

        {/* Soundwave Arcs */}
        <path d="M 404 150 A 85 85 0 0 1 404 260" stroke="#38BDF8" strokeWidth="14" strokeLinecap="round" opacity="0.85" />
        <path d="M 430 128 A 120 120 0 0 1 430 282" stroke="#818CF8" strokeWidth="9" strokeLinecap="round" strokeDasharray="16 20" opacity="0.55" />

        {/* Compound "P" Glyph */}
        <path
          fillRule="evenodd"
          d="
            M 140 152
            A 34 34 0 0 1 174 118
            H 282
            C 346 118 392 156 392 205
            C 392 254 346 292 282 292
            H 220
            A 16 16 0 0 0 204 308
            V 378
            A 32 32 0 0 1 140 378
            Z

            M 218 174
            H 276
            C 308 174 332 188 332 205
            C 332 222 308 236 276 236
            H 218
            A 12 12 0 0 1 206 224
            V 186
            A 12 12 0 0 1 218 174
            Z
          "
          fill="url(#pLogoGlyph)"
          stroke="url(#pLogoBevel)"
          strokeWidth="3"
        />

        {/* Vertical Light Bar */}
        <rect x="166" y="278" width="6" height="96" rx="3" fill="#FFFFFF" opacity="0.9" />

        {/* Central Neural AI Spark */}
        <g transform="translate(262, 205)">
          <path d="M 0 -34 Q 0 0 34 0 Q 0 0 0 34 Q 0 0 -34 0 Q 0 0 0 -34 Z" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="8" fill="#38BDF8" />
        </g>
      </svg>

      {/* Typography (Optional) */}
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
