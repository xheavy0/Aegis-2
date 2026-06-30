import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Clock, DollarSign, Users, AlertTriangle, ChevronDown, ChevronRight,
  Plus, Shield, Activity, Server, Globe, Building2, CheckCircle2, Circle,
  AlertCircle, Network, ClipboardList, BarChart2, GitBranch
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BIAProcess, BIACriticality, BIAImpactLevel } from '@/src/types';
import { api } from '@/src/lib/api';

// ─── Data ────────────────────────────────────────────────────────────────────

type Criticality = BIACriticality;
type ImpactLevel = BIAImpactLevel;
type PlanStatus  = 'Complete' | 'In Progress' | 'Not Started';


const RECOVERY_PHASES = [
  { id: 'P1', phase: 'Detection & Escalation',   duration: '0–15 min',  status: 'Complete' as PlanStatus,     owner: 'Alex C.',  tasks: ['Incident detected via monitoring', 'On-call engineer paged', 'Incident bridge opened', 'Severity level declared'] },
  { id: 'P2', phase: 'Notification & Assessment', duration: '15–30 min', status: 'Complete' as PlanStatus,     owner: 'Alex C.',  tasks: ['Stakeholders notified', 'BIA process owners alerted', 'Initial impact assessment completed', 'War room assembled'] },
  { id: 'P3', phase: 'Containment',               duration: '30–60 min', status: 'In Progress' as PlanStatus,  owner: 'David M.', tasks: ['Affected systems isolated', 'Failover initiated for critical systems', 'Customer-facing status page updated', 'Vendor/supplier contacts activated'] },
  { id: 'P4', phase: 'Recovery Execution',         duration: '1–4 hrs',  status: 'Not Started' as PlanStatus,  owner: 'David M.', tasks: ['Systems restored from last clean backup', 'Data integrity validation', 'RTO targets verified per BIA process', 'Regression tests executed'] },
  { id: 'P5', phase: 'Validation & Return',        duration: '4–8 hrs',  status: 'Not Started' as PlanStatus,  owner: 'Alex C.',  tasks: ['Business sign-off on restored services', 'Compliance checks completed', 'All-clear communicated to stakeholders', 'Post-incident review scheduled'] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CRIT_COLOR: Record<Criticality, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900/50',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-900/50',
  Medium:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
  Low:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};
const CRIT_DOT: Record<Criticality, string> = {
  Critical: 'bg-red-500', High: 'bg-orange-400', Medium: 'bg-amber-400', Low: 'bg-slate-400',
};

const IMPACT_SCORE: Record<ImpactLevel, number> = {
  Catastrophic: 5, Major: 4, Moderate: 3, Minor: 2, Negligible: 1,
};
const IMPACT_CELL = (score: number) => {
  if (score >= 5) return 'bg-red-600 text-white';
  if (score >= 4) return 'bg-orange-500 text-white';
  if (score >= 3) return 'bg-amber-400 text-white';
  if (score >= 2) return 'bg-emerald-500 text-white';
  return 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';
};

const PLAN_STATUS_CFG: Record<PlanStatus, { icon: React.ReactNode; color: string; bg: string }> = {
  'Complete':     { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  'In Progress':  { icon: <AlertCircle  className="w-4 h-4" />, color: 'text-amber-500',   bg: 'bg-amber-500'   },
  'Not Started':  { icon: <Circle       className="w-4 h-4" />, color: 'text-slate-400',   bg: 'bg-slate-300 dark:bg-slate-600' },
};

const DEPT_ICON: Record<string, React.ReactNode> = {
  Finance: <DollarSign className="w-4 h-4" />, Security: <Shield className="w-4 h-4" />,
  Data: <Activity className="w-4 h-4" />, 'Human Resources': <Users className="w-4 h-4" />,
  Operations: <Server className="w-4 h-4" />, IT: <Globe className="w-4 h-4" />,
  Compliance: <Building2 className="w-4 h-4" />,
};

function rtoLabel(h: number) {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h}h`;
  return `${h / 24}d`;
}

function RTOBar({ target, current }: { target: number; current: number }) {
  const met = current <= target;
  const pct = Math.min((current / Math.max(target * 2, current)) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] font-bold">
        <span className="text-slate-400">Current: <span className={met ? 'text-emerald-500' : 'text-red-500'}>{rtoLabel(current)}</span></span>
        <span className="text-slate-400">Target: {rtoLabel(target)}</span>
      </div>
      <div className="relative w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }}
          className={cn('h-full rounded-full', met ? 'bg-emerald-500' : 'bg-red-500')} />
        {/* Target marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500/80"
          style={{ left: `${(target / Math.max(target * 2, current)) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'processes' | 'dependencies' | 'recovery';

export function BIAView() {
  const [tab, setTab]         = useState<Tab>('overview');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterCrit, setFilterCrit] = useState<'All' | Criticality>('All');
  const [processes, setProcesses] = useState<BIAProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getBIA()
      .then(data => { if (active) { setProcesses(data); setError(null); } })
      .catch(err => { if (active) setError(err.message ?? 'Failed to load BIA processes'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const metRTO    = processes.filter(p => p.currentRTOHours <= p.rtoHours).length;
  const unmetRTO  = processes.length - metRTO;
  const readiness = Math.round((metRTO / Math.max(processes.length, 1)) * 100);
  const totalLoss = processes.reduce((s, p) => s + p.hourlyLoss, 0);
  const critical  = processes.filter(p => p.criticality === 'Critical').length;

  const filtered = processes.filter(p => filterCrit === 'All' || p.criticality === filterCrit);

  const TABS = [
    { id: 'overview',      label: 'Overview',        icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'processes',     label: 'Processes',        icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'dependencies',  label: 'Dependencies',     icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'recovery',      label: 'Recovery Plans',   icon: <Shield className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Business Impact Analysis</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Criticality, recovery objectives, financial exposure, and continuity plans.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Process
        </button>
      </div>

      {loading && (
        <div className="glass-card p-4 flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4 animate-spin" /> Loading BIA processes…
        </div>
      )}
      {error && (
        <div className="glass-card p-4 flex items-center gap-3 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Processes',    value: processes.length,                     color: 'text-slate-900 dark:text-white' },
          { label: 'Critical',           value: critical,                              color: 'text-red-500' },
          { label: 'Recovery Readiness', value: `${readiness}%`,                      color: readiness >= 80 ? 'text-emerald-500' : readiness >= 60 ? 'text-amber-500' : 'text-red-500' },
          { label: 'Unmet RTO Targets',  value: unmetRTO,                             color: unmetRTO > 0 ? 'text-red-500' : 'text-emerald-500' },
          { label: 'Max Hourly Exposure',value: `$${(totalLoss / 1000).toFixed(0)}k`, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={cn('text-2xl font-black mt-1 leading-none', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-aegis-bg p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            className={cn('flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all',
              tab === t.id ? 'bg-white dark:bg-aegis-surface text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW ───────────────────────────────────────────── */}
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recovery Readiness */}
              <div className="glass-card p-6 space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">RTO Compliance — Target vs Current</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Blue line = target · Bar = current recovery time</p>
                </div>
                <div className="space-y-4">
                  {processes.map(p => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CRIT_DOT[p.criticality])} />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate flex-1">{p.name}</span>
                        {p.currentRTOHours > p.rtoHours && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest shrink-0">⚠ Unmet</span>
                        )}
                      </div>
                      <RTOBar target={p.rtoHours} current={p.currentRTOHours} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Heat Map */}
              <div className="glass-card p-6 space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Business Impact Heat Map</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Impact by category per process</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-3 w-40">Process</th>
                        {['Financial', 'Operational', 'Reputational', 'Regulatory'].map(col => (
                          <th key={col} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3 px-1">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      {processes.map(p => (
                        <tr key={p.id} className="border-t border-slate-100 dark:border-aegis-border">
                          <td className="pr-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CRIT_DOT[p.criticality])} />
                              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">{p.name.split('&')[0].trim()}</span>
                            </div>
                          </td>
                          {[p.financialImpact, p.operationalImpact, p.reputationalImpact, p.regulatoryImpact].map((imp, i) => (
                            <td key={i} className="px-1 py-1.5 text-center">
                              <span className={cn('inline-block w-full px-1 py-1 rounded text-[9px] font-black', IMPACT_CELL(IMPACT_SCORE[imp]))}>
                                {imp.substring(0, 4).toUpperCase()}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-aegis-border">
                  {[['Catastrophic','bg-red-600'],['Major','bg-orange-500'],['Moderate','bg-amber-400'],['Minor','bg-emerald-500'],['Negligible','bg-slate-300']].map(([l,c]) => (
                    <span key={l} className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                      <span className={cn('w-2.5 h-2.5 rounded', c)} />{l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial exposure timeline */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Cumulative Financial Exposure</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Projected cost over time — worst case vs. RTO-met scenario</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    style={{ background: 'transparent' }}
                    data={[1,2,4,8,12,24,48].map(h => ({
                      label: h < 24 ? `${h}h` : `${h/24}d`,
                      worst:     Math.round(processes.reduce((s,p) => s + p.hourlyLoss * h, 0) / 1000),
                      mitigated: Math.round(processes.reduce((s,p) => s + (h > p.rtoHours ? p.hourlyLoss * p.rtoHours : p.hourlyLoss * h), 0) / 1000),
                    }))}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="wc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-aegis-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}k`} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: '#0d1220', color: '#e8edf5', fontSize: 11 }}
                      formatter={(v: number, name: string) => [`$${v}k`, name === 'worst' ? 'Worst Case' : 'With RTO Met']} />
                    <Area type="monotone" dataKey="worst"     stroke="#EF4444" strokeWidth={2} fill="url(#wc)" dot={false} />
                    <Area type="monotone" dataKey="mitigated" stroke="#10B981" strokeWidth={2} fill="url(#mg)" dot={false} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-red-500 rounded" />Worst Case</span>
                <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-emerald-500" />With RTO Targets Met</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── processes ──────────────────────────────────────────── */}
        {tab === 'processes' && (
          <motion.div key="processes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(f => (
                <button key={f} onClick={() => setFilterCrit(f)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                    filterCrit === f ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-aegis-bg text-slate-500 hover:text-slate-900 dark:hover:text-white')}>
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map(p => (
                <div key={p.id} className="glass-card overflow-hidden">
                  <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-left">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-aegis-bg text-slate-500 shrink-0">
                      {DEPT_ICON[p.department] ?? <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-[10px] text-blue-500/70 font-bold">{p.id}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{p.name}</span>
                        <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg border', CRIT_COLOR[p.criticality])}>{p.criticality}</span>
                        {p.currentRTOHours > p.rtoHours && (
                          <span className="text-[9px] font-black text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />RTO Unmet</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-wrap">
                        <span>{p.department}</span>
                        <span>·</span>
                        <span>RTO <span className="text-blue-400">{rtoLabel(p.rtoHours)}</span></span>
                        <span>·</span>
                        <span>RPO <span className="text-purple-400">{rtoLabel(p.rpoHours)}</span></span>
                        <span>·</span>
                        <span className="text-amber-500">${(p.hourlyLoss / 1000).toFixed(0)}k/hr</span>
                      </div>
                    </div>
                    {expanded === p.id ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded === p.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div className="border-t border-slate-100 dark:border-aegis-border px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Description */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.description}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">System Dependencies</p>
                              <div className="flex flex-wrap gap-1.5">
                                {p.dependencies.map(d => (
                                  <span key={d} className="text-[10px] font-mono font-bold px-2 py-1 bg-slate-100 dark:bg-aegis-bg rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-aegis-border">{d}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Recovery objectives + RTO bar */}
                          <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recovery Objectives</p>
                            {[
                              { label: 'RTO Target', value: rtoLabel(p.rtoHours), color: 'text-blue-500' },
                              { label: 'RPO Target', value: rtoLabel(p.rpoHours), color: 'text-purple-500' },
                              { label: 'MTPD',       value: rtoLabel(p.mtpdHours), color: 'text-red-500' },
                            ].map(r => (
                              <div key={r.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                                <span className="text-[10px] font-bold text-slate-500">{r.label}</span>
                                <span className={cn('text-sm font-black', r.color)}>{r.value}</span>
                              </div>
                            ))}
                            <div className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border space-y-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current vs Target RTO</p>
                              <RTOBar target={p.rtoHours} current={p.currentRTOHours} />
                            </div>
                          </div>

                          {/* Impact */}
                          <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Impact Assessment</p>
                            {[
                              { label: 'Financial',     imp: p.financialImpact },
                              { label: 'Operational',   imp: p.operationalImpact },
                              { label: 'Reputational',  imp: p.reputationalImpact },
                              { label: 'Regulatory',    imp: p.regulatoryImpact },
                            ].map(({ label, imp }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500">{label}</span>
                                <span className={cn('text-[10px] font-black px-2 py-1 rounded-lg', IMPACT_CELL(IMPACT_SCORE[imp]))}>{imp}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-slate-100 dark:border-aegis-border flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hourly Loss</span>
                              <span className="text-base font-black text-amber-500">${p.hourlyLoss.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── DEPENDENCIES ───────────────────────────────────────── */}
        {tab === 'dependencies' && (
          <motion.div key="deps" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Process → System Dependency Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Which business processes depend on which infrastructure</p>
              </div>
              <div className="overflow-x-auto">
                {(() => {
                  const allSystems = Array.from(new Set(processes.flatMap(p => p.dependencies)));
                  return (
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-4 w-48">Process</th>
                          {allSystems.map(s => (
                            <th key={s} className="pb-3 px-1">
                              <span className="block font-mono text-[8px] font-black text-slate-500 uppercase tracking-wider [writing-mode:vertical-lr] rotate-180 h-20 items-end">{s}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {processes.map(p => (
                          <tr key={p.id} className="border-t border-slate-100 dark:border-aegis-border">
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-2">
                                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CRIT_DOT[p.criticality])} />
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{p.name.split('&')[0].trim()}</span>
                              </div>
                            </td>
                            {allSystems.map(s => (
                              <td key={s} className="px-1 py-2 text-center">
                                {p.dependencies.includes(s)
                                  ? <span className={cn('inline-block w-5 h-5 rounded', CRIT_DOT[p.criticality])} title={`${p.name} depends on ${s}`} />
                                  : <span className="inline-block w-5 h-5 rounded bg-slate-100 dark:bg-white/5" />
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>

            {/* Most depended-on systems */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Single Points of Failure</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Systems with the most dependent critical processes</p>
              <div className="space-y-3">
                {Array.from(new Set(processes.flatMap(p => p.dependencies)))
                  .map(sys => ({
                    sys,
                    count: processes.filter(p => p.dependencies.includes(sys)).length,
                    hasCritical: processes.some(p => p.dependencies.includes(sys) && p.criticality === 'Critical'),
                  }))
                  .sort((a, b) => b.count - a.count)
                  .map(({ sys, count, hasCritical }) => (
                    <div key={sys} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {hasCritical && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{sys}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{count} processes</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(count / processes.length) * 100}%` }} transition={{ duration: 0.7 }}
                          className={cn('h-full rounded-full', hasCritical ? 'bg-red-500' : 'bg-blue-500')} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RECOVERY PLANS ─────────────────────────────────────── */}
        {tab === 'recovery' && (
          <motion.div key="recovery" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-5">
            {/* Progress bar */}
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Incident Recovery Plan</h3>
                <span className="text-[10px] font-black text-amber-500 px-2 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">In Progress</span>
              </div>
              <div className="flex gap-1">
                {RECOVERY_PHASES.map((ph, i) => (
                  <div key={ph.id} className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10">
                    <div className={cn('h-full', ph.status === 'Complete' ? 'bg-emerald-500' : ph.status === 'In Progress' ? 'bg-amber-500' : '')} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{RECOVERY_PHASES.filter(p => p.status === 'Complete').length} of {RECOVERY_PHASES.length} phases complete</span>
                <span>Estimated completion in ~6 hrs</span>
              </div>
            </div>

            {/* Phase cards */}
            <div className="space-y-3">
              {RECOVERY_PHASES.map((ph, i) => {
                const cfg = PLAN_STATUS_CFG[ph.status];
                return (
                  <div key={ph.id} className="glass-card overflow-hidden">
                    <button onClick={() => setExpanded(expanded === ph.id ? null : ph.id)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      {/* Step number */}
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0', cfg.bg)}>
                        {ph.status === 'Complete' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{ph.phase}</span>
                          <span className={cn('text-[10px] font-black flex items-center gap-1', cfg.color)}>
                            {cfg.icon}{ph.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ph.duration}</span>
                          <span>·</span>
                          <span>Owner: {ph.owner}</span>
                        </div>
                      </div>
                      {expanded === ph.id ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded === ph.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                          <div className="border-t border-slate-100 dark:border-aegis-border px-6 py-4 space-y-2">
                            {ph.tasks.map((task, ti) => (
                              <div key={ti} className="flex items-center gap-3">
                                {ph.status === 'Complete'
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  : ph.status === 'In Progress' && ti === 0
                                  ? <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                  : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                                }
                                <span className="text-xs text-slate-600 dark:text-slate-400">{task}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
