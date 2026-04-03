import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(10,0,21,0.8)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gradient tracking-tight">
          LivCrowd
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-text-muted hover:text-text-secondary transition-colors">Home</Link>
          <Link to="/search" className="text-text-muted hover:text-text-secondary transition-colors">Search</Link>
          
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className={window.location.pathname.startsWith('/admin') ? "text-primary-glow" : "text-text-muted hover:text-text-secondary transition-colors"}
                >
                  Admin
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-text-muted hover:text-danger transition-colors ml-4"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-4 shadow-[0_0_15px_rgba(124,58,237,0.3)]">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
