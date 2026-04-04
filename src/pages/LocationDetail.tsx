import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCrowdData } from '../hooks/useCrowdData';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  MapPin,
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'motion/react';

import { calculateWaitTime } from '../lib/crowd-utils';

import { getLiveTrend, getRealtimeTraffic } from '../services/gemini';
import { collection, addDoc, serverTimestamp, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { locations, events, loading } = useCrowdData();
  const location = locations.find(l => l.id === id);
  const locationEvents = events[id || ''] || [];
  const [isUpdating, setIsUpdating] = useState(false);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!location) return <div className="text-center py-20">Location not found</div>;

  const handleAIUpdate = async () => {
    if (isUpdating || !location) return;
    setIsUpdating(true);
    try {
      // 1. Get real-time crowd estimate and trend
      const aiTrend = await getLiveTrend(location.name, location.capacity);
      const trafficInfo = await getRealtimeTraffic(location.name, location.latitude, location.longitude);

      if (aiTrend && aiTrend.length > 0) {
        // 2. Update current crowd in Firestore (use the last point)
        const latestPoint = aiTrend[aiTrend.length - 1];
        const trend = latestPoint.crowdCount > aiTrend[0].crowdCount ? 'INCREASING' : 
                     latestPoint.crowdCount < aiTrend[0].crowdCount ? 'DECREASING' : 'STABLE';

        const batch = writeBatch(db);
        
        // Update location doc
        batch.update(doc(db, 'locations', location.id), {
          currentCrowd: latestPoint.crowdCount,
          trend: trend,
          trafficInfo: trafficInfo.text,
          lastUpdated: serverTimestamp()
        });

        // 3. Add events for the trend to the subcollection
        const eventsPath = `locations/${location.id}/events`;
        for (const point of aiTrend) {
          const newEventRef = doc(collection(db, eventsPath));
          batch.set(newEventRef, {
            crowdCount: point.crowdCount,
            timestamp: new Date(point.timestamp),
            source: 'AI_SIMULATED'
          });
        }

        await batch.commit();
      }
    } catch (err) {
      console.error("AI Update Error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const occupancy = (location.currentCrowd / location.capacity) * 100;
  const waitInfo = calculateWaitTime(location.currentCrowd, location.capacity, location.baseWaitTimePerPerson);

  const getStatus = () => {
    if (occupancy < 40) return { 
      label: 'BEST TIME TO VISIT', 
      icon: <CheckCircle2 className="text-emerald-500" />, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      desc: 'The crowd is minimal. You can enjoy a peaceful visit with almost no wait time.'
    };
    if (occupancy < 75) return { 
      label: 'MODERATE CROWD', 
      icon: <AlertTriangle className="text-amber-500" />, 
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      desc: 'Moderate activity. Expect some short queues and a lively atmosphere.'
    };
    return { 
      label: 'AVOID NOW', 
      icon: <XCircle className="text-rose-500" />, 
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      desc: 'The venue is near capacity. Long wait times expected. Consider visiting later.'
    };
  };

  const status = getStatus();

  const chartData = locationEvents.map(e => ({
    time: format(e.timestamp.toDate(), 'HH:mm'),
    count: e.crowdCount,
    occupancy: Math.round((e.crowdCount / location.capacity) * 100)
  }));

  const hourlyData = [
    { hour: '08:00', level: 10 },
    { hour: '10:00', level: 35 },
    { hour: '12:00', level: 85 },
    { hour: '14:00', level: 95 },
    { hour: '16:00', level: 65 },
    { hour: '18:00', level: 45 },
    { hour: '20:00', level: 20 },
  ];

  return (
    <div className="space-y-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info & Real-time */}
        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-6xl font-black tracking-tighter uppercase">{location.name}</h1>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Live</span>
              </div>
              <button
                onClick={handleAIUpdate}
                disabled={isUpdating}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#141414]/5 hover:bg-[#141414]/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isUpdating ? 'Updating...' : 'Refresh with AI'}
              </button>
            </div>
            <p className="text-xl text-[#141414]/50 font-medium max-w-2xl">{location.description}</p>
            
            <div className="flex flex-wrap gap-4">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + (location.address ? ' ' + location.address : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all"
              >
                <MapPin size={16} />
                Get Directions
                <ExternalLink size={14} className="opacity-50" />
              </a>
              
              {location.address && (
                <div className="flex items-center gap-2 px-6 py-3 bg-[#141414]/5 rounded-full text-xs font-bold text-[#141414]/40 uppercase tracking-widest">
                  <MapPin size={16} />
                  {location.address}
                </div>
              )}
            </div>
          </header>

          <div className={`p-8 rounded-3xl ${status.bg} border border-current/10 space-y-4`}>
            <div className="flex items-center gap-3">
              {status.icon}
              <span className={`text-sm font-black uppercase tracking-widest ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-lg font-bold text-[#141414] leading-snug">{status.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#141414]/10 space-y-2">
              <div className="flex items-center gap-2 text-[#141414]/40">
                <Users size={18} />
                <span className="text-xs font-bold uppercase">Current Crowd</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{location.currentCrowd}</span>
                <span className="text-sm font-bold text-[#141414]/30">/ {location.capacity}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#141414]/10 space-y-2">
              <div className="flex items-center gap-2 text-[#141414]/40">
                <Clock size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Est. Wait Time</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black ${waitInfo.label === 'HECTIC' ? 'text-rose-500' : waitInfo.label === 'BUSY' ? 'text-amber-500' : 'text-[#141414]'}`}>
                  {waitInfo.display}
                </span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#141414]/20">
                {waitInfo.label}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#141414]/10 space-y-2">
              <div className="flex items-center gap-2 text-[#141414]/40">
                <TrendingUp size={18} />
                <span className="text-xs font-bold uppercase">Trend</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black uppercase">{location.trend}</span>
                {location.trend === 'INCREASING' ? <TrendingUp className="text-rose-500" /> : <TrendingDown className="text-emerald-500" />}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black tracking-tight uppercase">Live Trend (Last 30m)</h3>
                {locationEvents.some(e => e.source === 'AI_SIMULATED') && (
                  <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                    AI Managed
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Occupancy %</span>
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#14141440' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#14141440' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorOcc)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Schedule */}
        <div className="space-y-8">
          {location.trafficInfo && (
            <div className="bg-blue-600 text-white p-8 rounded-3xl space-y-4 shadow-xl shadow-blue-500/20">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-blue-200" />
                <h3 className="text-xl font-black uppercase tracking-tight">AI Traffic Insight</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90">{location.trafficInfo}</p>
              {location.bestTimeToVisit && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Best Time to Visit Today</p>
                  <p className="text-sm font-bold">{location.bestTimeToVisit}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-[#141414] text-white p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight">Crowd Insights</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1"><Info size={16} className="text-emerald-400" /></div>
                <p className="text-sm font-medium text-white/70">Peak hours usually occur between 12:00 PM and 3:00 PM.</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1"><Info size={16} className="text-emerald-400" /></div>
                <p className="text-sm font-medium text-white/70">Mondays are typically 30% less crowded than weekends.</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1"><Info size={16} className="text-emerald-400" /></div>
                <p className="text-sm font-medium text-white/70">Entry point B is currently moving faster than Entry A.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 space-y-6">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#141414]/40" />
              <h3 className="text-xl font-black uppercase tracking-tight">Typical Day</h3>
            </div>
            
            <div className="space-y-4">
              {hourlyData.map((d) => (
                <div key={d.hour} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-[#141414]/40">{d.hour}</span>
                    <span className={d.level > 70 ? 'text-rose-500' : d.level > 40 ? 'text-amber-500' : 'text-emerald-500'}>
                      {d.level > 70 ? 'Busy' : d.level > 40 ? 'Moderate' : 'Quiet'}
                    </span>
                  </div>
                  <div className="h-2 bg-[#141414]/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.level}%` }}
                      className={`h-full rounded-full ${d.level > 70 ? 'bg-rose-500' : d.level > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
