import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, CheckCircle2, Clock, Zap,
  RefreshCw, Settings2, Plus, ChevronRight, ExternalLink,
  Shield, Database, Users, Code2, Monitor, Bug,
  Ticket, MessageSquare, GraduationCap, KeyRound,
  Activity, Cloud, ArrowRight, Sparkles, Filter,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type Status = 'connected' | 'disconnected' | 'syncing' | 'error' | 'coming_soon';
type Category =
  | 'All' | 'Cloud' | 'Identity' | 'HRIS' | 'Developer'
  | 'Endpoint' | 'Vulnerability' | 'Ticketing' | 'Communication'
  | 'Training' | 'Password' | 'SIEM' | 'Other';

interface Integration {
  id: string;
  name: string;
  provider: string;
  category: Exclude<Category, 'All'>;
  description: string;
  logo: string;
  color: string;
  status: Status;
  lastSync?: string;
  evidenceCount?: number;
  syncFrequency?: string;
  type: 'native' | 'partner' | 'new';
  controlsMapped?: number;
}

const INTEGRATIONS: Integration[] = [
  // Cloud
  { id: 'aws', name: 'Amazon AWS', provider: 'Amazon', category: 'Cloud', description: 'Collect evidence from EC2, S3, IAM, CloudTrail, GuardDuty, and 40+ services.', logo: 'AWS', color: 'bg-orange-500', status: 'connected', lastSync: '2 min ago', evidenceCount: 12840, syncFrequency: 'Every 5 min', type: 'native', controlsMapped: 94 },
  { id: 'gcp', name: 'Google Cloud', provider: 'Google', category: 'Cloud', description: 'Monitor GCP resources, IAM policies, audit logs and security command center.', logo: 'GCP', color: 'bg-blue-500', status: 'connected', lastSync: '4 min ago', evidenceCount: 7210, syncFrequency: 'Every 5 min', type: 'native', controlsMapped: 78 },
  { id: 'azure', name: 'Microsoft Azure', provider: 'Microsoft', category: 'Cloud', description: 'Azure AD, Security Center, resource inventory, and policy compliance.', logo: 'Az', color: 'bg-sky-600', status: 'connected', lastSync: '6 min ago', evidenceCount: 9340, syncFrequency: 'Every 10 min', type: 'native', controlsMapped: 86 },
  { id: 'digitalocean', name: 'DigitalOcean', provider: 'DigitalOcean', category: 'Cloud', description: 'Droplets, Spaces, VPCs, and firewall rule evidence collection.', logo: 'DO', color: 'bg-blue-400', status: 'disconnected', type: 'native' },
  { id: 'heroku', name: 'Heroku', provider: 'Salesforce', category: 'Cloud', description: 'App configs, dyno metadata, add-on inventory.', logo: 'H', color: 'bg-purple-600', status: 'coming_soon', type: 'partner' },

  // Identity
  { id: 'okta', name: 'Okta', provider: 'Okta Inc.', category: 'Identity', description: 'User provisioning, MFA status, group policies, and access reviews.', logo: 'Ok', color: 'bg-blue-600', status: 'connected', lastSync: '8 min ago', evidenceCount: 4102, syncFrequency: 'Every 10 min', type: 'native', controlsMapped: 42 },
  { id: 'azure-ad', name: 'Azure Active Directory', provider: 'Microsoft', category: 'Identity', description: 'Directory users, privileged roles, conditional access policies.', logo: 'AD', color: 'bg-sky-500', status: 'connected', lastSync: '11 min ago', evidenceCount: 3890, syncFrequency: 'Every 10 min', type: 'native', controlsMapped: 38 },
  { id: 'google-ws', name: 'Google Workspace', provider: 'Google', category: 'Identity', description: 'Google Directory, OAuth apps, admin activity, 2-step verification.', logo: 'GW', color: 'bg-emerald-500', status: 'connected', lastSync: '5 min ago', evidenceCount: 2150, syncFrequency: 'Every 10 min', type: 'native', controlsMapped: 31 },
  { id: 'auth0', name: 'Auth0', provider: 'Okta', category: 'Identity', description: 'Authentication logs, MFA enforcement, application access policies.', logo: 'A0', color: 'bg-indigo-600', status: 'disconnected', type: 'native' },
  { id: 'ping', name: 'PingIdentity', provider: 'Ping Identity', category: 'Identity', description: 'SSO sessions, entitlement review, policy enforcement evidence.', logo: 'Pi', color: 'bg-red-500', status: 'coming_soon', type: 'partner' },

  // HRIS
  { id: 'workday', name: 'Workday', provider: 'Workday', category: 'HRIS', description: 'Employee lifecycle, onboarding/offboarding workflows, org chart.', logo: 'Wd', color: 'bg-teal-600', status: 'connected', lastSync: '1h ago', evidenceCount: 1820, syncFrequency: 'Daily', type: 'native', controlsMapped: 22 },
  { id: 'bamboohr', name: 'BambooHR', provider: 'Rippling', category: 'HRIS', description: 'Headcount, terminations, training completion tracking.', logo: 'B', color: 'bg-green-600', status: 'disconnected', type: 'native' },
  { id: 'rippling', name: 'Rippling', provider: 'Rippling', category: 'HRIS', description: 'Unified HR + IT: device management, app provisioning, payroll data.', logo: 'Rp', color: 'bg-yellow-500', status: 'disconnected', type: 'native' },
  { id: 'adp', name: 'ADP Workforce', provider: 'ADP', category: 'HRIS', description: 'Payroll records, hire/term dates, compliance training.', logo: 'AP', color: 'bg-red-600', status: 'coming_soon', type: 'partner' },
  { id: 'hibob', name: 'HiBob', provider: 'HiBob', category: 'HRIS', description: 'Employee records, job changes, time off and leave management.', logo: 'Hb', color: 'bg-pink-500', status: 'coming_soon', type: 'partner' },

  // Developer
  { id: 'github', name: 'GitHub', provider: 'Microsoft', category: 'Developer', description: 'Branch protection, code review, secret scanning, GHAS alerts.', logo: 'GH', color: 'bg-slate-800', status: 'connected', lastSync: '3 min ago', evidenceCount: 6540, syncFrequency: 'Every 5 min', type: 'native', controlsMapped: 57 },
  { id: 'gitlab', name: 'GitLab', provider: 'GitLab', category: 'Developer', description: 'MR approvals, pipeline security scans, dependency audits.', logo: 'GL', color: 'bg-orange-600', status: 'disconnected', type: 'native' },
  { id: 'jira', name: 'Jira', provider: 'Atlassian', category: 'Developer', description: 'Vulnerability ticket SLA tracking, change management evidence.', logo: 'Ji', color: 'bg-blue-500', status: 'connected', lastSync: '15 min ago', evidenceCount: 2310, syncFrequency: 'Every 15 min', type: 'native', controlsMapped: 18 },
  { id: 'linear', name: 'Linear', provider: 'Linear', category: 'Developer', description: 'Issue tracking, security sprint evidence, risk item closure.', logo: 'Li', color: 'bg-violet-600', status: 'disconnected', type: 'native' },
  { id: 'snyk', name: 'Snyk', provider: 'Snyk', category: 'Developer', description: 'Open-source vulnerabilities, container scanning, IaC misconfigs.', logo: 'Sn', color: 'bg-purple-700', status: 'connected', lastSync: '20 min ago', evidenceCount: 1890, syncFrequency: 'Every 30 min', type: 'native', controlsMapped: 24 },

  // Endpoint
  { id: 'crowdstrike', name: 'CrowdStrike', provider: 'CrowdStrike', category: 'Endpoint', description: 'EDR coverage, detections, threat hunting activity, device posture.', logo: 'CS', color: 'bg-red-700', status: 'connected', lastSync: '7 min ago', evidenceCount: 5120, syncFrequency: 'Every 5 min', type: 'native', controlsMapped: 41 },
  { id: 'jamf', name: 'Jamf Pro', provider: 'Jamf', category: 'Endpoint', description: 'macOS/iOS MDM compliance, encryption status, patch levels.', logo: 'Jm', color: 'bg-slate-600', status: 'connected', lastSync: '12 min ago', evidenceCount: 980, syncFrequency: 'Every 10 min', type: 'native', controlsMapped: 19 },
  { id: 'intune', name: 'Microsoft Intune', provider: 'Microsoft', category: 'Endpoint', description: 'Windows device compliance, policy enforcement, app management.', logo: 'In', color: 'bg-blue-700', status: 'disconnected', type: 'native' },
  { id: 'sentinelone', name: 'SentinelOne', provider: 'SentinelOne', category: 'Endpoint', description: 'AI-driven threat prevention, device health, quarantine activity.', logo: 'S1', color: 'bg-violet-700', status: 'disconnected', type: 'native' },
  { id: 'kandji', name: 'Kandji', provider: 'Kandji', category: 'Endpoint', description: 'Apple fleet MDM, blueprints, compliance parameters.', logo: 'Ka', color: 'bg-emerald-700', status: 'coming_soon', type: 'partner' },

  // Vulnerability
  { id: 'tenable', name: 'Tenable.io', provider: 'Tenable', category: 'Vulnerability', description: 'CVE scan results, CVSS scores, asset risk ratings, SLA tracking.', logo: 'Te', color: 'bg-orange-700', status: 'connected', lastSync: '1h ago', evidenceCount: 3410, syncFrequency: 'Every hour', type: 'native', controlsMapped: 33 },
  { id: 'qualys', name: 'Qualys VMDR', provider: 'Qualys', category: 'Vulnerability', description: 'Vulnerability detections, patch status, asset inventory.', logo: 'Qu', color: 'bg-red-600', status: 'disconnected', type: 'native' },
  { id: 'rapid7', name: 'Rapid7 InsightVM', provider: 'Rapid7', category: 'Vulnerability', description: 'Risk scoring, remediation workflow evidence, scan history.', logo: 'R7', color: 'bg-amber-600', status: 'disconnected', type: 'native' },
  { id: 'wiz', name: 'Wiz', provider: 'Wiz', category: 'Vulnerability', description: 'Cloud security posture, attack paths, vulnerability graph.', logo: 'Wz', color: 'bg-blue-600', status: 'coming_soon', type: 'new' },
  { id: 'orca', name: 'Orca Security', provider: 'Orca', category: 'Vulnerability', description: 'Agentless cloud vulnerability and risk prioritization.', logo: 'Or', color: 'bg-teal-500', status: 'coming_soon', type: 'new' },

  // Ticketing
  { id: 'servicenow', name: 'ServiceNow', provider: 'ServiceNow', category: 'Ticketing', description: 'ITSM change requests, risk assessment workflows, CMDB.', logo: 'SN', color: 'bg-green-700', status: 'disconnected', type: 'native' },
  { id: 'zendesk', name: 'Zendesk', provider: 'Zendesk', category: 'Ticketing', description: 'Customer security incident tracking, SLA evidence.', logo: 'Zd', color: 'bg-emerald-600', status: 'disconnected', type: 'partner' },
  { id: 'freshdesk', name: 'Freshdesk', provider: 'Freshworks', category: 'Ticketing', description: 'Incident management, SLA metrics, customer data processing logs.', logo: 'Fd', color: 'bg-teal-400', status: 'coming_soon', type: 'partner' },

  // Communication
  { id: 'slack', name: 'Slack', provider: 'Salesforce', category: 'Communication', description: 'DLP policy alerts, channel exports for audit, user activity.', logo: 'Sl', color: 'bg-purple-500', status: 'connected', lastSync: '2 min ago', evidenceCount: 890, syncFrequency: 'Every 5 min', type: 'native', controlsMapped: 11 },
  { id: 'teams', name: 'Microsoft Teams', provider: 'Microsoft', category: 'Communication', description: 'Meeting records, policy enforcement, DLP activity logs.', logo: 'Mt', color: 'bg-indigo-600', status: 'disconnected', type: 'native' },
  { id: 'zoom', name: 'Zoom', provider: 'Zoom', category: 'Communication', description: 'Meeting encryption status, recording policies, admin logs.', logo: 'Zm', color: 'bg-blue-500', status: 'coming_soon', type: 'partner' },

  // Training
  { id: 'knowbe4', name: 'KnowBe4', provider: 'KnowBe4', category: 'Training', description: 'Phishing simulation results, training completion rates, risk scores.', logo: 'KB', color: 'bg-green-600', status: 'connected', lastSync: '2h ago', evidenceCount: 1240, syncFrequency: 'Daily', type: 'native', controlsMapped: 14 },
  { id: 'proofpoint', name: 'Proofpoint', provider: 'Proofpoint', category: 'Training', description: 'Security awareness training completions, phishing test history.', logo: 'Pp', color: 'bg-blue-800', status: 'disconnected', type: 'native' },
  { id: 'sans', name: 'SANS Security Awareness', provider: 'SANS Institute', category: 'Training', description: 'Training module completions, assessment scores, certifications.', logo: 'SA', color: 'bg-red-700', status: 'coming_soon', type: 'partner' },

  // Password
  { id: '1password', name: '1Password', provider: '1Password', category: 'Password', description: 'Vault audit log, team member access, 2FA enforcement status.', logo: '1P', color: 'bg-blue-600', status: 'connected', lastSync: '30 min ago', evidenceCount: 640, syncFrequency: 'Every 30 min', type: 'native', controlsMapped: 8 },
  { id: 'lastpass', name: 'LastPass', provider: 'LastPass', category: 'Password', description: 'Shared folder access, MFA policy, dark web monitoring alerts.', logo: 'LP', color: 'bg-red-500', status: 'disconnected', type: 'native' },
  { id: 'bitwarden', name: 'Bitwarden', provider: 'Bitwarden', category: 'Password', description: 'Organization vault events, policy compliance, user health.', logo: 'Bw', color: 'bg-blue-500', status: 'coming_soon', type: 'new' },

  // SIEM
  { id: 'splunk', name: 'Splunk SIEM', provider: 'Cisco', category: 'SIEM', description: 'Security events, alert history, notable events and incident timelines.', logo: 'Sp', color: 'bg-orange-500', status: 'disconnected', type: 'native' },
  { id: 'ms-sentinel', name: 'Microsoft Sentinel', provider: 'Microsoft', category: 'SIEM', description: 'Azure-native SIEM logs, analytics rules, incident management.', logo: 'Se', color: 'bg-blue-600', status: 'coming_soon', type: 'partner' },
  { id: 'sumologic', name: 'Sumo Logic', provider: 'Sumo Logic', category: 'SIEM', description: 'Log analytics, security insights, compliance dashboards.', logo: 'Su', color: 'bg-indigo-500', status: 'coming_soon', type: 'partner' },
];

