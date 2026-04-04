import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Users, ShieldCheck, History, LayoutDashboard, Settings, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LoginType = 'USER' | 'ADMIN' | null;

export const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<LoginType>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Handle redirect result (after returning from Google redirect login)
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const intendedRole = sessionStorage.getItem('intendedRole');
          navigate(intendedRole === 'ADMIN' ? '/admin' : '/dashboard');
        }
      } catch (err: any) {
        setError(err?.message || 'Sign-in failed. Please try again.');
      }
    };
    checkRedirectResult();
  }, [navigate]);

  const handleLogin = async () => {
    if (!loginType) return;
    setError(null);
    setIsSigningIn(true);
    sessionStorage.setItem('intendedRole', loginType);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate(loginType === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      // If popup was blocked, fall back to redirect
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
          // Page will redirect, no need to do anything else
          return;
        } catch (redirectErr: any) {
          setError(redirectErr?.message || 'Sign-in failed. Please try again.');
        }
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Please add "localhost" to your Firebase Auth authorized domains.');
      } else {
        setError(err?.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  const userFeatures = [
    { icon: LayoutDashboard, title: 'Real-time Monitoring', desc: 'Track crowd density across multiple venues live.' },
    { icon: History, title: 'Search History', desc: 'Keep track of your previous searches and trends.' },
    { icon: ShieldCheck, title: 'Personal Profile', desc: 'Manage your identity and preferences securely.' },
  ];

  const adminFeatures = [
    { icon: Settings, title: 'Venue Management', desc: 'Add, edit, and remove locations from the system.' },
    { icon: LayoutDashboard, title: 'Live Analytics', desc: 'Monitor system-wide traffic and capacity limits.' },
    { icon: Lock, title: 'Secure Access', desc: 'Restricted administrative controls for authorized staff.' },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {!loginType ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl space-y-12 text-center"
          >
            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tighter uppercase">Choose your path</h1>
              <p className="text-[#141414]/50 font-medium text-lg">Select how you want to access Livcrwd today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setLoginType('USER')}
                className="group bg-white p-10 rounded-[2.5rem] border border-[#141414]/10 hover:border-[#141414] transition-all hover:shadow-2xl text-left space-y-6"
              >
                <div className="w-14 h-14 bg-[#141414]/5 rounded-2xl flex items-center justify-center text-[#141414] group-hover:bg-[#141414] group-hover:text-white transition-all">
                  <Users size={28} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight">USER ACCESS</h2>
                  <p className="text-sm text-[#141414]/40 font-medium">Monitor crowds, save history, and manage your profile.</p>
                </div>
              </button>

              <button
                onClick={() => setLoginType('ADMIN')}
                className="group bg-[#141414] p-10 rounded-[2.5rem] border border-[#141414] transition-all hover:shadow-2xl text-left space-y-6"
              >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#141414] transition-all">
                  <Lock size={28} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-white">ADMIN PORTAL</h2>
                  <p className="text-sm text-white/40 font-medium">Manage venues, update capacity, and control system settings.</p>
                </div>
              </button>
            </div>
          </motion.div>
        ) : loginType === 'USER' ? (
          <motion.div
            key="user-login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-12">
              <button 
                onClick={() => setLoginType(null)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors"
              >
                <ArrowLeft size={14} />
                Back to selection
              </button>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center text-white">
                  <Users size={32} />
                </div>
                <h1 className="text-6xl font-black tracking-tighter leading-none">JOIN THE<br />CROWD.</h1>
                <p className="text-[#141414]/50 font-medium text-lg max-w-sm">
                  Sign in to unlock full access to Livcrwd features and start monitoring your favorite spots.
                </p>
              </div>

              <div className="space-y-6">
                {userFeatures.map((f, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-[#141414]/5 rounded-lg text-[#141414]/40">
                      <f.icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{f.title}</h3>
                      <p className="text-xs text-[#141414]/40 font-medium">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-[#141414]/10 shadow-2xl space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">USER LOGIN</h2>
                <p className="text-sm text-[#141414]/40 font-medium">Continue with your Google account</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-left">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-[#141414] text-white rounded-2xl font-bold text-lg hover:bg-[#141414]/90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#141414]/20 disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100"
              >
                <LogIn size={24} />
                <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>

              <div className="pt-8 border-t border-[#141414]/5">
                <button 
                  onClick={() => { setLoginType('ADMIN'); setError(null); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 hover:text-[#141414] transition-colors"
                >
                  Need Admin Access? Switch to Admin Portal
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="admin-login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-12">
              <button 
                onClick={() => setLoginType(null)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors"
              >
                <ArrowLeft size={14} />
                Back to selection
              </button>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center text-white">
                  <Lock size={32} />
                </div>
                <h1 className="text-6xl font-black tracking-tighter leading-none text-[#141414]">ADMIN<br />PORTAL.</h1>
                <p className="text-[#141414]/50 font-medium text-lg max-w-sm">
                  Administrative access for venue managers and system operators.
                </p>
              </div>

              <div className="space-y-6">
                {adminFeatures.map((f, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-[#141414]/5 rounded-lg text-[#141414]/40">
                      <f.icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#141414]">{f.title}</h3>
                      <p className="text-xs text-[#141414]/40 font-medium">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-[#141414]/10 shadow-2xl space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-[#141414]">ADMIN LOGIN</h2>
                <p className="text-sm text-[#141414]/40 font-medium">Authorized personnel only</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-left">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-[#141414] text-white rounded-2xl font-bold text-lg hover:bg-[#141414]/90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#141414]/20 disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100"
              >
                <ShieldCheck size={24} />
                <span>{isSigningIn ? 'Signing in...' : 'Admin Sign In'}</span>
              </button>

              <div className="pt-8 border-t border-[#141414]/5 space-y-4">
                <button 
                  onClick={() => { setLoginType('USER'); setError(null); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 hover:text-[#141414] transition-colors"
                >
                  Not an Admin? Switch to User Access
                </button>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/10">
                  Access is restricted to verified administrators
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background styling for Admin mode - Removed dark overlay to match user login */}
    </div>
  );
};
