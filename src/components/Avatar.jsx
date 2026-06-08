import React from 'react';
import girl1 from '../assets/girl_1.png';
import boy1 from '../assets/boy_1.png';
import girl2 from '../assets/girl_2.png';
import boy2 from '../assets/boy_2.png';

// Reusable cute vector illustrations for default avatars
export const CatSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="url(#catBg)" />
    <defs>
      <linearGradient id="catBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE5EC" />
        <stop offset="100%" stopColor="#FFD6E8" />
      </linearGradient>
    </defs>
    <path d="M 22 45 L 14 15 L 40 32 Z" fill="#FFA5C9" stroke="#E0559C" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 25 42 L 18 20 L 37 32 Z" fill="#FFC2D9" />
    <path d="M 78 45 L 86 15 L 60 32 Z" fill="#FFA5C9" stroke="#E0559C" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 75 42 L 82 20 L 63 32 Z" fill="#FFC2D9" />
    <path d="M 25 90 C 25 75 35 68 50 68 C 65 68 75 75 75 90 Z" fill="#FFFBF7" stroke="#E0559C" strokeWidth="2.5" />
    <ellipse cx="50" cy="53" rx="35" ry="30" fill="#FFFBF7" stroke="#E0559C" strokeWidth="2.5" />
    <circle cx="38" cy="50" r="3.5" fill="#6D4C57" />
    <circle cx="39.5" cy="48.5" r="1" fill="#FFF" />
    <circle cx="62" cy="50" r="3.5" fill="#6D4C57" />
    <circle cx="63.5" cy="48.5" r="1" fill="#FFF" />
    <ellipse cx="32" cy="56" rx="4" ry="2.5" fill="#FF8EBF" opacity="0.6" />
    <ellipse cx="68" cy="56" rx="4" ry="2.5" fill="#FF8EBF" opacity="0.6" />
    <path d="M 50 54 L 48 52 H 52 Z" fill="#6D4C57" />
    <path d="M 46 57 C 48 59 50 59 50 57 C 50 59 52 59 54 57" stroke="#6D4C57" strokeWidth="2" strokeLinecap="round" />
    <path d="M 12 52 H 4" stroke="#E0559C" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 13 56 L 6 59" stroke="#E0559C" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 88 52 H 96" stroke="#E0559C" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 87 56 L 94 59" stroke="#E0559C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const BunnySVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="url(#bunnyBg)" />
    <defs>
      <linearGradient id="bunnyBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E8F9FD" />
        <stop offset="100%" stopColor="#C0F2F9" />
      </linearGradient>
    </defs>
    <path d="M 32 35 C 28 10 40 8 40 32 Z" fill="#FFFBF7" stroke="#0BB3C9" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 33 32 C 30 14 38 13 38 30 Z" fill="#FFC2D9" />
    <path d="M 68 35 C 72 10 60 8 60 32 Z" fill="#FFFBF7" stroke="#0BB3C9" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 67 32 C 70 14 62 13 62 30 Z" fill="#FFC2D9" />
    <circle cx="50" cy="55" r="28" fill="#FFFBF7" stroke="#0BB3C9" strokeWidth="2.5" />
    <path d="M 38 52 Q 41 49 44 52" stroke="#6D4C57" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 56 52 Q 59 49 62 52" stroke="#6D4C57" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="36" cy="59" r="3" fill="#FF8EBF" opacity="0.6" />
    <circle cx="64" cy="59" r="3" fill="#FF8EBF" opacity="0.6" />
    <circle cx="50" cy="56" r="2" fill="#FF8EBF" />
    <path d="M 47 60 Q 50 63 50 60 Q 50 63 53 60" stroke="#6D4C57" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const BearSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="url(#bearBg)" />
    <defs>
      <linearGradient id="bearBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF2E6" />
        <stop offset="100%" stopColor="#FFE0C2" />
      </linearGradient>
    </defs>
    <circle cx="28" cy="35" r="10" fill="#E6C29E" stroke="#C69465" strokeWidth="2.5" />
    <circle cx="28" cy="35" r="6" fill="#FCE2C6" />
    <circle cx="72" cy="35" r="10" fill="#E6C29E" stroke="#C69465" strokeWidth="2.5" />
    <circle cx="72" cy="35" r="6" fill="#FCE2C6" />
    <circle cx="50" cy="56" r="28" fill="#F7D3AF" stroke="#C69465" strokeWidth="2.5" />
    <ellipse cx="50" cy="62" rx="10" ry="7" fill="#FFF" stroke="#C69465" strokeWidth="1.5" />
    <path d="M 50 58.5 L 47 56.5 H 53 Z" fill="#6D4C57" />
    <path d="M 48 62.5 Q 50 64.5 50 62.5 Q 50 64.5 52 62.5" stroke="#6D4C57" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="39" cy="52" r="3" fill="#6D4C57" />
    <circle cx="40" cy="51" r="0.8" fill="#FFF" />
    <circle cx="61" cy="52" r="3" fill="#6D4C57" />
    <circle cx="62" cy="51" r="0.8" fill="#FFF" />
    <ellipse cx="33" cy="58" rx="3.5" ry="2" fill="#FF8EBF" opacity="0.6" />
    <ellipse cx="67" cy="58" rx="3.5" ry="2" fill="#FF8EBF" opacity="0.6" />
  </svg>
);

