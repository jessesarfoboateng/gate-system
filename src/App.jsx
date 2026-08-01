import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings2, History, Shield, Menu, X, ChevronLeft } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Controls from './pages/Controls';
import EventLog from './pages/EventLog';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Sidebar Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed lg:relative top-0 bottom-0 left-0 bg-[#111827] border-r border-slate-800 flex flex-col justify-between py-8 px-5 shrink-0 z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden opacity-0 border-r-0 px-0'
        }`}
      >
        <div className="flex flex-col gap-8 w-full min-w-[218px]">
          {/* Logo and Name with close toggle */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 tracking-tight">GateControl</h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Biosecurity</p>
              </div>
            </div>
            
            {/* Collapse button for both mobile (Close) and desktop (Collapse) */}
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-smooth cursor-pointer"
              title={window.innerWidth < 1024 ? "Close menu" : "Collapse menu"}
            >
              {window.innerWidth < 1024 ? <X size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-col gap-2 w-full">
            <NavLink 
              to="/" 
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({isActive}) => `relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-smooth ${isActive ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />}
                  <LayoutDashboard size={20} />
                  <span className="text-xs tracking-wide">Live Dashboard</span>
                </>
              )}
            </NavLink>
            
            <NavLink 
              to="/controls" 
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({isActive}) => `relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-smooth ${isActive ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />}
                  <Settings2 size={20} />
                  <span className="text-xs tracking-wide">Manual Controls</span>
                </>
              )}
            </NavLink>
            
            <NavLink 
              to="/logs" 
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({isActive}) => `relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-smooth ${isActive ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />}
                  <History size={20} />
                  <span className="text-xs tracking-wide">Event Log</span>
                </>
              )}
            </NavLink>
          </nav>
        </div>
        
        {/* Bottom System Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50 min-w-[218px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">System Online</span>
        </div>
      </div>
    </>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="flex h-screen bg-[#000000] text-slate-100 font-sans overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Global Sticky Top Header */}
          <header className="h-16 border-b border-slate-800 bg-[#111827]/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30">
            <div className="flex items-center gap-4">
              {/* Show hamburger Menu toggle only when sidebar is closed OR on mobile devices */}
              {(!sidebarOpen || window.innerWidth < 1024) && (
                <button 
                  onClick={toggleSidebar}
                  className="p-2 rounded-xl bg-[#111827] border border-slate-800 text-slate-300 hover:text-white transition-smooth hover:bg-slate-800/50 cursor-pointer"
                  title="Open Navigation Menu"
                >
                  <Menu size={18} />
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Monitoring</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Protection</span>
            </div>
          </header>

          {/* Route Content Area */}
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/controls" element={<Controls />} />
              <Route path="/logs" element={<EventLog />} />
            </Routes>
          </div>
          
        </main>
      </div>
    </Router>
  );
}

export default App;
