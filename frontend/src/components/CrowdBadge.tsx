import React from 'react';
import { CrowdLevel } from '../types';

interface CrowdBadgeProps {
  level: CrowdLevel;
}

const levelConfig = {
  LOW: {
    bg: 'bg-[rgba(16,185,129,0.15)]',
    text: 'text-[#34D399]',
    border: 'border-[rgba(16,185,129,0.4)]',
    shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]'
  },
  MEDIUM: {
    bg: 'bg-[rgba(245,158,11,0.15)]',
    text: 'text-[#FCD34D]',
    border: 'border-[rgba(245,158,11,0.4)]',
    shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]'
  },
  HIGH: {
    bg: 'bg-[rgba(239,68,68,0.15)]',
    text: 'text-[#FCA5A5]',
    border: 'border-[rgba(239,68,68,0.4)]',
    shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]'
  }
};

const CrowdBadge: React.FC<CrowdBadgeProps> = ({ level }) => {
  const config = levelConfig[level];

  return (
    <span className={`px-3 py-1 rounded-full text-[0.72rem] font-semibold tracking-wider uppercase border ${config.bg} ${config.text} ${config.border} ${config.shadow} transition-all duration-400 ease-out inline-flex items-center justify-center`}>
      {level}
    </span>
  );
};

export default CrowdBadge;
