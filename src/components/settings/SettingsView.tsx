import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CreditCard,
  Database,
  HardDrive,
  KeyRound,
  Lock,
  Plus,
  RotateCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { CurrentUser, DEFAULT_USERS, MODULE_LABELS, readRoleAccess, ROLE_ACCESS_STORAGE_KEY, UserRole } from '@/src/rbac';

// ─── Constants ───────────────────────────────────────────────────────────────

const USER_STORAGE_KEY    = 'aegis.settings.users.v1';
const DATA_DELEGATION_KEY = 'aegis.settings.datadelegation.v1';
const ROLES: UserRole[]   = ['Admin', 'Auditor', 'Compliance', 'Risk Officer', 'User'];

type SettingsTab = 'users' | 'delegation' | 'audit' | 'auth' | 'billing';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'users',      label: 'User Management',              icon: <Users className="w-4 h-4" /> },
  { id: 'delegation', label: 'Data Delegation',              icon: <Database className="w-4 h-4" /> },
  { id: 'audit',      label: 'Audit Log',                    icon: <Activity className="w-4 h-4" /> },
  { id: 'auth',       label: 'Authentication Integrations',  icon: <KeyRound className="w-4 h-4" /> },
  { id: 'billing',    label: 'My Subscriptions',             icon: <CreditCard className="w-4 h-4" /> },
];

// ─── Data Delegation types ────────────────────────────────────────────────────

type StorageProvider = 'aws' | 'gcs' | 'azure' | 'onprem';

interface AwsConfig    { bucket: string; region: string; accessKeyId: string; secretAccessKey: string; }
interface GcsConfig    { bucket: string; projectId: string; serviceAccountJson: string; }
interface AzureConfig  { connectionString: string; containerName: string; }
interface OnPremConfig { endpoint: string; token: string; tlsEnabled: boolean; }

interface DataDelegationConfig {
  provider: StorageProvider;
  aws: AwsConfig;
  gcs: GcsConfig;
  azure: AzureConfig;
  onprem: OnPremConfig;
}

const DEFAULT_DATA_DELEGATION: DataDelegationConfig = {
  provider: 'aws',
  aws:    { bucket: '', region: 'us-east-1', accessKeyId: '', secretAccessKey: '' },
  gcs:    { bucket: '', projectId: '', serviceAccountJson: '' },
  azure:  { connectionString: '', containerName: '' },
  onprem: { endpoint: '', token: '', tlsEnabled: true },
};

function readDataDelegation(): DataDelegationConfig {
  try {
    const raw = localStorage.getItem(DATA_DELEGATION_KEY);
    if (!raw) return DEFAULT_DATA_DELEGATION;
    return { ...DEFAULT_DATA_DELEGATION, ...JSON.parse(raw) };
  } catch { return DEFAULT_DATA_DELEGATION; }
}

const PROVIDERS: { id: StorageProvider; label: string; badge: string; icon: React.ReactNode; description: string }[] = [
  { id: 'aws',     label: 'AWS S3',              badge: 'Amazon Web Services', icon: <Cloud className="w-5 h-5" />,     description: 'Store data in a private S3 bucket with IAM-controlled access.' },
  { id: 'gcs',    label: 'Google Cloud Storage', badge: 'Google Cloud',        icon: <Cloud className="w-5 h-5" />,     description: 'GCS bucket with service account authentication.' },
  { id: 'azure',  label: 'Azure Blob Storage',   badge: 'Microsoft Azure',     icon: <Cloud className="w-5 h-5" />,     description: 'Azure container with connection string auth.' },
  { id: 'onprem', label: 'On-Premise Server',    badge: 'Self-Hosted',         icon: <HardDrive className="w-5 h-5" />, description: 'Your own infrastructure — full data sovereignty.' },
];

// ─── Static data ──────────────────────────────────────────────────────────────

const AUTH_PROVIDERS = [
  { name: 'Okta SAML',          type: 'SAML 2.0',    status: 'Ready',       description: 'Enterprise SSO through Okta identity provider.' },
  { name: 'Azure AD / Entra ID',type: 'SAML / OIDC', status: 'Configured',  description: 'Microsoft identity federation for workforce users.' },
  { name: 'Google Workspace',   type: 'OIDC',        status: 'Available',   description: 'Google identity provider login for workspace users.' },
  { name: 'OneLogin',           type: 'SAML 2.0',    status: 'Available',   description: 'SAML connector for OneLogin tenants.' },
];

