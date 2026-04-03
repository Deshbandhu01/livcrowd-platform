import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Place } from '../types';
import { useAllCrowdSockets } from '../hooks/useAllCrowdSockets';
import CrowdBadge from '../components/CrowdBadge';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalPlaces: 0, activePlaces: 0, totalSignals: 0 });
  const [places, setPlaces] = useState<Place[]>([]);
  const statuses = useAllCrowdSockets();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const statsData = await api.get('/api/admin/dashboard');
      setStats(statsData);
      
      const placesData = await api.get('/api/places');
      setPlaces(placesData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOverride = async (id: number, level: string) => {
    try {
      await api.put(`/api/admin/places/${id}/override`, {
        crowdLevel: level,
        trend: 'STABLE',
        waitTimeMin: level === 'HIGH' ? 30 : level === 'MEDIUM' ? 10 : 0,
        waitTimeMax: level === 'HIGH' ? 60 : level === 'MEDIUM' ? 20 : 5,
      });
      // The WebSocket hook will autoupdate the UI when backend broadcasts
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Admin Dashboard</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 border-t-2 border-t-primary">
          <div className="text-text-muted text-sm font-medium tracking-wide mb-2 uppercase">Total Places</div>
          <div className="text-3xl font-bold text-white">{stats.totalPlaces}</div>
        </div>
        <div className="glass-card p-6 border-t-2 border-t-accent-cyan">
          <div className="text-text-muted text-sm font-medium tracking-wide mb-2 uppercase">Active Places</div>
          <div className="text-3xl font-bold text-white">{stats.activePlaces}</div>
        </div>
        <div className="glass-card p-6 border-t-2 border-t-success">
          <div className="text-text-muted text-sm font-medium tracking-wide mb-2 uppercase">System Health</div>
          <div className="text-3xl font-bold text-success flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse inline-block"></span> OK
          </div>
        </div>
      </div>

      {/* Live Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
           <h2 className="text-xl font-semibold text-white">Live Monitoring</h2>
           <button className="btn-primary text-sm px-4 py-2">Add New Place</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-[rgba(0,0,0,0.3)]">
            <thead className="bg-[rgba(255,255,255,0.05)] text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.08)]">Place Name</th>
                <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.08)]">Category</th>
                <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.08)]">Live Status</th>
                <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.08)] text-right">Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)] text-text-secondary text-sm">
              {places.map(place => {
                const status = statuses[place.id];
                return (
                  <tr key={place.id} className="hover:bg-[rgba(124,58,237,0.05)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{place.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted">{place.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {status ? <CrowdBadge level={status.crowdLevel} /> : <span className="opacity-50">Loading...</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOverride(place.id, 'LOW')} className="btn-ghost text-xs px-3 py-1">Set LOW</button>
                        <button onClick={() => handleOverride(place.id, 'HIGH')} className="btn-ghost text-xs px-3 py-1 border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.1)] hover:text-danger">Set HIGH</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
