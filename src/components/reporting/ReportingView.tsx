import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Download, Activity, ShieldCheck, AlertTriangle, FileText, Users, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { MOCK_VENDORS } from '@/src/constants';

const BIA_PROCESSES = [
  { name: 'Core Banking & Payments',    criticality: 'Critical', rtoHours: 0.25, hourlyLoss: 55000 },
  { name: 'Customer IAM',               criticality: 'Critical', rtoHours: 0.5,  hourlyLoss: 28000 },
  { name: 'Customer Support',           criticality: 'High',     rtoHours: 2,    hourlyLoss: 6500  },
  { name: 'Data Warehouse',             criticality: 'High',     rtoHours: 4,    hourlyLoss: 9000  },
  { name: 'HR & Payroll',               criticality: 'High',     rtoHours: 8,    hourlyLoss: 12000 },
  { name: 'Regulatory Reporting',       criticality: 'High',     rtoHours: 24,   hourlyLoss: 18000 },
  { name: 'Internal Collaboration',     criticality: 'Medium',   rtoHours: 4,    hourlyLoss: 3200  },
];

// Cumulative downtime cost — worst case (all systems down)
const DOWNTIME_COST = [1, 2, 4, 8, 12, 24, 48].map(h => ({
  label: h < 24 ? `${h}h` : `${h / 24}d`,
  hours: h,
  cost: Math.round(BIA_PROCESSES.reduce((sum, p) => sum + p.hourlyLoss * h, 0) / 1000),
  mitigated: Math.round(BIA_PROCESSES.reduce((sum, p) => sum + (h > p.rtoHours ? p.hourlyLoss * p.rtoHours : p.hourlyLoss * h), 0) / 1000),
}));

const CRIT_DOT: Record<string, string> = {
  Critical: 'bg-red-500',
  High:     'bg-orange-400',
  Medium:   'bg-amber-400',
  Low:      'bg-slate-400',
};

const CRIT_TEXT: Record<string, string> = {
  Critical: 'text-red-500',
  High:     'text-orange-500',
  Medium:   'text-amber-500',
  Low:      'text-slate-400',
};

const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444'];

const MOCK_TIME_DATA = {
  weekly: [
    { name: 'Mon', risks: 4, compliance: 65 },
    { name: 'Tue', risks: 3, compliance: 68 },
    { name: 'Wed', risks: 5, compliance: 66 },
    { name: 'Thu', risks: 2, compliance: 72 },
    { name: 'Fri', risks: 6, compliance: 70 },
    { name: 'Sat', risks: 1, compliance: 74 },
    { name: 'Sun', risks: 0, compliance: 74 },
  ],
  monthly: [
    { name: 'Week 1', risks: 12, compliance: 60 },
    { name: 'Week 2', risks: 18, compliance: 65 },
    { name: 'Week 3', risks: 10, compliance: 70 },
    { name: 'Week 4', risks: 15, compliance: 74 },
  ],
  yearly: [
    { name: 'Jan', risks: 45, compliance: 40 },
    { name: 'Feb', risks: 52, compliance: 45 },
    { name: 'Mar', risks: 38, compliance: 52 },
    { name: 'Apr', risks: 30, compliance: 58 },
    { name: 'May', risks: 42, compliance: 62 },
    { name: 'Jun', risks: 35, compliance: 65 },
    { name: 'Jul', risks: 28, compliance: 68 },
    { name: 'Aug', risks: 22, compliance: 70 },
    { name: 'Sep', risks: 18, compliance: 72 },
    { name: 'Oct', risks: 25, compliance: 73 },
    { name: 'Nov', risks: 20, compliance: 74 },
    { name: 'Dec', risks: 15, compliance: 74 },
  ]
};

