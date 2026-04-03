import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CrowdSnapshot } from '../types';

interface CrowdChartProps {
  data: CrowdSnapshot[];
}

const CrowdChart: React.FC<CrowdChartProps> = ({ data }) => {
  const chartData = [...data].reverse().map(snapshot => {
    const timeStr = new Date(snapshot.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let value = 0;
    if (snapshot.crowdLevel === 'LOW') value = 20 + Math.random() * 10;
    else if (snapshot.crowdLevel === 'MEDIUM') value = 60 + Math.random() * 10;
    else value = 90 + Math.random() * 10;
    
    return {
      time: timeStr,
      crowdLevel: value,
      levelRaw: snapshot.crowdLevel
    };
  });

  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748B" 
            tick={{fill: '#64748B', fontSize: 12}} 
            tickLine={false} 
            axisLine={false} 
            dy={10} 
          />
          <YAxis 
            stroke="#64748B" 
            tick={{fill: '#64748B', fontSize: 12}}
            tickLine={false} 
            axisLine={false}
            domain={[0, 100]}
            hide
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 10, 40, 0.95)', 
              borderColor: 'rgba(124, 58, 237, 0.3)',
              borderRadius: '8px',
              color: '#E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }} 
            formatter={(value: any, name: string, props: any) => [props.payload.levelRaw, "Level"]}
          />
          <Area 
            type="monotone" 
            dataKey="crowdLevel" 
            stroke="#7C3AED" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCrowd)" 
            filter="url(#glow)"
            activeDot={{ r: 6, fill: '#9F67FF', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CrowdChart;