export const CakeSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="url(#cakeBg)" />
    <defs>
      <linearGradient id="cakeBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF0F5" />
        <stop offset="100%" stopColor="#FFD6E8" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="74" rx="36" ry="6" fill="#FFF" stroke="#E0559C" strokeWidth="2.5" />
    <path d="M 22 66 L 50 32 L 78 66 Z" fill="#FFFBF7" stroke="#E0559C" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 22 66 L 50 48 L 78 66 Z" fill="#FFC2D9" />
    <path d="M 22 66 Q 30 63 36 66 Q 44 68 50 66 Q 56 63 64 66 Q 72 68 78 66" stroke="#E0559C" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 32 C 45 22 50 15 50 15 C 50 15 55 22 50 32 Z" fill="#FF4D6D" stroke="#C9184A" strokeWidth="1.5" />
    <path d="M 47 24 Q 50 20 53 24" stroke="#70E000" strokeWidth="2" strokeLinecap="round" />
    <circle cx="44" cy="58" r="2" fill="#6D4C57" />
    <circle cx="56" cy="58" r="2" fill="#6D4C57" />
    <path d="M 49 61 C 50 62 51 62 51 61" stroke="#6D4C57" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Avatar({ pfp, className = "w-full h-full object-cover rounded-full" }) {
  if (!pfp) {
    return <img src={girl1} alt="Cozy Girl" className={className} />;
  }

  // 1. Map to newly generated high-quality boy & girl anime avatars
  if (pfp === 'avatar:girl1' || pfp.includes('photo-1573865526739-10659fec78a5')) {
    return <img src={girl1} alt="Cozy Girl" className={className} />;
  }
  if (pfp === 'avatar:boy1' || pfp.includes('photo-1585110396000-c9ffd4e4b308')) {
    return <img src={boy1} alt="Cozy Boy" className={className} />;
  }
  if (pfp === 'avatar:girl2') {
    return <img src={girl2} alt="Pastel Girl" className={className} />;
  }
  if (pfp === 'avatar:boy2') {
    return <img src={boy2} alt="Pastel Boy" className={className} />;
  }

  // 2. Map to the vector animal/cake illustrations
  if (pfp === 'avatar:cat') {
    return <CatSVG className={className} />;
  }
  if (pfp === 'avatar:bunny') {
    return <BunnySVG className={className} />;
  }
  if (pfp === 'avatar:teddy' || pfp.includes('photo-1559251606-c623743a6d76')) {
    return <BearSVG className={className} />;
  }
  if (pfp === 'avatar:cake' || pfp.includes('photo-1588195538326-c5b1e9f80a1b')) {
    return <CakeSVG className={className} />;
  }

  // Fallback to custom file upload (Base64 string) or standard URL
  return (
    <img
      src={pfp}
      alt="User Profile"
      className={className}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.parentNode.innerHTML = `<img src="${girl1}" class="${className}" />`;
      }}
    />
  );
}
