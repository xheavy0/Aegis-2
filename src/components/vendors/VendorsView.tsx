import React, { useState, useMemo } from 'react';
import {
  Users, ShieldAlert, CheckCircle2, AlertCircle, Plus, X, ChevronRight,
  TrendingUp, TrendingDown, Minus, Search, Filter, ExternalLink,
  FileText, Shield, Activity, Clock, AlertTriangle, BarChart2,
  Building2, Star, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw,
  FileCheck, Package, Globe, Database
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tier = 'Tier 1' | 'Tier 2' | 'Tier 3';
type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under Review';
type RiskTrend = 'Improving' | 'Stable' | 'Degrading';

interface Vendor {
  id: string;
  name: string;
  category: string;
  tier: Tier;
  securityScore: number;
  inherentRisk: RiskLevel;
  residualRisk: RiskLevel;
  complianceStatus: ComplianceStatus;
  lastAssessment: string;
  nextReview: string;
  owner: string;
  openFindings: number;
  criticalFindings: number;
  certifications: string[];
  impactScore: number;    // 1-5
  likelihoodScore: number; // 1-5
  riskTrend: RiskTrend;
  annualSpend: string;
  description: string;
  dataAccess: string[];
  riskCategories: { name: string; inherent: number; residual: number }[];
}

interface Assessment {
  id: string;
  vendorId: string;
  vendorName: string;
  tier: Tier;
  type: string;
  dueDate: string;
  status: 'Overdue' | 'Due Soon' | 'Scheduled' | 'In Progress' | 'Completed';
  assignee: string;
  completion: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const VENDORS: Vendor[] = [
  {
    id: 'V-001', name: 'CloudOps Pro', category: 'IaaS / Cloud', tier: 'Tier 1',
    securityScore: 88, inherentRisk: 'Critical', residualRisk: 'Low',
    complianceStatus: 'Compliant', lastAssessment: '2025-11-12', nextReview: '2026-05-12',
    owner: 'Alex C.', openFindings: 2, criticalFindings: 0,
    certifications: ['SOC 2 Type II', 'ISO 27001', 'CSA STAR'],
    impactScore: 5, likelihoodScore: 2, riskTrend: 'Stable',
    annualSpend: '$480,000',
    description: 'Primary cloud infrastructure provider. Hosts all production workloads and customer data.',
    dataAccess: ['Customer PII', 'Financial Data', 'Intellectual Property'],
    riskCategories: [
      { name: 'InfoSec', inherent: 90, residual: 15 },
      { name: 'Operational', inherent: 80, residual: 20 },
      { name: 'Financial', inherent: 70, residual: 25 },
      { name: 'Compliance', inherent: 75, residual: 10 },
      { name: 'Reputational', inherent: 65, residual: 15 },
    ],
  },
  {
    id: 'V-002', name: 'SecurityFlow Inc', category: 'Security SaaS', tier: 'Tier 2',
    securityScore: 62, inherentRisk: 'High', residualRisk: 'Medium',
    complianceStatus: 'Pending', lastAssessment: '2025-01-05', nextReview: '2026-06-05',
    owner: 'Sarah L.', openFindings: 7, criticalFindings: 1,
    certifications: ['SOC 2 Type I'],
    impactScore: 3, likelihoodScore: 3, riskTrend: 'Degrading',
    annualSpend: '$120,000',
    description: 'SIEM and security monitoring platform. Receives security event logs from all infrastructure.',
    dataAccess: ['Security Logs', 'Infrastructure Metadata'],
    riskCategories: [
      { name: 'InfoSec', inherent: 65, residual: 40 },
      { name: 'Operational', inherent: 55, residual: 35 },
      { name: 'Financial', inherent: 40, residual: 30 },
      { name: 'Compliance', inherent: 60, residual: 45 },
      { name: 'Reputational', inherent: 50, residual: 35 },
    ],
  },
  {
    id: 'V-003', name: 'PayShield Gateway', category: 'FinTech / Payments', tier: 'Tier 1',
    securityScore: 94, inherentRisk: 'Critical', residualRisk: 'Low',
    complianceStatus: 'Compliant', lastAssessment: '2026-02-20', nextReview: '2026-08-20',
    owner: 'Alex C.', openFindings: 1, criticalFindings: 0,
    certifications: ['PCI DSS Level 1', 'SOC 2 Type II', 'ISO 27001'],
    impactScore: 5, likelihoodScore: 1, riskTrend: 'Improving',
    annualSpend: '$760,000',
    description: 'Payment processing gateway for all customer transactions. PCI-compliant infrastructure.',
    dataAccess: ['Payment Card Data', 'Customer PII', 'Financial Transactions'],
    riskCategories: [
      { name: 'InfoSec', inherent: 95, residual: 8 },
      { name: 'Operational', inherent: 90, residual: 10 },
      { name: 'Financial', inherent: 98, residual: 12 },
      { name: 'Compliance', inherent: 92, residual: 6 },
      { name: 'Reputational', inherent: 88, residual: 10 },
    ],
  },
  {
    id: 'V-004', name: 'DataVault Analytics', category: 'Analytics SaaS', tier: 'Tier 2',
    securityScore: 45, inherentRisk: 'High', residualRisk: 'High',
    complianceStatus: 'Non-Compliant', lastAssessment: '2025-06-18', nextReview: '2026-05-01',
    owner: 'Elena R.', openFindings: 14, criticalFindings: 3,
    certifications: [],
    impactScore: 3, likelihoodScore: 4, riskTrend: 'Degrading',
    annualSpend: '$95,000',
    description: 'Business intelligence and analytics platform. Processes operational and customer data for reporting.',
    dataAccess: ['Operational Data', 'Customer Behavioral Data'],
    riskCategories: [
      { name: 'InfoSec', inherent: 55, residual: 50 },
      { name: 'Operational', inherent: 45, residual: 42 },
      { name: 'Financial', inherent: 50, residual: 48 },
      { name: 'Compliance', inherent: 60, residual: 58 },
      { name: 'Reputational', inherent: 48, residual: 45 },
    ],
  },
  {
    id: 'V-005', name: 'NetSecure VPN', category: 'Network Security', tier: 'Tier 2',
    securityScore: 73, inherentRisk: 'High', residualRisk: 'Medium',
    complianceStatus: 'Compliant', lastAssessment: '2026-01-10', nextReview: '2026-07-10',
    owner: 'David M.', openFindings: 4, criticalFindings: 0,
    certifications: ['SOC 2 Type II', 'FedRAMP Moderate'],
    impactScore: 4, likelihoodScore: 2, riskTrend: 'Stable',
    annualSpend: '$68,000',
    description: 'Enterprise VPN solution for remote access. All employee remote connections routed through this vendor.',
    dataAccess: ['Network Traffic Metadata', 'Employee Credentials'],
    riskCategories: [
      { name: 'InfoSec', inherent: 75, residual: 30 },
      { name: 'Operational', inherent: 65, residual: 28 },
      { name: 'Financial', inherent: 40, residual: 20 },
      { name: 'Compliance', inherent: 55, residual: 22 },
      { name: 'Reputational', inherent: 60, residual: 25 },
    ],
  },
  {
    id: 'V-006', name: 'HRBridge HRIS', category: 'HR Technology', tier: 'Tier 3',
    securityScore: 82, inherentRisk: 'Medium', residualRisk: 'Low',
    complianceStatus: 'Compliant', lastAssessment: '2025-10-05', nextReview: '2026-10-05',
    owner: 'Sarah L.', openFindings: 1, criticalFindings: 0,
    certifications: ['SOC 2 Type II', 'ISO 27001'],
    impactScore: 2, likelihoodScore: 2, riskTrend: 'Stable',
    annualSpend: '$42,000',
    description: 'Human resources information system for employee records, payroll, and benefits management.',
    dataAccess: ['Employee PII', 'Salary Data', 'Benefits Information'],
    riskCategories: [
      { name: 'InfoSec', inherent: 40, residual: 12 },
      { name: 'Operational', inherent: 35, residual: 10 },
      { name: 'Financial', inherent: 45, residual: 15 },
      { name: 'Compliance', inherent: 50, residual: 12 },
      { name: 'Reputational', inherent: 38, residual: 10 },
    ],
  },
  {
    id: 'V-007', name: 'GlobalLogix ERP', category: 'Enterprise Software', tier: 'Tier 1',
    securityScore: 67, inherentRisk: 'Critical', residualRisk: 'High',
    complianceStatus: 'Under Review', lastAssessment: '2025-09-30', nextReview: '2026-05-30',
    owner: 'Alex C.', openFindings: 9, criticalFindings: 2,
    certifications: ['ISO 27001'],
    impactScore: 5, likelihoodScore: 3, riskTrend: 'Degrading',
    annualSpend: '$550,000',
    description: 'Core ERP system managing supply chain, financials, and inventory. Deeply integrated with operations.',
    dataAccess: ['Financial Data', 'Supply Chain Data', 'Customer Orders', 'Vendor Contracts'],
    riskCategories: [
      { name: 'InfoSec', inherent: 80, residual: 55 },
      { name: 'Operational', inherent: 85, residual: 60 },
      { name: 'Financial', inherent: 90, residual: 65 },
      { name: 'Compliance', inherent: 75, residual: 50 },
      { name: 'Reputational', inherent: 70, residual: 55 },
    ],
  },
  {
    id: 'V-008', name: 'AI Insights Co', category: 'AI / ML SaaS', tier: 'Tier 3',
    securityScore: 55, inherentRisk: 'Medium', residualRisk: 'Medium',
    complianceStatus: 'Pending', lastAssessment: '2025-12-15', nextReview: '2026-06-15',
    owner: 'Elena R.', openFindings: 5, criticalFindings: 0,
    certifications: ['SOC 2 Type I'],
    impactScore: 2, likelihoodScore: 3, riskTrend: 'Improving',
    annualSpend: '$28,000',
    description: 'AI-powered analytics and predictive modeling. Processes anonymized customer datasets.',
    dataAccess: ['Anonymized Customer Data', 'Operational Metrics'],
    riskCategories: [
      { name: 'InfoSec', inherent: 55, residual: 40 },
      { name: 'Operational', inherent: 45, residual: 35 },
      { name: 'Financial', inherent: 35, residual: 30 },
      { name: 'Compliance', inherent: 50, residual: 42 },
      { name: 'Reputational', inherent: 48, residual: 38 },
    ],
  },
  {
    id: 'V-009', name: 'CloudBackup Plus', category: 'Backup / DR', tier: 'Tier 2',
    securityScore: 79, inherentRisk: 'High', residualRisk: 'Low',
    complianceStatus: 'Compliant', lastAssessment: '2026-03-01', nextReview: '2026-09-01',
    owner: 'David M.', openFindings: 2, criticalFindings: 0,
    certifications: ['SOC 2 Type II', 'ISO 27001'],
    impactScore: 4, likelihoodScore: 1, riskTrend: 'Stable',
    annualSpend: '$36,000',
    description: 'Enterprise backup and disaster recovery solution. Stores encrypted off-site copies of all critical data.',
    dataAccess: ['All Production Data (Encrypted)'],
    riskCategories: [
      { name: 'InfoSec', inherent: 70, residual: 18 },
      { name: 'Operational', inherent: 75, residual: 15 },
      { name: 'Financial', inherent: 65, residual: 20 },
      { name: 'Compliance', inherent: 72, residual: 14 },
      { name: 'Reputational', inherent: 68, residual: 16 },
    ],
  },
  {
    id: 'V-010', name: 'LegalEase Docs', category: 'Legal Tech', tier: 'Tier 3',
    securityScore: 77, inherentRisk: 'Medium', residualRisk: 'Low',
    complianceStatus: 'Compliant', lastAssessment: '2025-08-22', nextReview: '2026-08-22',
    owner: 'Sarah L.', openFindings: 0, criticalFindings: 0,
    certifications: ['SOC 2 Type II'],
    impactScore: 2, likelihoodScore: 2, riskTrend: 'Stable',
    annualSpend: '$18,000',
    description: 'Document management and e-signature platform for contracts and legal agreements.',
    dataAccess: ['Legal Documents', 'Contract Data', 'Signature Data'],
    riskCategories: [
      { name: 'InfoSec', inherent: 38, residual: 12 },
      { name: 'Operational', inherent: 30, residual: 10 },
      { name: 'Financial', inherent: 35, residual: 12 },
      { name: 'Compliance', inherent: 42, residual: 14 },
      { name: 'Reputational', inherent: 32, residual: 10 },
    ],
  },
];

const ASSESSMENTS: Assessment[] = [
  { id: 'A-001', vendorId: 'V-004', vendorName: 'DataVault Analytics', tier: 'Tier 2', type: 'Annual Due Diligence', dueDate: '2026-05-01', status: 'Overdue', assignee: 'Elena R.', completion: 20 },
  { id: 'A-002', vendorId: 'V-007', vendorName: 'GlobalLogix ERP', tier: 'Tier 1', type: 'Quarterly Review', dueDate: '2026-05-30', status: 'In Progress', assignee: 'Alex C.', completion: 55 },
  { id: 'A-003', vendorId: 'V-001', vendorName: 'CloudOps Pro', tier: 'Tier 1', type: 'Semi-Annual Review', dueDate: '2026-05-12', status: 'Due Soon', assignee: 'Alex C.', completion: 0 },
  { id: 'A-004', vendorId: 'V-002', vendorName: 'SecurityFlow Inc', tier: 'Tier 2', type: 'Remediation Validation', dueDate: '2026-06-05', status: 'Scheduled', assignee: 'Sarah L.', completion: 0 },
  { id: 'A-005', vendorId: 'V-008', vendorName: 'AI Insights Co', tier: 'Tier 3', type: 'Annual Due Diligence', dueDate: '2026-06-15', status: 'Scheduled', assignee: 'Elena R.', completion: 0 },
  { id: 'A-006', vendorId: 'V-005', vendorName: 'NetSecure VPN', tier: 'Tier 2', type: 'Penetration Test Review', dueDate: '2026-07-10', status: 'Scheduled', assignee: 'David M.', completion: 0 },
  { id: 'A-007', vendorId: 'V-003', vendorName: 'PayShield Gateway', tier: 'Tier 1', type: 'PCI DSS Compliance', dueDate: '2026-08-20', status: 'Scheduled', assignee: 'Alex C.', completion: 0 },
  { id: 'A-008', vendorId: 'V-009', vendorName: 'CloudBackup Plus', tier: 'Tier 2', type: 'DR Test Review', dueDate: '2026-09-01', status: 'Scheduled', assignee: 'David M.', completion: 0 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_CFG: Record<RiskLevel, { bg: string; text: string; border: string; dot: string }> = {
  Critical: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  High:     { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  Medium:   { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  Low:      { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
};

const STATUS_CFG: Record<ComplianceStatus, { bg: string; text: string }> = {
  'Compliant':    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  'Non-Compliant':{ bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  'Pending':      { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  'Under Review': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
};

const TIER_CFG: Record<Tier, { color: string; bg: string }> = {
  'Tier 1': { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  'Tier 2': { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  'Tier 3': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
};

const ASSMT_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  'Overdue':   { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  'Due Soon':  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  'In Progress':{ bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  'Scheduled': { bg: 'bg-slate-100 dark:bg-white/5', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' },
  'Completed': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-black text-slate-700 dark:text-slate-300 w-6 text-right">{score}</span>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const c = RISK_CFG[level];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border', c.bg, c.text, c.border)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {level}
    </span>
  );
}

function TrendIcon({ trend }: { trend: RiskTrend }) {
  if (trend === 'Improving') return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === 'Degrading') return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

// ─── Heat Map ─────────────────────────────────────────────────────────────────

const HEAT_COLORS: Record<number, string> = {
  2: 'bg-emerald-500/20 border-emerald-500/30',
  3: 'bg-amber-400/20 border-amber-400/30',
  4: 'bg-orange-500/20 border-orange-500/30',
  6: 'bg-amber-400/20 border-amber-400/30',
  8: 'bg-orange-500/20 border-orange-500/30',
  9: 'bg-red-500/20 border-red-500/30',
  10: 'bg-red-600/20 border-red-600/30',
  12: 'bg-red-600/30 border-red-600/40',
  15: 'bg-red-700/30 border-red-700/40',
  16: 'bg-red-600/30 border-red-600/40',
  20: 'bg-red-700/40 border-red-700/50',
  25: 'bg-red-800/40 border-red-800/50',
};

function getHeatColor(impact: number, likelihood: number): string {
  const score = impact * likelihood;
  const keys = Object.keys(HEAT_COLORS).map(Number).sort((a, b) => a - b);
  for (const k of keys) {
    if (score <= k) return HEAT_COLORS[k];
  }
  return HEAT_COLORS[25];
}

function RiskHeatMap({ vendors }: { vendors: Vendor[] }) {
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];
  const lLabels: Record<number, string> = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely', 5: 'Almost Certain' };
  const iLabels: Record<number, string> = { 1: 'Negligible', 2: 'Minor', 3: 'Moderate', 4: 'Major', 5: 'Severe' };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Vendor Risk Heat Map</h3>
        <span className="ml-auto text-[9px] text-slate-400 font-bold uppercase tracking-widest">Inherent Risk</span>
      </div>
      <div className="flex gap-3">
        {/* Y-axis label */}
        <div className="flex flex-col justify-center items-center w-4">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest -rotate-90 whitespace-nowrap">Likelihood</span>
        </div>
        <div className="flex-1">
          {likelihoods.map((l) => (
            <div key={l} className="flex gap-1 mb-1">
              <div className="w-16 flex-shrink-0 flex items-center justify-end pr-2">
                <span className="text-[8px] font-bold text-slate-400 text-right leading-tight">{lLabels[l]}</span>
              </div>
              {impacts.map((i) => {
                const vendorsHere = vendors.filter(v => v.impactScore === i && v.likelihoodScore === l);
                return (
                  <div
                    key={i}
                    className={cn('relative flex-1 h-10 rounded border flex items-center justify-center', getHeatColor(i, l))}
                  >
                    {vendorsHere.map((v, idx) => (
                      <div
                        key={v.id}
                        title={v.name}
                        className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black text-white shadow-sm cursor-pointer',
                          v.tier === 'Tier 1' ? 'bg-red-500' : v.tier === 'Tier 2' ? 'bg-orange-500' : 'bg-blue-500'
                        )}
                        style={{ position: vendorsHere.length > 1 ? 'relative' : undefined, marginLeft: idx > 0 ? '-4px' : undefined, zIndex: idx }}
                      >
                        {v.id.replace('V-', '')}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          {/* X-axis labels */}
          <div className="flex gap-1 mt-2">
            <div className="w-16 flex-shrink-0" />
            {impacts.map(i => (
              <div key={i} className="flex-1 text-center">
                <span className="text-[8px] font-bold text-slate-400 leading-tight">{iLabels[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-0.5">
            <div className="w-16 flex-shrink-0" />
            <div className="flex-1 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">← Impact →</span>
            </div>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-aegis-border">
        {(['Tier 1', 'Tier 2', 'Tier 3'] as Tier[]).map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-full', t === 'Tier 1' ? 'bg-red-500' : t === 'Tier 2' ? 'bg-orange-500' : 'bg-blue-500')} />
            <span className="text-[9px] font-bold text-slate-500">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vendor Detail Panel ──────────────────────────────────────────────────────

function VendorDetail({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [tab, setTab] = useState<'profile' | 'risk' | 'findings'>('profile');
  const tabs = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'risk' as const, label: 'Risk Assessment' },
    { id: 'findings' as const, label: `Findings (${vendor.openFindings})` },
  ];

  const mockFindings = Array.from({ length: vendor.openFindings }, (_, i) => ({
    id: `F-${vendor.id}-${i + 1}`,
    title: ['Missing MFA enforcement', 'Unencrypted data at rest', 'Outdated TLS version', 'No incident response SLA', 'Subprocessor not disclosed', 'Pen test overdue', 'Missing DPA', 'No BCP documented', 'API key rotation gap', 'Logging disabled in staging'][i % 10],
    severity: (['Critical', 'High', 'Medium', 'Low'] as RiskLevel[])[Math.min(i, 3)],
    dueDate: `2026-0${(i % 9) + 1}-15`,
    status: i < vendor.criticalFindings ? 'Open' : 'In Remediation',
  }));

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
      />
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-aegis-surface shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-aegis-border"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">{vendor.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-mono text-slate-400">{vendor.id}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[9px] text-slate-400 font-bold">{vendor.category}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border', TIER_CFG[vendor.tier].bg, TIER_CFG[vendor.tier].color)}>
              {vendor.tier}
            </span>
            <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest', STATUS_CFG[vendor.complianceStatus].bg, STATUS_CFG[vendor.complianceStatus].text)}>
              {vendor.complianceStatus}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <TrendIcon trend={vendor.riskTrend} />
              <span className={cn('text-[9px] font-bold', vendor.riskTrend === 'Improving' ? 'text-emerald-500' : vendor.riskTrend === 'Degrading' ? 'text-red-500' : 'text-slate-400')}>
                {vendor.riskTrend}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-100 dark:border-aegis-border">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors',
                tab === t.id
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 'profile' && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{vendor.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Security Score', value: `${vendor.securityScore}/100`, icon: Shield },
                  { label: 'Annual Spend', value: vendor.annualSpend, icon: Activity },
                  { label: 'Owner', value: vendor.owner, icon: Users },
                  { label: 'Last Review', value: vendor.lastAssessment, icon: Calendar },
                  { label: 'Next Review', value: vendor.nextReview, icon: Clock },
                  { label: 'Open Findings', value: `${vendor.openFindings} (${vendor.criticalFindings} critical)`, icon: AlertTriangle },
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

              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Data Access</h4>
                <div className="flex flex-wrap gap-2">
                  {vendor.dataAccess.map(d => (
                    <span key={d} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-bold flex items-center gap-1">
                      <Database className="w-2.5 h-2.5" />{d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Certifications</h4>
                {vendor.certifications.length === 0 ? (
                  <p className="text-xs text-red-500 font-bold">No certifications on file</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {vendor.certifications.map(c => (
                      <span key={c} className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-bold border border-emerald-100 dark:border-emerald-900/30">
                        <FileCheck className="w-2.5 h-2.5" />{c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'risk' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Inherent Risk</p>
                  <RiskBadge level={vendor.inherentRisk} />
                  <p className="text-[9px] text-slate-400 mt-2">Without controls</p>
                </div>
                <div className="p-4 rounded-xl border">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Residual Risk</p>
                  <RiskBadge level={vendor.residualRisk} />
                  <p className="text-[9px] text-slate-400 mt-2">After controls applied</p>
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Category Breakdown</h4>
                <div className="space-y-4">
                  {vendor.riskCategories.map(cat => (
                    <div key={cat.name}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          {cat.inherent}% → <span className="text-blue-500">{cat.residual}%</span>
                        </span>
                      </div>
                      <div className="relative h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-red-200 dark:bg-red-900/40 rounded-full" style={{ width: `${cat.inherent}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all" style={{ width: `${cat.residual}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-300" /><span className="text-[9px] text-slate-400 font-bold">Inherent</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[9px] text-slate-400 font-bold">Residual</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-aegis-bg border border-slate-100 dark:border-aegis-border">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Heat Map Position</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Impact: <span className="font-black text-slate-900 dark:text-white">{['', 'Negligible', 'Minor', 'Moderate', 'Major', 'Severe'][vendor.impactScore]}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  Likelihood: <span className="font-black text-slate-900 dark:text-white">{['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][vendor.likelihoodScore]}</span>
                </p>
              </div>
            </>
          )}

          {tab === 'findings' && (
            <>
              {vendor.openFindings === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400" />
                  <p className="font-bold text-sm">No open findings</p>
                  <p className="text-xs mt-1">All issues have been resolved.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockFindings.map(f => {
                    const rc = RISK_CFG[f.severity];
                    return (
                      <div key={f.id} className="p-4 rounded-xl border border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-aegis-bg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{f.title}</p>
                            <p className="text-[9px] font-mono text-slate-400 mt-0.5">{f.id}</p>
                          </div>
                          <RiskBadge level={f.severity} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={cn('text-[9px] font-bold', f.status === 'Open' ? 'text-red-500' : 'text-amber-500')}>{f.status}</span>
                          <span className="text-[9px] text-slate-400">Due {f.dueDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-aegis-border flex gap-3">
          <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
            Start Assessment
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = ['Overview', 'Vendor Portfolio', 'Assessments', 'Risk Register'] as const;
type Tab = typeof TABS[number];

export function VendorsView() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<Tier | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'All'>('All');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'All'>('All');

  const stats = useMemo(() => {
    const t1 = VENDORS.filter(v => v.tier === 'Tier 1').length;
    const t2 = VENDORS.filter(v => v.tier === 'Tier 2').length;
    const t3 = VENDORS.filter(v => v.tier === 'Tier 3').length;
    const compliant = VENDORS.filter(v => v.complianceStatus === 'Compliant').length;
    const highRisk = VENDORS.filter(v => v.residualRisk === 'Critical' || v.residualRisk === 'High').length;
    const totalFindings = VENDORS.reduce((s, v) => s + v.openFindings, 0);
    return { t1, t2, t3, compliant, highRisk, totalFindings };
  }, []);

  const filteredVendors = useMemo(() => VENDORS.filter(v => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTier !== 'All' && v.tier !== filterTier) return false;
    if (filterStatus !== 'All' && v.complianceStatus !== filterStatus) return false;
    if (filterRisk !== 'All' && v.residualRisk !== filterRisk) return false;
    return true;
  }), [search, filterTier, filterStatus, filterRisk]);

  const riskRankingData = [...VENDORS]
    .sort((a, b) => a.securityScore - b.securityScore)
    .slice(0, 7)
    .map(v => ({ name: v.name.split(' ')[0], score: v.securityScore, fill: v.securityScore >= 80 ? '#10b981' : v.securityScore >= 65 ? '#f59e0b' : '#ef4444' }));

  const overdueCount = ASSESSMENTS.filter(a => a.status === 'Overdue').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Third-Party Risk Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Vendor lifecycle governance, risk scoring, and due diligence management.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Onboard Vendor
        </button>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Vendors', value: VENDORS.length, icon: Package, color: 'text-blue-500' },
          { label: 'Tier 1 — Critical', value: stats.t1, icon: ShieldAlert, color: 'text-red-500' },
          { label: 'Tier 2 — High', value: stats.t2, icon: ShieldAlert, color: 'text-orange-400' },
          { label: 'Tier 3 — Standard', value: stats.t3, icon: ShieldAlert, color: 'text-blue-400' },
          { label: 'High Risk Vendors', value: stats.highRisk, icon: AlertTriangle, color: 'text-red-500', alert: stats.highRisk > 0 },
          { label: 'Open Findings', value: stats.totalFindings, icon: AlertCircle, color: 'text-amber-500', alert: stats.totalFindings > 5 },
        ].map((s, i) => (
          <div key={i} className={cn('glass-card p-4 flex flex-col gap-2', s.alert ? 'border-red-200 dark:border-red-900/40' : '')}>
            <div className="flex items-center gap-2">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">{s.label}</p>
            </div>
            <p className={cn('text-3xl font-black leading-none', s.alert ? 'text-red-500' : 'text-slate-900 dark:text-white')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn('px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t
                ? 'bg-white dark:bg-aegis-surface text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}>
            {t}
            {t === 'Assessments' && overdueCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[7px]">{overdueCount}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskHeatMap vendors={VENDORS} />

              {/* Vendor Security Score Ranking */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Security Score Ranking</h3>
                  <span className="ml-auto text-[9px] text-slate-400 font-bold uppercase tracking-widest">Lowest first</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={riskRankingData} layout="vertical" margin={{ left: 8, right: 16 }} style={{ background: 'transparent' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} width={52} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(v: number) => [v + '/100', 'Security Score']}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {riskRankingData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Risk Vendors Table */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Highest Residual Risk</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-aegis-border">
                      {['Vendor', 'Tier', 'Inherent Risk', 'Residual Risk', 'Score', 'Status', 'Trend', 'Findings'].map(h => (
                        <th key={h} className="text-left pb-3 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...VENDORS].sort((a, b) => {
                      const order: Record<RiskLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
                      return order[a.residualRisk] - order[b.residualRisk];
                    }).slice(0, 5).map(v => (
                      <tr key={v.id} className="border-b border-slate-50 dark:border-aegis-border/50 hover:bg-slate-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setSelectedVendor(v)}>
                        <td className="py-3 pr-4">
                          <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                          <div className="text-[9px] text-slate-400">{v.category}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border', TIER_CFG[v.tier].bg, TIER_CFG[v.tier].color)}>{v.tier}</span>
                        </td>
                        <td className="py-3 pr-4"><RiskBadge level={v.inherentRisk} /></td>
                        <td className="py-3 pr-4"><RiskBadge level={v.residualRisk} /></td>
                        <td className="py-3 pr-4 w-24"><ScoreBar score={v.securityScore} /></td>
                        <td className="py-3 pr-4">
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', STATUS_CFG[v.complianceStatus].bg, STATUS_CFG[v.complianceStatus].text)}>{v.complianceStatus}</span>
                        </td>
                        <td className="py-3 pr-4"><TrendIcon trend={v.riskTrend} /></td>
                        <td className="py-3">
                          <span className={cn('font-black', v.criticalFindings > 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-400')}>{v.openFindings}</span>
                          {v.criticalFindings > 0 && <span className="text-[8px] text-red-400 ml-1">({v.criticalFindings} crit)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── VENDOR PORTFOLIO TAB ─────────────────────────────────────────── */}
        {activeTab === 'Vendor Portfolio' && (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search vendors..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <select value={filterTier} onChange={e => setFilterTier(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="All">All Tiers</option>
                <option>Tier 1</option><option>Tier 2</option><option>Tier 3</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="All">All Statuses</option>
                <option>Compliant</option><option>Non-Compliant</option><option>Pending</option><option>Under Review</option>
              </select>
              <select value={filterRisk} onChange={e => setFilterRisk(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="All">All Risk Levels</option>
                <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
              </select>
              <span className="text-[10px] text-slate-400 font-bold">{filteredVendors.length} vendors</span>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/5">
                    {['Vendor', 'Category', 'Tier', 'Security Score', 'Inherent', 'Residual', 'Status', 'Next Review', 'Findings', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map(v => (
                    <tr key={v.id} className="border-b border-slate-50 dark:border-aegis-border/40 hover:bg-slate-50/80 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedVendor(v)}>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                        <div className="text-[9px] font-mono text-slate-400">{v.id}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{v.category}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border', TIER_CFG[v.tier].bg, TIER_CFG[v.tier].color)}>{v.tier}</span>
                      </td>
                      <td className="px-4 py-3.5 w-28"><ScoreBar score={v.securityScore} /></td>
                      <td className="px-4 py-3.5"><RiskBadge level={v.inherentRisk} /></td>
                      <td className="px-4 py-3.5"><RiskBadge level={v.residualRisk} /></td>
                      <td className="px-4 py-3.5">
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', STATUS_CFG[v.complianceStatus].bg, STATUS_CFG[v.complianceStatus].text)}>
                          {v.complianceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{v.nextReview}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn('font-black text-sm', v.criticalFindings > 0 ? 'text-red-500' : v.openFindings > 0 ? 'text-amber-500' : 'text-emerald-500')}>
                          {v.openFindings}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── ASSESSMENTS TAB ──────────────────────────────────────────────── */}
        {activeTab === 'Assessments' && (
          <motion.div key="assessments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['Overdue', 'Due Soon', 'Scheduled'] as const).map(status => {
                const items = ASSESSMENTS.filter(a => a.status === status || (status === 'Scheduled' && (a.status === 'Scheduled' || a.status === 'In Progress')));
                const cfg = ASSMT_CFG[status];
                return (
                  <div key={status} className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                      <h3 className={cn('text-sm font-black uppercase tracking-widest', cfg.text)}>{status}</h3>
                      <span className={cn('ml-auto px-2 py-0.5 rounded-full text-[9px] font-black', cfg.bg, cfg.text)}>{items.length}</span>
                    </div>
                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No items</p>
                      ) : items.map(a => (
                        <div key={a.id} className="p-3 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{a.vendorName}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{a.type}</p>
                            </div>
                            <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border', TIER_CFG[a.tier].bg, TIER_CFG[a.tier].color)}>{a.tier}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] text-slate-500 flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{a.dueDate}</span>
                            <span className="text-[9px] text-slate-400">{a.assignee}</span>
                          </div>
                          {a.completion > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between mb-1">
                                <span className="text-[8px] text-slate-400">Progress</span>
                                <span className="text-[8px] font-bold text-blue-500">{a.completion}%</span>
                              </div>
                              <div className="h-1 bg-slate-100 dark:bg-white/10 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${a.completion}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── RISK REGISTER TAB ────────────────────────────────────────────── */}
        {activeTab === 'Risk Register' && (
          <motion.div key="register" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Open findings consolidated across all vendors, ordered by residual risk severity.</p>
            <div className="space-y-3">
              {[...VENDORS]
                .filter(v => v.openFindings > 0)
                .sort((a, b) => {
                  const o: Record<RiskLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
                  if (o[a.residualRisk] !== o[b.residualRisk]) return o[a.residualRisk] - o[b.residualRisk];
                  return b.openFindings - a.openFindings;
                })
                .map(v => (
                  <div key={v.id} className="glass-card p-5 flex items-center gap-5 cursor-pointer hover:border-blue-500/40 transition-colors"
                    onClick={() => { setSelectedVendor(v); }}>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{v.name}</span>
                        <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border', TIER_CFG[v.tier].bg, TIER_CFG[v.tier].color)}>{v.tier}</span>
                      </div>
                      <p className="text-[9px] text-slate-400">{v.category} · Owner: {v.owner}</p>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Residual</p>
                        <div className="mt-1"><RiskBadge level={v.residualRisk} /></div>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{v.openFindings}</p>
                      </div>
                      {v.criticalFindings > 0 && (
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Critical</p>
                          <p className="text-2xl font-black text-red-500">{v.criticalFindings}</p>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Detail Panel */}
      <AnimatePresence>
        {selectedVendor && (
          <VendorDetail vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
