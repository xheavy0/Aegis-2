import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, CheckCircle2, Circle, AlertCircle, Filter, X,
  ShieldCheck, TrendingUp, AlertTriangle, Target, Users,
  FileText, ChevronRight, BarChart3, Layers, Lock, Eye,
  Radio, RotateCcw, RefreshCw, ClipboardList, Upload,
  ExternalLink, Calendar, Tag, Zap, Award, Clock
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Control, ControlEvidence, ControlImplStatus, ControlMaturity, ControlPriority } from '@/src/types';
import { api } from '@/src/lib/api';

// ─── Frameworks ────────────────────────────────────────────────────────────────
type FrameworkId = 'nist-csf2' | 'iso27001' | 'soc2' | 'gdpr' | 'pci-dss' | 'cmmc';

interface Framework {
  id: FrameworkId;
  name: string;
  shortName: string;
  version: string;
  description: string;
  active: boolean;
  controlCount: number;
  color: string;
  bg: string;
  border: string;
}

const FRAMEWORKS: Framework[] = [
  {
    id: 'nist-csf2',
    name: 'NIST Cybersecurity Framework',
    shortName: 'NIST CSF',
    version: '2.0',
    description: '6 functions · 44 categories · 106 subcategories',
    active: true,
    controlCount: 44,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
  },
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001',
    shortName: 'ISO 27001',
    version: '2022',
    description: '4 clauses · 93 controls · Annex A',
    active: false,
    controlCount: 93,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    shortName: 'SOC 2',
    version: 'AICPA',
    description: '5 trust service criteria · 64 points',
    active: false,
    controlCount: 64,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation',
    shortName: 'GDPR',
    version: 'EU 2016/679',
    description: '11 chapters · 99 articles',
    active: false,
    controlCount: 99,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    shortName: 'PCI DSS',
    version: 'v4.0',
    description: '12 requirements · 281 sub-requirements',
    active: false,
    controlCount: 281,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
  },
  {
    id: 'cmmc',
    name: 'CMMC',
    shortName: 'CMMC',
    version: '2.0',
    description: '3 levels · 110+ practices',
    active: false,
    controlCount: 110,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────────
type CsfFunction = 'GOVERN' | 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';
type ImplStatus  = ControlImplStatus;
type MaturityLvl = ControlMaturity;
type Priority    = ControlPriority;
type Evidence    = ControlEvidence;

// ─── Data ──────────────────────────────────────────────────────────────────────

// ─── Config ────────────────────────────────────────────────────────────────────
const CSF_FUNCTIONS: { key: CsfFunction; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  { key: 'GOVERN',   label: 'Govern',   icon: <ClipboardList className="w-4 h-4" />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
  { key: 'IDENTIFY', label: 'Identify', icon: <Eye className="w-4 h-4" />,           color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800'   },
  { key: 'PROTECT',  label: 'Protect',  icon: <Lock className="w-4 h-4" />,          color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  { key: 'DETECT',   label: 'Detect',   icon: <Radio className="w-4 h-4" />,         color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  { key: 'RESPOND',  label: 'Respond',  icon: <Zap className="w-4 h-4" />,           color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800'     },
  { key: 'RECOVER',  label: 'Recover',  icon: <RotateCcw className="w-4 h-4" />,     color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
];

const MATURITY_LABELS: Record<MaturityLvl, string> = {
  0: 'Not Started', 1: 'Initial', 2: 'Developing', 3: 'Defined', 4: 'Optimized',
};
const MATURITY_COLORS: Record<MaturityLvl, string> = {
  0: 'bg-slate-200 dark:bg-slate-700',
  1: 'bg-red-400',
  2: 'bg-amber-400',
  3: 'bg-blue-400',
  4: 'bg-emerald-500',
};

const STATUS_CONFIG = {
  Implemented:  { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  Partial:      { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800'   },
  'Not Started':{ icon: <Circle className="w-3.5 h-3.5" />,      color: 'text-slate-400',                        bg: 'bg-slate-50 dark:bg-slate-800',      border: 'border-slate-200 dark:border-slate-700'   },
};

const PRIORITY_CONFIG: Record<Priority, string> = {
  Critical: 'text-red-600 dark:text-red-400',
  High:     'text-orange-500 dark:text-orange-400',
  Medium:   'text-amber-500 dark:text-amber-400',
  Low:      'text-slate-400',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function coveragePct(controls: Control[]) {
  if (!controls.length) return 0;
  const score = controls.reduce((s, c) => s + c.maturity, 0);
  return Math.round((score / (controls.length * 4)) * 100);
}

function getFunctionCfg(key: CsfFunction) {
  return CSF_FUNCTIONS.find(f => f.key === key)!;
}

// ─── MaturityBar ───────────────────────────────────────────────────────────────
function MaturityBar({ level, size = 'sm' }: { level: MaturityLvl; size?: 'sm' | 'md' }) {
  return (
    <div className={cn('flex items-center gap-1', size === 'md' ? 'gap-1.5' : 'gap-0.5')}>
      {([0, 1, 2, 3, 4] as MaturityLvl[]).map(i => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all',
            size === 'md' ? 'w-4 h-4' : 'w-2.5 h-2.5',
            i <= level ? MATURITY_COLORS[level] : 'bg-slate-100 dark:bg-slate-800'
          )}
        />
      ))}
    </div>
  );
}

// ─── FunctionCard ──────────────────────────────────────────────────────────────
function FunctionCard({ cfg, controls, active, onClick }: {
  cfg: typeof CSF_FUNCTIONS[0];
  controls: Control[];
  active: boolean;
  onClick: () => void;
}) {
  const pct = coveragePct(controls);
  const implemented = controls.filter(c => c.status === 'Implemented').length;

  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left p-4 rounded-xl border transition-all',
        active
          ? `${cfg.bg} ${cfg.border} shadow-sm`
          : 'bg-white dark:bg-aegis-surface border-slate-100 dark:border-aegis-border hover:border-slate-200 dark:hover:border-white/10'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg, cfg.color)}>
          {cfg.icon}
        </div>
        <span className={cn('text-lg font-black', pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-500' : 'text-red-500')}>{pct}%</span>
      </div>
      <div className={cn('text-xs font-black uppercase tracking-widest mb-1', cfg.color)}>{cfg.label}</div>
      <div className="text-[10px] text-slate-400">{implemented}/{controls.length} implemented</div>
      <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-aegis-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={cn('h-full rounded-full', pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400')}
        />
      </div>
    </button>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────
function ControlDetailPanel({ control, onClose }: { control: Control; onClose: () => void }) {
  const fnCfg = getFunctionCfg(control.function);
  const stCfg = STATUS_CONFIG[control.status];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
      />
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-aegis-surface shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-aegis-border overflow-hidden"
      >
        {/* Header */}
        <div className={cn('px-6 py-5 border-b border-slate-100 dark:border-aegis-border', fnCfg.bg)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border', fnCfg.bg, fnCfg.color, fnCfg.border)}>
                  {fnCfg.label}
                </span>
                <span className="font-mono text-[10px] font-black text-slate-500">{control.id}</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-snug">{control.subcategory}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{control.category}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-aegis-border flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Status + Maturity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</div>
              <div className={cn('flex items-center gap-1.5 text-xs font-black', stCfg.color)}>
                {stCfg.icon}
                {control.status}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Maturity</div>
              <MaturityBar level={control.maturity} size="sm" />
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">{MATURITY_LABELS[control.maturity]}</div>
            </div>
          </div>

          {/* Maturity selector */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Set Maturity Level</div>
            <div className="grid grid-cols-5 gap-1.5">
              {([0, 1, 2, 3, 4] as MaturityLvl[]).map(lvl => (
                <button
                  key={lvl}
                  className={cn(
                    'p-2.5 rounded-xl border text-center transition-all',
                    lvl === control.maturity
                      ? `${fnCfg.bg} ${fnCfg.border} ${fnCfg.color}`
                      : 'bg-slate-50 dark:bg-aegis-bg border-slate-100 dark:border-aegis-border text-slate-400 hover:border-slate-300'
                  )}
                >
                  <div className="text-sm font-black">{lvl}</div>
                  <div className="text-[8px] font-bold mt-0.5 leading-tight">{MATURITY_LABELS[lvl].split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Control Description</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{control.description}</p>
          </div>

          {/* Owner + Priority + Due Date */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />{control.owner}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</div>
              <div className={cn('text-xs font-black', PRIORITY_CONFIG[control.priority])}>{control.priority}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {control.dueDate ? new Date(control.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </div>
            </div>
          </div>

          {/* Notes */}
          {control.notes && (
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium">
                {control.notes}
              </div>
            </div>
          )}

          {/* Evidence */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence</div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                <Upload className="w-3 h-3" />
                Upload
              </button>
            </div>
            {control.evidence.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 dark:border-aegis-border rounded-xl text-slate-400">
                <Upload className="w-6 h-6 mb-2 opacity-40" />
                <p className="text-xs font-bold">No evidence uploaded</p>
                <p className="text-[10px] mt-0.5">Drag & drop or click Upload</p>
              </div>
            ) : (
              <div className="space-y-2">
                {control.evidence.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{e.name}</div>
                      <div className="text-[10px] text-slate-400">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Policies */}
          {control.linkedPolicies.length > 0 && (
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Linked Policies</div>
              <div className="flex flex-wrap gap-2">
                {control.linkedPolicies.map(pid => (
                  <span key={pid} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-[10px] font-black text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <FileText className="w-3 h-3" />{pid}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-aegis-border flex gap-2 bg-white dark:bg-aegis-surface">
          <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-aegis-bg text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Framework Card ────────────────────────────────────────────────────────────
function FrameworkCard({ fw, isSelected, onSelect }: {
  fw: Framework;
  isSelected: boolean;
  onSelect: () => void;
}) {
  if (!fw.active) {
    return (
      <div className="relative p-4 rounded-xl border border-slate-100 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg opacity-60 cursor-not-allowed select-none">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{fw.shortName}</div>
            <div className="text-[10px] text-slate-400 font-mono">{fw.version}</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Lock className="w-2.5 h-2.5" />
            Soon
          </div>
        </div>
        <div className="text-[10px] text-slate-400 leading-relaxed">{fw.description}</div>
        <div className="mt-3 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        'text-left p-4 rounded-xl border-2 transition-all w-full',
        isSelected
          ? `${fw.bg} ${fw.border} shadow-md`
          : 'bg-white dark:bg-aegis-surface border-slate-200 dark:border-aegis-border hover:border-blue-300 dark:hover:border-blue-700'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className={cn('text-xs font-black uppercase tracking-widest', isSelected ? fw.color : 'text-slate-700 dark:text-slate-300')}>{fw.shortName}</div>
          <div className="text-[10px] text-slate-400 font-mono">{fw.version}</div>
        </div>
        {isSelected && (
          <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider', fw.bg, fw.color)}>
            <CheckCircle2 className="w-2.5 h-2.5" />
            Active
          </div>
        )}
      </div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{fw.description}</div>
      {isSelected && (
        <div className="mt-3 w-full h-1 rounded-full bg-blue-200 dark:bg-blue-800 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: '68%' }} />
        </div>
      )}
    </button>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────────
export function RequirementHubView() {
  const [activeFramework, setActiveFramework] = useState<FrameworkId>('nist-csf2');
  const [search, setSearch]           = useState('');
  const [filterFn, setFilterFn]       = useState<CsfFunction | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<ImplStatus | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [selected, setSelected]       = useState<Control | null>(null);
  const [CONTROLS, setControls]       = useState<Control[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getControls()
      .then(data => { if (active) { setControls(data); setError(null); } })
      .catch(err => { if (active) setError(err.message ?? 'Failed to load controls'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const activeFw = FRAMEWORKS.find(f => f.id === activeFramework)!;

  // Stats
  const totalControls    = CONTROLS.length;
  const implemented      = CONTROLS.filter(c => c.status === 'Implemented').length;
  const partial          = CONTROLS.filter(c => c.status === 'Partial').length;
  const notStarted       = CONTROLS.filter(c => c.status === 'Not Started').length;
  const overallScore     = coveragePct(CONTROLS);
  const criticalGaps     = CONTROLS.filter(c => c.status !== 'Implemented' && c.priority === 'Critical').length;

  // Filtered
  const filtered = useMemo(() => CONTROLS.filter(c => {
    const matchFn       = filterFn === 'All' || c.function === filterFn;
    const matchStatus   = filterStatus === 'All' || c.status === filterStatus;
    const matchPriority = filterPriority === 'All' || c.priority === filterPriority;
    const matchSearch   = !search || [c.id, c.category, c.subcategory, c.description, c.owner]
      .some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchFn && matchStatus && matchPriority && matchSearch;
  }), [CONTROLS, search, filterFn, filterStatus, filterPriority]);

  // Function coverage map
  const fnControls = useMemo(() => {
    const map: Record<string, Control[]> = {};
    CSF_FUNCTIONS.forEach(f => { map[f.key] = CONTROLS.filter(c => c.function === f.key); });
    return map;
  }, [CONTROLS]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Requirement Hub</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Select a compliance framework to view and track its requirements</p>
      </div>

      {loading && (
        <div className="glass-card p-4 flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4 animate-spin" /> Loading controls…
        </div>
      )}
      {error && (
        <div className="glass-card p-4 flex items-center gap-3 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Framework Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {FRAMEWORKS.map(fw => (
          <FrameworkCard
            key={fw.id}
            fw={fw}
            isSelected={activeFramework === fw.id}
            onSelect={() => {
              if (fw.active) {
                setActiveFramework(fw.id);
                setFilterFn('All');
                setFilterStatus('All');
                setSearch('');
              }
            }}
          />
        ))}
      </div>

      {/* Active Framework info bar */}
      <div className={cn('flex items-center gap-4 px-5 py-3 rounded-xl border', activeFw.bg, activeFw.border)}>
        <div className={cn('text-sm font-black', activeFw.color)}>{activeFw.name} {activeFw.version}</div>
        <div className="w-px h-4 bg-current opacity-20" />
        <div className="text-xs text-slate-500 dark:text-slate-400">{activeFw.description}</div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Framework Active
        </div>
      </div>

      {/* Score ring row */}
      <div className="flex items-center justify-end gap-3">
        <div className="text-right">
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">{overallScore}%</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage</div>
        </div>
        <div className="w-16 h-16 relative flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-aegis-border" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
              strokeDasharray={`${overallScore} ${100 - overallScore}`}
              strokeLinecap="round"
              className="text-blue-600 dark:text-blue-400 transition-all duration-700"
            />
          </svg>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Controls', value: totalControls, sub: 'NIST CSF 2.0', icon: <Layers className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Implemented',    value: implemented,   sub: `${Math.round(implemented/totalControls*100)}% complete`, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'In Progress',    value: partial,       sub: 'Partial coverage', icon: <AlertCircle className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Critical Gaps',  value: criticalGaps,  sub: 'Needs immediate attention', icon: <AlertTriangle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 dark:bg-red-900/20' },
        ].map(s => (
          <div key={s.label} className="glass-card p-5 flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.color)}>{s.icon}</div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{s.value}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Function Heatmap */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {CSF_FUNCTIONS.map(cfg => (
          <FunctionCard
            key={cfg.key}
            cfg={cfg}
            controls={fnControls[cfg.key]}
            active={filterFn === cfg.key}
            onClick={() => setFilterFn(filterFn === cfg.key ? 'All' : cfg.key)}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search controls, owners, categories..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', 'Implemented', 'Partial', 'Not Started'] as const).map(s => {
            const cfg = s !== 'All' ? STATUS_CONFIG[s] : null;
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                  filterStatus === s ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                )}>
                {cfg?.icon}{s}
              </button>
            );
          })}
          <div className="w-px h-5 bg-slate-200 dark:bg-aegis-border" />
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(p => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={cn('px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                filterPriority === p ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10',
                p !== 'All' && filterPriority !== p ? PRIORITY_CONFIG[p as Priority] : ''
              )}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Table */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-aegis-border text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
          <div className="col-span-2">Control ID</div>
          <div className="col-span-1">Function</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-1">Owner</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Maturity</div>
          <div className="col-span-2">Status</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-aegis-border">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No controls match your filters</p>
            </div>
          ) : filtered.map((ctrl, i) => {
            const fn   = getFunctionCfg(ctrl.function);
            const st   = STATUS_CONFIG[ctrl.status];
            return (
              <motion.div
                key={ctrl.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => setSelected(ctrl)}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-white/[0.025] transition-all cursor-pointer group"
              >
                {/* ID */}
                <div className="md:col-span-2 font-mono text-[11px] font-black text-blue-500/80 group-hover:text-blue-600 transition-colors">{ctrl.id}</div>

                {/* Function */}
                <div className="md:col-span-1">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border', fn.bg, fn.color, fn.border)}>
                    {fn.icon && React.cloneElement(fn.icon as any, { className: 'w-2.5 h-2.5' })}
                    {ctrl.function.slice(0, 3)}
                  </span>
                </div>

                {/* Description */}
                <div className="md:col-span-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{ctrl.subcategory}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{ctrl.description}</div>
                </div>

                {/* Owner */}
                <div className="md:col-span-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{ctrl.owner}</span>
                </div>

                {/* Priority */}
                <div className="md:col-span-1">
                  <span className={cn('text-[9px] font-black uppercase tracking-wider', PRIORITY_CONFIG[ctrl.priority])}>{ctrl.priority}</span>
                </div>

                {/* Maturity */}
                <div className="md:col-span-2">
                  <MaturityBar level={ctrl.maturity} />
                  <div className="text-[9px] text-slate-400 mt-1">{MATURITY_LABELS[ctrl.maturity]}</div>
                </div>

                {/* Status */}
                <div className="md:col-span-2 flex items-center justify-between">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border', st.bg, st.color, st.border)}>
                    {st.icon}
                    {ctrl.status}
                  </span>
                  {ctrl.evidence.length > 0 && (
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                      <FileText className="w-3 h-3" />{ctrl.evidence.length}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-aegis-border flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">{filtered.length} of {totalControls} controls</span>
          <span className="text-[11px] font-bold text-slate-400">{notStarted} not started · {partial} partial · {implemented} implemented</span>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && <ControlDetailPanel control={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
