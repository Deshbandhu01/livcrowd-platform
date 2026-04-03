import React from 'react';
import { Trend } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TrendArrow: React.FC<{ trend: Trend }> = ({ trend }) => {
  if (trend === 'INCREASING') {
    return (
      <div className="flex items-center gap-1.5 text-text-muted text-sm">
        <TrendingUp className="text-danger animate-bounce-up" size={16} /> 
        <span className="text-text-secondary font-medium">Increasing</span>
      </div>
    );
  }
  if (trend === 'DECREASING') {
    return (
      <div className="flex items-center gap-1.5 text-text-muted text-sm">
        <TrendingDown className="text-success animate-bounce-down" size={16} /> 
        <span className="text-text-secondary font-medium">Decreasing</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-text-muted text-sm">
      <Minus className="text-text-muted" size={16} /> 
      <span className="text-text-secondary font-medium">Stable</span>
    </div>
  );
};

export default TrendArrow;
