import React from 'react';
import { UserRole } from '../types';
import { Shield, Award, GraduationCap, User } from 'lucide-react';

/**
 * Official School Emblem SVG Component for SMP Negeri 18 Jakarta
 * Styled with traditional Indonesian educational heraldry:
 * Golden rice & cotton garland (Padi & Kapas), blue shield, star, open book & torch.
 */
export const SchoolEmblemSvg: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-full h-full", 
  size 
}) => {
  return (
    <svg 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="60" y1="10" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="60%" stopColor="#0f2b6b" />
          <stop offset="100%" stopColor="#0a1945" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="torchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Garland Halo */}
      <circle cx="60" cy="58" r="54" fill="#09142b" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" />

      {/* Main Heraldic Shield */}
      <path 
        d="M60 12 C88 12 100 24 100 46 C100 78 74 98 60 106 C46 98 20 78 20 46 C20 24 32 12 60 12 Z" 
        fill="url(#shieldGrad)" 
        stroke="url(#goldGrad)" 
        strokeWidth="3.5"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* Inner Shield Accent Line */}
      <path 
        d="M60 18 C83 18 93 28 93 47 C93 73 71 91 60 98 C49 91 27 73 27 47 C27 28 37 18 60 18 Z" 
        fill="none" 
        stroke="#38bdf8" 
        strokeWidth="1.2" 
        opacity="0.7"
      />

      {/* Top Five-Pointed Star of Pancasila */}
      <polygon 
        points="60,20 62.5,27 70,27 64,31.5 66.5,38 60,34 53.5,38 56,31.5 50,27 57.5,27" 
        fill="url(#goldGrad)" 
        stroke="#854d0e" 
        strokeWidth="0.5"
      />

      {/* Torch of Knowledge */}
      {/* Flame */}
      <path 
        d="M60 38 C63 42 66 45 64 49 C62 52 58 52 56 49 C54 45 57 42 60 38 Z" 
        fill="url(#torchGrad)" 
      />
      {/* Torch Handle */}
      <path d="M58 49 L62 49 L61 56 L59 56 Z" fill="url(#goldGrad)" />

      {/* Open Book of Education (Tut Wuri Handayani inspiration) */}
      <path 
        d="M60 58 C53 53 43 54 36 57 L36 71 C43 68 53 67 60 72 C67 67 77 68 84 71 L84 57 C77 54 67 53 60 58 Z" 
        fill="#f8fafc" 
        stroke="#cbd5e1" 
        strokeWidth="1"
      />
      {/* Book Center Seam & Page Lines */}
      <line x1="60" y1="58" x2="60" y2="72" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M40 61 C46 59 54 59 58 62" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M40 64 C46 62 54 62 58 65" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M80 61 C74 59 66 59 62 62" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M80 64 C74 62 66 62 62 65" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />

      {/* Number 18 Emblem Pill */}
      <rect x="47" y="74" width="26" height="15" rx="4" fill="#090e1d" stroke="url(#goldGrad)" strokeWidth="1.5" />
      <text 
        x="60" 
        y="85.5" 
        textAnchor="middle" 
        fill="#fef08a" 
        fontSize="11" 
        fontWeight="900" 
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        18
      </text>

      {/* Bottom Ribbon / Banner */}
      <path 
        d="M26 100 L34 94 L60 97 L86 94 L94 100 L88 104 L60 102 L32 104 Z" 
        fill="url(#goldGrad)" 
        stroke="#78350f" 
        strokeWidth="0.8"
      />
      <text 
        x="60" 
        y="100.5" 
        textAnchor="middle" 
        fill="#451a03" 
        fontSize="5.2" 
        fontWeight="800" 
        fontFamily="sans-serif"
        letterSpacing="0.3"
      >
        SMP NEGERI 18
      </text>
    </svg>
  );
};

/**
 * Universal School Logo Renderer
 * Renders custom image if uploaded, or high-fidelity SchoolEmblemSvg fallback.
 */
interface SchoolLogoProps {
  url?: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  url,
  alt = 'Logo SMP Negeri 18 Jakarta',
  className = 'w-full h-full object-contain',
  fallbackClassName = 'w-full h-full'
}) => {
  if (url && url.trim().length > 0) {
    return (
      <img 
        src={url} 
        alt={alt} 
        className={className} 
        onError={(e) => {
          // If image fails to load, gracefully hide it and let container show SVG
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }
  return <SchoolEmblemSvg className={fallbackClassName} />;
};

/**
 * User Account Avatar Component
 * Displays user photo if uploaded, or role-distinguished heraldic badge.
 */
interface UserAvatarProps {
  url?: string;
  role?: UserRole;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  url,
  role = 'Admin',
  name = 'User',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }[size];

  if (url && url.trim().length > 0) {
    return (
      <div className={`relative rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-slate-700/60 ${sizeClasses} ${className}`}>
        <img 
          src={url} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Role-based styled avatar
  let bgGradient = 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white';
  let RoleIcon = Shield;
  let ringColor = 'ring-blue-400/40';

  if (role === 'Kepala Sekolah') {
    bgGradient = 'bg-gradient-to-tr from-amber-700 via-amber-600 to-yellow-400 text-white';
    RoleIcon = Award;
    ringColor = 'ring-amber-400/50';
  } else if (role === 'Guru') {
    bgGradient = 'bg-gradient-to-tr from-emerald-700 via-teal-600 to-cyan-400 text-white';
    RoleIcon = GraduationCap;
    ringColor = 'ring-emerald-400/50';
  }

  return (
    <div 
      className={`relative rounded-full flex-shrink-0 flex items-center justify-center font-bold shadow-md ring-1 ${ringColor} ${bgGradient} ${sizeClasses} ${className}`}
      title={`${name} (${role})`}
    >
      <RoleIcon className={iconSizes} />
    </div>
  );
};
