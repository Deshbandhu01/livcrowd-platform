import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton rounded-2xl p-6 h-[200px] flex flex-col justify-between border border-[rgba(255,255,255,0.05)]">
      <div className="flex justify-between items-start">
        <div className="space-y-3 w-2/3">
          <div className="h-3 w-1/4 bg-[rgba(255,255,255,0.1)] rounded"></div>
          <div className="h-5 w-3/4 bg-[rgba(255,255,255,0.1)] rounded"></div>
          <div className="h-3 w-1/2 bg-[rgba(255,255,255,0.1)] rounded mt-2"></div>
        </div>
        <div className="h-6 w-16 bg-[rgba(255,255,255,0.1)] rounded-full"></div>
      </div>
      <div className="flex justify-between border-t border-[rgba(255,255,255,0.05)] pt-4">
        <div className="h-4 w-24 bg-[rgba(255,255,255,0.1)] rounded"></div>
        <div className="h-4 w-20 bg-[rgba(255,255,255,0.1)] rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
