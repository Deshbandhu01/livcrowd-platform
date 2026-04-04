import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { LocationDetail } from './pages/LocationDetail';
import { HistoryPage } from './pages/History';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

import { ChatBot } from './components/ChatBot';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/location/:id" element={<LocationDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </Layout>
      </Router>
    </AuthProvider>
  );
}
