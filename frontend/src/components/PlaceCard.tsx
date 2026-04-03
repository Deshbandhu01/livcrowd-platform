import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Place, CrowdStatus } from '../types';
import CrowdBadge from './CrowdBadge';
import TrendArrow from './TrendArrow';
import WaitTimeRange from './WaitTimeRange';
import { MapPin } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  status?: CrowdStatus;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, status }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/place/${place.id}`)}
      className="glass-card p-6 cursor-pointer group hover:-translate-y-1 transition-transform relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[0.75rem] uppercase tracking-wider text-text-muted font-bold block mb-1">
            {place.category}
          </span>
          <h3 className="text-text-main font-semibold text-lg hover:text-primary-glow transition-colors">
            {place.name}
          </h3>
          <div className="flex items-center text-text-muted text-[0.8rem] mt-1 space-x-1">
            <MapPin size={12} />
            <span className="truncate max-w-[200px]">{place.address}</span>
          </div>
        </div>
        {status ? (
          <CrowdBadge level={status.crowdLevel} />
        ) : (
           <span className="text-xs text-text-muted">Loading...</span>
        )}
      </div>

      <div className="mt-8 flex justify-between items-end border-t border-[rgba(255,255,255,0.05)] pt-4">
        <div>
          {status && <WaitTimeRange min={status.waitTimeMin} max={status.waitTimeMax} />}
        </div>
        <div>
          {status && <TrendArrow trend={status.trend} />}
        </div>
      </div>
      
      {/* Decorative hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-cyan opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-2xl"></div>
    </div>
  );
};

export default PlaceCard;
