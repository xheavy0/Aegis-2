export type NISTFunction = 'GOVERN' | 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';

export interface NISTStatus {
  function: NISTFunction;
  score: number; // 0-100
  totalControls: number;
  implementedControls: number;
}

export type RiskCategory = 'Cyber' | 'Operational' | 'Financial' | 'Compliance' | 'Strategic' | 'Reputational';
export type RiskTreatment = 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';
export type RiskStatus = 'Open' | 'Mitigating' | 'Accepted' | 'Transferred' | 'Closed';
export type RiskTrend = 'Increasing' | 'Stable' | 'Decreasing';

export interface Risk {
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

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
export type FindingStatus = 'Open' | 'In Progress' | 'In Review' | 'Resolved' | 'Accepted' | 'False Positive';
export type FindingCategory = 'Access Control' | 'Data Protection' | 'Vulnerability' | 'Configuration' | 'Compliance' | 'Audit';

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  category: FindingCategory;
  source: string;
  status: FindingStatus;
  owner: string;
  dateFound: string;
  dueDate: string;
  slaBreached: boolean;
  daysOpen: number;
  affectedAsset: string;
  evidenceCount: number;
  remediationNotes: string;
}

export interface Vendor {
  id: string;
  name: string;
  criticality: 'Tier 1' | 'Tier 2' | 'Tier 3';
  complianceStatus: 'Compliant' | 'Non-compliant' | 'Pending';
  lastAssessment: string;
}

export type TaskStatus = 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Done' | 'Cancelled';
export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None';
export type TaskType = 'Remediation' | 'Evidence' | 'Audit' | 'Policy' | 'General';

export interface TaskLinkedItem {
  type: 'risk' | 'control' | 'finding' | 'policy';
  id: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee: string;
  dueDate: string;
  labels: string[];
  linkedItems: TaskLinkedItem[];
  createdAt: string;
  updatedAt: string;
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
