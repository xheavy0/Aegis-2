import React, { useState, useEffect, useCallback } from 'react';
import { Server, Cloud, Network, Cpu, HardDrive, MemoryStick, Activity, Plus, Search, Filter, Wifi, WifiOff, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, LineChart, Line } from 'recharts';
import { Asset, AssetType, AssetStatus, AssetEnv } from '@/src/types';
import { api } from '@/src/lib/api';

interface LiveMetric {
  cpu: number;
  ram: number;
  disk: number;
  net: number;
  history: { t: number; cpu: number; ram: number }[];
}


// Core servers we'll show live metrics for
const MONITORED = ['prod-web-01', 'prod-db-primary', 'aws-ec2-api-prod', 'gcp-gke-cluster'];

function randBetween(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

function initMetric(base: { cpu: number; ram: number; disk: number; net: number }): LiveMetric {
  const history = Array.from({ length: 20 }, (_, i) => ({
    t: i,
    cpu: base.cpu + randBetween(-8, 8),
    ram: base.ram + randBetween(-5, 5),
  }));
  return { ...base, history };
}

const INITIAL_METRICS: Record<string, LiveMetric> = {
  'prod-web-01':       initMetric({ cpu: 42, ram: 61, disk: 38, net: 120 }),
  'prod-db-primary':   initMetric({ cpu: 78, ram: 85, disk: 64, net: 340 }),
  'aws-ec2-api-prod':  initMetric({ cpu: 31, ram: 55, disk: 22, net: 210 }),
  'gcp-gke-cluster':   initMetric({ cpu: 56, ram: 72, disk: 41, net: 480 }),
};

const TYPE_ICON: Record<AssetType, React.ReactNode> = {
  Server:  <Server className="w-4 h-4" />,
  Cloud:   <Cloud className="w-4 h-4" />,
  Network: <Network className="w-4 h-4" />,
};

const ENV_COLOR: Record<AssetEnv, string> = {
  'On-Prem': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Cloud':   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Hybrid':  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

const STATUS_CFG: Record<AssetStatus, { icon: React.ReactNode; color: string; dot: string }> = {
  Online:   { icon: <Wifi className="w-3.5 h-3.5" />,    color: 'text-emerald-500', dot: 'bg-emerald-500' },
  Offline:  { icon: <WifiOff className="w-3.5 h-3.5" />, color: 'text-slate-400',   dot: 'bg-slate-400' },
  Degraded: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-amber-500', dot: 'bg-amber-500' },
};

function GaugeBar({ value, warn = 70, crit = 90 }: { value: number; warn?: number; crit?: number }) {
  const color = value >= crit ? 'bg-red-500' : value >= warn ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
      <span className={cn('text-xs font-black w-8 text-right', value >= crit ? 'text-red-500' : value >= warn ? 'text-amber-500' : 'text-slate-900 dark:text-white')}>
        {value}%
      </span>
    </div>
  );
}

function MiniChart({ data, dataKey, color }: { data: { t: number; cpu: number; ram: number }[]; dataKey: 'cpu' | 'ram'; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }} style={{ background: 'transparent' }}>
        <defs>
          <linearGradient id={`grad-${dataKey}-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#grad-${dataKey}-${color})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AssetManagementView() {
  const [tab, setTab] = useState<'inventory' | 'monitor'>('inventory');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | AssetType>('All');
  const [filterEnv, setFilterEnv] = useState<'All' | AssetEnv>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | AssetStatus>('All');
  const [metrics, setMetrics] = useState<Record<string, LiveMetric>>(INITIAL_METRICS);
  const [tick, setTick] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getAssets()
      .then(data => { if (active) { setAssets(data); setError(null); } })
      .catch(err => { if (active) setError(err.message ?? 'Failed to load assets'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Simulate real-time updates every 2 seconds
  useEffect(() => {
    if (tab !== 'monitor') return;
    const id = setInterval(() => {
      setMetrics(prev => {
        const next = { ...prev };
        for (const name of MONITORED) {
          const m = next[name];
          const newCpu = Math.min(99, Math.max(1, m.cpu + randBetween(-6, 6)));
          const newRam = Math.min(99, Math.max(10, m.ram + randBetween(-3, 3)));
          const newHistory = [...m.history.slice(1), { t: m.history[m.history.length - 1].t + 1, cpu: newCpu, ram: newRam }];
          next[name] = { ...m, cpu: newCpu, ram: newRam, net: randBetween(50, 600), history: newHistory };
        }
        return next;
      });
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, [tab]);

  const filtered = assets.filter(a => {
    const matchType   = filterType === 'All'   || a.type === filterType;
    const matchEnv    = filterEnv === 'All'    || a.env === filterEnv;
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchSearch = !search || [a.name, a.ip, a.os, a.owner, ...a.tags].some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchEnv && matchStatus && matchSearch;
  });

  const online   = assets.filter(a => a.status === 'Online').length;
  const degraded = assets.filter(a => a.status === 'Degraded').length;
  const offline  = assets.filter(a => a.status === 'Offline').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Asset Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Infrastructure inventory and real-time performance monitoring.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {loading && (
        <div className="glass-card p-4 flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading assets…
        </div>
      )}
      {error && (
        <div className="glass-card p-4 flex items-center gap-3 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Assets',   value: assets.length,                                            color: 'text-slate-900 dark:text-white' },
          { label: 'Servers',        value: assets.filter(a => a.type === 'Server').length,            color: 'text-blue-500' },
          { label: 'Cloud',          value: assets.filter(a => a.type === 'Cloud').length,             color: 'text-purple-500' },
          { label: 'Network',        value: assets.filter(a => a.type === 'Network').length,           color: 'text-teal-500' },
          { label: 'Online',         value: online,                                                    color: 'text-emerald-500' },
          { label: 'Degraded / Off', value: `${degraded} / ${offline}`,                               color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={cn('text-2xl font-black mt-1 leading-none', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-aegis-bg p-1 rounded-xl w-fit">
        {(['inventory', 'monitor'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all',
              tab === t ? 'bg-white dark:bg-aegis-surface text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            {t === 'inventory' ? 'Inventory' : '⬤ Live Monitor'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'inventory' ? (
          <motion.div key="inventory" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, IP, OS, tag..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[var(--ink)] placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="w-4 h-4 text-slate-400" />
                {(['All', 'Server', 'Cloud', 'Network'] as const).map(f => (
                  <button key={f} onClick={() => setFilterType(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all', filterType === f ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-aegis-bg text-slate-500 hover:text-slate-900 dark:hover:text-white')}>{f}</button>
                ))}
                <div className="w-px h-4 bg-slate-200 dark:bg-aegis-border" />
                {(['All', 'On-Prem', 'Cloud', 'Hybrid'] as const).map(f => (
                  <button key={f} onClick={() => setFilterEnv(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all', filterEnv === f ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-aegis-bg text-slate-500 hover:text-slate-900 dark:hover:text-white')}>{f}</button>
                ))}
                <div className="w-px h-4 bg-slate-200 dark:bg-aegis-border" />
                {(['All', 'Online', 'Degraded', 'Offline'] as const).map(f => (
                  <button key={f} onClick={() => setFilterStatus(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all', filterStatus === f ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-aegis-bg text-slate-500 hover:text-slate-900 dark:hover:text-white')}>{f}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-aegis-border">
                    {['Asset', 'Type', 'Environment', 'IP Address', 'OS / Platform', 'Owner', 'Location', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-aegis-border">
                  {filtered.map(a => {
                    const sc = STATUS_CFG[a.status];
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={cn('relative flex h-2 w-2 shrink-0')}>
                              {a.status === 'Online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                              <span className={cn('relative inline-flex rounded-full h-2 w-2', sc.dot)} />
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{a.name}</span>
                          </div>
                          <div className="flex gap-1 mt-1 ml-4">
                            {a.tags.map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-aegis-bg rounded text-slate-500 font-bold">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            {TYPE_ICON[a.type]}
                            <span className="text-xs font-semibold">{a.type}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-[10px] font-black px-2 py-1 rounded-lg', ENV_COLOR[a.env])}>{a.env}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{a.ip}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{a.os}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{a.owner}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{a.location}</td>
                        <td className="px-4 py-3">
                          <span className={cn('flex items-center gap-1 text-xs font-bold', sc.color)}>
                            {sc.icon} {a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No assets match your filters</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting search or filter criteria.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="monitor" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live — updates every 2s &nbsp;·&nbsp; {new Date().toLocaleTimeString()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {MONITORED.map(name => {
                const asset = assets.find(a => a.name === name)!;
                const m = metrics[name];
                const sc = STATUS_CFG[asset.status];
                return (
                  <div key={name} className="glass-card p-6 space-y-5">
                    {/* Card header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn('flex items-center gap-1 text-xs font-bold', sc.color)}>{sc.icon}</span>
                          <h3 className="font-mono text-sm font-black text-slate-900 dark:text-white">{name}</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{asset.os} &nbsp;·&nbsp; {asset.location}</p>
                      </div>
                      <span className={cn('text-[10px] font-black px-2 py-1 rounded-lg', ENV_COLOR[asset.env])}>{asset.env}</span>
                    </div>

                    {/* Gauges */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Cpu className="w-3.5 h-3.5" /> CPU
                        </div>
                        <GaugeBar value={m.cpu} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <MemoryStick className="w-3.5 h-3.5" /> RAM
                        </div>
                        <GaugeBar value={m.ram} warn={75} crit={90} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <HardDrive className="w-3.5 h-3.5" /> Disk
                        </div>
                        <GaugeBar value={m.disk} warn={80} crit={95} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Network I/O</span>
                        <span className="ml-auto text-blue-500 font-black normal-case tracking-normal text-xs">{m.net} MB/s</span>
                      </div>
                    </div>

                    {/* Mini charts */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-aegis-border">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CPU History</p>
                        <MiniChart data={m.history} dataKey="cpu" color="#3B82F6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">RAM History</p>
                        <MiniChart data={m.history} dataKey="ram" color="#8B5CF6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
