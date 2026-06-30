import { NISTStatus, Vendor, Task, CalendarEvent } from './types';

export const NIST_CSF_FUNCTIONS = [
  { id: 'GOVERN', label: 'Govern', color: '#6366F1', description: 'Establish the organizations mission, stakeholder expectations, and legal requirements.' },
  { id: 'IDENTIFY', label: 'Identify', color: '#3B82F6', description: 'Develop an organizational understanding to manage cybersecurity risk.' },
  { id: 'PROTECT', label: 'Protect', color: '#10B981', description: 'Develop and implement appropriate safeguards to ensure delivery of services.' },
  { id: 'DETECT', label: 'Detect', color: '#F59E0B', description: 'Develop and implement appropriate activities to identify the occurrence of a cybersecurity event.' },
  { id: 'RESPOND', label: 'Respond', color: '#EF4444', description: 'Develop and implement appropriate activities to take action regarding a detected cybersecurity incident.' },
  { id: 'RECOVER', label: 'Recover', color: '#8B5CF6', description: 'Develop and implement appropriate activities to maintain plans for resilience.' },
];

export const MOCK_NIST_STATUS: NISTStatus[] = [
  { function: 'GOVERN', score: 85, totalControls: 31, implementedControls: 26 },
  { function: 'IDENTIFY', score: 72, totalControls: 29, implementedControls: 21 },
  { function: 'PROTECT', score: 64, totalControls: 44, implementedControls: 28 },
  { function: 'DETECT', score: 58, totalControls: 18, implementedControls: 10 },
  { function: 'RESPOND', score: 92, totalControls: 21, implementedControls: 19 },
  { function: 'RECOVER', score: 78, totalControls: 12, implementedControls: 9 },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: 'V-001', name: 'CloudOps Pro', criticality: 'Tier 1', complianceStatus: 'Compliant', lastAssessment: '2023-11-12' },
  { id: 'V-002', name: 'SecurityFlow Inc', criticality: 'Tier 2', complianceStatus: 'Pending', lastAssessment: '2024-01-05' },
];

export const MOCK_TASKS: Task[] = [
  { id: 'T-001', title: 'Update Firewall Rules', description: 'Review and update egress filtering rules for AWS VPCs.', dueDate: '2024-05-15', status: 'In Progress', priority: 'High', assignee: 'Alex C.' },
  { id: 'T-002', title: 'User Access Review', description: 'Quarterly review of IAM permissions for core infrastructure.', dueDate: '2024-05-20', status: 'Todo', priority: 'Medium', assignee: 'Sarah L.' },
  { id: 'T-003', title: 'SOC 2 Evidence Export', description: 'Export control evidence for Trust Services Criteria assessment.', dueDate: '2024-05-10', status: 'Completed', priority: 'High', assignee: 'Alex C.' },
  { id: 'T-004', title: 'Third-party Risk Assessment', description: 'Complete due diligence for New Vendor Alpha.', dueDate: '2024-05-25', status: 'Todo', priority: 'Low', assignee: 'Unassigned' },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'E-001', title: 'Q2 Audit Kickoff', description: 'Strategic alignment for the upcoming quarterly internal audit.', date: '2026-04-29', startTime: '10:00 AM', duration: '1h', type: 'Audit', assignees: ['Alex C.', 'Sarah L.', 'Archili K.'] },
  { id: 'E-002', title: 'Policy Review Board', description: 'Monthly meeting to ratify updated information security policies.', date: '2026-04-29', startTime: '2:30 PM', duration: '45m', type: 'Review', assignees: ['Alex C.', 'Elena R.'] },
  { id: 'E-003', title: 'Weekly SecOps Sync', description: 'Reviewing active incidents and monitoring trends.', date: '2026-04-30', startTime: '9:00 AM', duration: '30m', type: 'Meeting', assignees: ['David M.', 'Sarah L.'] },
  { id: 'E-004', title: 'Database Encryption Rollout', description: 'Planned maintenance for production DB encryption.', date: '2026-05-02', startTime: '11:00 PM', duration: '2h', type: 'Release', assignees: ['Alex C.', 'David M.'] },
];

export const TEAM_MEMBERS = [
  'Alex C.',
  'Sarah L.',
  'Archili K.',
  'David M.',
  'Elena R.',
  'Unassigned'
];
