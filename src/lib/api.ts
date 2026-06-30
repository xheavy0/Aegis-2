import { NISTStatus, Risk, Finding, Vendor, Task, CalendarEvent, AppNotification, Policy, Asset, BIAProcess, Control, EvidenceItem, AuditProgram, NotesWorkspace, AuthUser, LoginResponse } from '../types';

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

const TOKEN_KEY = 'aegis.auth.token';

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
}

/** Thrown for 401s so the app can redirect to login. */
export class UnauthorizedError extends Error {}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    setToken(null);
    const data = await res.json().catch(() => ({}));
    throw new UnauthorizedError(data.error ?? 'Unauthorized');
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) => req<LoginResponse>('POST', '/auth/login', { email, password }),
  me: () => req<AuthUser>('GET', '/auth/me'),

  // NIST
  getNist: () => req<NISTStatus[]>('GET', '/nist'),
  updateNist: (fn: string, body: Partial<NISTStatus>) => req<NISTStatus>('PUT', `/nist/${fn}`, body),

  // Risks
  getRisks: () => req<Risk[]>('GET', '/risks'),
  getRisk: (id: string) => req<Risk>('GET', `/risks/${id}`),
  createRisk: (body: Omit<Risk, 'id'>) => req<Risk>('POST', '/risks', body),
  updateRisk: (id: string, body: Partial<Risk>) => req<Risk>('PUT', `/risks/${id}`, body),
  deleteRisk: (id: string) => req<void>('DELETE', `/risks/${id}`),

  // Findings
  getFindings: () => req<Finding[]>('GET', '/findings'),
  getFinding: (id: string) => req<Finding>('GET', `/findings/${id}`),
  createFinding: (body: Omit<Finding, 'id'>) => req<Finding>('POST', '/findings', body),
  updateFinding: (id: string, body: Partial<Finding>) => req<Finding>('PUT', `/findings/${id}`, body),
  deleteFinding: (id: string) => req<void>('DELETE', `/findings/${id}`),

  // Vendors
  getVendors: () => req<Vendor[]>('GET', '/vendors'),
  getVendor: (id: string) => req<Vendor>('GET', `/vendors/${id}`),
  createVendor: (body: Omit<Vendor, 'id'>) => req<Vendor>('POST', '/vendors', body),
  updateVendor: (id: string, body: Partial<Vendor>) => req<Vendor>('PUT', `/vendors/${id}`, body),
  deleteVendor: (id: string) => req<void>('DELETE', `/vendors/${id}`),

  // Tasks
  getTasks: () => req<Task[]>('GET', '/tasks'),
  getTask: (id: string) => req<Task>('GET', `/tasks/${id}`),
  createTask: (body: Omit<Task, 'id'>) => req<Task>('POST', '/tasks', body),
  updateTask: (id: string, body: Partial<Task>) => req<Task>('PUT', `/tasks/${id}`, body),
  deleteTask: (id: string) => req<void>('DELETE', `/tasks/${id}`),

  // Calendar
  getEvents: () => req<CalendarEvent[]>('GET', '/calendar'),
  getEvent: (id: string) => req<CalendarEvent>('GET', `/calendar/${id}`),
  createEvent: (body: Omit<CalendarEvent, 'id'>) => req<CalendarEvent>('POST', '/calendar', body),
  updateEvent: (id: string, body: Partial<CalendarEvent>) => req<CalendarEvent>('PUT', `/calendar/${id}`, body),
  deleteEvent: (id: string) => req<void>('DELETE', `/calendar/${id}`),

  // Policies
  getPolicies: () => req<Policy[]>('GET', '/policies'),
  getPolicy: (id: string) => req<Policy>('GET', `/policies/${id}`),
  createPolicy: (body: Omit<Policy, 'id'>) => req<Policy>('POST', '/policies', body),
  updatePolicy: (id: string, body: Partial<Policy>) => req<Policy>('PUT', `/policies/${id}`, body),
  deletePolicy: (id: string) => req<void>('DELETE', `/policies/${id}`),

  // Assets
  getAssets: () => req<Asset[]>('GET', '/assets'),
  getAsset: (id: string) => req<Asset>('GET', `/assets/${id}`),
  createAsset: (body: Omit<Asset, 'id'>) => req<Asset>('POST', '/assets', body),
  updateAsset: (id: string, body: Partial<Asset>) => req<Asset>('PUT', `/assets/${id}`, body),
  deleteAsset: (id: string) => req<void>('DELETE', `/assets/${id}`),

  // BIA
  getBIA: () => req<BIAProcess[]>('GET', '/bia'),
  getBIAProcess: (id: string) => req<BIAProcess>('GET', `/bia/${id}`),
  createBIAProcess: (body: Omit<BIAProcess, 'id'>) => req<BIAProcess>('POST', '/bia', body),
  updateBIAProcess: (id: string, body: Partial<BIAProcess>) => req<BIAProcess>('PUT', `/bia/${id}`, body),
  deleteBIAProcess: (id: string) => req<void>('DELETE', `/bia/${id}`),

  // Controls
  getControls: () => req<Control[]>('GET', '/controls'),
  getControl: (id: string) => req<Control>('GET', `/controls/${id}`),
  createControl: (body: Control) => req<Control>('POST', '/controls', body),
  updateControl: (id: string, body: Partial<Control>) => req<Control>('PUT', `/controls/${id}`, body),
  deleteControl: (id: string) => req<void>('DELETE', `/controls/${id}`),

  // Evidence
  getEvidence: () => req<EvidenceItem[]>('GET', '/evidence'),
  getEvidenceItem: (id: string) => req<EvidenceItem>('GET', `/evidence/${id}`),
  createEvidence: (body: Omit<EvidenceItem, 'id'>) => req<EvidenceItem>('POST', '/evidence', body),
  updateEvidence: (id: string, body: Partial<EvidenceItem>) => req<EvidenceItem>('PUT', `/evidence/${id}`, body),
  deleteEvidence: (id: string) => req<void>('DELETE', `/evidence/${id}`),

  // Audits (whole-collection persistence)
  getAudits: () => req<AuditProgram[]>('GET', '/audits'),
  replaceAudits: (body: AuditProgram[]) => req<AuditProgram[]>('PUT', '/audits', body),

  // Notes (whole-workspace persistence)
  getNotesWorkspace: () => req<NotesWorkspace>('GET', '/notes'),
  replaceNotesWorkspace: (body: NotesWorkspace) => req<NotesWorkspace>('PUT', '/notes', body),

  // Notifications
  getNotifications: (audience?: string) =>
    req<AppNotification[]>('GET', audience ? `/notifications?audience=${encodeURIComponent(audience)}` : '/notifications'),
  createNotification: (body: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) =>
    req<AppNotification>('POST', '/notifications', body),
  markRead: (id: string) => req<AppNotification>('PUT', `/notifications/${id}/read`),
  deleteNotification: (id: string) => req<void>('DELETE', `/notifications/${id}`),

  // Health
  health: () => req<{ status: string; timestamp: string }>('GET', '/health'),
};
