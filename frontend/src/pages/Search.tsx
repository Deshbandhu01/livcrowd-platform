import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Place } from '../types';
import PlaceCard from '../components/PlaceCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAllCrowdSockets } from '../hooks/useAllCrowdSockets';
import { SearchIcon, ArrowLeft } from 'lucide-react';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const statuses = useAllCrowdSockets();

  useEffect(() => {
    // Autofocus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/api/places/search?q=${encodeURIComponent(query)}`);
        setPlaces(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceRequest = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(delayDebounceRequest);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="text-primary-glow hover:text-white transition-colors p-2 bg-[rgba(255,255,255,0.05)] rounded-full border border-[rgba(255,255,255,0.1)]">
          <ArrowLeft size={20} />
        </button>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setSearchParams({ q: e.target.value })}
            placeholder="Search hospitals, cafes, events..." 
            className="input-field pl-12 text-lg shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : places.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center opacity-70">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-text-muted flex items-center justify-center mb-4">
                 <SearchIcon size={40} className="text-text-muted" />
              </div>
              <h3 className="text-text-muted text-xl">No places found matching "{query}"</h3>
            </div>
        ) : (
            places.map(place => (
              <PlaceCard key={place.id} place={place} status={statuses[place.id]} />
            ))
        )}
      </div>
    </div>
  );
};

export default Search;
