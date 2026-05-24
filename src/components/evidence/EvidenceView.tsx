import React, { useState, useMemo } from 'react';
import {
  Search, X, Upload, CheckCircle2, AlertTriangle, AlertCircle,
  Filter, FileText, Shield, Database, Users, Code2, Monitor,
  Bug, Cloud, Archive, Plus, ExternalLink, RefreshCw, Clock,
  ChevronDown, ChevronRight, Copy, Key, Zap, Eye, Download,
  Link as LinkIcon, Calendar, Tag, Layers, MoreHorizontal,
  CheckSquare, Square, Activity
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ──────────────────────────────────────────────────────────────────────
type EvidenceType =
  | 'Policy Document' | 'Screenshot' | 'Config Export' | 'Audit Log'
  | 'Scan Report' | 'Certificate' | 'Test Result' | 'Training Record'
  | 'Access Review' | 'API Response';

type EvidenceStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Needs Review';

type SourceType = 'manual' | 'integration' | 'api';

interface Gap {
  control: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
}

interface Warning {
  message: string;
  type: 'expiry' | 'coverage' | 'quality' | 'stale';
}

interface EvidenceItem {
  id: string;
  name: string;
  type: EvidenceType;
  source: SourceType;
  integration?: string; // integration id
  framework: string;
  controls: string[];
  status: EvidenceStatus;
  collectedAt: string;
  expiresAt: string | null;
  size?: string;
  owner: string;
  gaps: Gap[];
  warnings: Warning[];
  tags: string[];
  description: string;
}

// ─── Connected integrations (mirrors ConnectorsView connected list) ─────────────
const CONNECTED_INTEGRATIONS = [
  { id: 'aws',        name: 'Amazon AWS',          logo: 'AWS', color: 'bg-orange-500', category: 'Cloud'          },
  { id: 'gcp',        name: 'Google Cloud',         logo: 'GCP', color: 'bg-blue-500',  category: 'Cloud'          },
  { id: 'azure',      name: 'Microsoft Azure',      logo: 'Az',  color: 'bg-sky-600',   category: 'Cloud'          },
  { id: 'okta',       name: 'Okta',                 logo: 'Ok',  color: 'bg-blue-600',  category: 'Identity'       },
  { id: 'azure-ad',   name: 'Azure AD',             logo: 'AD',  color: 'bg-sky-500',   category: 'Identity'       },
  { id: 'google-ws',  name: 'Google Workspace',     logo: 'GW',  color: 'bg-emerald-500',category: 'Identity'      },
  { id: 'workday',    name: 'Workday',              logo: 'Wd',  color: 'bg-teal-600',  category: 'HRIS'           },
  { id: 'github',     name: 'GitHub',               logo: 'GH',  color: 'bg-slate-800', category: 'Developer'      },
  { id: 'jira',       name: 'Jira',                 logo: 'Ji',  color: 'bg-blue-500',  category: 'Developer'      },
  { id: 'snyk',       name: 'Snyk',                 logo: 'Sn',  color: 'bg-purple-700',category: 'Developer'      },
  { id: 'crowdstrike',name: 'CrowdStrike',          logo: 'CS',  color: 'bg-red-700',   category: 'Endpoint'       },
  { id: 'jamf',       name: 'Jamf Pro',             logo: 'Jm',  color: 'bg-slate-600', category: 'Endpoint'       },
  { id: 'tenable',    name: 'Tenable.io',           logo: 'Te',  color: 'bg-orange-700',category: 'Vulnerability'  },
];

// ─── Evidence Data ──────────────────────────────────────────────────────────────
const EVIDENCE: EvidenceItem[] = [
  {
    id: 'EV-001', name: 'AWS IAM Policy Export', type: 'Config Export', source: 'integration', integration: 'aws',
    framework: 'NIST CSF 2.0', controls: ['PR.AA-01', 'PR.AA-05'], status: 'Valid',
    collectedAt: '2026-05-10T08:00:00Z', expiresAt: '2026-08-10T00:00:00Z', size: '2.4 MB',
    owner: 'AWS Auto-Collector', tags: ['IAM', 'Access Control'],
    description: 'Full export of IAM policies, roles and permission boundaries from all AWS accounts.',
    gaps: [],
    warnings: [{ message: 'Root account MFA not enforced in eu-west-1', type: 'coverage' }],
  },
  {
    id: 'EV-002', name: 'CloudTrail Audit Logs — May 2026', type: 'Audit Log', source: 'integration', integration: 'aws',
    framework: 'NIST CSF 2.0', controls: ['DE.CM-01', 'ID.AM-01'], status: 'Valid',
    collectedAt: '2026-05-10T06:00:00Z', expiresAt: null, size: '840 MB',
    owner: 'AWS Auto-Collector', tags: ['Logging', 'Audit Trail'],
    description: 'CloudTrail logs covering all API calls across us-east-1 and eu-west-1 regions.',
    gaps: [{ control: 'DE.CM-03', description: 'Personnel activity not included in trail scope', severity: 'Medium' }],
    warnings: [],
  },
  {
    id: 'EV-003', name: 'Okta MFA Status Report', type: 'Scan Report', source: 'integration', integration: 'okta',
    framework: 'NIST CSF 2.0', controls: ['PR.AA-03'], status: 'Needs Review',
    collectedAt: '2026-05-09T12:00:00Z', expiresAt: '2026-06-09T00:00:00Z', size: '1.1 MB',
    owner: 'Okta Auto-Collector', tags: ['MFA', 'Identity'],
    description: 'MFA enrollment and enforcement status for all Okta-managed users.',
    gaps: [
      { control: 'PR.AA-03', description: '18% of users have MFA disabled', severity: 'Critical' },
      { control: 'PR.AA-05', description: 'Legacy app authentication bypasses MFA policy', severity: 'High' },
    ],
    warnings: [{ message: 'Report covers only active users — inactive users excluded', type: 'coverage' }],
  },
  {
    id: 'EV-004', name: 'GitHub Branch Protection Settings', type: 'Config Export', source: 'integration', integration: 'github',
    framework: 'NIST CSF 2.0', controls: ['GV.PO-01', 'PR.PS-01'], status: 'Valid',
    collectedAt: '2026-05-10T07:30:00Z', expiresAt: null, size: '340 KB',
    owner: 'GitHub Auto-Collector', tags: ['Code Review', 'Branch Protection'],
    description: 'Branch protection rules, required reviewers and status checks for all production repositories.',
    gaps: [],
    warnings: [{ message: '3 repos missing required code owner approval', type: 'quality' }],
  },
  {
    id: 'EV-005', name: 'CrowdStrike EDR Coverage Report', type: 'Scan Report', source: 'integration', integration: 'crowdstrike',
    framework: 'NIST CSF 2.0', controls: ['DE.CM-01', 'PR.IR-01'], status: 'Valid',
    collectedAt: '2026-05-10T05:00:00Z', expiresAt: '2026-06-10T00:00:00Z', size: '5.2 MB',
    owner: 'CrowdStrike Auto-Collector', tags: ['EDR', 'Endpoint'],
    description: 'Endpoint detection coverage, sensor health and active threat detections across all managed devices.',
    gaps: [{ control: 'DE.CM-01', description: '12 endpoints offline >7 days', severity: 'High' }],
    warnings: [],
  },
  {
    id: 'EV-006', name: 'Tenable Vulnerability Scan — Q2 2026', type: 'Scan Report', source: 'integration', integration: 'tenable',
    framework: 'NIST CSF 2.0', controls: ['ID.RA-01', 'PR.PS-02'], status: 'Valid',
    collectedAt: '2026-05-01T02:00:00Z', expiresAt: '2026-06-01T00:00:00Z', size: '12.8 MB',
    owner: 'Tenable Auto-Collector', tags: ['Vulnerability', 'CVE'],
    description: 'Comprehensive vulnerability scan covering 2,340 assets across on-prem and cloud environments.',
    gaps: [
      { control: 'PR.PS-02', description: '47 critical CVEs unpatched >30 days', severity: 'Critical' },
      { control: 'ID.RA-01', description: 'Network segmentation gaps exposing critical assets', severity: 'High' },
    ],
    warnings: [
      { message: 'Scan coverage dropped to 89% — some cloud assets unreachable', type: 'coverage' },
      { message: 'Scan data is 9 days old', type: 'stale' },
    ],
  },
  {
    id: 'EV-007', name: 'Information Security Policy v2.4', type: 'Policy Document', source: 'manual',
    framework: 'NIST CSF 2.0', controls: ['GV.PO-01', 'GV.PO-02'], status: 'Valid',
    collectedAt: '2026-02-15T10:00:00Z', expiresAt: '2026-10-15T00:00:00Z', size: '1.8 MB',
    owner: 'Jane Smith (CISO)', tags: ['Policy', 'Governance'],
    description: 'Master information security policy document covering all aspects of the security program.',
    gaps: [],
    warnings: [{ message: 'Policy review due in 158 days', type: 'expiry' }],
  },
  {
    id: 'EV-008', name: 'Workday Employee Offboarding Audit', type: 'Access Review', source: 'integration', integration: 'workday',
    framework: 'NIST CSF 2.0', controls: ['PR.AA-01', 'GV.SC-02'], status: 'Needs Review',
    collectedAt: '2026-05-08T09:00:00Z', expiresAt: '2026-06-08T00:00:00Z', size: '890 KB',
    owner: 'Workday Auto-Collector', tags: ['HR', 'Offboarding', 'Access'],
    description: 'Terminated employee access revocation records and timeline compliance.',
    gaps: [{ control: 'PR.AA-01', description: '3 terminated employees retain active SSO access', severity: 'Critical' }],
    warnings: [{ message: 'Offboarding SLA exceeded for 2 accounts', type: 'quality' }],
  },
  {
    id: 'EV-009', name: 'Snyk SAST Scan Results', type: 'Scan Report', source: 'integration', integration: 'snyk',
    framework: 'NIST CSF 2.0', controls: ['PR.PS-01', 'ID.RA-01'], status: 'Valid',
    collectedAt: '2026-05-10T04:00:00Z', expiresAt: null, size: '3.1 MB',
    owner: 'Snyk Auto-Collector', tags: ['SAST', 'Dependencies'],
    description: 'Static analysis and dependency vulnerability scan across all production repositories.',
    gaps: [{ control: 'PR.PS-02', description: '8 high-severity open-source vulnerabilities', severity: 'High' }],
    warnings: [],
  },
  {
    id: 'EV-010', name: 'Azure AD Privileged Access Review', type: 'Access Review', source: 'integration', integration: 'azure-ad',
    framework: 'NIST CSF 2.0', controls: ['PR.AA-05', 'GV.SC-01'], status: 'Expiring Soon',
    collectedAt: '2026-04-01T10:00:00Z', expiresAt: '2026-05-20T00:00:00Z', size: '2.2 MB',
    owner: 'Azure Auto-Collector', tags: ['Privileged Access', 'Identity'],
    description: 'Quarterly privileged role assignment review for Azure AD admin accounts.',
    gaps: [],
    warnings: [
      { message: 'Evidence expires in 10 days — renew access review', type: 'expiry' },
      { message: '5 Global Admin accounts have no recent sign-in', type: 'quality' },
    ],
  },
  {
    id: 'EV-011', name: 'Penetration Test Report — Q1 2026', type: 'Test Result', source: 'manual',
    framework: 'NIST CSF 2.0', controls: ['ID.RA-01', 'PR.PS-01', 'DE.CM-01'], status: 'Valid',
    collectedAt: '2026-03-15T09:00:00Z', expiresAt: '2027-03-15T00:00:00Z', size: '4.7 MB',
    owner: 'Security Team', tags: ['Pentest', 'External Audit'],
    description: 'Annual external penetration test report covering web apps, APIs and network perimeter.',
    gaps: [{ control: 'PR.DS-01', description: 'Sensitive data exposed in API error responses', severity: 'High' }],
    warnings: [],
  },
  {
    id: 'EV-012', name: 'GCP Security Command Center Export', type: 'Config Export', source: 'integration', integration: 'gcp',
    framework: 'NIST CSF 2.0', controls: ['DE.CM-01', 'ID.AM-01', 'PR.DS-01'], status: 'Valid',
    collectedAt: '2026-05-10T08:15:00Z', expiresAt: null, size: '6.1 MB',
    owner: 'GCP Auto-Collector', tags: ['Cloud Security', 'CSPM'],
    description: 'Security findings and misconfigurations from GCP Security Command Center.',
    gaps: [{ control: 'PR.DS-01', description: 'GCS bucket with public read access detected', severity: 'Critical' }],
    warnings: [{ message: 'Premium tier required for full threat detection coverage', type: 'coverage' }],
  },
  {
    id: 'EV-013', name: 'Security Awareness Training Completion', type: 'Training Record', source: 'manual',
    framework: 'NIST CSF 2.0', controls: ['GV.OC-01'], status: 'Valid',
    collectedAt: '2026-04-30T17:00:00Z', expiresAt: '2027-04-30T00:00:00Z', size: '420 KB',
    owner: 'HR / Security', tags: ['Training', 'Awareness'],
    description: 'Annual security awareness training completion records — 94% completion rate.',
    gaps: [],
    warnings: [{ message: '14 employees have not completed mandatory training', type: 'coverage' }],
  },
  {
    id: 'EV-014', name: 'Jamf Device Compliance Snapshot', type: 'Config Export', source: 'integration', integration: 'jamf',
    framework: 'NIST CSF 2.0', controls: ['PR.AA-01', 'PR.PS-02'], status: 'Valid',
    collectedAt: '2026-05-10T07:00:00Z', expiresAt: '2026-06-10T00:00:00Z', size: '1.3 MB',
    owner: 'Jamf Auto-Collector', tags: ['MDM', 'Device', 'macOS'],
    description: 'macOS device compliance posture — encryption, OS version, and configuration profiles.',
    gaps: [],
    warnings: [{ message: '8 devices running macOS <14.0 (EOL soon)', type: 'stale' }],
  },
  {
    id: 'EV-015', name: 'API Health Check — Auth Service', type: 'API Response', source: 'api',
    framework: 'NIST CSF 2.0', controls: ['PR.AA-03', 'DE.CM-01'], status: 'Valid',
    collectedAt: '2026-05-10T08:45:00Z', expiresAt: null, size: '12 KB',
    owner: 'API Collector v1', tags: ['API', 'Auth', 'Health'],
    description: 'Automated API evidence collection from internal auth service health and config endpoints.',
    gaps: [],
    warnings: [],
  },
];

// ─── Config ─────────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<EvidenceType, string> = {
  'Policy Document': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
  'Screenshot':      'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
  'Config Export':   'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800',
  'Audit Log':       'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  'Scan Report':     'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
  'Certificate':     'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
  'Test Result':     'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
  'Training Record': 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800',
  'Access Review':   'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800',
  'API Response':    'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800',
};

