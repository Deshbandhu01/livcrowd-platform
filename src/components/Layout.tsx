import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, Settings, Home, LogIn, LogOut, Users, Menu, X, History, User as UserIcon } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'History', icon: History },
    ...(user ? [{ path: '/profile', label: 'Profile', icon: UserIcon }] : []),
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#141414] font-sans">
      <nav className="sticky top-0 z-50 bg-white border-b border-[#141414]/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Users size={18} />
                </div>
                <span className="font-bold text-xl tracking-tight">Livcrwd</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-[#141414] text-white'
                        : 'text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link to="/profile" className="flex items-center gap-3 group/profile">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-semibold group-hover/profile:text-[#141414] transition-colors">{profile?.displayName || user.displayName}</span>
                        <span className="text-[10px] text-[#141414]/50">{user.email}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#141414]/10 bg-[#141414]/5 group-hover/profile:scale-110 transition-transform">
                        {profile?.avatarUrl || user.photoURL ? (
                          <img src={profile?.avatarUrl || user.photoURL || ''} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#141414]/20">
                            <UserIcon size={16} />
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-full hover:bg-[#141414]/5 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-white rounded-full text-sm font-semibold hover:bg-[#141414]/90 transition-all hover:scale-105"
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[#141414]/5 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-[#141414]/10 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                      location.pathname === item.path
                        ? 'bg-[#141414] text-white'
                        : 'text-[#141414]/60 bg-[#141414]/5'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-[#141414]/10">
                  {user ? (
                    <div className="space-y-4">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest bg-[#141414]/5 text-[#141414]"
                      >
                        <UserIcon size={18} />
                        My Profile
                      </Link>
                      <div className="px-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#141414]/40">Logged in as</p>
                        <p className="font-bold">{profile?.displayName || user.displayName}</p>
                        <p className="text-xs text-[#141414]/50">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                    >
                      <LogIn size={16} />
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-[#141414]/10 py-12 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[#141414]/40">
            © 2026 Livcrwd. Real-time crowd intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};
