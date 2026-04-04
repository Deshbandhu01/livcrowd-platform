import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { CrowdEvent } from '../types';

interface SparklineProps {
  data: CrowdEvent[];
  color: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color }) => {
  if (!data || data.length === 0) return <div className="h-16 w-full bg-[#141414]/5 rounded-xl animate-pulse" />;

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={['auto', 'auto']} />
          <Line
            type="monotone"
            dataKey="crowdCount"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
