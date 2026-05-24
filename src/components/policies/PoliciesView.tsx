import React, { useState, useMemo } from 'react';
import {
  FileText, Clock, Users, ArrowRight, CheckCircle2, Plus, X, ShieldCheck,
  History, ExternalLink, Search, Filter, ChevronRight, AlertTriangle,
  BookOpen, GitBranch, UserCheck, Tag, Calendar, TrendingUp, Archive,
  Edit3, Eye, MoreHorizontal, Download, Send, RefreshCw, CheckSquare,
  XCircle, FileCheck, Layers
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ────────────────────────────────────────────────────────────────────
type PolicyStatus = 'Draft' | 'Under Review' | 'Approved' | 'Published' | 'Archived';
type PolicyCategory = 'Security' | 'Privacy' | 'HR' | 'Operations' | 'Compliance';

interface PolicyVersion {
  version: string;
  date: string;
  author: string;
  summary: string;
}

interface Attestation {
  name: string;
  role: string;
  date: string | null;
  status: 'Confirmed' | 'Pending' | 'Overdue';
}

interface Policy {
  id: string;
  title: string;
  version: string;
  owner: string;
  status: PolicyStatus;
  category: PolicyCategory;
  nextReview: string;
  lastUpdated: string;
  description: string;
  frameworks: { code: string; name: string }[];
  versions: PolicyVersion[];
  attestations: Attestation[];
  exceptions: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const POLICIES: Policy[] = [
  {
    id: 'POL-001',
    title: 'Information Security Policy',
    version: 'v2.4',
    owner: 'CISO',
    status: 'Published',
    category: 'Security',
    nextReview: '2024-10-15',
    lastUpdated: '2024-02-15',
    description: 'Governs all information security practices and responsibilities across the organization. Establishes the security framework, roles, and accountability structure.',
    frameworks: [
      { code: 'AC-1', name: 'Access Control Policy' },
      { code: 'AT-1', name: 'Awareness & Training' },
      { code: 'CA-1', name: 'Security Assessment' },
      { code: 'ISO 27001', name: 'A.5.1 - Information Security Policies' },
    ],
    versions: [
      { version: 'v2.4', date: '2024-02-15', author: 'Jane Smith', summary: 'Updated cloud security provisions' },
      { version: 'v2.3', date: '2023-09-01', author: 'John Doe', summary: 'Added remote work guidelines' },
      { version: 'v2.2', date: '2023-01-20', author: 'Jane Smith', summary: 'Annual review update' },
    ],
    attestations: [
      { name: 'Alice Chen', role: 'Engineering Lead', date: '2024-02-20', status: 'Confirmed' },
      { name: 'Bob Martin', role: 'Product Manager', date: '2024-02-22', status: 'Confirmed' },
      { name: 'Carol White', role: 'HR Director', date: null, status: 'Pending' },
      { name: 'David Kim', role: 'Sales Director', date: null, status: 'Overdue' },
    ],
    exceptions: 2,
  },
  {
    id: 'POL-002',
    title: 'Acceptable Use Policy',
    version: 'v1.8',
    owner: 'HR / Security',
    status: 'Published',
    category: 'HR',
    nextReview: '2024-11-30',
    lastUpdated: '2024-01-10',
    description: 'Sets expectations for employees regarding acceptable use of corporate assets, networks, and information systems.',
    frameworks: [
      { code: 'PS-1', name: 'Personnel Security Policy' },
      { code: 'PL-4', name: 'Rules of Behavior' },
    ],
    versions: [
      { version: 'v1.8', date: '2024-01-10', author: 'HR Team', summary: 'Social media policy update' },
      { version: 'v1.7', date: '2023-06-15', author: 'HR Team', summary: 'BYOD additions' },
    ],
    attestations: [
      { name: 'Alice Chen', role: 'Engineering Lead', date: '2024-01-15', status: 'Confirmed' },
      { name: 'Bob Martin', role: 'Product Manager', date: '2024-01-16', status: 'Confirmed' },
      { name: 'Carol White', role: 'HR Director', date: '2024-01-14', status: 'Confirmed' },
      { name: 'David Kim', role: 'Sales Director', date: null, status: 'Pending' },
    ],
    exceptions: 0,
  },
  {
    id: 'POL-003',
    title: 'Incident Response Plan',
    version: 'v3.1',
    owner: 'Security Ops',
    status: 'Under Review',
    category: 'Security',
    nextReview: '2024-07-01',
    lastUpdated: '2024-05-30',
    description: 'Defines procedures for identifying, containing, eradicating, and recovering from security incidents. Establishes escalation paths and communication protocols.',
    frameworks: [
      { code: 'IR-1', name: 'Incident Response Policy' },
      { code: 'IR-8', name: 'Incident Response Plan' },
      { code: 'DE.AE', name: 'NIST CSF - Anomalies & Events' },
    ],
    versions: [
      { version: 'v3.1', date: '2024-05-30', author: 'SecOps Team', summary: 'Ransomware playbook added' },
      { version: 'v3.0', date: '2024-01-01', author: 'SecOps Team', summary: 'Major restructure' },
    ],
    attestations: [
      { name: 'Alice Chen', role: 'Engineering Lead', date: null, status: 'Pending' },
      { name: 'Bob Martin', role: 'Product Manager', date: null, status: 'Pending' },
    ],
    exceptions: 1,
  },
  {
    id: 'POL-004',
    title: 'Data Privacy Policy (GDPR)',
    version: 'v2.0',
    owner: 'Legal / DPO',
    status: 'Published',
    category: 'Privacy',
    nextReview: '2025-01-15',
    lastUpdated: '2024-01-15',
    description: 'Standards for collecting, processing, and storing personal data of EU citizens in compliance with GDPR requirements.',
    frameworks: [
      { code: 'PT-1', name: 'PII Processing Policy' },
      { code: 'SC-28', name: 'Protection of Data at Rest' },
      { code: 'GDPR Art.5', name: 'Principles of Processing' },
    ],
    versions: [
      { version: 'v2.0', date: '2024-01-15', author: 'Legal Team', summary: 'GDPR 2024 amendments' },
      { version: 'v1.9', date: '2023-05-25', author: 'DPO Office', summary: 'Breach notification update' },
    ],
    attestations: [
      { name: 'Alice Chen', role: 'Engineering Lead', date: '2024-01-20', status: 'Confirmed' },
      { name: 'Carol White', role: 'HR Director', date: '2024-01-21', status: 'Confirmed' },
      { name: 'David Kim', role: 'Sales Director', date: null, status: 'Overdue' },
    ],
    exceptions: 0,
  },
  {
    id: 'POL-005',
    title: 'Business Continuity Plan',
    version: 'v1.2',
    owner: 'Operations',
    status: 'Draft',
    category: 'Operations',
    nextReview: '2024-09-01',
    lastUpdated: '2024-05-01',
    description: 'Framework for maintaining and restoring business operations following a disruptive event. Covers RTO/RPO targets and recovery procedures.',
    frameworks: [
      { code: 'CP-1', name: 'Contingency Planning Policy' },
      { code: 'CP-2', name: 'Contingency Plan' },
    ],
    versions: [
      { version: 'v1.2', date: '2024-05-01', author: 'Ops Team', summary: 'Cloud DR added' },
    ],
    attestations: [],
    exceptions: 0,
  },
  {
    id: 'POL-006',
    title: 'Vendor Risk Management Policy',
    version: 'v1.0',
    owner: 'Procurement',
    status: 'Approved',
    category: 'Compliance',
    nextReview: '2025-03-01',
    lastUpdated: '2024-03-01',
    description: 'Requirements for assessing, onboarding, and monitoring third-party vendors with access to corporate systems or data.',
    frameworks: [
      { code: 'SA-12', name: 'Supply Chain Protection' },
      { code: 'SR-1', name: 'Supply Chain Risk Management' },
    ],
    versions: [
      { version: 'v1.0', date: '2024-03-01', author: 'Procurement', summary: 'Initial release' },
    ],
    attestations: [
      { name: 'Alice Chen', role: 'Engineering Lead', date: '2024-03-10', status: 'Confirmed' },
    ],
    exceptions: 3,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const LIFECYCLE_STAGES: PolicyStatus[] = ['Draft', 'Under Review', 'Approved', 'Published', 'Archived'];

const STATUS_CONFIG: Record<PolicyStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Draft:        { color: 'text-slate-500 dark:text-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',       border: 'border-slate-200 dark:border-slate-700', icon: <Edit3 className="w-3 h-3" /> },
  'Under Review': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20',     border: 'border-amber-200 dark:border-amber-800', icon: <RefreshCw className="w-3 h-3" /> },
  Approved:     { color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20',       border: 'border-blue-200 dark:border-blue-800',   icon: <CheckCircle2 className="w-3 h-3" /> },
  Published:    { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: <FileCheck className="w-3 h-3" /> },
  Archived:     { color: 'text-slate-400 dark:text-slate-600',   bg: 'bg-slate-50 dark:bg-slate-900',        border: 'border-slate-100 dark:border-slate-800', icon: <Archive className="w-3 h-3" /> },
};

const CATEGORY_COLORS: Record<PolicyCategory, string> = {
  Security:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  Privacy:     'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800',
  HR:          'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400 border-pink-100 dark:border-pink-800',
  Operations:  'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800',
  Compliance:  'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400 border-teal-100 dark:border-teal-800',
};

const ATTEST_CONFIG = {
  Confirmed: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Pending:   { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',     icon: <Clock className="w-3.5 h-3.5" /> },
  Overdue:   { color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20',         icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

type DetailTab = 'overview' | 'versions' | 'attestation' | 'frameworks';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function LifecycleBadge({ status }: { status: PolicyStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border', cfg.bg, cfg.color, cfg.border)}>
      {cfg.icon}
      {status}
    </span>
  );
}

function LifecycleTrack({ status }: { status: PolicyStatus }) {
  const currentIdx = LIFECYCLE_STAGES.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {LIFECYCLE_STAGES.filter(s => s !== 'Archived').map((stage, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx && status !== 'Archived';
        return (
          <React.Fragment key={stage}>
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
              isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
            )}>
              {isDone && <CheckCircle2 className="w-2.5 h-2.5" />}
              {stage}
            </div>
            {i < LIFECYCLE_STAGES.filter(s => s !== 'Archived').length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function PolicyDetailPanel({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>('overview');

  const confirmedCount = policy.attestations.filter(a => a.status === 'Confirmed').length;
  const attestPct = policy.attestations.length > 0 ? Math.round((confirmedCount / policy.attestations.length) * 100) : 0;
  const days = daysUntil(policy.nextReview);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
      />
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-aegis-surface shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-aegis-border overflow-hidden"
      >
        {/* Header */}
        <div className="px-7 py-6 border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest">{policy.id}</span>
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[10px] font-mono text-slate-400">{policy.version}</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{policy.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <LifecycleBadge status={policy.status} />
                  <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border', CATEGORY_COLORS[policy.category])}>
                    {policy.category}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-aegis-border flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lifecycle track */}
          <div className="mt-5">
            <LifecycleTrack status={policy.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-aegis-border px-7 bg-white dark:bg-aegis-surface">
          {([
            { key: 'overview', label: 'Overview', icon: <Eye className="w-3.5 h-3.5" /> },
            { key: 'versions', label: 'History', icon: <GitBranch className="w-3.5 h-3.5" /> },
            { key: 'attestation', label: `Attestation ${policy.attestations.length > 0 ? `(${attestPct}%)` : ''}`, icon: <UserCheck className="w-3.5 h-3.5" /> },
            { key: 'frameworks', label: 'Controls', icon: <Layers className="w-3.5 h-3.5" /> },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3.5 text-[11px] font-black uppercase tracking-wider border-b-2 transition-all',
                tab === t.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {tab === 'overview' && (
            <>
              {/* Key metadata */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {policy.owner}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Review</div>
                  <div className={cn('text-sm font-bold flex items-center gap-1.5', days < 30 ? 'text-red-600 dark:text-red-400' : days < 90 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white')}>
                    <Calendar className="w-3.5 h-3.5" />
                    {days < 0 ? 'Overdue' : `${days}d`}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{formatDate(policy.nextReview)}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exceptions</div>
                  <div className={cn('text-sm font-bold flex items-center gap-1.5', policy.exceptions > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400')}>
                    {policy.exceptions > 0 ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {policy.exceptions > 0 ? `${policy.exceptions} active` : 'None'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{policy.description}</p>
              </div>

              {/* Attestation progress */}
              {policy.attestations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attestation Progress</h3>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{confirmedCount}/{policy.attestations.length}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-aegis-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${attestPct}%` }}
                      className={cn('h-full rounded-full', attestPct === 100 ? 'bg-emerald-500' : attestPct > 50 ? 'bg-blue-500' : 'bg-amber-500')}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5">{attestPct}% acknowledged</div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border hover:border-blue-500/30 transition-all text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Send className="w-3.5 h-3.5 text-blue-500" />
                    Send for Attestation
                  </button>
                  <button className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border hover:border-blue-500/30 transition-all text-xs font-bold text-slate-600 dark:text-slate-300">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                    Request Review
                  </button>
                  <button className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border hover:border-blue-500/30 transition-all text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Export PDF
                  </button>
                  <button className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border hover:border-red-500/30 transition-all text-xs font-bold text-red-500">
                    <Archive className="w-3.5 h-3.5" />
                    Archive Policy
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === 'versions' && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Version History</h3>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100 dark:bg-aegis-border" />
                <div className="space-y-4">
                  {policy.versions.map((v, i) => (
                    <div key={v.version} className="pl-9 relative">
                      <div className={cn('absolute left-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black',
                        i === 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-aegis-surface border-slate-200 dark:border-aegis-border text-slate-400'
                      )}>
                        {i === 0 ? <CheckCircle2 className="w-3 h-3" /> : <History className="w-3 h-3" />}
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{v.version}</span>
                          {i === 0 && <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Current</span>}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{v.summary}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.author}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(v.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'attestation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acknowledgements</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                  <Send className="w-3 h-3" />
                  Send Reminder
                </button>
              </div>

              {policy.attestations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No attestations required</p>
                  <p className="text-xs mt-1">This policy has no acknowledgement requirements yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {policy.attestations.map((a, i) => {
                    const cfg = ATTEST_CONFIG[a.status];
                    return (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-black">
                            {a.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{a.name}</div>
                            <div className="text-[10px] text-slate-400">{a.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider', cfg.bg, cfg.color)}>
                            {cfg.icon}
                            {a.status}
                          </div>
                          {a.date && <div className="text-[9px] text-slate-400 mt-0.5">{formatDate(a.date)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'frameworks' && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Control Mappings</h3>
              <div className="space-y-2">
                {policy.frameworks.map((f) => (
                  <div key={f.code} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border hover:border-blue-500/30 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{f.code}</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.name}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function PoliciesView() {
  const [selected, setSelected] = useState<Policy | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<PolicyCategory | 'All'>('All');

  const stats = useMemo(() => ({
    total: POLICIES.length,
    published: POLICIES.filter(p => p.status === 'Published').length,
    underReview: POLICIES.filter(p => p.status === 'Under Review').length,
    expiringSoon: POLICIES.filter(p => daysUntil(p.nextReview) <= 60 && daysUntil(p.nextReview) > 0).length,
    overdue: POLICIES.filter(p => daysUntil(p.nextReview) < 0).length,
  }), []);

  const filtered = useMemo(() => POLICIES.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  }), [search, statusFilter, categoryFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: POLICIES.length };
    LIFECYCLE_STAGES.forEach(s => { counts[s] = POLICIES.filter(p => p.status === s).length; });
    return counts;
  }, []);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Policy Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Manage policy lifecycle, track attestations and control mappings.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />} label="Total Policies" value={stats.total} color="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={<FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} label="Published" value={stats.published} sub={`${POLICIES.filter(p=>p.status==='Approved').length} pending approval`} color="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard icon={<RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />} label="Under Review" value={stats.underReview} color="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />} label="Review Due Soon" value={stats.expiringSoon} sub={stats.overdue > 0 ? `${stats.overdue} overdue` : undefined} color="bg-red-50 dark:bg-red-900/20" />
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search policies..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['All', ...LIFECYCLE_STAGES] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all',
                statusFilter === s
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
              )}
            >
              {s}
              <span className="opacity-60">{statusCounts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Policy List */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-aegis-border text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Policy</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Next Review</div>
          <div className="col-span-1 text-right">Attest.</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-aegis-border">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">No policies found</p>
              </div>
            ) : filtered.map((policy, i) => {
              const days = daysUntil(policy.nextReview);
              const confirmed = policy.attestations.filter(a => a.status === 'Confirmed').length;
              const total = policy.attestations.length;
              const pct = total > 0 ? Math.round((confirmed / total) * 100) : null;

              return (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(policy)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  <div className="md:col-span-1 font-mono text-[10px] font-bold text-blue-500/70">{policy.id}</div>

                  <div className="md:col-span-4">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">{policy.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded font-mono text-slate-500">{policy.version}</span>
                      <span className="text-[9px] text-slate-400 flex items-center gap-1"><Users className="w-2.5 h-2.5" />{policy.owner}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border', CATEGORY_COLORS[policy.category])}>
                      {policy.category}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <LifecycleBadge status={policy.status} />
                  </div>

                  <div className="md:col-span-2">
                    <div className={cn('text-xs font-bold flex items-center gap-1.5',
                      days < 0 ? 'text-red-500' : days < 30 ? 'text-amber-500' : days < 90 ? 'text-orange-400' : 'text-slate-500 dark:text-slate-400'
                    )}>
                      <Calendar className="w-3 h-3" />
                      {days < 0 ? 'Overdue' : `${days}d`}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{formatDate(policy.nextReview)}</div>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    {pct !== null ? (
                      <div className="text-right">
                        <div className={cn('text-xs font-black', pct === 100 ? 'text-emerald-500' : pct > 50 ? 'text-blue-500' : 'text-amber-500')}>{pct}%</div>
                        <div className="w-10 h-1 bg-slate-100 dark:bg-aegis-border rounded-full overflow-hidden mt-1">
                          <div className={cn('h-full rounded-full', pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && <PolicyDetailPanel policy={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
