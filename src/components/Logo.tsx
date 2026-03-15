import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Eye Shape */}
      <path 
        d="M10 50C10 50 25 25 50 25C75 25 90 50 90 50C90 50 75 75 50 75C25 75 10 50 10 50Z" 
        stroke="#0B4A75" 
        strokeWidth="8" 
        strokeLinejoin="round"
      />
      {/* Inner Circle / Pupil */}
      <circle cx="50" cy="50" r="15" fill="#0B4A75" />
      
      {/* Trending Arrow */}
      <path 
        d="M35 65L45 50L55 60L75 30L85 40M75 30H85V40" 
        stroke="#2ECC71" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const LogoWithText: React.FC<{ light?: boolean }> = ({ light = false }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3">
        <Logo size={48} />
        <div className="flex flex-col">
          <span className={`text-3xl font-bold tracking-tight ${light ? 'text-white' : 'text-[#0B4A75]'}`}>
            VisionTrade
          </span>
        </div>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${light ? 'text-slate-400' : 'text-[#0B4A75]/70'}`}>
        Intelligent Trading Solutions
      </span>
    </div>
  );
};