const STATUS_CFG: Record<EvidenceStatus, { color: string; bg: string; border: string; dot: string }> = {
  'Valid':         { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'Expiring Soon': { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',     border: 'border-amber-200 dark:border-amber-800',     dot: 'bg-amber-500'   },
  'Expired':       { color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-200 dark:border-red-800',         dot: 'bg-red-500'     },
  'Needs Review':  { color: 'text-purple-600 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-900/20',   border: 'border-purple-200 dark:border-purple-800',   dot: 'bg-purple-500'  },
};

const SEV_COLOR = {
  Critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  High:     'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  Medium:   'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
};

const WARN_ICON: Record<Warning['type'], React.ReactNode> = {
  expiry:   <Clock className="w-3.5 h-3.5 text-amber-500" />,
  coverage: <AlertCircle className="w-3.5 h-3.5 text-orange-500" />,
  quality:  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  stale:    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />,
};

function getIntegration(id?: string) {
  return CONNECTED_INTEGRATIONS.find(i => i.id === id);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

// ─── Source Logo ────────────────────────────────────────────────────────────────
function SourceBadge({ item }: { item: EvidenceItem }) {
  if (item.source === 'manual') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <Upload className="w-3 h-3 text-slate-500" />
        </div>
        <span className="text-[10px] font-bold text-slate-500">Manual</span>
      </div>
    );
  }
  if (item.source === 'api') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-md bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
          <Code2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
        </div>
        <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">API</span>
      </div>
    );
  }
  const integ = getIntegration(item.integration);
  if (!integ) return null;
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-black flex-shrink-0', integ.color)}>
        {integ.logo}
      </div>
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[80px]">{integ.name}</span>
    </div>
  );
}

