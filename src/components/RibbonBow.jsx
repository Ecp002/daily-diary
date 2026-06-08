import React from 'react';

export default function RibbonBow({ className = "", size = 28, colorPrimary = "#FF69B4", colorSecondary = "#FFB6D9" }) {
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block animate-bow-wiggle select-none filter drop-shadow-[0_2px_4px_rgba(255,105,180,0.25)] ${className}`}
    >
      <defs>
        <linearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorPrimary} />
          <stop offset="50%" stopColor="#FF8EBF" />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
        <linearGradient id="tailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colorPrimary} />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
        <filter id="cuteShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#FF69B4" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Left Tail */}
      <path
        d="M 45 42 C 35 55 18 72 15 75 C 20 75 30 68 40 58 C 45 53 47 48 48 45 Z"
        fill="url(#tailGradient)"
        stroke={colorPrimary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Tail */}
      <path
        d="M 55 42 C 65 55 82 72 85 75 C 80 75 70 68 60 58 C 55 53 53 48 52 45 Z"
        fill="url(#tailGradient)"
        stroke={colorPrimary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Loop */}
      <path
        d="M 45 38 C 25 15 8 32 15 48 C 22 62 38 52 47 42 Z"
        fill="url(#bowGradient)"
        stroke={colorPrimary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Loop */}
      <path
        d="M 55 38 C 75 15 92 32 85 48 C 78 62 62 52 53 42 Z"
        fill="url(#bowGradient)"
        stroke={colorPrimary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Loop Knot */}
      <rect
        x="44"
        y="32"
        width="12"
        height="16"
        rx="6"
        fill="url(#bowGradient)"
        stroke={colorPrimary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Inner folds of the bow to add luxurious details */}
      <path
        d="M 42 38 C 36 34 32 36 30 40"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 58 38 C 64 34 68 36 70 40"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
