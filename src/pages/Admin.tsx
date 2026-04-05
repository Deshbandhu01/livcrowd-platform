import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useCrowdData } from '../hooks/useCrowdData';
import { useAuth } from '../AuthContext';
import { getRealtimeTraffic } from '../services/gemini';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Save, 
  X,
  Database,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trend, Location } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const Admin: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { locations, loading: dataLoading } = useCrowdData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);

  const syncRealtimeData = async () => {
    if (locations.length === 0 || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress('Starting sync...');
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        setSyncProgress(`Syncing ${loc.name}… (${i + 1}/${locations.length})`);
        try {
          const result = await getRealtimeTraffic(loc.name, loc.latitude, loc.longitude);
          if (result?.text) {
            await updateDoc(doc(db, 'locations', loc.id), {
              trafficInfo: result.text.substring(0, 500),
              lastUpdated: serverTimestamp(),
            });
            successCount++;
          }
        } catch (locErr) {
          console.error(`Error syncing ${loc.name}:`, locErr);
          failCount++;
        }

        // ── Rate-limit guard: wait 2 s between API calls ──────────────
        if (i < locations.length - 1) {
          await new Promise((res) => setTimeout(res, 2000));
        }
      }
      alert(
        `Sync complete! ✅ ${successCount} updated${
          failCount > 0 ? `, ⚠️ ${failCount} failed (see console)` : ''
        }`
      );
    } catch (err) {
      console.error('Sync error:', err);
      alert(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 100,
    currentCrowd: 0,
    baseWaitTimePerPerson: 0.5,
    trend: 'STABLE' as Trend,
  });

  if (authLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-[#141414]/5 rounded-full flex items-center justify-center mx-auto text-[#141414]/20">
          <Database size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Admin Access Required</h1>
          <p className="text-[#141414]/50 font-medium">Please sign in with an authorized account to manage locations.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-rose-500">Access Denied</h1>
        <p className="text-[#141414]/50 font-medium">You do not have administrative privileges.</p>
      </div>
    );
  }

  const handleSave = async () => {
    const path = editingId ? `locations/${editingId}` : 'locations';
    try {
      if (editingId) {
        await updateDoc(doc(db, 'locations', editingId), {
          ...formData,
          lastUpdated: serverTimestamp(),
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'locations'), {
          ...formData,
          lastUpdated: serverTimestamp(),
        });
        setIsAdding(false);
      }
      setFormData({
        name: '',
        description: '',
        capacity: 100,
        currentCrowd: 0,
        baseWaitTimePerPerson: 0.5,
        trend: 'STABLE',
      });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async (id: string) => {
    const path = `locations/${id}`;
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteDoc(doc(db, 'locations', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const simulateActivity = async (loc: Location, type: 'SPIKE' | 'DROP' | 'STABLE') => {
    let newCrowd = loc.currentCrowd;
    let newTrend: Trend = 'STABLE';

    if (type === 'SPIKE') {
      newCrowd = Math.min(loc.capacity, loc.currentCrowd + Math.floor(Math.random() * 20) + 5);
      newTrend = 'INCREASING';
    } else if (type === 'DROP') {
      newCrowd = Math.max(0, loc.currentCrowd - (Math.floor(Math.random() * 15) + 5));
      newTrend = 'DECREASING';
    } else {
      newTrend = 'STABLE';
    }

    const path = `locations/${loc.id}`;
    try {
      await updateDoc(doc(db, 'locations', loc.id), {
        currentCrowd: newCrowd,
        trend: newTrend,
        lastUpdated: serverTimestamp(),
      });

      await addDoc(collection(db, `locations/${loc.id}/events`), {
        locationId: loc.id,
        timestamp: serverTimestamp(),
        crowdCount: newCrowd,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const seedData = async () => {
    const initialLocations = [
      { name: 'Central Plaza', description: 'Main city square and transit hub', capacity: 500, currentCrowd: 120, trend: 'STABLE' },
      { name: 'Grand Library', description: 'Quiet study spaces and archives', capacity: 200, currentCrowd: 45, trend: 'DECREASING' },
      { name: 'Metro Station A', description: 'Primary underground transit point', capacity: 800, currentCrowd: 650, trend: 'INCREASING' },
      { name: 'Food Court', description: 'Diverse dining options and seating', capacity: 300, currentCrowd: 210, trend: 'STABLE' },
    ];

    try {
      for (const loc of initialLocations) {
        const docRef = await addDoc(collection(db, 'locations'), {
          ...loc,
          baseWaitTimePerPerson: 0.3,
          lastUpdated: serverTimestamp(),
        });

        // Add some initial events
        for (let i = 0; i < 10; i++) {
          await addDoc(collection(db, `locations/${docRef.id}/events`), {
            locationId: docRef.id,
            timestamp: new Date(Date.now() - (10 - i) * 600000),
            crowdCount: loc.currentCrowd + (Math.random() * 40 - 20),
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'locations');
    }
  };

  const cleanupDuplicates = async (silent = false) => {
    const seenNames = new Set<string>();
    const duplicates: string[] = [];

    locations.forEach(loc => {
      const normalizedName = loc.name.trim().toLowerCase();
      if (seenNames.has(normalizedName)) {
        duplicates.push(loc.id);
      } else {
        seenNames.add(normalizedName);
      }
    });

    if (duplicates.length === 0) {
      if (!silent) alert('No duplicate locations found.');
      return;
    }

    const performCleanup = async () => {
      try {
        for (const id of duplicates) {
          await deleteDoc(doc(db, 'locations', id));
        }
        if (!silent) alert('Duplicates removed successfully.');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'locations');
      }
    };

    if (silent) {
      await performCleanup();
    } else if (window.confirm(`Found ${duplicates.length} duplicate locations. Remove them?`)) {
      await performCleanup();
    }
  };

  useEffect(() => {
    if (!dataLoading && locations.length > 0) {
      cleanupDuplicates(true);
    }
  }, [dataLoading, locations.length]);

  const filteredLocations = locations.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  const totalCapacity = locations.reduce((acc, loc) => acc + loc.capacity, 0);
  const totalCrowd = locations.reduce((acc, loc) => acc + loc.currentCrowd, 0);
  const avgOccupancy = totalCapacity > 0 ? (totalCrowd / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase">Admin Panel</h1>
          <p className="text-[#141414]/50 font-medium">Manage locations and simulate real-time crowd activity.</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={syncRealtimeData}
            disabled={isSyncing}
            className="px-6 py-3 bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {isSyncing ? syncProgress : 'Sync Realtime Data'}
          </button>
          <button
            onClick={() => cleanupDuplicates(false)}
            className="px-6 py-3 bg-rose-500/10 text-rose-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            Cleanup Duplicates
          </button>
          <button
            onClick={seedData}
            className="px-6 py-3 bg-emerald-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            <Database size={16} />
            Seed Initial Data
          </button>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
            }}
            className="px-6 py-3 bg-[#141414] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Add Location
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#141414]/10 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Active Venues</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black leading-none">{locations.length}</span>
            <span className="text-xs font-bold text-emerald-500 mb-1">LIVE</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#141414]/10 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Total Occupancy</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black leading-none">{totalCrowd}</span>
            <span className="text-xs font-bold text-[#141414]/30 mb-1">/ {totalCapacity}</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#141414]/10 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Avg Density</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black leading-none">{avgOccupancy.toFixed(1)}%</span>
            <div className={`w-2 h-2 rounded-full mb-2 ${avgOccupancy > 75 ? 'bg-rose-500' : avgOccupancy > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
        <input
          type="text"
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 pr-6 py-3 bg-white border border-[#141414]/10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/5 transition-all w-full"
        />
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-8 rounded-3xl border border-[#141414]/10 space-y-8 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">
                {editingId ? 'Edit Location' : 'New Location'}
              </h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 hover:bg-[#141414]/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#141414]/5 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#141414]/5 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#141414]/5 rounded-xl text-sm font-medium focus:outline-none h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-[#141414] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#141414]/90 flex items-center gap-2"
              >
                <Save size={18} />
                Save Location
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {filteredLocations.map((loc) => (
          <motion.div
            key={loc.id}
            layout
            className="bg-white p-6 rounded-3xl border border-[#141414]/10 flex flex-col md:flex-row md:items-center justify-between gap-8"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black uppercase tracking-tight">{loc.name}</h3>
                <div className={`w-2 h-2 rounded-full ${
                  (loc.currentCrowd / loc.capacity) > 0.75 ? 'bg-rose-500' : 
                  (loc.currentCrowd / loc.capacity) > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </div>
              <p className="text-sm text-[#141414]/40 font-medium">{loc.description}</p>
              <div className="flex items-center gap-4 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#141414]/5 px-2 py-1 rounded">
                  Cap: {loc.capacity}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#141414]/5 px-2 py-1 rounded">
                  Crowd: {loc.currentCrowd}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/20">
                  {loc.lastUpdated ? `Updated ${new Date(loc.lastUpdated.toDate()).toLocaleTimeString()}` : 'No updates'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-[#141414]/5 p-1 rounded-full">
                <button
                  onClick={() => simulateActivity(loc, 'SPIKE')}
                  className="p-2 hover:bg-rose-500 hover:text-white rounded-full transition-all"
                  title="Simulate Spike"
                >
                  <TrendingUp size={18} />
                </button>
                <button
                  onClick={() => simulateActivity(loc, 'STABLE')}
                  className="p-2 hover:bg-[#141414] hover:text-white rounded-full transition-all"
                  title="Simulate Stable"
                >
                  <Minus size={18} />
                </button>
                <button
                  onClick={() => simulateActivity(loc, 'DROP')}
                  className="p-2 hover:bg-emerald-500 hover:text-white rounded-full transition-all"
                  title="Simulate Drop"
                >
                  <TrendingDown size={18} />
                </button>
              </div>

              <div className="h-8 w-px bg-[#141414]/10 hidden md:block" />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(loc.id);
                    setFormData({
                      name: loc.name,
                      description: loc.description,
                      capacity: loc.capacity,
                      currentCrowd: loc.currentCrowd,
                      baseWaitTimePerPerson: loc.baseWaitTimePerPerson,
                      trend: loc.trend,
                    });
                  }}
                  className="p-3 hover:bg-blue-500 hover:text-white rounded-full transition-all text-[#141414]/40"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="p-3 hover:bg-rose-500 hover:text-white rounded-full transition-all text-[#141414]/40"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
