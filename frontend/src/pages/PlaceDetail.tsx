import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Place, CrowdSnapshot } from '../types';
import { useCrowdSocket } from '../hooks/useCrowdSocket';
import CrowdBadge from '../components/CrowdBadge';
import TrendArrow from '../components/TrendArrow';
import WaitTimeRange from '../components/WaitTimeRange';
import CrowdChart from '../components/CrowdChart';
import { MapPin, Info, ArrowLeft, Clock, Users, ShieldCheck } from 'lucide-react';

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [history, setHistory] = useState<CrowdSnapshot[]>([]);
  const { status, isConnected } = useCrowdSocket(id);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const placeData = await api.get(`/api/places/${id}`);
        setPlace(placeData);
        
        const histData = await api.get(`/api/places/${id}/history`);
        setHistory(histData);
      } catch (e) {
        console.error("Failed to load details");
      }
    };
    fetchDetails();
  }, [id, status]);

  const handleCheckIn = async () => {
    if (!id || checkingIn) return;
    setCheckingIn(true);
    try {
      await api.post('/api/signals/checkin', { placeId: parseInt(id) });
    } catch(e) {
    } finally {
      setTimeout(() => setCheckingIn(false), 2000);
    }
  };

  if (!place) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary-glow font-medium animate-pulse">Scanning live data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to discovery</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                {place.category}
              </span>
              {isConnected && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Connection
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-text-main mb-4 tracking-tight leading-tight">
              {place.name}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-text-muted text-sm">
               <div className="flex items-center gap-2">
                 <MapPin size={16} className="text-primary" />
                 <span>{place.address}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Users size={16} className="text-primary" />
                 <span>Max Capacity: {place.capacity}</span>
               </div>
            </div>
          </section>

          {/* Live Status Card */}
          <section className="glass-card p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock size={120} />
             </div>
             <div className="relative z-10">
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold mb-6">Real-Time Crowdsource Pulse</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="space-y-6">
                      <div className="transform scale-110 origin-left">
                        {status ? <CrowdBadge level={status.crowdLevel} /> : <span className="text-text-muted italic">Waiting for signal...</span>}
                      </div>
                      {status && (
                        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                           <WaitTimeRange min={status.waitTimeMin} max={status.waitTimeMax} />
                           <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                           <TrendArrow trend={status.trend} />
                        </div>
                      )}
                   </div>
                   <div className="hidden md:flex flex-col items-end text-right">
                      <p className="text-[10px] text-text-muted uppercase font-bold mb-1 opacity-50 text-right">Last Updated</p>
                      <p className="text-text-main font-mono text-xs">{status ? new Date(status.updatedAt).toLocaleTimeString() : '--:--:--'}</p>
                   </div>
                </div>
             </div>
          </section>

          {/* Best Time & Notice Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Best Time Panel */}
             <div className="glass-card p-6 border-l-4 border-l-primary bg-primary/5">
                <div className="flex gap-4">
                   <Clock className="text-primary shrink-0" size={24} />
                   <div>
                      <h4 className="text-text-main font-bold text-sm mb-2">Optimal Visit Time</h4>
                      <p className="text-[#E2E8F0] text-sm leading-relaxed">
                         {status?.crowdLevel === 'HIGH' 
                           ? "Extreme crowds detected. Suggest waiting 2+ hours for better conditions." 
                           : status?.crowdLevel === 'MEDIUM' 
                           ? "Moderate volume. The next 45 minutes are ideal before peak hits." 
                           : "Green light! Best possible time to visit right now."}
                      </p>
                   </div>
                </div>
             </div>

             {/* Relative Crowd Notice */}
             <div className="glass-card p-6 border-l-4 border-l-accent-cyan bg-accent-cyan/5">
                <div className="flex gap-4">
                   <Info className="text-accent-cyan shrink-0" size={24} />
                   <div>
                      <h4 className="text-text-main font-bold text-sm mb-2">Space Context</h4>
                      <p className="text-text-muted text-sm leading-relaxed">
                         {place.capacity > 100 
                           ? "Large venue. Even at medium capacity, expect some walking room." 
                           : "Intimate space. Density levels feel higher here than in larger halls."}
                      </p>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Chart Section */}
          <section>
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-main">24h History Trend</h3>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest bg-white/5 px-3 py-1 rounded">Past 48 Snapshots</span>
             </div>
             <div className="glass-card p-6">
               {history.length > 0 ? (
                 <CrowdChart data={history} />
               ) : (
                 <div className="h-[240px] flex flex-col items-center justify-center text-text-muted text-sm space-y-4">
                    <div className="w-10 h-10 border-2 border-dashed border-white/20 rounded-full animate-spin"></div>
                    <p>Collecting enough historical data points...</p>
                 </div>
               )}
             </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="glass-card p-8 sticky top-24 border border-primary/20 bg-primary/5 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
              <h3 className="text-xl font-bold text-text-main mb-3">Contribute Signal</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-8">
                Your anonymous check-in helps others see the live crowd level. We never store GPS coordinates or personal IDs.
              </p>
              
              <button 
                onClick={handleCheckIn}
                disabled={checkingIn}
                className={`w-full py-4 rounded-2xl font-bold transition-all duration-500 overflow-hidden relative group text-sm tracking-wide ${
                  checkingIn ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'btn-primary'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {checkingIn ? (
                    <>
                      <ShieldCheck size={18} />
                      Signal Broadcasting...
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      I'm at this venue
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </button>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                 <div className="flex items-center gap-3 text-xs text-text-muted bg-white/5 p-4 rounded-xl">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    <span>Your privacy is protected. No location tracking used.</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
