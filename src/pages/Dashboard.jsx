import React, { useState, useEffect } from 'react';
import { api } from '../mockApi';
import { ShieldCheck, AlertTriangle, Waves, Maximize, BatteryMedium, RefreshCw, Milestone, Eye } from 'lucide-react';

const CustomAreaChart = ({ data }) => {
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data || data.length === 0) {
    return <div className="text-xs text-slate-500 text-center py-8">Waiting for telemetry data...</div>;
  }

  const maxVal = 400;
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.distance / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="svgGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>

        {[0, 100, 200, 300, 400].map((val) => {
          const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
          return (
            <g key={val}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1f2937" strokeWidth={1} />
              <text x={paddingLeft - 10} y={y + 3} fontSize={8} fill="#4b5563" textAnchor="end" className="font-semibold">{val}</text>
            </g>
          );
        })}

        {points.length > 0 && <path d={areaPath} fill="url(#svgGradient)" />}
        {points.length > 0 && <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill="#111827" stroke="#3b82f6" strokeWidth={1.5} />
            {i === points.length - 1 && (
              <g>
                <circle cx={p.x} cy={p.y} r={6} fill="none" stroke="#3b82f6" strokeWidth={1} className="animate-ping" />
                <rect x={p.x - 14} y={p.y - 20} width={28} height={14} rx={4} fill="#1f2937" stroke="#374151" strokeWidth={1} />
                <text x={p.x} y={p.y - 10} fontSize={8} fill="#ffffff" fontWeight="bold" textAnchor="middle">{Math.round(p.distance)}</text>
              </g>
            )}
          </g>
        ))}

        {points.filter((_, idx) => idx % 3 === 0 || idx === points.length - 1).map((p, idx) => (
          <text key={idx} x={p.x} y={height - 8} fontSize={8} fill="#4b5563" textAnchor="middle" className="font-semibold">{p.time}</text>
        ))}
      </svg>
    </div>
  );
};

