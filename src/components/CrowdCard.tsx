import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Clock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Location, CrowdEvent, Trend, Density } from '../types';
import { Sparkline } from './Sparkline';
import { motion } from 'motion/react';

import { calculateWaitTime } from '../lib/crowd-utils';

interface CrowdCardProps {
  location: Location;
  events: CrowdEvent[];
}

export const CrowdCard: React.FC<CrowdCardProps> = ({ location, events }) => {
  const occupancy = (location.currentCrowd / location.capacity) * 100;
  
  const getDensity = (occ: number): Density => {
    if (occ < 40) return 'LOW';
    if (occ < 75) return 'MEDIUM';
    return 'HIGH';
  };

  const density = getDensity(occupancy);
  const waitInfo = calculateWaitTime(location.currentCrowd, location.capacity, location.baseWaitTimePerPerson);

  const statusColors = {
    LOW: '#10b981', // emerald-500
    MEDIUM: '#f59e0b', // amber-500
    HIGH: '#ef4444', // rose-500
  };

  const trendIcons = {
    INCREASING: <TrendingUp size={16} className="text-rose-600" />,
    DECREASING: <TrendingDown size={16} className="text-emerald-600" />,
    STABLE: <Minus size={16} className="text-amber-600" />,
  };

  const trendColors = {
    INCREASING: 'bg-rose-50 text-rose-700 border-rose-100',
    DECREASING: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    STABLE: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-[#141414]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight text-[#141414] leading-none uppercase">{location.name}</h3>
            <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">
              {location.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Live</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${trendColors[location.trend]}`}>
              {trendIcons[location.trend]}
              <span className="text-[10px] font-black uppercase tracking-tighter">{location.trend}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[#141414]/30">
              <Users size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Density</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${density === 'HIGH' ? 'text-rose-500' : density === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {density}
              </span>
              <span className="text-xs font-bold text-[#141414]/20">
                {Math.round(occupancy)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[#141414]/30">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Wait Time</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${waitInfo.label === 'HECTIC' ? 'text-rose-500' : waitInfo.label === 'BUSY' ? 'text-amber-500' : 'text-[#141414]'}`}>
                {waitInfo.display}
              </span>
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#141414]/20">
              {waitInfo.label}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {location.trafficInfo && (
            <div className="p-4 bg-[#141414]/5 rounded-2xl border border-[#141414]/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-[#141414]/40" />
                <p className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-widest">AI Traffic Insight</p>
              </div>
              <p className="text-xs text-[#141414]/70 font-medium leading-relaxed line-clamp-2 italic">{location.trafficInfo}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-[#141414]/30 uppercase tracking-widest">Activity Trend</span>
              <span className="text-[10px] font-bold text-[#141414]/20 uppercase tracking-widest">Last 30m</span>
            </div>
            <Sparkline data={events} color={statusColors[density]} />
          </div>
        </div>
      </div>

      <Link
        to={`/location/${location.id}`}
        className="flex items-center justify-between px-6 py-4 bg-[#141414]/5 hover:bg-[#141414] hover:text-white transition-all group"
      >
        <span className="text-xs font-bold uppercase tracking-widest">View Details</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
};