const TEAM_TASK_STATS = [
  { name: 'Alex C.', completed: 45, efficiency: 94 },
  { name: 'Sarah J.', completed: 38, efficiency: 88 },
  { name: 'Michael K.', completed: 42, efficiency: 91 },
  { name: 'Elena R.', completed: 29, efficiency: 96 },
  { name: 'David B.', completed: 51, efficiency: 84 },
];

export function ReportingView() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const data = MOCK_TIME_DATA[timeframe];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Intelligence & Reporting</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Holistic visualization of security posture and operational metrics.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white dark:bg-aegis-surface p-1 rounded-xl border border-slate-200 dark:border-aegis-border shadow-sm">
            {(['weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  timeframe === t 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PDF
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Executive Score', value: '74', trend: '+12%', icon: ShieldCheck, color: 'text-blue-500' },
            { label: 'Risk Mitigation', value: '82%', trend: '+5%', icon: AlertTriangle, color: 'text-orange-500' },
            { label: 'Control Health', value: '94%', trend: 'Stable', icon: Activity, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 flex items-center justify-between group overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1 leading-none">{stat.value}</h3>
                    <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {stat.trend} from last peroid
                    </p>
                </div>
                <stat.icon className={cn("w-12 h-12 opacity-10 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform", stat.color)} />
            </div>
          ))}
      </div>

      {/* Vendor / TPSA Statistics — moved up */}
      {(() => {
        const t1 = MOCK_VENDORS.filter(v => v.criticality === 'Tier 1').length;
        const t2 = MOCK_VENDORS.filter(v => v.criticality === 'Tier 2').length;
        const t3 = MOCK_VENDORS.filter(v => v.criticality === 'Tier 3').length;
        const compliant    = MOCK_VENDORS.filter(v => v.complianceStatus === 'Compliant').length;
        const nonCompliant = MOCK_VENDORS.filter(v => v.complianceStatus === 'Non-compliant').length;
        const pending      = MOCK_VENDORS.filter(v => v.complianceStatus === 'Pending').length;
        const total        = MOCK_VENDORS.length;
        const tiers = [
          { label: 'Tier 1 — Critical', count: t1, color: 'bg-red-500',    text: 'text-red-500' },
          { label: 'Tier 2 — High',     count: t2, color: 'bg-orange-400', text: 'text-orange-400' },
          { label: 'Tier 3 — Standard', count: t3, color: 'bg-amber-400',  text: 'text-amber-400' },
        ];
        return (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Third-Party Risk — Vendor Overview</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Criticality distribution & compliance status</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-aegis-bg rounded-xl">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-black text-slate-900 dark:text-white">{total} Vendors</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tier breakdown */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">By Criticality Tier</p>
                {tiers.map(t => (
                  <div key={t.label} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className={cn('text-xs font-black', t.text)}>{t.label}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{t.count} <span className="text-slate-400 font-medium">/ {total}</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: total ? `${(t.count / total) * 100}%` : '0%' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', t.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance status */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">By Compliance Status</p>
                {[
                  { label: 'Compliant',     count: compliant,    color: 'bg-emerald-500', text: 'text-emerald-500' },
                  { label: 'Non-Compliant', count: nonCompliant, color: 'bg-red-500',     text: 'text-red-500' },
                  { label: 'Pending',       count: pending,      color: 'bg-amber-400',   text: 'text-amber-500' },
                ].map(s => (
                  <div key={s.label} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className={cn('text-xs font-black', s.text)}>{s.label}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{s.count} <span className="text-slate-400 font-medium">/ {total}</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: total ? `${(s.count / total) * 100}%` : '0%' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', s.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Security Posture + Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Security Posture Trend</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Compliance score over {timeframe}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[9px] font-black uppercase text-slate-400">Score</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} style={{ background: 'transparent' }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-aegis-border" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#000' }} itemStyle={{ fontWeight: 800, fontSize: '12px' }} />
                <Area type="monotone" dataKey="compliance" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Team Performance</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tasks completed by member</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEAM_TASK_STATS} layout="vertical" style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-slate-100 dark:text-aegis-border" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#000' }} />
                <Bar dataKey="completed" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Accumulation + BIA Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Accumulation */}
        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Risk Accumulation</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identified risks throughout {timeframe}</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-aegis-border" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#000' }} />
                <Bar dataKey="risks" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIA Report */}
        <div className="glass-card p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Business Impact Analysis</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cumulative downtime cost projection</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Max hourly loss</p>
              <p className="text-2xl font-black text-red-500">${(BIA_PROCESSES.reduce((s, p) => s + p.hourlyLoss, 0) / 1000).toFixed(0)}k</p>
            </div>
          </div>

          {/* Cumulative cost chart */}
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DOWNTIME_COST} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} style={{ background: 'transparent' }}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-aegis-border" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}k`} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', backgroundColor: '#0d1220', color: '#e8edf5', fontSize: 11 }}
                  formatter={(v: number, name: string) => [`$${(v).toLocaleString()}k`, name === 'cost' ? 'Worst Case' : 'With RTO']}
                />
                <Area type="monotone" dataKey="cost"      stroke="#EF4444" strokeWidth={2} fill="url(#costGrad)"      dot={false} />
                <Area type="monotone" dataKey="mitigated" stroke="#10B981" strokeWidth={2} fill="url(#mitigatedGrad)" dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-500 inline-block rounded" />Worst Case</span>
            <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-emerald-500 inline-block" />With RTO Targets</span>
          </div>

          {/* Process table */}
          <div className="border-t border-slate-100 dark:border-aegis-border pt-4 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Critical Processes</p>
            {BIA_PROCESSES.filter(p => p.criticality !== 'Medium').map(p => (
              <div key={p.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CRIT_DOT[p.criticality])} />
                  <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">RTO {p.rtoHours < 1 ? `${p.rtoHours * 60}m` : `${p.rtoHours}h`}</span>
                  <span className={cn('text-[10px] font-black', CRIT_TEXT[p.criticality])}>${(p.hourlyLoss / 1000).toFixed(0)}k/hr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Risks by Category</h4>
              <div className="space-y-3">
                  {[
                    { label: 'Access Control', count: 12, color: 'bg-blue-500' },
                    { label: 'Data Privacy', count: 8, color: 'bg-emerald-500' },
                    { label: 'Cloud Config', count: 6, color: 'bg-orange-500' },
                  ].map((cat, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-700 dark:text-slate-300">{cat.label}</span>
                            <span className="text-slate-500">{cat.count}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className={cn("h-full", cat.color)} style={{ width: `${(cat.count/15)*100}%` }} />
                        </div>
                    </div>
                  ))}
              </div>
          </div>
          <div className="glass-card p-6 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Findings Severity</h4>
              <div className="flex items-center justify-center pt-2">
                  <ResponsiveContainer width="100%" height={120}>
                      <PieChart style={{ background: 'transparent' }}>
                          <Pie
                            data={[
                                { name: 'High', value: 40 },
                                { name: 'Med', value: 35 },
                                { name: 'Low', value: 25 },
                            ]} 
                            innerRadius={35} 
                            outerRadius={50} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                              {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                          </Pie>
                          <Tooltip />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4">
                  {['High', 'Med', 'Low'].map((l, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", COLORS[i])} />
                        <span className="text-[9px] font-black uppercase text-slate-500">{l}</span>
                    </div>
                  ))}
              </div>
          </div>
          <div className="glass-card p-6 bg-slate-900 border-none relative overflow-hidden flex flex-col justify-center text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent)]" />
              <div className="relative z-10">
                <FileText className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h4 className="text-sm font-black text-white leading-tight">Board Advisory Report</h4>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Ready for Q2 compliance review. Includes automated gap analysis and remediation progress.</p>
                <button className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">Generate Insights</button>
              </div>
          </div>
      </div>
    </div>
  );
}
