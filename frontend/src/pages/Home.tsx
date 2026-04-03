import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Place } from '../types';
import PlaceCard from '../components/PlaceCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAllCrowdSockets } from '../hooks/useAllCrowdSockets';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Hospital', 'Café', 'College', 'Office', 'Event'];

const Home: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const statuses = useAllCrowdSockets();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await api.get('/api/places');
        setPlaces(data);
        
        // Pre-fetch initial statuses
        for (const p of data) {
           api.get(`/api/places/${p.id}/status`).then(d => {
             if (d && !statuses[p.id]) {
                statuses[p.id] = d;
             }
           }).catch(() => {});
        }
      } catch (e) {
        console.error('Failed to fetch places');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const filteredPlaces = places.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Premium Image */}
      <div className="relative h-[460px] overflow-hidden mb-12 flex items-center justify-center">
        <img 
          src="/hero.png" 
          alt="LivCrowd Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-lighten scale-110 animate-[pulse_10s_infinite]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Know the <span className="text-primary-glow">Crowd</span>,<br />Before you go.
          </h1>
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Real-time, privacy-first intelligence. See live capacity and skip the wait at 
            your favorite local spots.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Search Bar - Floating Style */}
        <div className="relative -mt-24 z-20 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={24} />
            <input
              type="text"
              placeholder="Search cafes, hospitals, malls..."
              className="w-full bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl py-6 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main text-lg transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] placeholder:text-text-muted/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-in fade-in duration-700 delay-700">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                selectedCategory === cat 
                  ? 'bg-primary/20 border-primary/50 text-primary-glow shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                  : 'bg-white/5 border-white/10 text-text-muted hover:border-white/30 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredPlaces.length > 0 ? (
            filteredPlaces.map((place, i) => (
              <div 
                key={place.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500" 
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <PlaceCard 
                  place={place} 
                  status={statuses[place.id]} 
                  onClick={() => navigate(`/places/${place.id}`)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Search className="mx-auto text-text-muted mb-4 opacity-20" size={64} />
              <p className="text-text-muted text-lg">No places found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
