import React from 'react';
import { Link } from 'react-router-dom';
import { useCrowdData } from '../hooks/useCrowdData';
import { useAuth } from '../AuthContext';
import { CrowdCard } from '../components/CrowdCard';
import { ArrowRight, Users, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const { locations, events, loading } = useCrowdData();
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#141414] text-white rounded-full text-[10px] font-bold uppercase tracking-widest"
          >
            <Zap size={12} className="text-amber-400 fill-amber-400" />
            <span>Real-time Crowd Intelligence</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]"
          >
            KNOW THE <span className="text-emerald-500">CROWD</span> <br /> BEFORE YOU GO.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#141414]/60 max-w-2xl mx-auto font-medium"
          >
            Livcrwd provides real-time density tracking and actionable insights to help you make better decisions about when to visit your favorite locations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-[#141414] text-white rounded-full font-bold text-lg hover:bg-[#141414]/90 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>View Live Dashboard</span>
              <ArrowRight size={20} />
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-8 py-4 bg-white border border-[#141414]/10 text-[#141414] rounded-full font-bold text-lg hover:bg-[#141414]/5 transition-all"
              >
                Admin Access
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">LIVE LOCATIONS</h2>
            <p className="text-[#141414]/50 font-medium">Currently tracking {locations.length} venues in real-time.</p>
          </div>
          <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[300px] bg-white rounded-2xl border border-[#141414]/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.slice(0, 3).map(loc => (
              <CrowdCard key={loc.id} location={loc} events={events[loc.id] || []} />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-20">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold">Real-time Density</h3>
          <p className="text-[#141414]/60 leading-relaxed font-medium">
            Live updates every 30 seconds. Know exactly how many people are at a location right now.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold">Actionable Insights</h3>
          <p className="text-[#141414]/60 leading-relaxed font-medium">
            Don't just see data. Get recommendations on the best times to visit based on historical trends.
          </p>
        </div>
        {isAdmin && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold">Admin Controls</h3>
            <p className="text-[#141414]/60 leading-relaxed font-medium">
              Powerful tools for venue managers to simulate scenarios and manage capacity limits.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
