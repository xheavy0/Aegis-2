import { NISTStatus, Risk, Finding, Vendor, Task, CalendarEvent, AppNotification } from '../../src/types.js';

export let nistStatus: NISTStatus[] = [
  { function: 'GOVERN', score: 85, totalControls: 31, implementedControls: 26 },
  { function: 'IDENTIFY', score: 72, totalControls: 29, implementedControls: 21 },
  { function: 'PROTECT', score: 64, totalControls: 44, implementedControls: 28 },
  { function: 'DETECT', score: 58, totalControls: 18, implementedControls: 10 },
  { function: 'RESPOND', score: 92, totalControls: 21, implementedControls: 19 },
  { function: 'RECOVER', score: 78, totalControls: 12, implementedControls: 9 },
];

export let risks: Risk[] = [
  { id: 'R-101', title: 'Unencrypted Sensitive Data in Cloud Storage', impact: 'Critical', likelihood: 'Medium', status: 'Open', owner: 'Jane Doe', updatedAt: '2024-03-20' },
  { id: 'R-102', title: 'Lack of MFA for External Vendors', impact: 'High', likelihood: 'High', status: 'Mitigated', owner: 'John Smith', updatedAt: '2024-03-15' },
  { id: 'R-103', title: 'Outdated Patch Management Policy', impact: 'Medium', likelihood: 'Low', status: 'Accepted', owner: 'Alice Brown', updatedAt: '2024-02-28' },
];

export let findings: Finding[] = [
  { id: 'F-501', description: 'Inactive accounts not disabled for 90+ days', severity: 'High', source: 'Active Directory', status: 'Open', dateFound: '2024-03-18' },
  { id: 'F-502', description: 'Critical vulnerability on public database server', severity: 'Critical', source: 'Tenable', status: 'Open', dateFound: '2024-03-19' },
  { id: 'F-503', description: 'Unauthorized API token creation detected', severity: 'Medium', source: 'Okta', status: 'Resolved', dateFound: '2024-03-10' },
];

export let vendors: Vendor[] = [
  { id: 'V-001', name: 'CloudOps Pro', criticality: 'Tier 1', complianceStatus: 'Compliant', lastAssessment: '2023-11-12' },
  { id: 'V-002', name: 'SecurityFlow Inc', criticality: 'Tier 2', complianceStatus: 'Pending', lastAssessment: '2024-01-05' },
];

export let tasks: Task[] = [
  { id: 'T-001', title: 'Update Firewall Rules', description: 'Review and update egress filtering rules for AWS VPCs.', dueDate: '2024-05-15', status: 'In Progress', priority: 'High', assignee: 'Alex C.' },
  { id: 'T-002', title: 'User Access Review', description: 'Quarterly review of IAM permissions for core infrastructure.', dueDate: '2024-05-20', status: 'Todo', priority: 'Medium', assignee: 'Sarah L.' },
  { id: 'T-003', title: 'SOC 2 Evidence Export', description: 'Export control evidence for Trust Services Criteria assessment.', dueDate: '2024-05-10', status: 'Completed', priority: 'High', assignee: 'Alex C.' },
  { id: 'T-004', title: 'Third-party Risk Assessment', description: 'Complete due diligence for New Vendor Alpha.', dueDate: '2024-05-25', status: 'Todo', priority: 'Low', assignee: 'Unassigned' },
];

export let calendarEvents: CalendarEvent[] = [
  { id: 'E-001', title: 'Q2 Audit Kickoff', description: 'Strategic alignment for the upcoming quarterly internal audit.', date: '2026-04-29', startTime: '10:00 AM', duration: '1h', type: 'Audit', assignees: ['Alex C.', 'Sarah L.', 'Archili K.'] },
  { id: 'E-002', title: 'Policy Review Board', description: 'Monthly meeting to ratify updated information security policies.', date: '2026-04-29', startTime: '2:30 PM', duration: '45m', type: 'Review', assignees: ['Alex C.', 'Elena R.'] },
  { id: 'E-003', title: 'Weekly SecOps Sync', description: 'Reviewing active incidents and monitoring trends.', date: '2026-04-30', startTime: '9:00 AM', duration: '30m', type: 'Meeting', assignees: ['David M.', 'Sarah L.'] },
  { id: 'E-004', title: 'Database Encryption Rollout', description: 'Planned maintenance for production DB encryption.', date: '2026-05-02', startTime: '11:00 PM', duration: '2h', type: 'Release', assignees: ['Alex C.', 'David M.'] },
];

export let notifications: AppNotification[] = [];

let counters = { R: 103, F: 503, V: 2, T: 4, E: 4, N: 0 };

export function nextId(prefix: 'R' | 'F' | 'V' | 'T' | 'E' | 'N'): string {
  counters[prefix]++;
  const pad = prefix === 'R' || prefix === 'F' ? 3 : prefix === 'N' ? 4 : 3;
  return `${prefix}-${String(counters[prefix]).padStart(pad, '0')}`;
}
