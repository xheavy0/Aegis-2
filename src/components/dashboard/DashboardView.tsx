import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { NIST_CSF_FUNCTIONS, MOCK_NIST_STATUS, MOCK_CALENDAR_EVENTS } from '@/src/constants';
import { Shield, AlertCircle, FileCheck, ExternalLink, Zap, Activity, Info, ChevronRight, CheckCircle2, Globe, Lock, Database, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function DashboardView({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const radarData = MOCK_NIST_STATUS.map(s => ({
    subject: s.function.split(' - ')[0],
    A: s.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border border-blue-500/20 shadow-inner group">
             <div className="absolute inset-0 bg-blue-600 blur-lg opacity-10 group-hover:opacity-30 transition-opacity" />
             <img 
               src="/regenerated_image_1777458964528.png" 
               alt="Aegis Logo" 
               className="relative w-full h-full object-cover"
               referrerPolicy="no-referrer"
             />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Welcome back, Alex C.</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Operational · Deployment Stable</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {/* Buttons removed per user request */}
        </div>
      </header>

      {/* Briefing Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-0 overflow-hidden border-blue-500/10 bg-gradient-to-br from-white to-slate-50 dark:from-aegis-surface dark:to-slate-900/50"
      >
        <div className="p-1 bg-blue-600" />
        <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Info className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Morning Briefing</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Short Summary: 14 automated collections & policy drift detected.</h3>
                <div className="flex flex-wrap gap-4 pt-2">
                    <div className="px-4 py-2 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-aegis-border flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-none">12 Controls Validated</span>
                    </div>
                    <div className="px-4 py-2 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-aegis-border flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-none">3 Critical Findings</span>
                    </div>
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer hover:scale-105 transition-all">
                        <span className="text-xs font-black uppercase tracking-widest">Review Daily Audit ❯</span>
                    </div>
                </div>
            </div>
            <div className="shrink-0 w-full md:w-72 space-y-4">
                <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Activity className="w-12 h-12" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Security Score</p>
                    <div className="flex items-end gap-2 mt-1">
                        <span className="text-4xl font-black">74%</span>
                        <span className="text-xs font-bold text-emerald-400 mb-1.5">+2.1%</span>
                    </div>
                    <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '74%' }} />
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'compliance', label: 'Overall Posture', value: '74%', icon: Shield, color: 'text-blue-500', trend: '+2.4%', type: 'score' },
          { id: 'risks', label: 'Risk Exposure', value: 'High', icon: AlertCircle, color: 'text-amber-500', trend: 'Stable', type: 'risk' },
          { id: 'findings', label: 'Open Findings', value: '28', icon: FileCheck, color: 'text-red-500', trend: '-5 this week', type: 'findings' },
          { id: 'connectors', label: 'Active Plugins', value: '08', icon: Zap, color: 'text-emerald-500', trend: 'All Healthy', type: 'system' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            onClick={() => onTabChange(stat.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</h3>
                <p className={cn("text-[10px] font-bold mt-2", i === 2 ? "text-emerald-500" : "text-slate-400")}>{stat.trend}</p>
              </div>
            </div>
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-bl-full transition-all group-hover:scale-110" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maturity Radar */}
        <div className="lg:col-span-3 glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Maturity Radar</h3>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Posture across NIST functional domains</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-aegis-bg p-1 rounded-lg border border-slate-100 dark:border-aegis-border">
                <button className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-aegis-surface text-blue-600 rounded-md shadow-sm">Current</button>
                <button className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Previous</button>
            </div>
          </div>
          <div className="flex-1 h-[320px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData} style={{ background: 'transparent' }}>
                <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-aegis-border" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} />
                <Radar
                  name="Maturity"
                  dataKey="A"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Agenda */}
        <div className="glass-card p-6 flex flex-col bg-white dark:bg-aegis-surface">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-aegis-border pb-4">
                <div>
                   <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Today's Agenda</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit & Team Schedule</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                    <CalendarIcon className="w-5 h-5" />
                </div>
            </div>
            <div className="flex-1 space-y-4">
                {MOCK_CALENDAR_EVENTS.slice(0, 2).map((event) => (
                    <div key={event.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-aegis-bg border border-slate-100 dark:border-aegis-border group hover:border-blue-500/30 transition-all cursor-pointer">
                        <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 bg-white dark:bg-aegis-surface rounded-xl shadow-sm border border-slate-100 dark:border-aegis-border">
                            <span className="text-[10px] font-black text-blue-600 uppercase">APR</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">29</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{event.title}</h4>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight",
                                    event.type === 'Audit' ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                )}>{event.type}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 grayscale group-hover:grayscale-0 transition-all">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500">{event.startTime}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-bold text-slate-500 tracking-tight">{event.duration}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button 
              onClick={() => onTabChange('calendar')}
              className="mt-6 w-full py-3 bg-slate-50 dark:bg-aegis-bg text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-aegis-border hover:bg-slate-100 transition-all"
            >
              View Full Team Calendar
            </button>
        </div>

        {/* Security Pulse / Anomalies */}
        <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8 text-slate-900 dark:text-white">
                <h3 className="text-lg font-bold leading-tight">Integrity Pulse</h3>
                <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 space-y-4">
                {[
                    { title: 'Critical Finding Uncovered', desc: 'AD: Domain admin change without ticket', time: '12m ago', type: 'critical', id: 'findings' },
                    { title: 'New Evidence Collected', desc: 'Okta: Yearly MFA report harvested', time: '1h ago', type: 'success', id: 'compliance' },
                    { title: 'Drift Detected', desc: 'AWS: S3 bucket config changed via CLI', time: '2h ago', type: 'warning', id: 'risks' },
                ].map((item, id) => (
                    <div 
                      key={id} 
                      onClick={() => onTabChange(item.id)}
                      className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
                    >
                        <div className={cn(
                            "w-1.5 h-10 rounded-full shrink-0 group-hover:w-3 transition-all",
                            item.type === 'critical' ? "bg-red-500" : item.type === 'success' ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500">{item.title}</h4>
                            <p className="text-xs text-slate-400 truncate">{item.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.time}</span>
                    </div>
                ))}
            </div>
            <button className="mt-8 text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Command History <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
