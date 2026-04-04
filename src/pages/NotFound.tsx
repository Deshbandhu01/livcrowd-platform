import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
      <div className="w-24 h-24 bg-[#141414]/5 rounded-full flex items-center justify-center text-[#141414]/20">
        <Search size={48} />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-black tracking-tighter uppercase">404</h1>
        <h2 className="text-2xl font-bold uppercase tracking-tight">Page Not Found</h2>
        <p className="text-[#141414]/50 font-medium max-w-md">
          The location you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link
        to="/"
        className="px-8 py-4 bg-[#141414] text-white rounded-full font-bold text-lg hover:bg-[#141414]/90 transition-all hover:scale-105 flex items-center gap-2"
      >
        <Home size={20} />
        <span>Return Home</span>
      </Link>
    </div>
  );
};
