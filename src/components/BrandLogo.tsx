import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const titleSize = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl md:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Luxury Shield / Automotive Crest SVG */}
      <div className={`relative ${iconDimensions} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 128 128"
          className="w-full h-full drop-shadow-[0_2px_10px_rgba(229,184,105,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="crestBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1c24" />
              <stop offset="50%" stopColor="#0b0c10" />
              <stop offset="100%" stopColor="#040507" />
            </linearGradient>

            <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff2be" />
              <stop offset="25%" stopColor="#e5b869" />
              <stop offset="60%" stopColor="#b8860b" />
              <stop offset="85%" stopColor="#e5b869" />
              <stop offset="100%" stopColor="#8c6109" />
            </linearGradient>

            <filter id="crestGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Outer Shield Boundary */}
          <polygon
            points="64,6 118,24 104,96 64,122 24,96 10,24"
            fill="url(#crestBg)"
            stroke="url(#goldMetallic)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner Inset Thin Border */}
          <polygon
            points="64,13 111,29 98,92 64,115 30,92 17,29"
            fill="none"
            stroke="url(#goldMetallic)"
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />

          {/* Winged Aero Blade Top Accent */}
          <path
            d="M 28,42 L 64,58 L 100,42 L 88,48 L 64,62 L 40,48 Z"
            fill="url(#goldMetallic)"
            filter="url(#crestGlow)"
          />

          {/* Monogram "E" */}
          <path
            d="M 38,52 L 56,52 L 56,57 L 44,57 L 44,65 L 53,65 L 53,70 L 44,70 L 44,80 L 57,80 L 57,85 L 38,85 Z"
            fill="url(#goldMetallic)"
          />

          {/* Monogram "M" */}
          <path
            d="M 59,52 L 67,52 L 77,72 L 87,52 L 95,52 L 95,85 L 89,85 L 89,63 L 80,81 L 74,81 L 65,63 L 65,85 L 59,85 Z"
            fill="url(#goldMetallic)"
          />

          {/* Bottom Gem Accent */}
          <polygon
            points="64,96 70,102 64,108 58,102"
            fill="url(#goldMetallic)"
          />
        </svg>
      </div>

      {/* Typography Lockup */}
      <div className="flex flex-col leading-none">
        <div className={`font-bold tracking-tight text-white ${titleSize} flex items-center`}>
          <span className="font-display tracking-tight text-white group-hover:text-[#fff2be] transition-colors">
            ELITE
          </span>
          <span className="font-display text-[#e5b869] ml-1.5 font-light tracking-wider">
            MOTORS
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase mt-0.5 font-mono">
            Supercar Atelier
          </span>
        )}
      </div>
    </div>
  );
};
