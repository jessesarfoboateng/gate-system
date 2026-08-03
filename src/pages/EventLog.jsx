import React, { useState, useEffect } from 'react';
import { api } from '../mockApi';
import { Download, Filter, Calendar } from 'lucide-react';

export default function EventLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await api.getLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const handleExport = () => {
    const headers = "Timestamp,Event Type,Details\n";
    const csvContent = filteredLogs.map(l => `${l.timestamp},${l.type},"${l.detail}"`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-events-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    // Type Filter
    const matchesType = filterType === 'all' || log.type.includes(filterType);
    if (!matchesType) return false;
    
    // Date Range Filter
    if (startDate) {
      const start = new Date(startDate);
      const logTime = new Date(log.timestamp);
      if (logTime < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full day
      const logTime = new Date(log.timestamp);
      if (logTime > end) return false;
    }
    return true;
  });

  const formatEventType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeBadgeColor = (type) => {
    if (type.includes('entry')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    if (type.includes('misting')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-405 dark:text-blue-400 border-blue-500/20';
    if (type.includes('emergency')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    if (type.includes('mode')) return 'bg-slate-100 dark:bg-slate-800 text-text-secondary border-border-color';
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="flex-1 bg-brand-bg min-h-screen flex flex-col text-text-primary">
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-8 flex flex-col h-full overflow-hidden">
        
        {/* Header and Filter Toolbar */}
        <header className="flex flex-col gap-6 mb-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Event Log / History</h1>
            <p className="text-xs text-text-secondary mt-0.5">Audit logs of security and sanitation gate transits</p>
          </div>
          
          <div className="bg-card-bg border border-border-color rounded-3xl p-5 shadow-premium flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              
              {/* Type Select */}
              <div className="relative w-full sm:w-44">
                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Event Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full appearance-none bg-slate-100 dark:bg-slate-900 border border-border-color text-text-primary py-2 px-3 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-blue transition-smooth cursor-pointer"
                >
                  <option value="all">All Events</option>
                  <option value="entry">Detections</option>
                  <option value="gate">Gate Sweep</option>
                  <option value="misting">Misting Run</option>
                  <option value="mode">System Mode</option>
                </select>
                <Filter size={12} className="absolute right-3 bottom-2.5 text-text-secondary pointer-events-none" />
              </div>

              {/* Date Start */}
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-border-color text-text-primary py-1.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-blue transition-smooth [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              {/* Date End */}
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-border-color text-text-primary py-1.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-blue transition-smooth [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

            </div>

            {/* Export Action */}
            <button 
              onClick={handleExport}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-border-color text-text-primary py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center gap-2 transition-smooth w-full md:w-auto justify-center cursor-pointer shadow-sm"
            >
              <Download size={14} />
              Export CSV
            </button>

          </div>
        </header>

        {/* Table representation */}
        <div className="bg-card-bg border border-border-color rounded-3xl shadow-premium flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-border-color sticky top-0 backdrop-blur-md z-10">
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-wider text-text-secondary w-1/4">Date & Time</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-wider text-text-secondary w-1/4">Event Category</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-wider text-text-secondary w-1/2">Details / Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/60 text-text-primary">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-xs font-semibold text-text-secondary">Loading audit history...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-xs font-semibold text-text-secondary">No events matched filters.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4.5 px-6 whitespace-nowrap text-xs font-medium text-text-secondary">
                        <span className="flex items-center gap-2">
                          <Calendar size={13} className="text-text-tertiary" />
                          {new Date(log.timestamp).toLocaleString(undefined, {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute:'2-digit', second:'2-digit'
                        })}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeBadgeColor(log.type)}`}>
                          {formatEventType(log.type)}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-xs font-semibold text-text-secondary">
                        {log.detail}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
