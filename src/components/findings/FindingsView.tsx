import React, { useState, useMemo } from 'react';
import {
  Search, Plus, X, ShieldAlert, CheckCircle2, Clock, AlertTriangle,
  Activity, ChevronRight, Database, FileText, User, AlertCircle,
  BarChart2, TrendingUp, Filter, Tag, Layers
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '@/src/types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, PieChart, Pie
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type Severity   = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
type FindStatus = 'Open' | 'In Progress' | 'In Review' | 'Resolved' | 'Accepted' | 'False Positive';
type Category   = 'Access Control' | 'Data Protection' | 'Vulnerability' | 'Configuration' | 'Compliance' | 'Audit';

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: Category;
  source: string;
  status: FindStatus;
  owner: string;
  dateFound: string;
  dueDate: string;
  slaBreached: boolean;
  daysOpen: number;
  affectedAsset: string;
  evidenceCount: number;
  remediationNotes: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

// SLA thresholds (days): Critical=1, High=3, Medium=30, Low=90
const SLA_DAYS: Record<Severity, number> = { Critical: 1, High: 3, Medium: 30, Low: 90, Info: 180 };

const FINDINGS: Finding[] = [
  {
    id: 'F-501', title: 'Critical CVE-2024-1234 on API Gateway', severity: 'Critical', category: 'Vulnerability',
    description: 'A remotely exploitable RCE vulnerability in the API gateway software (v2.4.1) is actively being exploited in the wild. CVSS 9.8.',
    source: 'Tenable.io', status: 'In Progress', owner: 'David M.',
    dateFound: '2026-05-06', dueDate: '2026-05-07', slaBreached: true, daysOpen: 3,
    affectedAsset: 'aws-ec2-api-prod', evidenceCount: 4, remediationNotes: 'Emergency patching ticket raised. Compensating WAF rule deployed.',
  },
  {
    id: 'F-502', title: 'MFA Not Enforced for Privileged Accounts', severity: 'Critical', category: 'Access Control',
    description: '14 privileged admin accounts in production do not have MFA enforced, creating significant credential-based attack risk.',
    source: 'Manual Audit', status: 'In Progress', owner: 'Alex C.',
    dateFound: '2026-05-01', dueDate: '2026-05-02', slaBreached: true, daysOpen: 8,
    affectedAsset: 'Active Directory / Okta', evidenceCount: 2, remediationNotes: 'Enforcement policy being rolled out in phases. 6 of 14 accounts remediated.',
  },
  {
    id: 'F-503', title: 'Unencrypted Sensitive Data in S3 Bucket', severity: 'High', category: 'Data Protection',
    description: 'Customer PII found in an S3 bucket without server-side encryption or bucket policy restrictions. Bucket is not publicly exposed.',
    source: 'AWS Security Hub', status: 'In Progress', owner: 'Elena R.',
    dateFound: '2026-05-04', dueDate: '2026-05-07', slaBreached: true, daysOpen: 5,
    affectedAsset: 's3://prod-customer-exports', evidenceCount: 3, remediationNotes: 'Encryption policy applied. Data migration to encrypted bucket in progress.',
  },
  {
    id: 'F-504', title: 'Stale Admin Accounts Not Disabled (90+ days)', severity: 'High', category: 'Access Control',
    description: '23 inactive user accounts with elevated permissions have not been disabled despite exceeding the 90-day dormancy threshold.',
    source: 'Active Directory', status: 'Open', owner: 'Alex C.',
    dateFound: '2026-04-28', dueDate: '2026-05-01', slaBreached: true, daysOpen: 11,
    affectedAsset: 'corp.internal / Azure AD', evidenceCount: 1, remediationNotes: '',
  },
  {
    id: 'F-505', title: 'Missing WAF Rules for OWASP Top 10', severity: 'High', category: 'Configuration',
    description: 'Web Application Firewall rules for SQLi, XSS, and path traversal are not enabled on the customer-facing portal.',
    source: 'Pen Test (Q1 2026)', status: 'In Progress', owner: 'David M.',
    dateFound: '2026-03-15', dueDate: '2026-04-15', slaBreached: true, daysOpen: 55,
    affectedAsset: 'prod-web-01, prod-web-02', evidenceCount: 5, remediationNotes: 'WAF rule set review in progress. Staging environment tested.',
  },
  {
    id: 'F-506', title: 'TLS 1.0/1.1 Still Enabled on Load Balancer', severity: 'Medium', category: 'Configuration',
    description: 'Legacy TLS versions 1.0 and 1.1 remain enabled on the production load balancer, exposing connections to POODLE/BEAST attacks.',
    source: 'Qualys SSL Labs', status: 'In Review', owner: 'David M.',
    dateFound: '2026-04-01', dueDate: '2026-05-01', slaBreached: true, daysOpen: 38,
    affectedAsset: 'lb-prod-01', evidenceCount: 2, remediationNotes: 'Config change submitted. Awaiting change advisory board approval.',
  },
  {
    id: 'F-507', title: 'Logging Disabled on Production Database', severity: 'Medium', category: 'Compliance',
    description: 'Audit logging is not enabled on the primary production database, violating PCI DSS Requirement 10 and internal policy.',
    source: 'Internal Audit', status: 'Open', owner: 'Elena R.',
    dateFound: '2026-04-15', dueDate: '2026-05-15', slaBreached: false, daysOpen: 24,
    affectedAsset: 'prod-db-primary', evidenceCount: 1, remediationNotes: '',
  },
  {
    id: 'F-508', title: 'API Keys Without Rotation Policy', severity: 'Medium', category: 'Access Control',
    description: 'Service account API keys in use have not been rotated in over 180 days and have no automated rotation configured.',
    source: 'CrowdStrike Falcon', status: 'Open', owner: 'Alex C.',
    dateFound: '2026-04-20', dueDate: '2026-05-20', slaBreached: false, daysOpen: 19,
    affectedAsset: 'AWS IAM / GitHub Actions', evidenceCount: 2, remediationNotes: '',
  },
  {
    id: 'F-509', title: 'Missing Data Processing Agreement — Sub-Processor', severity: 'Medium', category: 'Compliance',
    description: 'A recently onboarded analytics sub-processor does not have a signed DPA in place, violating GDPR Article 28.',
    source: 'Legal Review', status: 'In Review', owner: 'Sarah L.',
    dateFound: '2026-04-22', dueDate: '2026-05-22', slaBreached: false, daysOpen: 17,
    affectedAsset: 'AI Insights Co', evidenceCount: 1, remediationNotes: 'DPA draft sent for review. Vendor legal team responding.',
  },
  {
    id: 'F-510', title: 'Unauthorised Port Open on Firewall (Port 3389)', severity: 'High', category: 'Configuration',
    description: 'RDP port 3389 is open to the internet on a non-bastion server, significantly increasing the attack surface.',
    source: 'Tenable.io', status: 'Open', owner: 'David M.',
    dateFound: '2026-05-05', dueDate: '2026-05-08', slaBreached: true, daysOpen: 4,
    affectedAsset: 'prod-web-02 (10.0.1.14)', evidenceCount: 2, remediationNotes: '',
  },
  {
    id: 'F-511', title: 'Backup Integrity Verification Not Scheduled', severity: 'Medium', category: 'Compliance',
    description: 'No automated restore testing is in place for production database backups. Last manual test was 8 months ago.',
    source: 'Internal Audit', status: 'Open', owner: 'David M.',
    dateFound: '2026-03-30', dueDate: '2026-04-30', slaBreached: true, daysOpen: 40,
    affectedAsset: 'CloudBackup Plus / prod-db-*', evidenceCount: 0, remediationNotes: '',
  },
  {
    id: 'F-512', title: 'Security Awareness Training Completion Below 80%', severity: 'Low', category: 'Compliance',
    description: 'Only 67% of employees have completed mandatory annual security awareness training. Target is 95% by Q2.',
    source: 'LMS Report', status: 'In Progress', owner: 'Sarah L.',
    dateFound: '2026-04-01', dueDate: '2026-06-30', slaBreached: false, daysOpen: 38,
    affectedAsset: 'All Staff (312 employees)', evidenceCount: 1, remediationNotes: 'Reminder campaign launched. Manager escalation initiated for non-completions.',
  },
  {
    id: 'F-513', title: 'Endpoint DLP Not Deployed on 22 Devices', severity: 'Medium', category: 'Data Protection',
    description: 'DLP agent not installed on 22 employee endpoints, leaving data exfiltration risk unmitigated on those devices.',
    source: 'CrowdStrike Falcon', status: 'Open', owner: 'David M.',
    dateFound: '2026-05-02', dueDate: '2026-06-02', slaBreached: false, daysOpen: 7,
    affectedAsset: '22 x macOS endpoints', evidenceCount: 1, remediationNotes: '',
  },
  {
    id: 'F-514', title: 'CVE-2025-8812 Low Severity on Internal Tool', severity: 'Low', category: 'Vulnerability',
    description: 'A low-severity local privilege escalation vulnerability in an internal reporting tool. Not externally accessible.',
    source: 'Tenable.io', status: 'Accepted', owner: 'Alex C.',
    dateFound: '2026-02-10', dueDate: '2026-08-10', slaBreached: false, daysOpen: 89,
    affectedAsset: 'internal-reporting-v3', evidenceCount: 2, remediationNotes: 'Risk accepted. Not internet-facing, compensating access controls in place.',
  },
  {
    id: 'F-515', title: 'Missing SOC 2 Mapping for New Control Set', severity: 'Low', category: 'Audit',
    description: 'Control changes from Q4 2025 have not been mapped to SOC 2 Trust Service Criteria in the GRC system.',
    source: 'Internal Audit', status: 'In Progress', owner: 'Sarah L.',
    dateFound: '2026-04-05', dueDate: '2026-05-31', slaBreached: false, daysOpen: 34,
    affectedAsset: 'GRC Platform / Control Library', evidenceCount: 0, remediationNotes: 'Mapping exercise underway. 14 of 28 controls mapped.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEV_CFG: Record<Severity, { bg: string; text: string; border: string; dot: string; bar: string }> = {
  Critical: { bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400',    border: 'border-red-200 dark:border-red-800',    dot: 'bg-red-500',    bar: 'bg-red-500' },
  High:     { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500', bar: 'bg-orange-500' },
  Medium:   { bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800',  dot: 'bg-amber-500',  bar: 'bg-amber-500' },
  Low:      { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-200 dark:border-blue-800',   dot: 'bg-blue-500',   bar: 'bg-blue-500' },
  Info:     { bg: 'bg-slate-100 dark:bg-white/10',    text: 'text-slate-500 dark:text-slate-400',  border: 'border-slate-200 dark:border-aegis-border', dot: 'bg-slate-400', bar: 'bg-slate-400' },
};

const STATUS_CFG: Record<FindStatus, { bg: string; text: string; dot: string }> = {
  'Open':          { bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-700 dark:text-red-400',    dot: 'bg-red-500' },
  'In Progress':   { bg: 'bg-blue-100 dark:bg-blue-900/30',  text: 'text-blue-700 dark:text-blue-400',  dot: 'bg-blue-500' },
  'In Review':     { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  'Resolved':      { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'Accepted':      { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  'False Positive':{ bg: 'bg-slate-100 dark:bg-white/10', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' },
};

function SevBadge({ sev }: { sev: Severity }) {
  const c = SEV_CFG[sev];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border', c.bg, c.text, c.border)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />{sev}
    </span>
  );
}

function SlaTag({ breached, daysOpen, sev }: { breached: boolean; daysOpen: number; sev: Severity }) {
  if (breached) return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
      SLA BREACHED
    </span>
  );
  const remaining = SLA_DAYS[sev] - daysOpen;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
      {remaining}d left
    </span>
  );
}

// ─── Finding Detail Panel ─────────────────────────────────────────────────────

function FindingDetail({ finding, onClose, onUpdate }: { finding: Finding; onClose: () => void; onUpdate: (f: Finding) => void }) {
  const c = SEV_CFG[finding.severity];
  const sc = STATUS_CFG[finding.status];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" />
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-aegis-surface shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-aegis-border">

        <div className="px-6 py-5 border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white mt-0.5 flex-shrink-0',
                finding.severity === 'Critical' ? 'bg-red-600' : finding.severity === 'High' ? 'bg-orange-500' : 'bg-amber-500')}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{finding.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono text-slate-400">{finding.id}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[9px] text-slate-400 font-bold">{finding.category}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 flex-shrink-0 ml-2"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <SevBadge sev={finding.severity} />
            <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1', sc.bg, sc.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />{finding.status}
            </span>
            <SlaTag breached={finding.slaBreached} daysOpen={finding.daysOpen} sev={finding.severity} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{finding.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Source', value: finding.source, icon: Database },
              { label: 'Owner', value: finding.owner, icon: User },
              { label: 'Date Found', value: finding.dateFound, icon: Clock },
              { label: 'SLA Due', value: finding.dueDate, icon: Clock },
              { label: 'Days Open', value: String(finding.daysOpen), icon: Activity },
              { label: 'Evidence', value: `${finding.evidenceCount} files`, icon: FileText },
              { label: 'Affected Asset', value: finding.affectedAsset, icon: Database },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3 text-slate-400" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">SLA Threshold</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {finding.severity} findings must be remediated within <span className="font-black text-slate-900 dark:text-white">{SLA_DAYS[finding.severity]} day{SLA_DAYS[finding.severity] > 1 ? 's' : ''}</span>
              {finding.slaBreached ? <span className="ml-2 text-red-500 font-black">— BREACHED by {finding.daysOpen - SLA_DAYS[finding.severity]} day(s)</span> : <span className="ml-2 text-emerald-500 font-black">— Within SLA</span>}
            </p>
          </div>

          {finding.remediationNotes && (
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Remediation Notes</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{finding.remediationNotes}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-aegis-border flex gap-3">
          <button onClick={() => { onUpdate({ ...finding, status: 'Resolved' }); onClose(); }}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20">
            Mark Resolved
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest">
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FindingsViewProps {
  onNotify: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

const TABS = ['Overview', 'All Findings', 'Remediation Board', 'SLA Tracker'] as const;
type Tab = typeof TABS[number];

export function FindingsView({ onNotify }: FindingsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [findings, setFindings] = useState<Finding[]>(FINDINGS);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState<Severity | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<FindStatus | 'All'>('All');

  const stats = useMemo(() => {
    const open      = findings.filter(f => f.status === 'Open').length;
    const critical  = findings.filter(f => f.severity === 'Critical').length;
    const breached  = findings.filter(f => f.slaBreached && f.status !== 'Resolved').length;
    const resolved  = findings.filter(f => f.status === 'Resolved').length;
    const rate      = Math.round((resolved / findings.length) * 100);
    const avgDays   = Math.round(findings.filter(f => f.status !== 'Resolved').reduce((s, f) => s + f.daysOpen, 0) / Math.max(findings.filter(f => f.status !== 'Resolved').length, 1));

    const bySev = (['Critical','High','Medium','Low','Info'] as Severity[]).map(s => ({
      name: s, value: findings.filter(f => f.severity === s).length,
      fill: s === 'Critical' ? '#ef4444' : s === 'High' ? '#f97316' : s === 'Medium' ? '#f59e0b' : s === 'Low' ? '#3b82f6' : '#94a3b8'
    })).filter(d => d.value > 0);

    const bySource = findings.reduce((acc, f) => {
      acc[f.source] = (acc[f.source] || 0) + 1; return acc;
    }, {} as Record<string, number>);
    const sourceData = Object.entries(bySource).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return { open, critical, breached, resolved, rate, avgDays, bySev, sourceData };
  }, [findings]);

  const filtered = useMemo(() => findings.filter(f => {
    if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSev !== 'All' && f.severity !== filterSev) return false;
    if (filterStatus !== 'All' && f.status !== filterStatus) return false;
    return true;
  }), [findings, search, filterSev, filterStatus]);

  const slaStats = useMemo(() => (['Critical','High','Medium','Low'] as Severity[]).map(sev => {
    const group = findings.filter(f => f.severity === sev && f.status !== 'Resolved' && f.status !== 'False Positive');
    const breached = group.filter(f => f.slaBreached).length;
    const within   = group.length - breached;
    return { sev, total: group.length, breached, within, pct: group.length > 0 ? Math.round((within / group.length) * 100) : 100 };
  }), [findings]);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Findings</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Security findings, compliance gaps, and remediation tracking across all sources.</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Register Finding</button>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Findings', value: findings.length, icon: Layers, color: 'text-blue-500' },
          { label: 'Open', value: stats.open, icon: AlertCircle, color: 'text-red-500', alert: stats.open > 5 },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-red-500', alert: stats.critical > 0 },
          { label: 'SLA Breached', value: stats.breached, icon: Clock, color: 'text-red-500', alert: stats.breached > 0 },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Remediation Rate', value: `${stats.rate}%`, icon: Activity, color: 'text-blue-500' },
        ].map((s, i) => (
          <div key={i} className={cn('glass-card p-4 flex flex-col gap-2', s.alert ? 'border-red-200 dark:border-red-900/40' : '')}>
            <div className="flex items-center gap-2">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">{s.label}</p>
            </div>
            <p className={cn('text-2xl font-black leading-none', s.alert ? 'text-red-500' : 'text-slate-900 dark:text-white')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn('px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t ? 'bg-white dark:bg-aegis-surface text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
            {t}
            {t === 'Overview' && stats.breached > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[7px]">{stats.breached}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Severity Distribution */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Findings by Severity</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.bySev} margin={{ left: 0 }} style={{ background: 'transparent' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {stats.bySev.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Source Breakdown */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Database className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Findings by Source</h3>
                </div>
                <div className="space-y-3">
                  {stats.sourceData.map(s => (
                    <div key={s.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.name}</span>
                        <span className="text-xs font-black text-slate-500">{s.value}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(s.value / findings.length) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SLA Breached Findings */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">SLA Breached Findings</h3>
              </div>
              <div className="space-y-2">
                {findings.filter(f => f.slaBreached && f.status !== 'Resolved').sort((a, b) => {
                  const order: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
                  return order[a.severity] - order[b.severity];
                }).map(f => (
                  <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 cursor-pointer hover:border-red-300 transition-colors"
                    onClick={() => setSelectedFinding(f)}>
                    <SevBadge sev={f.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{f.title}</p>
                      <p className="text-[9px] text-slate-400">{f.source} · {f.affectedAsset}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] font-black text-red-500">{f.daysOpen - SLA_DAYS[f.severity]}d overdue</p>
                      <p className="text-[9px] text-slate-400">{f.owner}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ALL FINDINGS ──────────────────────────────────────────────────── */}
        {activeTab === 'All Findings' && (
          <motion.div key="af" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search findings…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400" />
              </div>
              <select value={filterSev} onChange={e => setFilterSev(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="All">All Severities</option>
                {['Critical','High','Medium','Low','Info'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="All">All Statuses</option>
                {['Open','In Progress','In Review','Resolved','Accepted','False Positive'].map(s => <option key={s}>{s}</option>)}
              </select>
              <span className="text-[10px] text-slate-400 font-bold">{filtered.length} findings</span>
            </div>

            <div className="glass-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/5">
                    {['Finding', 'Category', 'Source', 'Severity', 'Status', 'SLA', 'Owner', 'Days Open', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => {
                    const sc = STATUS_CFG[f.status];
                    return (
                      <tr key={f.id} className="border-b border-slate-50 dark:border-aegis-border/40 hover:bg-slate-50/80 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setSelectedFinding(f)}>
                        <td className="px-4 py-3.5"><div className="font-bold text-slate-900 dark:text-white max-w-[220px] truncate">{f.title}</div><div className="text-[9px] font-mono text-slate-400">{f.id}</div></td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-[10px]">{f.category}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-[10px]">{f.source}</td>
                        <td className="px-4 py-3.5"><SevBadge sev={f.severity} /></td>
                        <td className="px-4 py-3.5"><span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 w-fit', sc.bg, sc.text)}><span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />{f.status}</span></td>
                        <td className="px-4 py-3.5"><SlaTag breached={f.slaBreached} daysOpen={f.daysOpen} sev={f.severity} /></td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{f.owner}</td>
                        <td className="px-4 py-3.5 font-black text-slate-700 dark:text-slate-300">{f.daysOpen}d</td>
                        <td className="px-4 py-3.5"><ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── REMEDIATION BOARD ─────────────────────────────────────────────── */}
        {activeTab === 'Remediation Board' && (
          <motion.div key="rb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {(['Open','In Progress','In Review','Resolved'] as FindStatus[]).map(status => {
                const items = findings.filter(f => f.status === status);
                const sc = STATUS_CFG[status];
                return (
                  <div key={status} className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={cn('w-2 h-2 rounded-full', sc.dot)} />
                      <h3 className={cn('text-xs font-black uppercase tracking-widest', sc.text)}>{status}</h3>
                      <span className={cn('ml-auto px-2 py-0.5 rounded-full text-[9px] font-black', sc.bg, sc.text)}>{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.length === 0 && <p className="text-[10px] text-slate-400 text-center py-6">No findings</p>}
                      {items.map(f => (
                        <div key={f.id} className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border cursor-pointer hover:border-blue-500/40 transition-colors"
                          onClick={() => setSelectedFinding(f)}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{f.title}</p>
                            <SevBadge sev={f.severity} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-400">{f.source}</span>
                            {f.slaBreached && f.status !== 'Resolved' && (
                              <span className="text-[8px] font-black text-red-500">SLA !</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[9px] text-slate-400">{f.owner}</span>
                            <span className="text-[9px] text-slate-400">{f.daysOpen}d</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── SLA TRACKER ───────────────────────────────────────────────────── */}
        {activeTab === 'SLA Tracker' && (
          <motion.div key="sla" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {slaStats.map(s => {
                const c = SEV_CFG[s.sev];
                return (
                  <div key={s.sev} className={cn('glass-card p-6 border', s.breached > 0 ? 'border-red-200 dark:border-red-900/40' : '')}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg)}>
                          <AlertTriangle className={cn('w-5 h-5', c.text)} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">{s.sev}</h3>
                          <p className="text-[9px] text-slate-400 font-bold">SLA: {SLA_DAYS[s.sev]} day{SLA_DAYS[s.sev] > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-2xl font-black', s.breached > 0 ? 'text-red-500' : 'text-emerald-500')}>{s.pct}%</p>
                        <p className="text-[9px] text-slate-400 font-bold">compliance</p>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                      <div className={cn('h-full rounded-full transition-all', s.pct >= 80 ? 'bg-emerald-500' : s.pct >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${s.pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-emerald-600 dark:text-emerald-400">{s.within} within SLA</span>
                      {s.breached > 0 && <span className="text-red-500">{s.breached} SLA breached</span>}
                      <span className="text-slate-400">{s.total} total</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SLA Breach List */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">All SLA Breaches</h3>
              {findings.filter(f => f.slaBreached && f.status !== 'Resolved').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">All findings are within SLA</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {findings.filter(f => f.slaBreached && f.status !== 'Resolved').map(f => {
                    const overdue = f.daysOpen - SLA_DAYS[f.severity];
                    return (
                      <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 cursor-pointer hover:border-red-300 transition-colors"
                        onClick={() => setSelectedFinding(f)}>
                        <SevBadge sev={f.severity} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{f.title}</p>
                          <p className="text-[9px] text-slate-400">{f.id} · {f.owner} · {f.source}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-red-500">+{overdue}d</p>
                          <p className="text-[9px] text-slate-400">overdue</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedFinding && (
          <FindingDetail finding={selectedFinding} onClose={() => setSelectedFinding(null)}
            onUpdate={updated => setFindings(prev => prev.map(f => f.id === updated.id ? updated : f))} />
        )}
      </AnimatePresence>
    </div>
  );
}
