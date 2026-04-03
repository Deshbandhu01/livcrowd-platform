import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/auth/register', { username, password });
      navigate('/login');
    } catch (err: any) {
      setError('Registration failed. Username may be taken.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left side brand intro */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20">
        <h1 className="text-5xl font-bold text-white mb-6">Join LivCrowd</h1>
        <p className="text-xl text-text-muted leading-relaxed">
          Create an account to gain access to detailed analytics and personalize your real-time crowd monitoring experience.
        </p>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="glass-card w-full max-w-[420px] p-8 md:p-10">
          <div className="text-center mb-8">
             <h2 className="text-2xl font-bold text-white tracking-tight">Create an account</h2>
             <p className="text-text-muted text-sm mt-2">Enter your details below to sign up</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg text-danger text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="johndoe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="w-full btn-primary text-lg tracking-wide shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Create Account
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-glow hover:underline transition-all">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
