import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCrowdData } from '../hooks/useCrowdData';
import { CrowdCard } from '../components/CrowdCard';
import { generateSpeech, getNewLocationDetails } from '../services/gemini';
import { Search, Filter, History, X, Clock, CheckCircle2, XCircle, Volume2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { SearchHistory } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { locations, events, loading } = useCrowdData();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleAutoCreate = async () => {
    if (!search.trim() || isCreating) return;
    
    setIsCreating(true);
    try {
      const details = await getNewLocationDetails(search);
      if (details) {
        const path = 'locations';
        await addDoc(collection(db, path), {
          ...details,
          capacity: Math.floor(details.capacity) || 500,
          currentCrowd: Math.floor((details.capacity || 500) * 0.3),
          trend: 'STABLE',
          baseWaitTimePerPerson: 0.5,
          lastUpdated: serverTimestamp()
        });
        setSearch('');
        alert(`✅ Successfully added "${details.name}" to the dashboard!`);
      } else {
        alert(`⚠️ Could not fetch details for "${search}".\n\nThis may be a temporary API issue. Please:\n1. Check your browser Console (F12) for the exact error\n2. Try again in a few seconds\n3. Try a more specific name (e.g. "Goa Beach" instead of "Goa")`);
      }
    } catch (err) {
      console.error("Auto-create error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`❌ Failed to create location.\n\n${msg}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTTS = async () => {
    if (!search.trim() || isSpeaking) return;
    
    setIsSpeaking(true);
    const textToSpeak = filteredLocations.length > 0 
      ? `Found ${filteredLocations.length} locations matching ${search}. The top result is ${filteredLocations[0].name} with ${filteredLocations[0].currentCrowd} people.`
      : `No locations found for ${search}. We are working to fetch real-time data for this area.`;

    const base64Audio = await generateSpeech(textToSpeak);
    if (base64Audio) {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } else {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const path = 'searchHistory';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as SearchHistory));
      data.sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0));
      setHistory(data.slice(0, 10));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [user]);

  const saveSearch = async (q: string) => {
    if (!user || !q.trim()) return;
    
    const isFound = locations.some(loc => 
      loc.name.toLowerCase() === q.trim().toLowerCase() ||
      loc.name.toLowerCase().includes(q.trim().toLowerCase())
    );

    const path = 'searchHistory';
    try {
      await addDoc(collection(db, path), {
        query: q.trim(),
        userId: user.uid,
        timestamp: serverTimestamp(),
        status: isFound ? 'found' : 'not_found'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const path = `searchHistory/${id}`;
    try {
      await deleteDoc(doc(db, 'searchHistory', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    
    const occ = (loc.currentCrowd / loc.capacity) * 100;
    const density = occ < 40 ? 'LOW' : occ < 75 ? 'MEDIUM' : 'HIGH';
    return matchesSearch && density === filter;
  });

  const handleSearch = (queryStr: string) => {
    const q = queryStr.trim().toLowerCase();
    if (!q) return;

    setSearch(queryStr);
    setShowHistory(false);
    
    // Check for exact or partial match to navigate directly
    const match = locations.find(loc => 
      loc.name.toLowerCase() === q || 
      loc.name.toLowerCase().includes(q)
    );

    if (match) {
      navigate(`/location/${match.id}`);
    }
    
    saveSearch(queryStr);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSearch(search);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q && locations.length > 0) {
      // Use a small delay to ensure locations are loaded and we don't loop
      const timer = setTimeout(() => {
        const queryStr = q.trim().toLowerCase();
        const match = locations.find(loc => 
          loc.name.toLowerCase() === queryStr || 
          loc.name.toLowerCase().includes(queryStr)
        );
        if (match) {
          navigate(`/location/${match.id}`, { replace: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.search, locations.length]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearch(q);
    }
  }, [location.search]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter">DASHBOARD</h1>
          <p className="text-[#141414]/50 font-medium">Real-time crowd monitoring across all tracked venues.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              className="pl-12 pr-12 py-3 bg-white border border-[#141414]/10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/5 transition-all w-full md:w-64"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {search && (
                <button 
                  type="button"
                  onClick={handleTTS}
                  disabled={isSpeaking}
                  className={`p-1 transition-colors ${isSpeaking ? 'text-emerald-500' : 'text-[#141414]/20 hover:text-[#141414]'}`}
                  title="Listen to results"
                >
                  {isSpeaking ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                </button>
              )}
              {search && (
                <button 
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1 text-[#141414]/20 hover:text-[#141414] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <button 
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="p-1 text-[#141414]/30 hover:text-[#141414] transition-colors"
              >
                <History size={18} />
              </button>
            </div>

            <AnimatePresence>
              {showHistory && history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#141414]/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-[#141414]/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Recent Searches</span>
                    <Clock size={12} className="text-[#141414]/20" />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSearch(item.query)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#141414]/5 cursor-pointer transition-colors group/item"
                      >
                        <div className="flex items-center gap-3">
                          <Search size={14} className="text-[#141414]/20" />
                          <span className="text-sm font-medium">{item.query}</span>
                          {item.status === 'found' ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          ) : (
                            <XCircle size={12} className="text-rose-500" />
                          )}
                        </div>
                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-1 opacity-0 group-hover/item:opacity-100 hover:bg-[#141414]/10 rounded transition-all"
                        >
                          <X size={14} className="text-[#141414]/40" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="flex bg-white border border-[#141414]/10 rounded-full p-1 overflow-x-auto max-w-full">
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-[#141414] text-white' : 'text-[#141414]/40 hover:text-[#141414]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[300px] bg-white rounded-2xl border border-[#141414]/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLocations.map(loc => (
            <CrowdCard key={loc.id} location={loc} events={events[loc.id] || []} />
          ))}
          
          {/* "Working to fetch data" UI for missing locations */}
          {search && filteredLocations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-[#141414]/10 flex flex-col justify-between h-full group hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#141414]/5 rounded-2xl flex items-center justify-center text-[#141414]/20">
                    <Search size={24} />
                  </div>
                  <div className="px-3 py-1 bg-[#141414]/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                    Pending
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight uppercase truncate">"{search}"</h3>
                  <p className="text-sm text-[#141414]/50 font-medium leading-relaxed">
                    We don't have this location in our records yet. Would you like our AI to fetch the details and add it for you?
                  </p>
                  
                  <button
                    onClick={handleAutoCreate}
                    disabled={isCreating}
                    className="w-full py-4 bg-[#141414] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isCreating ? 'Fetching Details...' : 'Create with AI'}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#141414]/5 flex items-center gap-3">
                <div className="w-2 h-2 bg-[#141414]/20 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30">Fetching data...</span>
              </div>
              
              {/* Background accent */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#141414]/5 rounded-full blur-3xl group-hover:bg-[#141414]/10 transition-all" />
            </motion.div>
          )}
        </div>
      )}

      {!loading && !search && filteredLocations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 text-center space-y-4 bg-white rounded-3xl border border-dashed border-[#141414]/20"
        >
          <div className="w-16 h-16 bg-[#141414]/5 rounded-full flex items-center justify-center mx-auto text-[#141414]/20">
            <Search size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No locations available</h3>
            <p className="text-[#141414]/40 font-medium">Try adjusting your filters or check back later.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
