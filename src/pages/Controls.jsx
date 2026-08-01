import React, { useState, useEffect } from 'react';
import { api } from '../mockApi';
import { ShieldAlert, Maximize2, Waves, Lock, ToggleLeft, ToggleRight, Power, Settings2 } from 'lucide-react';

export default function Controls() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchState = async () => {
      try {
        const data = await api.getStatus();
        if (mounted) setState(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 3000); // Poll every 3s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleModeToggle = async () => {
    if (!state) return;
    setLoading(true);
    try {
      const newMode = state.mode === 'auto' ? 'manual' : 'auto';
      const updatedState = await api.setMode(newMode);
      setState(updatedState);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setLoading(false), 300);
  };

  const handleGateAction = async (action) => {
    if (!state || state.mode !== 'manual') return;
    setLoading(true);
    try {
      const updatedState = await api.setGateStatus(action);
      setState(updatedState);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setLoading(false), 300);
  };

  const handleMistingAction = async () => {
    if (!state || state.mode !== 'manual') return;
    setLoading(true);
    try {
      await api.triggerMisting();
      setState(prev => ({ ...prev, mistingPump: true }));
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setLoading(false), 300);
  };

  const handleEmergencyStop = async () => {
    if (!window.confirm("WARNING: Force emergency lockout? This stops all motorized actions immediately.")) return;
    setLoading(true);
    try {
      const updatedState = await api.emergencyStop();
      setState(updatedState);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setLoading(false), 300);
  };

  if (!state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#000000]">
        <span className="text-xs font-semibold">Loading control configurations...</span>
      </div>
    );
  }

  const isManual = state.mode === 'manual';

  return (
    <div className="flex-1 bg-[#000000] min-h-screen text-slate-100">
      <div className="max-w-4xl mx-auto w-full p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Manual Override Controls</h1>
          <p className="text-xs text-slate-400 mt-0.5">Override automated peripheral mechanisms</p>
        </header>

        {/* Mode Switch Card */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-premium mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isManual ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                <Settings2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Operation Authority Mode</h3>
                <p className="text-xs text-slate-400 mt-1">Toggle between auto-protection and manual overrides</p>
              </div>
            </div>
            
            <button
              onClick={handleModeToggle}
              disabled={loading}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs transition-smooth border cursor-pointer ${
                isManual 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/10' 
                  : 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-600/10'
              }`}
            >
              {isManual ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {isManual ? 'Manual Control' : 'Auto Protection'}
            </button>
          </div>
        </div>

        {/* Manual Hardware Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Gate Control Card */}
          <div className={`bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-premium transition-smooth flex flex-col justify-between ${!isManual ? 'opacity-40' : ''}`}>
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3.5 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Maximize2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Servo Gate Arm</h4>
                    <p className="text-xs text-slate-450 text-slate-400 mt-0.5">Physical sweep actuator</p>
                  </div>
                </div>
                {!isManual && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded flex items-center gap-1">
                    <Lock size={10} /> Lockout
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Target Position</span>
                  <span className="uppercase text-slate-200 font-bold">{state.gateStatus}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-smooth" 
                    style={{ width: state.gateStatus === 'open' ? '100%' : state.gateStatus === 'closed' ? '0%' : '50%' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleGateAction('open')}
                disabled={!isManual || loading || state.gateStatus === 'open' || state.gateStatus === 'opening'}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed text-slate-200 py-3 rounded-xl text-xs font-bold transition-smooth border border-slate-700"
              >
                Raise Arm (Open)
              </button>
              <button
                onClick={() => handleGateAction('closed')}
                disabled={!isManual || loading || state.gateStatus === 'closed' || state.gateStatus === 'closing'}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed text-slate-200 py-3 rounded-xl text-xs font-bold transition-smooth border border-slate-700"
              >
                Lower Arm (Close)
              </button>
            </div>
          </div>

          {/* Misting Pump Control Card */}
          <div className={`bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-premium transition-smooth flex flex-col justify-between ${!isManual ? 'opacity-40' : ''}`}>
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3.5 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Waves size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Misting Sanitation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Disinfectant pump relay</p>
                  </div>
                </div>
                {!isManual && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded flex items-center gap-1">
                    <Lock size={10} /> Lockout
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Relay Circuit</span>
                  <span className="uppercase text-slate-200 font-bold">{state.mistingPump ? 'Running' : 'Idle'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-smooth ${state.mistingPump ? 'bg-emerald-500 w-full' : 'bg-slate-700 w-0'}`}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleMistingAction}
              disabled={!isManual || loading || state.mistingPump}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-bold transition-smooth flex justify-center items-center gap-2"
            >
              <Power size={14} />
              {state.mistingPump ? 'Misting active...' : 'Trigger Misting Cycle'}
            </button>
          </div>

        </div>

        {/* Emergency Stop Lockout */}
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-premium">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-400">Emergency Stop / Lockout</h3>
              <p className="text-xs text-rose-200/60 mt-1 max-w-md">
                Requires validation. Force emergency lockdown halts all actuators immediately, releases servo load, and locks the gate closed.
              </p>
            </div>
          </div>
          <button
            onClick={handleEmergencyStop}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3.5 px-6 rounded-2xl transition-smooth shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 w-full md:w-auto shrink-0 cursor-pointer"
          >
            TRIGGER LOCKOUT
          </button>
        </div>
      </div>
    </div>
  );
}
