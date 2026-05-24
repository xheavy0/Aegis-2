export type NISTFunction = 'GOVERN' | 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';

export interface NISTStatus {
  function: NISTFunction;
  score: number; // 0-100
  totalControls: number;
  implementedControls: number;
}

export interface Risk {
  id: string;
  title: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  likelihood: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Transferred';
  owner: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  source: 'Active Directory' | 'Okta' | 'Tenable' | 'Manual';
  status: 'Open' | 'Resolved' | 'Risk Accepted';
  dateFound: string;
}

export interface Vendor {
  id: string;
  name: string;
  criticality: 'Tier 1' | 'Tier 2' | 'Tier 3';
  complianceStatus: 'Compliant' | 'Non-compliant' | 'Pending';
  lastAssessment: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Todo' | 'In Progress' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  duration: string;
  type: 'Meeting' | 'Audit' | 'Review' | 'Release';
  assignees?: string[];
}

export type NotificationAudience = 'all' | string[];

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'calendar' | 'risk' | 'framework' | 'finding';
  audience: NotificationAudience;
  createdAt: string;
  read: boolean;
}