const CATEGORIES: Category[] = [
  'All', 'Cloud', 'Identity', 'HRIS', 'Developer',
  'Endpoint', 'Vulnerability', 'Ticketing', 'Communication',
  'Training', 'Password', 'SIEM',
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All:           <Activity className="w-3.5 h-3.5" />,
  Cloud:         <Cloud className="w-3.5 h-3.5" />,
  Identity:      <Shield className="w-3.5 h-3.5" />,
  HRIS:          <Users className="w-3.5 h-3.5" />,
  Developer:     <Code2 className="w-3.5 h-3.5" />,
  Endpoint:      <Monitor className="w-3.5 h-3.5" />,
  Vulnerability: <Bug className="w-3.5 h-3.5" />,
  Ticketing:     <Ticket className="w-3.5 h-3.5" />,
  Communication: <MessageSquare className="w-3.5 h-3.5" />,
  Training:      <GraduationCap className="w-3.5 h-3.5" />,
  Password:      <KeyRound className="w-3.5 h-3.5" />,
  SIEM:          <Database className="w-3.5 h-3.5" />,
  Other:         <Zap className="w-3.5 h-3.5" />,
};

const STATUS_CFG: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  connected:    { label: 'Connected',   dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  disconnected: { label: 'Available',   dot: 'bg-slate-400',   text: 'text-slate-500',                         bg: 'bg-slate-50 dark:bg-slate-800/30' },
  syncing:      { label: 'Syncing',     dot: 'bg-amber-400',   text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20' },
  error:        { label: 'Error',       dot: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20' },
  coming_soon:  { label: 'Coming Soon', dot: 'bg-violet-400',  text: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-900/20' },
};

const TYPE_CFG: Record<Integration['type'], { label: string; color: string }> = {
  native:  { label: 'Native',  color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  partner: { label: 'Partner', color: 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
  new:     { label: 'New',     color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' },
};

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold', cfg.bg, cfg.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot, status === 'syncing' && 'animate-pulse')} />
      {cfg.label}
    </span>
  );
}

function IntegrationDetail({ item, onClose, onNotify }: {
  item: Integration;
  onClose: () => void;
  onNotify: (msg: string, type?: string) => void;
}) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); onNotify(`${item.name} synced successfully`, 'success'); }, 2000);
  };

  const EVIDENCE_MAP: Record<string, string[]> = {
    aws:         ['S3 bucket policies', 'IAM user/role list', 'CloudTrail audit logs', 'GuardDuty findings', 'Security Hub controls', 'VPC flow logs'],
    gcp:         ['IAM bindings', 'Audit logs', 'SCC findings', 'GKE node compliance', 'Firewall rules'],
    azure:       ['Azure AD users', 'Conditional access policies', 'Defender alerts', 'Resource inventory', 'Policy compliance'],
    okta:        ['User MFA status', 'Application access list', 'Group memberships', 'Login audit log', 'Session policies'],
    'azure-ad':  ['Directory users', 'Privileged role members', 'Conditional access policies', 'Sign-in risk events'],
    'google-ws': ['User 2-step verification', 'OAuth app grants', 'Admin activity log', 'Data export audit'],
    github:      ['Branch protection rules', 'SAST/secret scan alerts', 'Code review approvals', 'Dependency audit', 'CODEOWNERS file'],
    jira:        ['Security ticket SLA adherence', 'Change request log', 'Bug fix lead times'],
    snyk:        ['Open-source vulnerabilities', 'Container image issues', 'IaC misconfiguration findings'],
    crowdstrike: ['EDR agent coverage', 'Detection events', 'Prevention policy status', 'Device health scores'],
    jamf:        ['Device encryption status', 'OS patch levels', 'Configuration profile compliance'],
    tenable:     ['CVE scan results', 'CVSS severity breakdown', 'Asset risk scores', 'Scan schedule compliance'],
    slack:       ['DLP policy alerts', 'Workspace admin log', 'User 2FA status'],
    workday:     ['Active employee list', 'Hire/termination events', 'Role change history'],
    knowbe4:     ['Training completion rates', 'Phishing simulation results', 'Risk assessment scores'],
    '1password': ['Vault access log', 'MFA enforcement status', 'Shared item audit'],
  };

  const evidenceItems = EVIDENCE_MAP[item.id] ?? ['Audit logs', 'Access records', 'Policy compliance data', 'Configuration snapshots'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-md h-full bg-white dark:bg-aegis-surface border-l border-slate-200 dark:border-aegis-border overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-aegis-surface border-b border-slate-100 dark:border-aegis-border p-5 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-lg', item.color)}>
              {item.logo}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{item.name}</h2>
              <p className="text-xs text-slate-500">{item.provider}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-aegis-border transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status strip */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-aegis-bg border border-slate-100 dark:border-aegis-border">
            <div>
              <StatusBadge status={item.status} />
              {item.lastSync && <p className="text-[10px] text-slate-400 mt-1">Last sync: {item.lastSync}</p>}
            </div>
            {item.status === 'connected' && (
              <button
                onClick={handleSync}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <RefreshCw className={cn('w-3 h-3', syncing && 'animate-spin')} />
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            )}
          </div>

          {/* Stats */}
          {item.status === 'connected' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Evidence Items', value: (item.evidenceCount ?? 0).toLocaleString() },
                { label: 'Controls Mapped', value: item.controlsMapped ?? '—' },
                { label: 'Sync Frequency', value: item.syncFrequency ?? '—' },
              ].map(s => (
                <div key={s.label} className="glass-card p-3 text-center">
                  <p className="text-base font-black text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">About</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
          </div>

          {/* Evidence collected */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Evidence Collected</p>
            <div className="space-y-2">
              {evidenceItems.map(ev => (
                <div key={ev} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-aegis-bg border border-slate-100 dark:border-aegis-border">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-aegis-border space-y-2">
            {item.status === 'connected' ? (
              <>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-aegis-border text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-aegis-bg transition-colors">
                  <Settings2 className="w-3.5 h-3.5" /> Configure Integration
                </button>
                <button
                  onClick={() => { onClose(); onNotify(`${item.name} disconnected`, 'info'); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Disconnect
                </button>
              </>
            ) : item.status !== 'coming_soon' ? (
              <button
                onClick={() => { onClose(); onNotify(`${item.name} connection initiated`, 'success'); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" /> Connect {item.name}
              </button>
            ) : (
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-sm font-black hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors">
                <Sparkles className="w-4 h-4" /> Request Early Access
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface Props { onNotify?: (msg: string, type: string) => void }

export function ConnectorsView({ onNotify = () => {} }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [selected, setSelected] = useState<Integration | null>(null);

  const connected = useMemo(() =>
    INTEGRATIONS.filter(i => i.status === 'connected' || i.status === 'syncing' || i.status === 'error'),
    []
  );

  const available = useMemo(() =>
    INTEGRATIONS.filter(i => {
      const notConnected = i.status !== 'connected' && i.status !== 'syncing' && i.status !== 'error';
      const matchCat = category === 'All' || i.category === category;
      const q = search.toLowerCase();
      const matchSearch = !search || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.provider.toLowerCase().includes(q);
      return notConnected && matchCat && matchSearch;
    }),
    [category, search]
  );

  const stats = useMemo(() => ({
    total: INTEGRATIONS.length,
    connected: connected.length,
    evidenceTotal: connected.reduce((s, i) => s + (i.evidenceCount ?? 0), 0),
    controlsMapped: connected.reduce((s, i) => s + (i.controlsMapped ?? 0), 0),
  }), [connected]);

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm mb-3">
              <Zap className="w-3 h-3" /> {stats.total}+ Integrations
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Connect Aegis to Your Tech Stack</h1>
            <p className="text-blue-100 text-sm max-w-lg leading-relaxed">Automatically collect audit-ready evidence from the tools you already use. Every integration is built and maintained in-house.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              { label: 'Connected', value: stats.connected },
              { label: 'Evidence Items', value: stats.evidenceTotal.toLocaleString() },
              { label: 'Controls Covered', value: stats.controlsMapped },
            ].map(s => (
              <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Integration Catalog</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-aegis-bg text-slate-500 text-[10px] font-black">{available.length} available</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Filter className="w-3 h-3" />
            {category !== 'All' ? category : 'All categories'}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, category, or provider…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0',
                category === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-aegis-surface text-slate-500 border-slate-200 dark:border-aegis-border hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400'
              )}
            >
              {CATEGORY_ICONS[cat]}
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {available.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No integrations found</p>
            <p className="text-xs text-slate-300 mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {available.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelected(item)}
                  className="glass-card p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md', item.color)}>
                      {item.logo}
                    </div>
                    <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wide', TYPE_CFG[item.type].color)}>
                      {TYPE_CFG[item.type].label}
                    </span>
                  </div>

                  <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{item.name}</p>
                  <p className="text-[10px] text-slate-400 mb-2">{item.provider}</p>

                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-aegis-bg">{item.category}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-aegis-border flex items-center justify-end">
                    {item.status === 'coming_soon' ? (
                      <span className="text-[10px] font-bold text-violet-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Coming Soon
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:gap-1.5 transition-all">
                        Connect <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Active integrations */}
      {connected.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Active Integrations</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">{connected.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {connected.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelected(item)}
                className="glass-card p-4 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md', item.color)}>
                    {item.logo}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{item.name}</p>
                <p className="text-[10px] text-slate-400 mb-3">{item.provider}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Database className="w-3 h-3" />{(item.evidenceCount ?? 0).toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.lastSync}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-aegis-border flex items-center justify-between">
                  <button
                    onClick={e => { e.stopPropagation(); onNotify(`Syncing ${item.name}…`, 'info'); }}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Sync
                  </button>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:gap-1.5 transition-all">
                    Manage <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Request CTA */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-aegis-bg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Missing an integration?</p>
            <p className="text-xs text-slate-500 mt-0.5">We ship new integrations weekly. Submit a request and we'll prioritize it.</p>
          </div>
        </div>
        <button
          onClick={() => onNotify('Integration request submitted!', 'success')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-all active:scale-95 shadow-lg shadow-blue-600/20 shrink-0"
        >
          Request Integration <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <IntegrationDetail item={selected} onClose={() => setSelected(null)} onNotify={onNotify} />
        )}
      </AnimatePresence>
    </div>
  );
}