// ─── Detail Panel ────────────────────────────────────────────────────────────────
function EvidenceDetailPanel({ item, onClose }: { item: EvidenceItem; onClose: () => void }) {
  const stCfg = STATUS_CFG[item.status];
  const integ = getIntegration(item.integration);
  const totalIssues = item.gaps.length + item.warnings.length;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]" />
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-aegis-surface shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-aegis-border overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] font-black text-blue-500">{item.id}</span>
                <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border', TYPE_COLORS[item.type])}>{item.type}</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-snug">{item.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <SourceBadge item={item} />
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black border', stCfg.bg, stCfg.color, stCfg.border)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', stCfg.dot)} />{item.status}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-aegis-border flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Gaps + Warnings summary */}
          {totalIssues > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className={cn('p-4 rounded-xl border', item.gaps.length > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/40' : 'bg-slate-50 dark:bg-aegis-bg border-slate-100 dark:border-aegis-border')}>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Gaps</div>
                <div className={cn('text-2xl font-black', item.gaps.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400')}>{item.gaps.length}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">control gaps</div>
              </div>
              <div className={cn('p-4 rounded-xl border', item.warnings.length > 0 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/40' : 'bg-slate-50 dark:bg-aegis-bg border-slate-100 dark:border-aegis-border')}>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Warnings</div>
                <div className={cn('text-2xl font-black', item.warnings.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400')}>{item.warnings.length}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">quality issues</div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Collected', value: formatDate(item.collectedAt) },
              { label: 'Expires', value: item.expiresAt ? `${formatDate(item.expiresAt)} (${daysUntil(item.expiresAt)}d)` : 'Never' },
              { label: 'Owner', value: item.owner },
              { label: 'Size', value: item.size ?? '—' },
            ].map(m => (
              <div key={m.label} className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Mapped Controls */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mapped Controls</div>
            <div className="flex flex-wrap gap-1.5">
              {item.controls.map(c => (
                <span key={c} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md text-[10px] font-black text-blue-600 dark:text-blue-400 font-mono">{c}</span>
              ))}
            </div>
          </div>

          {/* Gaps */}
          {item.gaps.length > 0 && (
            <div>
              <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />Identified Gaps
              </div>
              <div className="space-y-2">
                {item.gaps.map((g, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-black text-red-500">{g.control}</span>
                      <span className={cn('px-2 py-0.5 rounded text-[8px] font-black uppercase', SEV_COLOR[g.severity])}>{g.severity}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{g.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {item.warnings.length > 0 && (
            <div>
              <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />Warnings
              </div>
              <div className="space-y-2">
                {item.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                    {WARN_ICON[w.type]}
                    <p className="text-xs text-slate-600 dark:text-slate-300">{w.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <Tag className="w-2.5 h-2.5" />{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-aegis-border flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider">
            <Download className="w-3.5 h-3.5" />Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-aegis-bg text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider">
            <ExternalLink className="w-3.5 h-3.5" />Source
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 dark:bg-aegis-bg text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider">
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── API Collection Panel ────────────────────────────────────────────────────────
function ApiCollectionSection() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const endpoints = [
    {
      method: 'POST', path: '/api/v1/evidence', label: 'Submit Evidence',
      description: 'Push evidence from any system via REST API.',
      body: `{\n  "name": "My Evidence",\n  "type": "Config Export",\n  "framework": "NIST CSF 2.0",\n  "controls": ["PR.AA-01"],\n  "data": "base64-encoded-content",\n  "owner": "team@company.com"\n}`,
    },
    {
      method: 'GET', path: '/api/v1/evidence', label: 'List Evidence',
      description: 'Retrieve all evidence items with optional filters.',
      body: `GET /api/v1/evidence?framework=NIST+CSF+2.0&status=Valid`,
    },
    {
      method: 'GET', path: '/api/v1/evidence/:id/gaps', label: 'Get Gaps',
      description: 'Retrieve identified gaps for a specific evidence item.',
      body: `GET /api/v1/evidence/EV-001/gaps`,
    },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-aegis-border flex items-center justify-between bg-gradient-to-r from-cyan-50/50 dark:from-cyan-900/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">API Evidence Collection</h3>
            <p className="text-xs text-slate-400 mt-0.5">Push evidence programmatically from any internal system or script</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <Key className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">API Key Required</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
            <Plus className="w-3 h-3" />Generate Key
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {endpoints.map((ep, i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-aegis-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-aegis-bg border-b border-slate-100 dark:border-aegis-border">
              <div className="flex items-center gap-2">
                <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded font-mono',
                  ep.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                )}>{ep.method}</span>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{ep.label}</span>
              </div>
              <button onClick={() => copy(ep.body, ep.path)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors">
                {copied === ep.path ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mb-2 truncate">{ep.path}</p>
              <p className="text-[10px] text-slate-500 mb-3">{ep.description}</p>
              <pre className="text-[9px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-aegis-bg p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-aegis-border">
                {ep.body}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main View ───────────────────────────────────────────────────────────────────
export function EvidenceView() {
  const [selected, setSelected]         = useState<EvidenceItem | null>(null);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | 'All'>('All');
  const [typeFilter, setTypeFilter]     = useState<EvidenceType | 'All'>('All');
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(new Set());
  const [showApi, setShowApi]           = useState(false);

  function toggleSource(id: string) {
    setSourceFilters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => EVIDENCE.filter(e => {
    const matchSearch   = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus   = statusFilter === 'All' || e.status === statusFilter;
    const matchType     = typeFilter === 'All' || e.type === typeFilter;
    const matchSource   = sourceFilters.size === 0 || (e.integration && sourceFilters.has(e.integration)) || (e.source === 'manual' && sourceFilters.has('manual')) || (e.source === 'api' && sourceFilters.has('api'));
    return matchSearch && matchStatus && matchType && matchSource;
  }), [search, statusFilter, typeFilter, sourceFilters]);

  // Stats
  const totalGaps     = EVIDENCE.reduce((s, e) => s + e.gaps.length, 0);
  const totalWarnings = EVIDENCE.reduce((s, e) => s + e.warnings.length, 0);
  const autoCount     = EVIDENCE.filter(e => e.source !== 'manual').length;
  const criticalGaps  = EVIDENCE.reduce((s, e) => s + e.gaps.filter(g => g.severity === 'Critical').length, 0);

  // Integration evidence counts
  const integrationCounts = useMemo(() => {
    const m: Record<string, number> = {};
    EVIDENCE.forEach(e => { if (e.integration) m[e.integration] = (m[e.integration] ?? 0) + 1; });
    return m;
  }, []);

  const EVIDENCE_TYPES: EvidenceType[] = [
    'Policy Document','Screenshot','Config Export','Audit Log','Scan Report',
    'Certificate','Test Result','Training Record','Access Review','API Response',
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Evidence Collection</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">All evidence from integrations, manual uploads, and API collectors.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button onClick={() => setShowApi(v => !v)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all',
              showApi ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-aegis-surface border-slate-200 dark:border-aegis-border text-slate-600 dark:text-slate-300 hover:border-cyan-500'
            )}>
            <Code2 className="w-4 h-4" />API Collector
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />Upload Evidence
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Evidence', value: EVIDENCE.length, sub: `${autoCount} auto-collected`, icon: <Archive className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Control Gaps', value: totalGaps, sub: `${criticalGaps} critical`, icon: <AlertTriangle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 dark:bg-red-900/20', alert: totalGaps > 0 },
          { label: 'Warnings', value: totalWarnings, sub: 'quality & coverage', icon: <AlertCircle className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Connected Sources', value: CONNECTED_INTEGRATIONS.length, sub: '+manual +API', icon: <Database className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((s, i) => (
          <div key={i} className={cn('glass-card p-5 flex items-center gap-4', s.alert ? 'border-red-200 dark:border-red-900/40' : '')}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.color)}>{s.icon}</div>
            <div>
              <div className={cn('text-2xl font-black leading-none', s.alert ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>{s.value}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* API Collector */}
      <AnimatePresence>
        {showApi && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <ApiCollectionSection />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content: Table + Right sidebar */}
      <div className="flex gap-5 items-start">

        {/* Table */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filters bar */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search evidence, tags..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500" />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="All">All Types</option>
                {EVIDENCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {/* Status filter tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['All', 'Valid', 'Expiring Soon', 'Expired', 'Needs Review'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                    statusFilter === s ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                  )}>
                  {s !== 'All' && <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_CFG[s as EvidenceStatus].dot)} />}
                  {s}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-slate-400 font-bold">{filtered.length} items</span>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-aegis-border text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Evidence</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-red-500">Gaps</div>
              <div className="col-span-1 text-amber-500">Warn</div>
              <div className="col-span-1">Date</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-aegis-border">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Archive className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No evidence found</p>
                </div>
              ) : filtered.map((ev, i) => {
                const stCfg = STATUS_CFG[ev.status];
                return (
                  <motion.div key={ev.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    onClick={() => setSelected(ev)}
                    className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-slate-50 dark:hover:bg-white/[0.025] transition-all cursor-pointer group"
                  >
                    <div className="col-span-1 font-mono text-[10px] font-black text-blue-500/70">{ev.id}</div>

                    <div className="col-span-3">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{ev.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ev.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-slate-500 font-bold">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2"><SourceBadge item={ev} /></div>

                    <div className="col-span-2">
                      <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border', TYPE_COLORS[ev.type])}>{ev.type}</span>
                    </div>

                    <div className="col-span-1">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black border', stCfg.bg, stCfg.color, stCfg.border)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', stCfg.dot)} />
                        <span className="truncate">{ev.status.split(' ')[0]}</span>
                      </span>
                    </div>

                    <div className="col-span-1">
                      {ev.gaps.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-black text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-3.5 h-3.5" />{ev.gaps.length}
                        </span>
                      ) : <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>}
                    </div>

                    <div className="col-span-1">
                      {ev.warnings.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-black text-amber-500">
                          <AlertCircle className="w-3.5 h-3.5" />{ev.warnings.length}
                        </span>
                      ) : <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>}
                    </div>

                    <div className="col-span-1 text-[10px] text-slate-400 font-bold">
                      {new Date(ev.collectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar — Source filters */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Source</div>
              {sourceFilters.size > 0 && (
                <button onClick={() => setSourceFilters(new Set())}
                  className="text-[9px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-wider">
                  Clear
                </button>
              )}
            </div>

            {/* Manual + API */}
            <div className="space-y-1 mb-4 pb-4 border-b border-slate-100 dark:border-aegis-border">
              {[
                { id: 'manual', label: 'Manual Upload', count: EVIDENCE.filter(e => e.source === 'manual').length, icon: <Upload className="w-3 h-3 text-slate-400" />, color: 'bg-slate-200 dark:bg-slate-700' },
                { id: 'api', label: 'API Collector', count: EVIDENCE.filter(e => e.source === 'api').length, icon: <Code2 className="w-3 h-3 text-cyan-500" />, color: 'bg-cyan-100 dark:bg-cyan-900/30' },
              ].map(s => (
                <button key={s.id} onClick={() => toggleSource(s.id)}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left',
                    sourceFilters.has(s.id) ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  )}>
                  <div className={cn('w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0', s.color)}>{s.icon}</div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex-1">{s.label}</span>
                  <span className="text-[10px] font-black text-slate-400">{s.count}</span>
                  {sourceFilters.has(s.id)
                    ? <CheckSquare className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    : <Square className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                </button>
              ))}
            </div>

            {/* Integrations by category */}
            {Object.entries(
              CONNECTED_INTEGRATIONS.reduce((acc, i) => {
                (acc[i.category] = acc[i.category] ?? []).push(i);
                return acc;
              }, {} as Record<string, typeof CONNECTED_INTEGRATIONS>)
            ).map(([cat, integs]) => (
              <div key={cat} className="mb-3">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{cat}</div>
                <div className="space-y-0.5">
                  {integs.map(integ => {
                    const count = integrationCounts[integ.id] ?? 0;
                    const active = sourceFilters.has(integ.id);
                    return (
                      <button key={integ.id} onClick={() => toggleSource(integ.id)}
                        className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left',
                          active ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                        )}>
                        <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-black flex-shrink-0', integ.color)}>
                          {integ.logo}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex-1 truncate">{integ.name}</span>
                        <span className="text-[10px] font-black text-slate-400">{count}</span>
                        {active
                          ? <CheckSquare className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          : <Square className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats by source */}
          <div className="glass-card p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Gap Summary</div>
            <div className="space-y-2">
              {EVIDENCE.filter(e => e.gaps.length > 0).sort((a, b) => b.gaps.length - a.gaps.length).slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center gap-2 cursor-pointer" onClick={() => setSelected(e)}>
                  <SourceBadge item={e} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{e.name}</div>
                  </div>
                  <span className="flex items-center gap-0.5 text-[10px] font-black text-red-500 flex-shrink-0">
                    <AlertTriangle className="w-3 h-3" />{e.gaps.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && <EvidenceDetailPanel item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
