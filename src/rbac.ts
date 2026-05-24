export type UserRole = 'Admin' | 'Auditor' | 'Compliance' | 'Risk Officer' | 'User';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
}

export const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Home',
  reporting: 'Reports',
  assets: 'Assets',
  compliance: 'Frameworks',
  controls: 'Requirement Hub',
  policies: 'Policies',
  findings: 'Findings',
  risks: 'Risks',
  vendors: 'TPSA',
  bia: 'BIA',
  connectors: 'Integrations',
  evidence: 'Evidences',
  tasks: 'Task List',
  calendar: 'Calendar',
  notes: 'Notes',
  audits: 'Audits',
  intelligence: 'Aegis Intelligence',
};

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  Admin: [...Object.keys(MODULE_LABELS), 'settings'],
  Auditor: ['audits', 'intelligence'],
  Compliance: ['dashboard', 'compliance', 'controls', 'policies', 'findings', 'connectors', 'evidence', 'tasks', 'calendar', 'notes', 'intelligence'],
  'Risk Officer': ['dashboard', 'risks', 'vendors', 'bia', 'tasks', 'calendar', 'notes', 'intelligence'],
  User: ['dashboard', 'tasks', 'calendar', 'notes', 'intelligence'],
};

export const ROLE_ACCESS_STORAGE_KEY = 'aegis.settings.roleAccess.v1';

export function readRoleAccess(): Record<UserRole, string[]> {
  try {
    const raw = localStorage.getItem(ROLE_ACCESS_STORAGE_KEY);
    if (!raw) return ROLE_ACCESS;
    return { ...ROLE_ACCESS, ...(JSON.parse(raw) as Partial<Record<UserRole, string[]>>) };
  } catch {
    return ROLE_ACCESS;
  }
}

export const DEFAULT_USERS: CurrentUser[] = [
  { id: 'admin', name: 'Admin', email: 'admin@company.com', role: 'Admin', title: 'Platform Administrator' },
  { id: 'auditor', name: 'External Auditor', email: 'auditor@auditfirm.com', role: 'Auditor', title: 'Audit Reviewer' },
  { id: 'compliance', name: 'Compliance Lead', email: 'compliance@company.com', role: 'Compliance', title: 'Compliance Manager' },
  { id: 'risk', name: 'Risk Officer', email: 'risk@company.com', role: 'Risk Officer', title: 'Enterprise Risk Officer' },
  { id: 'user', name: 'Alex C.', email: 'officer@company.com', role: 'User', title: 'GRC Contributor' },
];

export function userFromEmail(email: string): CurrentUser {
  const normalized = email.trim().toLowerCase();
  try {
    const stored = localStorage.getItem('aegis.settings.users.v1');
    const users = stored ? JSON.parse(stored) as CurrentUser[] : DEFAULT_USERS;
    return [...users, ...DEFAULT_USERS].find(user => user.email.toLowerCase() === normalized) ?? DEFAULT_USERS[0];
  } catch {
    return DEFAULT_USERS.find(user => user.email.toLowerCase() === normalized) ?? DEFAULT_USERS[0];
  }
}

export function canAccess(role: UserRole, moduleId: string) {
  return readRoleAccess()[role]?.includes(moduleId) ?? false;
}
