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

export type VendorTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type VendorRiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type VendorComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under Review';
export type VendorRiskTrend = 'Improving' | 'Stable' | 'Degrading';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  tier: VendorTier;
  securityScore: number;
  inherentRisk: VendorRiskLevel;
  residualRisk: VendorRiskLevel;
  complianceStatus: VendorComplianceStatus;
  lastAssessment: string;
  nextReview: string;
  owner: string;
  openFindings: number;
  criticalFindings: number;
  certifications: string[];
  impactScore: number;     // 1-5
  likelihoodScore: number; // 1-5
  riskTrend: VendorRiskTrend;
  annualSpend: string;
  description: string;
  dataAccess: string[];
  riskCategories: { name: string; inherent: number; residual: number }[];
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

export type PolicyStatus = 'Draft' | 'Under Review' | 'Approved' | 'Published' | 'Archived';
export type PolicyCategory = 'Security' | 'Privacy' | 'HR' | 'Operations' | 'Compliance';

export interface PolicyVersion {
  version: string;
  date: string;
  author: string;
  summary: string;
}

export interface PolicyAttestation {
  name: string;
  role: string;
  date: string | null;
  status: 'Confirmed' | 'Pending' | 'Overdue';
}

export interface Policy {
  id: string;
  title: string;
  version: string;
  owner: string;
  status: PolicyStatus;
  category: PolicyCategory;
  nextReview: string;
  lastUpdated: string;
  description: string;
  frameworks: { code: string; name: string }[];
  versions: PolicyVersion[];
  attestations: PolicyAttestation[];
  exceptions: number;
}

export type AssetType = 'Server' | 'Cloud' | 'Network';
export type AssetStatus = 'Online' | 'Offline' | 'Degraded';
export type AssetEnv = 'On-Prem' | 'Cloud' | 'Hybrid';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  env: AssetEnv;
  status: AssetStatus;
  ip: string;
  os: string;
  owner: string;
  location: string;
  lastSeen: string;
  tags: string[];
}

export type BIACriticality = 'Critical' | 'High' | 'Medium' | 'Low';
export type BIAImpactLevel = 'Catastrophic' | 'Major' | 'Moderate' | 'Minor' | 'Negligible';

export interface BIAProcess {
  id: string;
  name: string;
  department: string;
  owner: string;
  criticality: BIACriticality;
  rtoHours: number;
  rpoHours: number;
  mtpdHours: number;
  currentRTOHours: number;
  financialImpact: BIAImpactLevel;
  operationalImpact: BIAImpactLevel;
  reputationalImpact: BIAImpactLevel;
  regulatoryImpact: BIAImpactLevel;
  dependencies: string[];
  description: string;
  hourlyLoss: number;
}

export type ControlImplStatus = 'Implemented' | 'Partial' | 'Not Started';
export type ControlMaturity = 0 | 1 | 2 | 3 | 4;
export type ControlPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ControlEvidence {
  name: string;
  type: 'doc' | 'link';
  date: string;
}

export interface Control {
  id: string;
  function: NISTFunction;
  category: string;
  subcategory: string;
  description: string;
  status: ControlImplStatus;
  maturity: ControlMaturity;
  priority: ControlPriority;
  owner: string;
  dueDate: string | null;
  evidence: ControlEvidence[];
  linkedPolicies: string[];
  notes: string;
}

export type EvidenceType =
  | 'Policy Document' | 'Screenshot' | 'Config Export' | 'Audit Log'
  | 'Scan Report' | 'Certificate' | 'Test Result' | 'Training Record'
  | 'Access Review' | 'API Response';
export type EvidenceStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Needs Review';
export type EvidenceSourceType = 'manual' | 'integration' | 'api';

export interface EvidenceGap {
  control: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
}

export interface EvidenceWarning {
  message: string;
  type: 'expiry' | 'coverage' | 'quality' | 'stale';
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: EvidenceType;
  source: EvidenceSourceType;
  integration?: string;
  framework: string;
  controls: string[];
  status: EvidenceStatus;
  collectedAt: string;
  expiresAt: string | null;
  size?: string;
  owner: string;
  gaps: EvidenceGap[];
  warnings: EvidenceWarning[];
  tags: string[];
  description: string;
}

export type AuditStatus = 'Planning' | 'Fieldwork' | 'Review' | 'Finalized' | 'Archived';
export type AuditType = 'Internal' | 'External' | 'SOC 2' | 'ISO 27001' | 'Vendor';
export type AuditEvidenceStatus = 'Requested' | 'Uploaded' | 'Accepted' | 'Rejected';
export type AuditFindingType = 'Strength' | 'Gap' | 'Observation';

export interface AuditEvidenceItem {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  status: AuditEvidenceStatus;
  size: string;
}

export interface AuditFinding {
  id: string;
  type: AuditFindingType;
  title: string;
  detail: string;
  severity: 'Low' | 'Medium' | 'High';
  owner: string;
  createdAt: string;
}

export interface AuditProgram {
  id: string;
  title: string;
  type: AuditType;
  status: AuditStatus;
  auditor: string;
  owner: string;
  startDate: string;
  dueDate: string;
  score: number;
  scope: string[];
  evidence: AuditEvidenceItem[];
  findings: AuditFinding[];
  finalAssessment: string;
  nextRecommendations: string;
  archivedAt?: string;
}

export type NoteAccessLevel = 'Private' | 'Team' | 'Shared';
export type NotePermission = 'Can view' | 'Can comment' | 'Can edit';

export interface NoteShareEntry {
  memberId: string;
  permission: NotePermission;
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  pinned: boolean;
  access: NoteAccessLevel;
  ownerId: string;
  sharedWith: NoteShareEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesWorkspace {
  notes: Note[];
  folders: NoteFolder[];
}

export type UserRole = 'Admin' | 'Auditor' | 'Compliance' | 'Risk Officer' | 'User';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
