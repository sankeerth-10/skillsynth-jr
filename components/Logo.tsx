
import React from 'react';

export const SkillSynthLogo: React.FC<{ className?: string, hideText?: boolean, size?: number }> = ({ className = "", hideText = false, size = 48 }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Refined Mascot SVG based on SkillSynth Jr image */}
      <div className="relative">
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg overflow-visible">
          {/* Rainbow Trail Sweep */}
          <path d="M10 85C25 80 40 70 85 80C110 85 140 80 150 75" stroke="url(#sweep_grad)" strokeWidth="6" strokeLinecap="round" className="opacity-80" />
          
          {/* Robot Body */}
          <rect x="25" y="30" width="50" height="50" rx="25" fill="url(#body_grad)" stroke="#1E293B" strokeWidth="1.5" />
          
          {/* Face Plate */}
          <rect x="32" y="38" width="36" height="22" rx="11" fill="#0F172A" />
          
          {/* Glowing Eyes */}
          <circle cx="42" cy="49" r="2.5" fill="#38BDF8" />
          <circle cx="58" cy="49" r="2.5" fill="#38BDF8" />
          
          {/* Smile */}
          <path d="M46 54C46 54 48 56 50 56C52 56 54 54 54 54" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Ears/Antennas */}
          <circle cx="25" cy="55" r="8" fill="#1E40AF" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="75" cy="55" r="8" fill="#1E40AF" stroke="#1E293B" strokeWidth="1.5" />
          
          {/* Golden Core */}
          <path d="M50 65L55 70L50 75L45 70L50 65Z" fill="#FBBF24" className="animate-pulse" />
          
          <defs>
            <linearGradient id="body_grad" x1="25" y1="30" x2="75" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" />
              <stop offset="0.7" stopColor="#6366F1" />
              <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="sweep_grad" x1="10" y1="85" x2="150" y2="75" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" />
              <stop offset="0.5" stopColor="#8B5CF6" />
              <stop offset="0.8" stopColor="#EC4899" />
              <stop offset="1" stopColor="#F97316" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Stars */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-orange rounded-full animate-ping opacity-50"></div>
        <div className="absolute top-2 -left-2 w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse"></div>
      </div>
      
      {!hideText && (
        <div className="flex items-center">
          <span className="text-2xl font-black tracking-tighter text-brand-blue">Skill</span>
          <span className="text-2xl font-black tracking-tighter text-brand-indigo dark:text-slate-100">Synth</span>
          <div className="ml-2 jr-badge text-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase italic shadow-lg shadow-brand-orange/20">
            Jr
          </div>
        </div>
      )}
    </div>
  );
};

export const SkillSynthMascot: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute w-64 h-64 bg-brand-blue/10 dark:bg-brand-blue/5 blur-[100px] rounded-full animate-pulse" />
    <SkillSynthLogo hideText size={140} />
  </div>
);
