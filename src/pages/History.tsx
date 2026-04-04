import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { SearchHistory } from '../types';
import { format } from 'date-fns';
import { History as HistoryIcon, Trash2, Search, Calendar, Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const HistoryPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const path = 'searchHistory';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as SearchHistory));
      // Sort client-side by timestamp desc
      data.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setHistory(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    const path = `searchHistory/${id}`;
    try {
      await deleteDoc(doc(db, 'searchHistory', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-[#141414]/5 rounded-full flex items-center justify-center mx-auto text-[#141414]/20">
          <HistoryIcon size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Login Required</h1>
          <p className="text-[#141414]/50 font-medium">Please sign in to view your search history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter uppercase">Search History</h1>
        <p className="text-[#141414]/50 font-medium">A complete record of your activity on Livcrwd.</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-[#141414]/10 animate-pulse" />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-[#141414]/10 flex items-center justify-between group hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 bg-[#141414]/5 rounded-full flex items-center justify-center text-[#141414]/40">
                    <Search size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#141414]">{item.query}</h3>
                      {item.status === 'found' ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{item.timestamp ? format(item.timestamp.toDate(), 'MMM dd, yyyy') : '...'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{item.timestamp ? format(item.timestamp.toDate(), 'HH:mm:ss') : '...'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    to={`/dashboard?q=${encodeURIComponent(item.query)}`}
                    className="p-2 text-[#141414]/20 hover:text-[#141414] hover:bg-[#141414]/5 rounded-full transition-all"
                    title="Search again"
                  >
                    <ArrowRight size={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-[#141414]/20 hover:text-rose-500 hover:bg-rose-500/5 rounded-full transition-all"
                    title="Delete from history"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center space-y-4 bg-white rounded-3xl border border-dashed border-[#141414]/20">
          <div className="w-16 h-16 bg-[#141414]/5 rounded-full flex items-center justify-center mx-auto text-[#141414]/20">
            <HistoryIcon size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No history yet</h3>
            <p className="text-[#141414]/40 font-medium">Your search history will appear here once you start searching.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#141414] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all"
          >
            Start Searching
          </Link>
        </div>
      )}
    </div>
  );
};
