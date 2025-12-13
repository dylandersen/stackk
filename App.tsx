import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid, Bell, Settings, Plus, Wallet, Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import Dashboard from './pages/Dashboard';
import ServicesList from './pages/ServicesList';
import ServiceDetail from './pages/ServiceDetail';
import AlertSettings from './pages/AlertSettings';
import AddService from './pages/AddService';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-border px-6 py-4 pb-6 z-50 flex justify-between items-center">
        <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-text-secondary'}`}>
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        </button>
        <button onClick={() => navigate('/services')} className={`flex flex-col items-center gap-1 ${isActive('/services') ? 'text-primary' : 'text-text-secondary'}`}>
          <Grid size={24} strokeWidth={isActive('/services') ? 2.5 : 2} />
        </button>
        <button onClick={() => navigate('/services/add')} className="flex flex-col items-center gap-1 -mt-8">
          <div className="bg-primary hover:bg-primary-hover transition-colors rounded-full p-4 shadow-lg shadow-primary/20 text-white">
             <Plus size={28} />
          </div>
        </button>
        <button onClick={() => navigate('/alerts')} className={`flex flex-col items-center gap-1 ${isActive('/alerts') ? 'text-primary' : 'text-text-secondary'}`}>
          <Bell size={24} strokeWidth={isActive('/alerts') ? 2.5 : 2} />
        </button>
        <button onClick={() => navigate('/settings')} className={`flex flex-col items-center gap-1 ${isActive('/settings') ? 'text-primary' : 'text-text-secondary'}`}>
          <Settings size={24} strokeWidth={isActive('/settings') ? 2.5 : 2} />
        </button>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-surface border-r border-border p-6 z-50">
        <div className="flex items-center gap-3 mb-10 text-primary font-secondary font-bold text-xl">
           <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
             <Wallet size={18} />
           </div>
           <span className="hidden lg:block">Stackk</span>
        </div>
        
        <nav className="flex flex-col gap-4">
          <NavItem to="/" icon={<Home size={22} />} label="Dashboard" active={isActive('/')} />
          <NavItem to="/services" icon={<Grid size={22} />} label="My Subscriptions" active={isActive('/services') || isActive('/services/add')} />
          <NavItem to="/alerts" icon={<Bell size={22} />} label="Alerts" active={isActive('/alerts')} />
          <NavItem to="/settings" icon={<Settings size={22} />} label="Settings" active={isActive('/settings')} />
        </nav>

        <div className="mt-auto">
           <button onClick={() => navigate('/services/add')} className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-btn flex items-center justify-center gap-2 transition-all">
             <Plus size={20} />
             <span className="hidden lg:block">Add New</span>
           </button>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className={`flex items-center gap-3 p-3 rounded-btn transition-colors ${active ? 'bg-white/5 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span className="hidden lg:block font-medium">{label}</span>
    </button>
  );
}

const App = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-text-primary pb-24 md:pb-0 md:pl-20 lg:pl-64">
        <Navigation />
        <main className="max-w-7xl mx-auto p-4 md:p-8">
           <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/services" element={<ServicesList />} />
              <Route path="/services/add" element={<AddService />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/alerts" element={<AlertSettings />} />
              <Route path="/settings" element={<AlertSettings />} /> {/* Reuse for now */}
            </Routes>
           </AnimatePresence>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;