const StatusCard = ({ title, value, subtitle, icon: Icon, color, isActive }) => {
  const colorStyles = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-800/40 text-slate-400 border-slate-700/50'
  };

  return (
    <div className={`p-4 rounded-2xl border bg-[#111827] ${isActive ? colorStyles[color] : colorStyles.slate} transition-smooth flex flex-col justify-between shadow-premium`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{title}</span>
        <div className={`p-1.5 rounded-lg ${isActive ? colorStyles[color] : colorStyles.slate}`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <div className="text-lg font-bold text-slate-100">{value}</div>
        {subtitle && <div className="text-[9px] text-slate-500 font-semibold">{subtitle}</div>}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [state, setState] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [distanceHistory, setDistanceHistory] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchState = async () => {
      try {
        setIsUpdating(true);
        const data = await api.getStatus();
        if (mounted) {
          setState(data);
          setLastUpdated(new Date());
          
          setDistanceHistory(prev => {
            const nextHistory = [...prev, { 
              time: new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
              distance: data.ultrasonicDistance 
            }];
            return nextHistory.slice(-8);
          });
        }
      } catch (error) {
        console.error("Failed to fetch state", error);
      } finally {
        setTimeout(() => {
          if (mounted) setIsUpdating(false);
        }, 300);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-[#000000] gap-3">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <span className="font-semibold text-xs">Initializing dashboard telemetry...</span>
      </div>
    );
  }

  const isEntryDetected = state.ultrasonicDistance < 150;
  const isGateOpen = state.gateStatus === 'open';

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#000000]">
      
      {/* DASHBOARD SIDEBAR: Operations & Timeline Section Container */}
      <div className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#111827]/40 flex flex-col shrink-0 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-md font-bold text-slate-100 tracking-tight">Active Operation</h2>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Biosecurity transit process status</p>
        </div>

        {/* Dynamic Biosecurity Timeline Section Container */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-premium flex-1 flex flex-col gap-5 justify-between">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transit Checklist</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${state.mode === 'auto' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {state.mode}
            </span>
          </div>

          <div className="flex flex-col gap-5 flex-1 justify-center my-2">
            {/* Step 1: Detector */}
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-smooth ${isEntryDetected ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  1
                </div>
                <div className={`w-0.5 h-12 border-l border-dashed mt-1 transition-smooth ${isEntryDetected ? 'border-amber-500/50' : 'border-slate-800'}`}></div>
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-slate-200">Vehicle Presence</h4>
                <p className="text-[10px] text-slate-450 text-slate-400 mt-0.5">Ultrasonic Distance Sensor</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isEntryDetected ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isEntryDetected ? 'text-amber-400' : 'text-slate-500'}`}>
                    {isEntryDetected ? `DETECTED (${state.ultrasonicDistance}cm)` : 'CLEAR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Sanitation Mist */}
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-smooth ${state.mistingPump ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  2
                </div>
                <div className={`w-0.5 h-12 border-l border-dashed mt-1 transition-smooth ${state.mistingPump ? 'border-blue-500/50' : 'border-slate-800'}`}></div>
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-slate-200">Disinfection Mist</h4>
                <p className="text-[10px] text-slate-450 text-slate-400 mt-0.5">Sanitizer Pressure Misting</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${state.mistingPump ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${state.mistingPump ? 'text-blue-400' : 'text-slate-500'}`}>
                    {state.mistingPump ? 'Misting Running' : 'STANDBY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Gate Release */}
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-smooth ${isGateOpen ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  3
                </div>
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-xs font-bold text-slate-200">Servo Access Lock</h4>
                <p className="text-[10px] text-slate-450 text-slate-400 mt-0.5">MG996R Motor Sweep</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isGateOpen ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isGateOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isGateOpen ? 'GATE OPENED' : 'GATE LOCKED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 font-semibold border-t border-slate-800 pt-3 text-center">
            System monitored: 24h biosecurity rule-active
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
        
        {/* Page Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">Main Console Monitor</h1>
            <p className="text-xs text-slate-400 mt-0.5">Gate - Sector A Overview</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
          </div>
        </header>

        {/* Grid of Real-Time Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatusCard 
            title="Ultrasonic Sensor" 
            value={isEntryDetected ? "Vehicle Present" : "Clear"}
            subtitle={`Distance: ${state.ultrasonicDistance}cm`}
            icon={isEntryDetected ? AlertTriangle : ShieldCheck}
            color={isEntryDetected ? 'amber' : 'blue'}
            isActive={true}
          />
          <StatusCard 
            title="Gate Arm Sweep" 
            value={state.gateStatus.toUpperCase()}
            subtitle="MG996R Motor status"
            icon={Maximize}
            color={isGateOpen ? 'green' : 'slate'}
            isActive={true}
          />
          <StatusCard 
            title="Disinfection Mist" 
            value={state.mistingPump ? "Pump ON" : "Pump OFF"}
            subtitle="High-pressure relay"
            icon={Waves}
            color={state.mistingPump ? 'amber' : 'blue'}
            isActive={state.mistingPump}
          />
          <StatusCard 
            title="Power Supply" 
            value={`${state.batteryLevel}%`}
            subtitle="Li-ion battery level"
            icon={BatteryMedium}
            color={state.batteryLevel > 20 ? 'green' : 'red'}
            isActive={true}
          />
        </div>

        {/* Blueprint Visual Representation */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-premium mb-6 flex flex-col items-center justify-center relative overflow-hidden h-72 min-h-72">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <h3 className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-slate-500">Gate Mechanism Blueprint</h3>

          <div className="relative z-10 w-full max-w-lg flex flex-col items-center mt-4">
            <div className="relative flex items-center justify-center h-40 w-full">
              {/* Left Post */}
              <div className="absolute left-1/4 bottom-0 w-12 h-28 bg-[#1f2937] border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <div className="w-6 h-1 bg-slate-700"></div>
              </div>

              {/* Status indicator LED */}
              <div className="absolute left-[calc(25%+16px)] bottom-20 w-4 h-4 rounded-full border-2 border-[#111827] flex items-center justify-center shadow-sm" style={{ zIndex: 30 }}>
                <span className={`w-2.5 h-2.5 rounded-full ${isGateOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              </div>

              {/* Rotating Gate Arm */}
              <div 
                className="absolute left-[calc(25%+24px)] bottom-16 h-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full origin-left transition-all duration-1000 ease-out border border-amber-600/10 shadow-sm"
                style={{
                  width: '180px',
                  transform: state.gateStatus === 'open' ? 'rotate(-80deg)' : 
                             state.gateStatus === 'opening' ? 'rotate(-45deg)' : 
                             state.gateStatus === 'closing' ? 'rotate(-30deg)' : 'rotate(0deg)',
                  zIndex: 20
                }}
              >
                <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
              </div>

              {/* Right Post */}
              <div className="absolute right-1/4 bottom-0 w-8 h-20 bg-[#1f2937] border border-slate-700 rounded-lg flex items-end justify-center pb-2">
                <div className="w-4 h-2 bg-slate-700 rounded"></div>
              </div>

              {/* Floor trigger area */}
              <div className="absolute bottom-0 left-1/4 right-1/4 h-2 bg-[#1f2937] border-t border-slate-700 flex justify-center items-center">
                <div className={`h-1.5 w-32 rounded-full transition-smooth ${isEntryDetected ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${isGateOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                {isGateOpen ? 'Gate Status: Open' : 'Gate Status: Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* History Telemetry Graph */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-premium">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ultrasonic Sensor Reading Timeline</span>
            <span className="text-[10px] font-semibold text-slate-500">Live feed (cm)</span>
          </div>
          <div className="w-full h-auto">
            <CustomAreaChart data={distanceHistory} />
          </div>
        </div>

      </div>

    </div>
  );
}
