import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { User, Mail, Phone, FileText, Camera, Save, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Profile: React.FC = () => {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phoneNumber: '',
    avatarUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        phoneNumber: profile.phoneNumber || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        setStatus({ type: 'error', message: 'Image size too large. Please use an image under 500KB.' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await updateProfile(formData);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-[#141414]/5 rounded-full flex items-center justify-center mx-auto text-[#141414]/20">
          <User size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Login Required</h1>
          <p className="text-[#141414]/50 font-medium">Please sign in to manage your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter uppercase">My Profile</h1>
        <p className="text-[#141414]/50 font-medium">Manage your personal information and how others see you.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 text-center space-y-6">
            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#141414]/5 bg-[#141414]/5 mx-auto relative">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#141414]/20">
                    <User size={48} />
                  </div>
                )}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <Upload size={24} />
                </button>
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[#141414] text-white rounded-full border-4 border-white hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">{formData.displayName || 'Anonymous User'}</h2>
              <p className="text-sm text-[#141414]/50 font-medium">{user.email}</p>
              <div className="inline-block px-3 py-1 bg-[#141414]/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mt-2">
                {profile?.role || 'User'}
              </div>
            </div>
          </div>

          <div className="bg-[#141414] p-6 rounded-3xl text-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Account Security</h3>
            <p className="text-sm font-medium opacity-80">Your account is secured with Google Authentication.</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-[#141414]/10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 ml-4">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20" size={18} />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-6 py-3 bg-[#141414]/5 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#141414]/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 ml-4">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20" size={18} />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-12 pr-6 py-3 bg-[#141414]/5 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#141414]/10 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 ml-4">Avatar URL</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20" size={18} />
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-12 pr-6 py-3 bg-[#141414]/5 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#141414]/10 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 ml-4">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-[#141414]/20" size={18} />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full pl-12 pr-6 py-3 bg-[#141414]/5 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#141414]/10 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex items-center gap-2 text-sm font-bold ${status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{status.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-[#141414] text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