const AUDIT_LOG = [
  { actor: 'Admin',           action: 'Updated role permissions', target: 'Compliance role',      time: '2026-05-10 18:42' },
  { actor: 'Admin',           action: 'Created user',             target: 'auditor@auditfirm.com',time: '2026-05-10 18:21' },
  { actor: 'External Auditor',action: 'Uploaded evidence',        target: 'AUD-2026-01',          time: '2026-05-10 17:58' },
  { actor: 'Risk Officer',    action: 'Changed task status',      target: 'T-006',                time: '2026-05-10 16:33' },
  { actor: 'Compliance Lead', action: 'Viewed framework score',   target: 'NIST CSF 2.0',         time: '2026-05-10 15:10' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'For small teams getting started with GRC.',
    features: ['Up to 5 users', 'Core GRC modules', 'Email support', '5 GB storage'],
    current: false,
    color: 'slate',
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$149',
    period: '/mo',
    description: 'Full GRC suite for growing organizations.',
    features: ['Up to 25 users', 'All modules + AI Intelligence', 'SSO (SAML/OIDC)', 'Priority support', '50 GB storage', 'Audit log export'],
    current: true,
    color: 'blue',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Unlimited scale with on-premise option.',
    features: ['Unlimited users', 'White-label', 'On-premise deployment', 'Dedicated CSM', 'Custom SLA', 'Unlimited storage'],
    current: false,
    color: 'violet',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readUsers() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return DEFAULT_USERS;
    const parsed = JSON.parse(raw) as CurrentUser[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_USERS;
  } catch { return DEFAULT_USERS; }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsView({ currentUser, onRoleAccessChange }: { currentUser: CurrentUser; onRoleAccessChange?: () => void }) {
  const [activeTab, setActiveTab]     = useState<SettingsTab>('users');
  const [users, setUsers]             = useState<CurrentUser[]>(readUsers);
  const [newEmail, setNewEmail]       = useState('');
  const [newRole, setNewRole]         = useState<UserRole>('User');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [roleAccess, setRoleAccess]   = useState<Record<UserRole, string[]>>(readRoleAccess);
  const [delegation, setDelegation]   = useState<DataDelegationConfig>(readDataDelegation);
  const [delegationSaved, setDelegationSaved]   = useState(false);
  const [delegationTesting, setDelegationTesting] = useState(false);
  const [delegationTestResult, setDelegationTestResult] = useState<'success' | 'error' | null>(null);

  const isAdmin = currentUser.role === 'Admin';
  const selectedModules = useMemo(() => roleAccess[selectedRole] ?? [], [roleAccess, selectedRole]);

  function saveUsers(next: CurrentUser[]) {
    setUsers(next);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
  }

  function createUser() {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    saveUsers([...users, { id: `user-${Date.now()}`, name, email, role: newRole, title: `${newRole} User` }]);
    setNewEmail('');
    setNewRole('User');
  }

  function toggleModule(role: UserRole, moduleId: string) {
    const next = {
      ...roleAccess,
      [role]: selectedModules.includes(moduleId)
        ? selectedModules.filter(id => id !== moduleId)
        : [...selectedModules, moduleId],
    };
    setRoleAccess(next);
    localStorage.setItem(ROLE_ACCESS_STORAGE_KEY, JSON.stringify(next));
    onRoleAccessChange?.();
  }

  function patchDelegation<K extends StorageProvider>(provider: K, patch: Partial<DataDelegationConfig[K]>) {
    setDelegation(prev => ({ ...prev, [provider]: { ...prev[provider], ...patch } }));
    setDelegationSaved(false);
    setDelegationTestResult(null);
  }

  function saveDelegation() {
    localStorage.setItem(DATA_DELEGATION_KEY, JSON.stringify(delegation));
    setDelegationSaved(true);
    setTimeout(() => setDelegationSaved(false), 3000);
  }

  function testConnection() {
    setDelegationTesting(true);
    setDelegationTestResult(null);
    setTimeout(() => {
      setDelegationTesting(false);
      const p = delegation.provider;
      let ok = false;
      if (p === 'aws')    ok = !!(delegation.aws.bucket && delegation.aws.accessKeyId && delegation.aws.secretAccessKey);
      if (p === 'gcs')    ok = !!(delegation.gcs.bucket && delegation.gcs.projectId && delegation.gcs.serviceAccountJson);
      if (p === 'azure')  ok = !!(delegation.azure.connectionString && delegation.azure.containerName);
      if (p === 'onprem') ok = !!(delegation.onprem.endpoint && delegation.onprem.token);
      setDelegationTestResult(ok ? 'success' : 'error');
    }, 1800);
  }

  if (!isAdmin) {
    return (
      <div className="glass-card p-10 text-center">
        <Lock className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">Settings are admin-only</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your role does not include platform administration access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Settings</h2>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Manage users, data storage, authentication, and billing.</p>
      </header>

      {/* ─── Tab bar ─── */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-white/[0.03] p-1.5 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white dark:bg-aegis-surface text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── User Management ─── */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="glass-card p-5 space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />Users
              </h3>
              <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Create users and assign roles</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_44px] gap-2">
              <input
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createUser()}
                placeholder="user@company.com"
                className="rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
                className="rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={createUser} className="rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                    {user.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <select
                    value={user.role}
                    onChange={e => saveUsers(users.map(u => u.id === user.id ? { ...u, role: e.target.value as UserRole } : u))}
                    className="rounded-lg border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface px-2 py-1.5 text-xs font-black text-slate-600 dark:text-slate-300"
                  >
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-5 space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-violet-500" />Role Customization
              </h3>
              <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Default module visibility by role</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn('rounded-xl px-3 py-2 text-xs font-black transition', selectedRole === role ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-aegis-bg text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10')}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(MODULE_LABELS).map(([moduleId, label]) => (
                <button
                  key={moduleId}
                  onClick={() => toggleModule(selectedRole, moduleId)}
                  className={cn('rounded-xl border px-3 py-2 flex items-center gap-2 text-left transition', selectedModules.includes(moduleId) ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg opacity-50')}
                >
                  <CheckCircle2 className={cn('w-4 h-4 shrink-0', selectedModules.includes(moduleId) ? 'text-emerald-500' : 'text-slate-400')} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ─── Data Delegation ─── */}
      {activeTab === 'delegation' && (
        <section className="glass-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />Data Delegation
            </h3>
            <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Choose where platform data is stored — cloud or on-premise
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => { setDelegation(prev => ({ ...prev, provider: p.id })); setDelegationTestResult(null); }}
                className={cn(
                  'rounded-2xl border p-4 text-left transition flex flex-col gap-3',
                  delegation.provider === p.id
                    ? 'border-blue-500 bg-blue-600/5 shadow-md shadow-blue-500/10'
                    : 'border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg hover:border-blue-300'
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', delegation.provider === p.id ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-aegis-surface text-slate-500 dark:text-slate-400')}>
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{p.label}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-blue-500 uppercase tracking-widest">{p.badge}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 leading-5">{p.description}</p>
                </div>
                {delegation.provider === p.id && <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" />}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-5 space-y-4">
            {delegation.provider === 'aws' && (
              <>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">AWS S3 Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="S3 Bucket Name"    value={delegation.aws.bucket}          onChange={v => patchDelegation('aws', { bucket: v })}          placeholder="my-aegis-data-bucket" />
                  <Field label="Region"             value={delegation.aws.region}          onChange={v => patchDelegation('aws', { region: v })}          placeholder="us-east-1" />
                  <Field label="Access Key ID"      value={delegation.aws.accessKeyId}     onChange={v => patchDelegation('aws', { accessKeyId: v })}     placeholder="AKIAIOSFODNN7EXAMPLE" />
                  <Field label="Secret Access Key"  value={delegation.aws.secretAccessKey} onChange={v => patchDelegation('aws', { secretAccessKey: v })} placeholder="••••••••••••" secret />
                </div>
              </>
            )}
            {delegation.provider === 'gcs' && (
              <>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Google Cloud Storage Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="GCS Bucket Name" value={delegation.gcs.bucket}     onChange={v => patchDelegation('gcs', { bucket: v })}     placeholder="aegis-grc-storage" />
                  <Field label="Project ID"       value={delegation.gcs.projectId} onChange={v => patchDelegation('gcs', { projectId: v })} placeholder="my-gcp-project-id" />
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Service Account JSON</label>
                    <textarea
                      rows={4}
                      value={delegation.gcs.serviceAccountJson}
                      onChange={e => patchDelegation('gcs', { serviceAccountJson: e.target.value })}
                      placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}'}
                      className="w-full rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface px-3 py-2 text-xs font-mono text-slate-900 dark:text-white resize-none focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
            {delegation.provider === 'azure' && (
              <>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Azure Blob Storage Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Field label="Connection String" value={delegation.azure.connectionString} onChange={v => patchDelegation('azure', { connectionString: v })} placeholder="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=..." secret />
                  </div>
                  <Field label="Container Name" value={delegation.azure.containerName} onChange={v => patchDelegation('azure', { containerName: v })} placeholder="aegis-data" />
                </div>
              </>
            )}
            {delegation.provider === 'onprem' && (
              <>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">On-Premise Server Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Server Endpoint URL" value={delegation.onprem.endpoint} onChange={v => patchDelegation('onprem', { endpoint: v })} placeholder="https://storage.internal.company.com" />
                  <Field label="API Token"            value={delegation.onprem.token}    onChange={v => patchDelegation('onprem', { token: v })}    placeholder="••••••••••••" secret />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => patchDelegation('onprem', { tlsEnabled: !delegation.onprem.tlsEnabled })}
                      className={cn('relative w-10 h-6 rounded-full transition-colors shrink-0', delegation.onprem.tlsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600')}
                    >
                      <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', delegation.onprem.tlsEnabled ? 'left-5' : 'left-1')} />
                    </button>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">Enforce TLS / HTTPS</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-aegis-border">
              <button
                onClick={testConnection}
                disabled={delegationTesting}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface px-4 py-2 text-sm font-black text-slate-700 dark:text-slate-200 hover:border-blue-300 transition disabled:opacity-50"
              >
                <RotateCw className={cn('w-4 h-4', delegationTesting && 'animate-spin')} />
                {delegationTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={saveDelegation}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 transition"
              >
                <Save className="w-4 h-4" />
                {delegationSaved ? 'Saved!' : 'Save Configuration'}
              </button>
              {delegationTestResult === 'success' && (
                <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Connection successful
                </span>
              )}
              {delegationTestResult === 'error' && (
                <span className="flex items-center gap-1.5 text-xs font-black text-red-500">
                  <AlertTriangle className="w-4 h-4" /> Connection failed — check your credentials
                </span>
              )}
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-400 leading-5">
            ⚠️ Credentials are stored locally in your browser session. In production, configure these via environment variables or a secrets manager. Aegis never transmits your storage credentials to third parties.
          </p>
        </section>
      )}

      {/* ─── Audit Log ─── */}
      {activeTab === 'audit' && (
        <section className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />Audit Log
            </h3>
            <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform activity history</p>
          </div>
          <div className="space-y-2">
            {AUDIT_LOG.map((entry, index) => (
              <div key={`${entry.time}-${index}`} className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{entry.action}</p>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{entry.time}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.actor} · {entry.target}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Authentication Integrations ─── */}
      {activeTab === 'auth' && (
        <section className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-500" />Authentication Integrations
            </h3>
            <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SSO and identity provider configuration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AUTH_PROVIDERS.map(provider => (
              <div key={provider.name} className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{provider.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{provider.type}</p>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{provider.description}</p>
                </div>
                <span className={cn(
                  'rounded-lg px-2 py-1 text-[10px] font-black shrink-0',
                  provider.status === 'Configured' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-white dark:bg-aegis-surface text-slate-500 dark:text-slate-300'
                )}>
                  {provider.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── My Subscriptions ─── */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={cn(
                  'glass-card p-6 flex flex-col gap-4 relative',
                  plan.current && 'ring-2 ring-blue-500'
                )}
              >
                {plan.current && (
                  <span className="absolute top-4 right-4 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-widest">
                    Current Plan
                  </span>
                )}
                <div>
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                    plan.color === 'blue' ? 'bg-blue-600 text-white' : plan.color === 'violet' ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-aegis-bg text-slate-500'
                  )}>
                    {plan.color === 'violet' ? <Sparkles className="w-5 h-5" /> : plan.color === 'blue' ? <Zap className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{plan.description}</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm font-bold text-slate-400 mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  'mt-2 w-full rounded-xl py-2.5 text-sm font-black transition',
                  plan.current
                    ? 'bg-slate-100 dark:bg-aegis-bg text-slate-500 dark:text-slate-400 cursor-default'
                    : plan.color === 'violet'
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}>
                  {plan.current ? 'Active' : plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>

          <section className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />Billing Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Billing Date</p>
                <p className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">June 10, 2026</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
                <p className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">$149.00</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                <p className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">•••• 4242</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, secret = false,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; secret?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={secret && !show ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 pr-14"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-black uppercase"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  );
}
