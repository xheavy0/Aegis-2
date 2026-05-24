import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus, Search, Plus, X,
  Shield, DollarSign, Activity, CheckCircle2, Clock, User, ChevronRight,
  BarChart2, Target, ArrowUpRight, FileText, Layers, Tag
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '@/src/types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskCategory = 'Cyber' | 'Operational' | 'Financial' | 'Compliance' | 'Strategic' | 'Reputational';
type RiskTreatment = 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';
type RiskStatus = 'Open' | 'Mitigating' | 'Accepted' | 'Transferred' | 'Closed';
type RiskTrend = 'Increasing' | 'Stable' | 'Decreasing';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  owner: string;
  inherentLikelihood: number; // 1-5
  inherentImpact: number;     // 1-5
  residualLikelihood: number;
  residualImpact: number;
  treatment: RiskTreatment;
  treatmentProgress: number; // 0-100
  status: RiskStatus;
  dateIdentified: string;
  reviewDate: string;
  financialExposure: number;
  riskTrend: RiskTrend;
  treatmentPlan: string;
  linkedControls: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const RISKS: Risk[] = [
  {
    id: 'R-101', title: 'Ransomware Attack on Cloud Infrastructure', category: 'Cyber',
    description: 'Adversarial encryption of production cloud workloads could halt all operations and result in significant data loss and regulatory penalties.',
    owner: 'Alex C.', inherentLikelihood: 4, inherentImpact: 5, residualLikelihood: 2, residualImpact: 5,
    treatment: 'Mitigate', treatmentProgress: 65, status: 'Mitigating',
    dateIdentified: '2025-09-01', reviewDate: '2026-06-01', financialExposure: 1200000, riskTrend: 'Stable',
    treatmentPlan: 'Deploy immutable backup strategy, enhanced EDR tooling, network segmentation, and incident response runbooks.',
    linkedControls: 8,
  },
  {
    id: 'R-102', title: 'Third-Party Data Breach via Supplier Access', category: 'Operational',
    description: 'A compromised Tier 1 vendor with access to customer PII could result in a significant data breach and GDPR enforcement action.',
    owner: 'Sarah L.', inherentLikelihood: 3, inherentImpact: 5, residualLikelihood: 2, residualImpact: 3,
    treatment: 'Transfer', treatmentProgress: 80, status: 'Mitigating',
    dateIdentified: '2025-10-12', reviewDate: '2026-06-15', financialExposure: 850000, riskTrend: 'Decreasing',
    treatmentPlan: 'Cyber insurance policy updated to include supply chain. Vendor MFA enforcement and data access minimisation.',
    linkedControls: 5,
  },
  {
    id: 'R-103', title: 'GDPR / Data Protection Regulatory Non-Compliance', category: 'Compliance',
    description: 'Gaps in data retention, consent management, and cross-border transfer safeguards expose the organisation to significant fines.',
    owner: 'Alex C.', inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 1, residualImpact: 3,
    treatment: 'Mitigate', treatmentProgress: 90, status: 'Mitigating',
    dateIdentified: '2025-06-05', reviewDate: '2026-07-01', financialExposure: 400000, riskTrend: 'Decreasing',
    treatmentPlan: 'DPA updated, Privacy by Design training rolled out, cross-border SCCs reviewed by legal.',
    linkedControls: 12,
  },
  {
    id: 'R-104', title: 'Malicious Insider Threat — Privileged Access Abuse', category: 'Cyber',
    description: 'A disgruntled or compromised insider with privileged access could exfiltrate sensitive data or sabotage systems.',
    owner: 'David M.', inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3,
    treatment: 'Mitigate', treatmentProgress: 45, status: 'Mitigating',
    dateIdentified: '2025-11-20', reviewDate: '2026-05-20', financialExposure: 320000, riskTrend: 'Increasing',
    treatmentPlan: 'Privileged Access Management (PAM) deployment underway. User Behaviour Analytics (UBA) in evaluation.',
    linkedControls: 6,
  },
  {
    id: 'R-105', title: 'Critical Supplier Business Continuity Failure', category: 'Operational',
    description: 'Single-source dependency on key cloud providers. If a primary IaaS provider fails, core services could be unavailable for extended periods.',
    owner: 'Alex C.', inherentLikelihood: 2, inherentImpact: 5, residualLikelihood: 1, residualImpact: 4,
    treatment: 'Mitigate', treatmentProgress: 55, status: 'Mitigating',
    dateIdentified: '2025-08-10', reviewDate: '2026-08-10', financialExposure: 680000, riskTrend: 'Stable',
    treatmentPlan: 'Multi-cloud architecture roadmap approved. Pilot of redundant DR environment in Azure underway.',
    linkedControls: 4,
  },
  {
    id: 'R-106', title: 'Unpatched Critical CVEs in Production Systems', category: 'Cyber',
    description: 'Known critical vulnerabilities in production infrastructure that have not yet been patched due to change freeze constraints.',
    owner: 'David M.', inherentLikelihood: 4, inherentImpact: 4, residualLikelihood: 3, residualImpact: 3,
    treatment: 'Mitigate', treatmentProgress: 40, status: 'Open',
    dateIdentified: '2026-02-14', reviewDate: '2026-05-14', financialExposure: 210000, riskTrend: 'Increasing',
    treatmentPlan: 'Patch management sprint initiated. Compensating controls (WAF, IPS rules) deployed pending patch window.',
    linkedControls: 3,
  },
  {
    id: 'R-107', title: 'Financial Fraud via Payment System Manipulation', category: 'Financial',
    description: 'Fraudulent manipulation of payment flows through social engineering or BEC targeting finance staff.',
    owner: 'Elena R.', inherentLikelihood: 2, inherentImpact: 3, residualLikelihood: 1, residualImpact: 2,
    treatment: 'Accept', treatmentProgress: 100, status: 'Accepted',
    dateIdentified: '2025-04-01', reviewDate: '2026-04-01', financialExposure: 75000, riskTrend: 'Stable',
    treatmentPlan: 'Dual-authorisation enforced for transactions above threshold. Risk accepted within appetite; insurance cover in place.',
    linkedControls: 7,
  },
  {
    id: 'R-108', title: 'AI Model Bias Resulting in Regulatory Scrutiny', category: 'Strategic',
    description: 'AI-based decision tools used in customer profiling may introduce bias, triggering regulatory investigation and reputational damage.',
    owner: 'Elena R.', inherentLikelihood: 2, inherentImpact: 3, residualLikelihood: 1, residualImpact: 2,
    treatment: 'Transfer', treatmentProgress: 70, status: 'Mitigating',
    dateIdentified: '2026-01-08', reviewDate: '2026-07-08', financialExposure: 180000, riskTrend: 'Stable',
    treatmentPlan: 'AI Governance policy drafted. Bias audits contracted to specialist external firm. Model cards introduced.',
    linkedControls: 2,
  },
  {
    id: 'R-109', title: 'Key Person Dependency — Security Leadership', category: 'Strategic',
    description: 'Critical institutional knowledge and programme ownership concentrated in one or two individuals. Departure risk is high.',
    owner: 'Sarah L.', inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 2,
    treatment: 'Mitigate', treatmentProgress: 30, status: 'Open',
    dateIdentified: '2025-12-01', reviewDate: '2026-06-01', financialExposure: 90000, riskTrend: 'Increasing',
    treatmentPlan: 'Succession planning programme initiated. Knowledge base documentation being formalised.',
    linkedControls: 1,
  },
  {
    id: 'R-110', title: 'DDoS Attack Causing Service Unavailability', category: 'Cyber',
    description: 'Volumetric DDoS targeting public-facing services could cause prolonged outages and SLA breaches.',
    owner: 'David M.', inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 1, residualImpact: 3,
    treatment: 'Mitigate', treatmentProgress: 60, status: 'Mitigating',
    dateIdentified: '2025-07-22', reviewDate: '2026-07-22', financialExposure: 150000, riskTrend: 'Stable',
    treatmentPlan: 'CDN-based DDoS scrubbing deployed. Rate limiting and geo-blocking configured. Runbook tested quarterly.',
    linkedControls: 5,
  },
  {
    id: 'R-111', title: 'Data Residency Non-Compliance — Cross-Border Transfers', category: 'Compliance',
    description: 'Data processed by US-based analytics sub-processors may violate EU data residency obligations under GDPR Article 44.',
    owner: 'Alex C.', inherentLikelihood: 2, inherentImpact: 4, residualLikelihood: 1, residualImpact: 2,
    treatment: 'Mitigate', treatmentProgress: 85, status: 'Mitigating',
    dateIdentified: '2025-03-14', reviewDate: '2026-03-14', financialExposure: 220000, riskTrend: 'Decreasing',
    treatmentPlan: 'SCCs executed with all affected vendors. Data flow mapping completed. DPA review ongoing.',
    linkedControls: 9,
  },
  {
    id: 'R-112', title: 'Reputational Damage from Public Security Incident', category: 'Reputational',
    description: 'A publicly disclosed breach or compliance failure could erode customer trust, trigger media coverage, and impact revenue.',
    owner: 'Sarah L.', inherentLikelihood: 2, inherentImpact: 4, residualLikelihood: 1, residualImpact: 3,
    treatment: 'Mitigate', treatmentProgress: 50, status: 'Open',
    dateIdentified: '2026-01-20', reviewDate: '2026-07-20', financialExposure: 350000, riskTrend: 'Stable',
    treatmentPlan: 'Crisis comms playbook drafted. PR firm on retainer. Board-level cyber briefing cadence established.',
    linkedControls: 3,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SCORE_LABEL: Record<number, string> = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High' };
const L_LABEL: Record<number, string> = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely', 5: 'Almost Certain' };
const I_LABEL: Record<number, string> = { 1: 'Negligible', 2: 'Minor', 3: 'Moderate', 4: 'Major', 5: 'Severe' };

function riskScore(l: number, i: number) { return l * i; }

function riskLevel(score: number): { label: string; bg: string; text: string; border: string } {
  if (score >= 16) return { label: 'Critical', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
  if (score >= 9)  return { label: 'High',     bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
  if (score >= 4)  return { label: 'Medium',   bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
  return              { label: 'Low',      bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
}

function RiskBadge({ l, i }: { l: number; i: number }) {
  const s = riskScore(l, i);
  const r = riskLevel(s);
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border', r.bg, r.text, r.border)}>
      {r.label} <span className="opacity-60">({s})</span>
    </span>
  );
}

const TREATMENT_CFG: Record<RiskTreatment, { bg: string; text: string; icon: React.FC<any> }> = {
  Mitigate: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',    text: 'text-blue-600 dark:text-blue-400',    icon: Shield },
  Accept:   { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400',   icon: CheckCircle2 },
  Transfer: { bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400', icon: ArrowUpRight },
  Avoid:    { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',         text: 'text-red-600 dark:text-red-400',       icon: X },
};

const STATUS_CFG: Record<RiskStatus, { bg: string; text: string }> = {
  Open:        { bg: 'bg-slate-100 dark:bg-white/10', text: 'text-slate-600 dark:text-slate-300' },
  Mitigating:  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  Accepted:    { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  Transferred: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  Closed:      { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
};

const CAT_COLORS: Record<RiskCategory, string> = {
  Cyber:        '#3b82f6',
  Operational:  '#f59e0b',
  Financial:    '#10b981',
  Compliance:   '#6366f1',
  Strategic:    '#8b5cf6',
  Reputational: '#ec4899',
};

function TrendIcon({ t }: { t: RiskTrend }) {
  if (t === 'Increasing') return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
  if (t === 'Decreasing') return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

// ─── Heat Map ─────────────────────────────────────────────────────────────────

function DualHeatMap({ risks }: { risks: Risk[] }) {
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];

  const getCellBg = (i: number, l: number) => {
    const s = i * l;
    if (s >= 16) return 'bg-red-500/25 border-red-500/40';
    if (s >= 9)  return 'bg-orange-400/25 border-orange-400/40';
    if (s >= 4)  return 'bg-amber-400/25 border-amber-400/40';
    return 'bg-emerald-500/20 border-emerald-500/30';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Risk Heat Map</h3>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col justify-center items-center w-4">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest -rotate-90 whitespace-nowrap">Likelihood</span>
        </div>
        <div className="flex-1">
          {likelihoods.map(l => (
            <div key={l} className="flex gap-1 mb-1">
              <div className="w-14 flex-shrink-0 flex items-center justify-end pr-2">
                <span className="text-[8px] font-bold text-slate-400 text-right">{L_LABEL[l]}</span>
              </div>
              {impacts.map(i => {
                const inherent = risks.filter(r => r.inherentImpact === i && r.inherentLikelihood === l);
                const residual = risks.filter(r => r.residualImpact === i && r.residualLikelihood === l);
                return (
                  <div key={i} className={cn('relative flex-1 h-11 rounded border flex items-center justify-center gap-0.5', getCellBg(i, l))}>
                    {inherent.map(r => (
                      <div key={r.id} title={`${r.id} (Inherent)`}
                        className="w-4 h-4 rounded-full bg-red-500 border-2 border-white/50 flex items-center justify-center text-[6px] font-black text-white cursor-pointer"
                        style={{ fontSize: '6px' }}>
                        {r.id.replace('R-', '')}
                      </div>
                    ))}
                    {residual.map(r => (
                      <div key={r.id + 'r'} title={`${r.id} (Residual)`}
                        className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white/50 flex items-center justify-center text-[6px] font-black text-white cursor-pointer"
                        style={{ fontSize: '6px' }}>
                        {r.id.replace('R-', '')}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex gap-1 mt-2">
            <div className="w-14 flex-shrink-0" />
            {impacts.map(i => (
              <div key={i} className="flex-1 text-center text-[8px] font-bold text-slate-400">{I_LABEL[i]}</div>
            ))}
          </div>
          <div className="text-center mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">← Impact →</div>
        </div>
      </div>
      <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100 dark:border-aegis-border">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-[9px] font-bold text-slate-500">Inherent Risk</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-[9px] font-bold text-slate-500">Residual Risk</span></div>
      </div>
    </div>
  );
}

// ─── Risk Detail Panel ────────────────────────────────────────────────────────

function RiskDetail({ risk, onClose, onUpdate }: { risk: Risk; onClose: () => void; onUpdate: (r: Risk) => void }) {
  const inherentScore = riskScore(risk.inherentLikelihood, risk.inherentImpact);
  const residualScore = riskScore(risk.residualLikelihood, risk.residualImpact);
  const inhLevel = riskLevel(inherentScore);
  const resLevel = riskLevel(residualScore);
  const tc = TREATMENT_CFG[risk.treatment];
  const TreatIcon = tc.icon;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" />
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-aegis-surface shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-aegis-border">
        {/* Header */}
        <div className={cn('px-6 py-5 border-b border-slate-100 dark:border-aegis-border',
          inherentScore >= 16 ? 'bg-red-50/50 dark:bg-red-900/10' :
          inherentScore >= 9  ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'bg-slate-50/50 dark:bg-white/5')}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white mt-0.5 flex-shrink-0',
                inherentScore >= 16 ? 'bg-red-600' : inherentScore >= 9 ? 'bg-orange-500' : 'bg-amber-500')}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{risk.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono text-slate-400">{risk.id}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[9px] text-slate-400 font-bold">{risk.category}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 flex-shrink-0 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest', STATUS_CFG[risk.status].bg, STATUS_CFG[risk.status].text)}>{risk.status}</span>
            <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1', tc.bg, tc.text)}>
              <TreatIcon className="w-2.5 h-2.5" />{risk.treatment}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <TrendIcon t={risk.riskTrend} />
              <span className={cn('text-[9px] font-bold', risk.riskTrend === 'Increasing' ? 'text-red-500' : risk.riskTrend === 'Decreasing' ? 'text-emerald-500' : 'text-slate-400')}>{risk.riskTrend}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{risk.description}</p>

          {/* Inherent vs Residual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Inherent Risk</p>
              <div className="flex items-end gap-2 mb-2">
                <span className={cn('text-2xl font-black', inhLevel.text)}>{inherentScore}</span>
                <span className="text-xs text-slate-400 mb-0.5">/ 25</span>
              </div>
              <RiskBadge l={risk.inherentLikelihood} i={risk.inherentImpact} />
              <div className="mt-2 space-y-1">
                <p className="text-[9px] text-slate-400">Likelihood: <span className="font-bold text-slate-600 dark:text-slate-300">{L_LABEL[risk.inherentLikelihood]}</span></p>
                <p className="text-[9px] text-slate-400">Impact: <span className="font-bold text-slate-600 dark:text-slate-300">{I_LABEL[risk.inherentImpact]}</span></p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Residual Risk</p>
              <div className="flex items-end gap-2 mb-2">
                <span className={cn('text-2xl font-black', resLevel.text)}>{residualScore}</span>
                <span className="text-xs text-slate-400 mb-0.5">/ 25</span>
              </div>
              <RiskBadge l={risk.residualLikelihood} i={risk.residualImpact} />
              <div className="mt-2 space-y-1">
                <p className="text-[9px] text-slate-400">Likelihood: <span className="font-bold text-slate-600 dark:text-slate-300">{L_LABEL[risk.residualLikelihood]}</span></p>
                <p className="text-[9px] text-slate-400">Impact: <span className="font-bold text-slate-600 dark:text-slate-300">{I_LABEL[risk.residualImpact]}</span></p>
              </div>
            </div>
          </div>

          {/* Treatment Progress */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Treatment Progress</p>
              <span className="text-sm font-black text-blue-500">{risk.treatmentProgress}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${risk.treatmentProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                className={cn('h-full rounded-full', risk.treatmentProgress >= 80 ? 'bg-emerald-500' : risk.treatmentProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500')} />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{risk.treatmentPlan}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Owner', value: risk.owner, icon: User },
              { label: 'Financial Exposure', value: `$${(risk.financialExposure / 1000).toFixed(0)}k`, icon: DollarSign },
              { label: 'Date Identified', value: risk.dateIdentified, icon: Clock },
              { label: 'Next Review', value: risk.reviewDate, icon: Clock },
              { label: 'Linked Controls', value: String(risk.linkedControls), icon: Shield },
              { label: 'Category', value: risk.category, icon: Tag },
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
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-aegis-border flex gap-3">
          <button onClick={() => { onUpdate({ ...risk, status: 'Mitigating' }); onClose(); }}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
            Update Treatment
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

interface RiskViewProps {
  onNotify: (notification: Omit<any, 'id' | 'createdAt' | 'read'>) => void;
}

const TABS = ['Overview', 'Risk Register', 'Treatment Plans', 'Heat Map'] as const;
type Tab = typeof TABS[number];

export function RiskView({ onNotify }: RiskViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [risks, setRisks] = useState<Risk[]>(RISKS);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<RiskCategory | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<RiskStatus | 'All'>('All');

  const stats = useMemo(() => {
    const scores = risks.map(r => riskScore(r.inherentLikelihood, r.inherentImpact));
    const critical = risks.filter(r => riskScore(r.inherentLikelihood, r.inherentImpact) >= 16).length;
    const high     = risks.filter(r => { const s = riskScore(r.inherentLikelihood, r.inherentImpact); return s >= 9 && s < 16; }).length;
    const open     = risks.filter(r => r.status === 'Open' || r.status === 'Mitigating').length;
    const totalExposure = risks.reduce((s, r) => s + r.financialExposure, 0);
    const catData = ['Cyber', 'Operational', 'Financial', 'Compliance', 'Strategic', 'Reputational'].map(c => ({
      name: c, value: risks.filter(r => r.category === c).length, fill: CAT_COLORS[c as RiskCategory]
    })).filter(d => d.value > 0);
    return { critical, high, open, totalExposure, catData };
  }, [risks]);

  const filtered = useMemo(() => risks.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'All' && r.category !== filterCat) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  }), [risks, search, filterCat, filterStatus]);

  const exposureData = useMemo(() =>
    [...risks].sort((a, b) => b.financialExposure - a.financialExposure).slice(0, 8).map(r => ({
      name: r.id, value: Math.round(r.financialExposure / 1000),
      fill: riskScore(r.inherentLikelihood, r.inherentImpact) >= 16 ? '#ef4444' :
            riskScore(r.inherentLikelihood, r.inherentImpact) >= 9 ? '#f97316' : '#f59e0b'
    })), [risks]);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Risk Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Enterprise risk register with inherent & residual scoring, treatment tracking, and exposure analysis.</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Declare Risk</button>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Risks', value: risks.length, icon: Layers, color: 'text-blue-500' },
          { label: 'Critical / High', value: `${stats.critical} / ${stats.high}`, icon: AlertTriangle, color: 'text-red-500', alert: true },
          { label: 'Active (Open + Mitigating)', value: stats.open, icon: Activity, color: 'text-amber-500' },
          { label: 'Total Exposure', value: `$${(stats.totalExposure / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 flex flex-col gap-2">
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
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exposure by Risk */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Financial Exposure by Risk ($k)</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={exposureData} margin={{ left: 0, right: 8 }} style={{ background: 'transparent' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(v: number) => [`$${v}k`, 'Exposure']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {exposureData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Risk by Category */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Tag className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Risk Distribution by Category</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart style={{ background: 'transparent' }}>
                    <Pie data={stats.catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {stats.catData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Risks Table */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Highest Exposure Risks</h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-aegis-border">
                    {['Risk', 'Category', 'Inherent', 'Residual', 'Exposure', 'Treatment', 'Progress', 'Trend'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...risks].sort((a, b) => b.financialExposure - a.financialExposure).slice(0, 6).map(r => {
                    const tc = TREATMENT_CFG[r.treatment];
                    return (
                      <tr key={r.id} className="border-b border-slate-50 dark:border-aegis-border/50 hover:bg-slate-50/50 dark:hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedRisk(r)}>
                        <td className="py-3 pr-4"><div className="font-bold text-slate-900 dark:text-white text-xs">{r.title.substring(0, 40)}{r.title.length > 40 ? '…' : ''}</div><div className="text-[9px] font-mono text-slate-400">{r.id}</div></td>
                        <td className="py-3 pr-4"><span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: CAT_COLORS[r.category], background: CAT_COLORS[r.category] + '20' }}>{r.category}</span></td>
                        <td className="py-3 pr-4"><RiskBadge l={r.inherentLikelihood} i={r.inherentImpact} /></td>
                        <td className="py-3 pr-4"><RiskBadge l={r.residualLikelihood} i={r.residualImpact} /></td>
                        <td className="py-3 pr-4 font-black text-slate-700 dark:text-slate-300">${(r.financialExposure / 1000).toFixed(0)}k</td>
                        <td className="py-3 pr-4"><span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border', tc.bg, tc.text)}>{r.treatment}</span></td>
                        <td className="py-3 pr-4 w-20">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full"><div className={cn('h-full rounded-full', r.treatmentProgress >= 80 ? 'bg-emerald-500' : 'bg-blue-500')} style={{ width: `${r.treatmentProgress}%` }} /></div>
                            <span className="text-[9px] font-bold text-slate-500">{r.treatmentProgress}%</span>
                          </div>
                        </td>
                        <td className="py-3"><TrendIcon t={r.riskTrend} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── RISK REGISTER ─────────────────────────────────────────────────── */}
        {activeTab === 'Risk Register' && (
          <motion.div key="rr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search risks…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400" />
              </div>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="All">All Categories</option>
                {['Cyber','Operational','Financial','Compliance','Strategic','Reputational'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                <option value="All">All Statuses</option>
                {['Open','Mitigating','Accepted','Transferred','Closed'].map(s => <option key={s}>{s}</option>)}
              </select>
              <span className="text-[10px] text-slate-400 font-bold">{filtered.length} risks</span>
            </div>

            <div className="glass-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/5">
                    {['Risk', 'Category', 'Owner', 'Inherent', 'Residual', 'Exposure', 'Treatment', 'Status', 'Trend', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const tc = TREATMENT_CFG[r.treatment];
                    return (
                      <tr key={r.id} className="border-b border-slate-50 dark:border-aegis-border/40 hover:bg-slate-50/80 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setSelectedRisk(r)}>
                        <td className="px-4 py-3.5"><div className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{r.title}</div><div className="text-[9px] font-mono text-slate-400">{r.id}</div></td>
                        <td className="px-4 py-3.5"><span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: CAT_COLORS[r.category], background: CAT_COLORS[r.category] + '20' }}>{r.category}</span></td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{r.owner}</td>
                        <td className="px-4 py-3.5"><RiskBadge l={r.inherentLikelihood} i={r.inherentImpact} /></td>
                        <td className="px-4 py-3.5"><RiskBadge l={r.residualLikelihood} i={r.residualImpact} /></td>
                        <td className="px-4 py-3.5 font-black text-slate-700 dark:text-slate-300">${(r.financialExposure / 1000).toFixed(0)}k</td>
                        <td className="px-4 py-3.5"><span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border', tc.bg, tc.text)}>{r.treatment}</span></td>
                        <td className="px-4 py-3.5"><span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', STATUS_CFG[r.status].bg, STATUS_CFG[r.status].text)}>{r.status}</span></td>
                        <td className="px-4 py-3.5"><TrendIcon t={r.riskTrend} /></td>
                        <td className="px-4 py-3.5"><ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── TREATMENT PLANS ───────────────────────────────────────────────── */}
        {activeTab === 'Treatment Plans' && (
          <motion.div key="tp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {(['Mitigate', 'Transfer', 'Accept', 'Avoid'] as RiskTreatment[]).map(treatment => {
              const group = risks.filter(r => r.treatment === treatment);
              if (group.length === 0) return null;
              const tc = TREATMENT_CFG[treatment];
              const TIcon = tc.icon;
              return (
                <div key={treatment}>
                  <div className="flex items-center gap-2 mb-3">
                    <TIcon className={cn('w-4 h-4', tc.text.split(' ')[0])} />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{treatment}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black border ml-1', tc.bg, tc.text)}>{group.length} risks</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.map(r => (
                      <div key={r.id} className="glass-card p-5 cursor-pointer hover:border-blue-500/40 transition-colors"
                        onClick={() => setSelectedRisk(r)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-xs leading-tight">{r.title}</div>
                            <div className="text-[9px] font-mono text-slate-400 mt-0.5">{r.id} · {r.category}</div>
                          </div>
                          <TrendIcon t={r.riskTrend} />
                        </div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Treatment Progress</span>
                          <span className={cn('text-xs font-black', r.treatmentProgress >= 80 ? 'text-emerald-500' : r.treatmentProgress >= 50 ? 'text-blue-500' : 'text-amber-500')}>{r.treatmentProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mb-3">
                          <div className={cn('h-full rounded-full', r.treatmentProgress >= 80 ? 'bg-emerald-500' : r.treatmentProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: `${r.treatmentProgress}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{r.treatmentPlan}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-aegis-border">
                          <div className="flex items-center gap-1.5"><User className="w-3 h-3 text-slate-400" /><span className="text-[9px] text-slate-400 font-bold">{r.owner}</span></div>
                          <div className="flex items-center gap-2">
                            <RiskBadge l={r.residualLikelihood} i={r.residualImpact} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── HEAT MAP ──────────────────────────────────────────────────────── */}
        {activeTab === 'Heat Map' && (
          <motion.div key="hm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <DualHeatMap risks={risks} />
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Critical (≥16)', count: risks.filter(r => riskScore(r.inherentLikelihood, r.inherentImpact) >= 16).length, color: 'bg-red-500' },
                { label: 'High (9–15)', count: risks.filter(r => { const s = riskScore(r.inherentLikelihood, r.inherentImpact); return s >= 9 && s < 16; }).length, color: 'bg-orange-500' },
                { label: 'Medium (4–8)', count: risks.filter(r => { const s = riskScore(r.inherentLikelihood, r.inherentImpact); return s >= 4 && s < 9; }).length, color: 'bg-amber-500' },
                { label: 'Low (1–3)', count: risks.filter(r => riskScore(r.inherentLikelihood, r.inherentImpact) < 4).length, color: 'bg-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="glass-card p-4 flex items-center gap-3">
                  <div className={cn('w-2 h-8 rounded-full', item.color)} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedRisk && (
          <RiskDetail risk={selectedRisk} onClose={() => setSelectedRisk(null)}
            onUpdate={updated => { setRisks(prev => prev.map(r => r.id === updated.id ? updated : r)); setSelectedRisk(updated); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
