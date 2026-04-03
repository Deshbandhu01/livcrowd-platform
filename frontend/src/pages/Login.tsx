import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Ghost, Orbit } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/api/auth/login', { username, password });
      login(data);
      if (data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left side brand intro */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome Back</h1>
        <p className="text-xl text-text-muted leading-relaxed">
          Stay informed about real-time crowd levels and make better decisions on when to step out, without compromising on your privacy.
        </p>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="glass-card w-full max-w-[420px] p-8 md:p-10 relative">
          <div className="text-center mb-8">
             <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to LivCrowd</h2>
             <p className="text-text-muted text-sm mt-2">Enter your details below to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="admin"
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
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-glow hover:underline transition-all">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
