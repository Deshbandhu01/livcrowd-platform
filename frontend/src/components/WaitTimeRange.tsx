import React from 'react';
import { Clock } from 'lucide-react';

interface WaitTimeRangeProps {
  min: number;
  max: number;
}

const WaitTimeRange: React.FC<WaitTimeRangeProps> = ({ min, max }) => {
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <Clock className="text-accent-cyan" size={18} />
      <span className="font-semibold">{min}–{max} min <span className="text-text-muted font-normal text-sm">wait</span></span>
    </div>
  );
};

export default WaitTimeRange;
