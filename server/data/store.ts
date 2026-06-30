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
  { id: 'R-101', title: 'Ransomware Attack on Cloud Infrastructure', category: 'Cyber', description: 'Adversarial encryption of production cloud workloads could halt all operations and result in significant data loss and regulatory penalties.', owner: 'Alex C.', inherentLikelihood: 4, inherentImpact: 5, residualLikelihood: 2, residualImpact: 5, treatment: 'Mitigate', treatmentProgress: 65, status: 'Mitigating', dateIdentified: '2025-09-01', reviewDate: '2026-06-01', financialExposure: 1200000, riskTrend: 'Stable', treatmentPlan: 'Deploy immutable backup strategy, enhanced EDR tooling, network segmentation, and incident response runbooks.', linkedControls: 8 },
  { id: 'R-102', title: 'Third-Party Data Breach via Supplier Access', category: 'Operational', description: 'A compromised Tier 1 vendor with access to customer PII could result in a significant data breach and GDPR enforcement action.', owner: 'Sarah L.', inherentLikelihood: 3, inherentImpact: 5, residualLikelihood: 2, residualImpact: 3, treatment: 'Transfer', treatmentProgress: 80, status: 'Mitigating', dateIdentified: '2025-10-12', reviewDate: '2026-06-15', financialExposure: 850000, riskTrend: 'Decreasing', treatmentPlan: 'Cyber insurance policy updated to include supply chain. Vendor MFA enforcement and data access minimisation.', linkedControls: 5 },
  { id: 'R-103', title: 'GDPR / Data Protection Regulatory Non-Compliance', category: 'Compliance', description: 'Gaps in data retention, consent management, and cross-border transfer safeguards expose the organisation to significant fines.', owner: 'Alex C.', inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 1, residualImpact: 3, treatment: 'Mitigate', treatmentProgress: 90, status: 'Mitigating', dateIdentified: '2025-06-05', reviewDate: '2026-07-01', financialExposure: 400000, riskTrend: 'Decreasing', treatmentPlan: 'DPA updated, Privacy by Design training rolled out, cross-border SCCs reviewed by legal.', linkedControls: 12 },
  { id: 'R-104', title: 'Malicious Insider Threat — Privileged Access Abuse', category: 'Cyber', description: 'A disgruntled or compromised insider with privileged access could exfiltrate sensitive data or sabotage systems.', owner: 'David M.', inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3, treatment: 'Mitigate', treatmentProgress: 45, status: 'Mitigating', dateIdentified: '2025-11-20', reviewDate: '2026-05-20', financialExposure: 320000, riskTrend: 'Increasing', treatmentPlan: 'Privileged Access Management (PAM) deployment underway. User Behaviour Analytics (UBA) in evaluation.', linkedControls: 6 },
  { id: 'R-105', title: 'Critical Supplier Business Continuity Failure', category: 'Operational', description: 'Single-source dependency on key cloud providers. If a primary IaaS provider fails, core services could be unavailable for extended periods.', owner: 'Alex C.', inherentLikelihood: 2, inherentImpact: 5, residualLikelihood: 1, residualImpact: 4, treatment: 'Mitigate', treatmentProgress: 55, status: 'Mitigating', dateIdentified: '2025-08-10', reviewDate: '2026-08-10', financialExposure: 680000, riskTrend: 'Stable', treatmentPlan: 'Multi-cloud architecture roadmap approved. Pilot of redundant DR environment in Azure underway.', linkedControls: 4 },
  { id: 'R-106', title: 'Unpatched Critical CVEs in Production Systems', category: 'Cyber', description: 'Known critical vulnerabilities in production infrastructure that have not yet been patched due to change freeze constraints.', owner: 'David M.', inherentLikelihood: 4, inherentImpact: 4, residualLikelihood: 3, residualImpact: 3, treatment: 'Mitigate', treatmentProgress: 40, status: 'Open', dateIdentified: '2026-02-14', reviewDate: '2026-05-14', financialExposure: 210000, riskTrend: 'Increasing', treatmentPlan: 'Patch management sprint initiated. Compensating controls (WAF, IPS rules) deployed pending patch window.', linkedControls: 3 },
  { id: 'R-107', title: 'Financial Fraud via Payment System Manipulation', category: 'Financial', description: 'Fraudulent manipulation of payment flows through social engineering or BEC targeting finance staff.', owner: 'Elena R.', inherentLikelihood: 2, inherentImpact: 3, residualLikelihood: 1, residualImpact: 2, treatment: 'Accept', treatmentProgress: 100, status: 'Accepted', dateIdentified: '2025-04-01', reviewDate: '2026-04-01', financialExposure: 75000, riskTrend: 'Stable', treatmentPlan: 'Dual-authorisation enforced for transactions above threshold. Risk accepted within appetite; insurance cover in place.', linkedControls: 7 },
  { id: 'R-108', title: 'AI Model Bias Resulting in Regulatory Scrutiny', category: 'Strategic', description: 'AI-based decision tools used in customer profiling may introduce bias, triggering regulatory investigation and reputational damage.', owner: 'Elena R.', inherentLikelihood: 2, inherentImpact: 3, residualLikelihood: 1, residualImpact: 2, treatment: 'Transfer', treatmentProgress: 70, status: 'Mitigating', dateIdentified: '2026-01-08', reviewDate: '2026-07-08', financialExposure: 180000, riskTrend: 'Stable', treatmentPlan: 'AI Governance policy drafted. Bias audits contracted to specialist external firm. Model cards introduced.', linkedControls: 2 },
  { id: 'R-109', title: 'Key Person Dependency — Security Leadership', category: 'Strategic', description: 'Critical institutional knowledge and programme ownership concentrated in one or two individuals. Departure risk is high.', owner: 'Sarah L.', inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 2, treatment: 'Mitigate', treatmentProgress: 30, status: 'Open', dateIdentified: '2025-12-01', reviewDate: '2026-06-01', financialExposure: 90000, riskTrend: 'Increasing', treatmentPlan: 'Succession planning programme initiated. Knowledge base documentation being formalised.', linkedControls: 1 },
  { id: 'R-110', title: 'DDoS Attack Causing Service Unavailability', category: 'Cyber', description: 'Volumetric DDoS targeting public-facing services could cause prolonged outages and SLA breaches.', owner: 'David M.', inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 1, residualImpact: 3, treatment: 'Mitigate', treatmentProgress: 60, status: 'Mitigating', dateIdentified: '2025-07-22', reviewDate: '2026-07-22', financialExposure: 150000, riskTrend: 'Stable', treatmentPlan: 'CDN-based DDoS scrubbing deployed. Rate limiting and geo-blocking configured. Runbook tested quarterly.', linkedControls: 5 },
  { id: 'R-111', title: 'Data Residency Non-Compliance — Cross-Border Transfers', category: 'Compliance', description: 'Data processed by US-based analytics sub-processors may violate EU data residency obligations under GDPR Article 44.', owner: 'Alex C.', inherentLikelihood: 2, inherentImpact: 4, residualLikelihood: 1, residualImpact: 2, treatment: 'Mitigate', treatmentProgress: 85, status: 'Mitigating', dateIdentified: '2025-03-14', reviewDate: '2026-03-14', financialExposure: 220000, riskTrend: 'Decreasing', treatmentPlan: 'SCCs executed with all affected vendors. Data flow mapping completed. DPA review ongoing.', linkedControls: 9 },
  { id: 'R-112', title: 'Reputational Damage from Public Security Incident', category: 'Reputational', description: 'A publicly disclosed breach or compliance failure could erode customer trust, trigger media coverage, and impact revenue.', owner: 'Sarah L.', inherentLikelihood: 2, inherentImpact: 4, residualLikelihood: 1, residualImpact: 3, treatment: 'Mitigate', treatmentProgress: 50, status: 'Open', dateIdentified: '2026-01-20', reviewDate: '2026-07-20', financialExposure: 350000, riskTrend: 'Stable', treatmentPlan: 'Crisis comms playbook drafted. PR firm on retainer. Board-level cyber briefing cadence established.', linkedControls: 3 },
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

let counters = { R: 112, F: 503, V: 2, T: 4, E: 4, N: 0 };

export function nextId(prefix: 'R' | 'F' | 'V' | 'T' | 'E' | 'N'): string {
  counters[prefix]++;
  const pad = prefix === 'R' || prefix === 'F' ? 3 : prefix === 'N' ? 4 : 3;
  return `${prefix}-${String(counters[prefix]).padStart(pad, '0')}`;
}
