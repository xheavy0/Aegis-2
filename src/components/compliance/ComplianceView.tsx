import React, { useState, useMemo } from 'react';
import {
  Shield, BookOpen, Landmark, Target, CheckCircle2, AlertCircle,
  Clock, X, Search, ChevronRight, FileText, Activity, BarChart2,
  AlertTriangle, Plus, User, Layers, TrendingUp, Calendar,
  ClipboardCheck, ArrowUpRight, Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '@/src/types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, PieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type ControlStatus = 'Passing' | 'Failing' | 'In Progress' | 'Not Tested' | 'Waived';

interface Domain {
  name: string;
  shortName: string;
  color: string;
  passing: number;
  failing: number;
  inProgress: number;
  notTested: number;
  total: number;
}

interface FrameworkDef {
  id: string;
  name: string;
  version: string;
  full: string;
  description: string;
  icon: React.FC<any>;
  color: string;
  passing: number;
  failing: number;
  inProgress: number;
  notTested: number;
  waived: number;
  lastAssessment: string;
  nextAudit: string;
  auditor: string;
  auditType: string;
  domains: Domain[];
  active: boolean;
}

interface Control {
  id: string;
  frameworkId: string;
  domain: string;
  name: string;
  description: string;
  status: ControlStatus;
  evidenceCount: number;
  owner: string;
  lastTested: string;
}

// ─── Framework Catalog (all available frameworks) ─────────────────────────────

interface FrameworkCatalogEntry {
  id: string;
  name: string;
  shortName: string;
  version: string;
  category: 'Cybersecurity' | 'Privacy' | 'Payment' | 'Cloud' | 'Defense' | 'Healthcare';
  description: string;
  controlCount: string;
  color: string;
  icon: React.FC<any>;
  popular?: boolean;
}

const FRAMEWORK_CATALOG: FrameworkCatalogEntry[] = [
  { id: 'nist',     name: 'NIST Cybersecurity Framework', shortName: 'NIST CSF 2.0',  version: '2.0',         category: 'Cybersecurity', description: '6 functions, 44 categories. The gold standard for cybersecurity risk management.',             controlCount: '106 subcategories', color: '#3b82f6', icon: Shield,      popular: true },
  { id: 'iso',      name: 'ISO/IEC 27001',                shortName: 'ISO 27001',      version: '2022',        category: 'Cybersecurity', description: 'International ISMS standard. Annex A with 93 controls across 4 control themes.',              controlCount: '93 controls',       color: '#10b981', icon: BookOpen,    popular: true },
  { id: 'soc2',     name: 'SOC 2 Type II',                shortName: 'SOC 2',          version: 'AICPA 2017',  category: 'Cloud',         description: 'Trust Services Criteria for SaaS and cloud service providers.',                             controlCount: '64 criteria',       color: '#8b5cf6', icon: Landmark,    popular: true },
  { id: 'pci',      name: 'PCI DSS',                      shortName: 'PCI DSS 4.0',    version: '4.0',         category: 'Payment',       description: 'Payment card data security for all entities that store, process or transmit cardholder data.', controlCount: '281 requirements',  color: '#f59e0b', icon: Target,      popular: true },
  { id: 'nist800',  name: 'NIST SP 800-53',               shortName: 'NIST 800-53',    version: 'Rev 5',       category: 'Cybersecurity', description: 'Security and privacy controls for federal information systems.',                             controlCount: '1000+ controls',   color: '#6366f1', icon: Shield },
  { id: 'gdpr',     name: 'GDPR',                         shortName: 'GDPR',           version: 'EU 2016/679', category: 'Privacy',       description: 'EU regulation on data protection and privacy for all individuals within the EU.',              controlCount: '99 articles',       color: '#06b6d4', icon: BookOpen },
  { id: 'hipaa',    name: 'HIPAA',                        shortName: 'HIPAA',          version: '2013 Final',  category: 'Healthcare',    description: 'US healthcare data privacy and security rules for protected health information.',              controlCount: '75+ safeguards',   color: '#ec4899', icon: Activity },
  { id: 'cmmc',     name: 'CMMC',                         shortName: 'CMMC 2.0',       version: '2.0',         category: 'Defense',       description: 'Cybersecurity Maturity Model Certification for DoD contractors.',                            controlCount: '110 practices',    color: '#ef4444', icon: Shield },
  { id: 'cis',      name: 'CIS Controls',                 shortName: 'CIS v8',         version: 'v8',          category: 'Cybersecurity', description: '18 prioritized safeguards to protect organizations against common cyber attacks.',              controlCount: '153 safeguards',   color: '#f97316', icon: Target },
  { id: 'fedramp',  name: 'FedRAMP',                      shortName: 'FedRAMP',        version: 'Rev 5',       category: 'Cloud',         description: 'US federal government cloud security authorization program.',                                 controlCount: '325 controls',     color: '#1d4ed8', icon: Landmark },
  { id: 'ccpa',     name: 'CCPA',                         shortName: 'CCPA',           version: '2020',        category: 'Privacy',       description: 'California Consumer Privacy Act — consumer data rights and business obligations.',             controlCount: '30+ requirements', color: '#7c3aed', icon: BookOpen },
  { id: 'dora',     name: 'DORA',                         shortName: 'DORA',           version: 'EU 2022/2554',category: 'Cybersecurity', description: 'EU Digital Operational Resilience Act for financial sector entities.',                        controlCount: '70+ requirements', color: '#0891b2', icon: Activity },
];

// ─── Framework Data ───────────────────────────────────────────────────────────

const FRAMEWORKS: FrameworkDef[] = [
  {
    id: 'nist', name: 'NIST CSF 2.0', version: '2.0', full: 'Cybersecurity Framework 2.0',
    description: 'Core framework for managing cybersecurity risk. Structured around six functions: Govern, Identify, Protect, Detect, Respond, Recover.',
    icon: Shield, color: '#3b82f6',
    passing: 78, failing: 15, inProgress: 10, notTested: 5, waived: 0,
    lastAssessment: '2026-02-12', nextAudit: '2026-08-01', auditor: 'Deloitte', auditType: 'External Assessment',
    active: true,
    domains: [
      { name: 'Govern',   shortName: 'GV', color: '#6366f1', passing: 23, failing: 4,  inProgress: 3, notTested: 1, total: 31 },
      { name: 'Identify', shortName: 'ID', color: '#3b82f6', passing: 18, failing: 5,  inProgress: 4, notTested: 2, total: 29 },
      { name: 'Protect',  shortName: 'PR', color: '#10b981', passing: 20, failing: 14, inProgress: 6, notTested: 4, total: 44 },
      { name: 'Detect',   shortName: 'DE', color: '#f59e0b', passing: 9,  failing: 5,  inProgress: 2, notTested: 2, total: 18 },
      { name: 'Respond',  shortName: 'RS', color: '#ef4444', passing: 18, failing: 2,  inProgress: 1, notTested: 0, total: 21 },
      { name: 'Recover',  shortName: 'RC', color: '#8b5cf6', passing: 8,  failing: 2,  inProgress: 1, notTested: 1, total: 12 },
    ],
  },
  {
    id: 'iso', name: 'ISO 27001', version: '2022', full: 'Information Security Management',
    description: 'International standard for establishing, implementing, maintaining and continuously improving an information security management system (ISMS).',
    icon: BookOpen, color: '#10b981',
    passing: 78, failing: 9, inProgress: 4, notTested: 2, waived: 0,
    lastAssessment: '2025-11-05', nextAudit: '2026-11-05', auditor: 'BSI Group', auditType: 'Surveillance Audit',
    active: false,
    domains: [
      { name: 'Organizational Controls', shortName: 'Org', color: '#10b981', passing: 32, failing: 3, inProgress: 1, notTested: 1, total: 37 },
      { name: 'People Controls',         shortName: 'Ppl', color: '#06b6d4', passing: 7,  failing: 1, inProgress: 0, notTested: 0, total: 8  },
      { name: 'Physical Controls',       shortName: 'Phy', color: '#14b8a6', passing: 13, failing: 1, inProgress: 0, notTested: 0, total: 14 },
      { name: 'Technological Controls',  shortName: 'Tec', color: '#6366f1', passing: 26, failing: 4, inProgress: 3, notTested: 1, total: 34 },
    ],
  },
  {
    id: 'soc2', name: 'SOC 2 Type II', version: '2017', full: 'Trust Services Criteria',
    description: 'Criteria for managing customer data based on the five Trust Service Principles: Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
    icon: Landmark, color: '#8b5cf6',
    passing: 51, failing: 22, inProgress: 8, notTested: 4, waived: 0,
    lastAssessment: '2025-09-30', nextAudit: '2026-09-30', auditor: 'PwC', auditType: 'Type II Audit',
    active: false,
    domains: [
      { name: 'Control Environment',    shortName: 'CC1', color: '#8b5cf6', passing: 7,  failing: 1, inProgress: 1, notTested: 0, total: 9  },
      { name: 'Communication & Info',   shortName: 'CC2', color: '#a78bfa', passing: 4,  failing: 1, inProgress: 0, notTested: 0, total: 5  },
      { name: 'Risk Assessment',        shortName: 'CC3', color: '#7c3aed', passing: 4,  failing: 2, inProgress: 0, notTested: 0, total: 6  },
      { name: 'Monitoring Activities',  shortName: 'CC4', color: '#6d28d9', passing: 3,  failing: 1, inProgress: 1, notTested: 0, total: 5  },
      { name: 'Control Activities',     shortName: 'CC5', color: '#5b21b6', passing: 4,  failing: 2, inProgress: 1, notTested: 0, total: 7  },
      { name: 'Logical Access',         shortName: 'CC6', color: '#4c1d95', passing: 11, failing: 5, inProgress: 1, notTested: 1, total: 18 },
      { name: 'System Operations',      shortName: 'CC7', color: '#8b5cf6', passing: 8,  failing: 4, inProgress: 1, notTested: 1, total: 14 },
      { name: 'Change Management',      shortName: 'CC8', color: '#a78bfa', passing: 5,  failing: 3, inProgress: 1, notTested: 0, total: 9  },
      { name: 'Risk Mitigation',        shortName: 'CC9', color: '#7c3aed', passing: 5,  failing: 3, inProgress: 2, notTested: 2, total: 12 },
    ],
  },
  {
    id: 'pci', name: 'PCI DSS 4.0', version: '4.0', full: 'Payment Card Industry Data Security',
    description: 'Global data security standard for all entities that store, process or transmit cardholder data, ensuring a secure payment card ecosystem.',
    icon: Target, color: '#f59e0b',
    passing: 12, failing: 0, inProgress: 0, notTested: 0, waived: 0,
    lastAssessment: '2026-03-01', nextAudit: '2027-03-01', auditor: 'Coalfire QSA', auditType: 'ROC Assessment',
    active: false,
    domains: [
      { name: 'Network Security',      shortName: 'R1',  color: '#f59e0b', passing: 2, failing: 0, inProgress: 0, notTested: 0, total: 2 },
      { name: 'Cardholder Data',       shortName: 'R2',  color: '#d97706', passing: 2, failing: 0, inProgress: 0, notTested: 0, total: 2 },
      { name: 'Vulnerability Mgmt',    shortName: 'R6',  color: '#b45309', passing: 2, failing: 0, inProgress: 0, notTested: 0, total: 2 },
      { name: 'Access Control',        shortName: 'R7',  color: '#92400e', passing: 2, failing: 0, inProgress: 0, notTested: 0, total: 2 },
      { name: 'Monitoring & Testing',  shortName: 'R10', color: '#f59e0b', passing: 2, failing: 0, inProgress: 0, notTested: 0, total: 2 },
      { name: 'Security Policy',       shortName: 'R12', color: '#d97706', passing: 2, failing: 0, inProgress: 0, notTested: 0, total: 2 },
    ],
  },
];

// ─── Sample Controls ──────────────────────────────────────────────────────────

const CONTROLS: Control[] = [
  // NIST
  { id:'GV.OC-01', frameworkId:'nist', domain:'Govern',   name:'Organizational Mission & Objectives',     description:'Mission, objectives, stakeholders and activities are understood and prioritized.',    status:'Passing',     evidenceCount:3, owner:'Alex C.',   lastTested:'2026-04-01' },
  { id:'GV.RM-01', frameworkId:'nist', domain:'Govern',   name:'Risk Management Strategy',                description:'Risk management objectives and goals are established and agreed.',                   status:'Passing',     evidenceCount:2, owner:'Alex C.',   lastTested:'2026-03-15' },
  { id:'GV.SC-01', frameworkId:'nist', domain:'Govern',   name:'Cybersecurity Supply Chain Risk',         description:'A cybersecurity supply chain risk management program is established.',               status:'In Progress', evidenceCount:1, owner:'Sarah L.',  lastTested:'2026-02-01' },
  { id:'ID.AM-01', frameworkId:'nist', domain:'Identify', name:'Inventory of Physical Assets',            description:'Physical devices and systems are inventoried and managed.',                         status:'Passing',     evidenceCount:4, owner:'David M.',  lastTested:'2026-04-10' },
  { id:'ID.AM-02', frameworkId:'nist', domain:'Identify', name:'Inventory of Software Assets',            description:'Software platforms and applications are inventoried within the organisation.',       status:'Passing',     evidenceCount:3, owner:'David M.',  lastTested:'2026-04-10' },
  { id:'ID.RA-01', frameworkId:'nist', domain:'Identify', name:'Asset Vulnerabilities Identified',        description:'Vulnerabilities in assets are identified and documented.',                          status:'Failing',     evidenceCount:0, owner:'David M.',  lastTested:'2025-11-01' },
  { id:'PR.AC-01', frameworkId:'nist', domain:'Protect',  name:'Identities & Credentials Managed',        description:'Identities and credentials are issued, managed and verified.',                      status:'Passing',     evidenceCount:5, owner:'Alex C.',   lastTested:'2026-04-05' },
  { id:'PR.AC-03', frameworkId:'nist', domain:'Protect',  name:'Remote Access Managed',                   description:'Remote access is managed with least privilege.',                                    status:'Passing',     evidenceCount:3, owner:'David M.',  lastTested:'2026-03-20' },
  { id:'PR.DS-01', frameworkId:'nist', domain:'Protect',  name:'Data-at-Rest Protected',                  description:'Data-at-rest is protected via encryption and access controls.',                     status:'Failing',     evidenceCount:0, owner:'Elena R.',  lastTested:'2025-10-15' },
  { id:'PR.DS-02', frameworkId:'nist', domain:'Protect',  name:'Data-in-Transit Protected',               description:'Data-in-transit is protected via TLS 1.2+ and certificate management.',            status:'In Progress', evidenceCount:1, owner:'Elena R.',  lastTested:'2026-01-20' },
  { id:'DE.CM-01', frameworkId:'nist', domain:'Detect',   name:'Networks Monitored',                      description:'The network is monitored to detect potential cybersecurity events.',                 status:'Passing',     evidenceCount:6, owner:'David M.',  lastTested:'2026-04-01' },
  { id:'DE.AE-01', frameworkId:'nist', domain:'Detect',   name:'Baseline of Operations Established',      description:'A baseline of network operations and expected data flows is established.',           status:'Failing',     evidenceCount:0, owner:'Alex C.',   lastTested:'2025-09-01' },
  { id:'RS.RP-01', frameworkId:'nist', domain:'Respond',  name:'Incident Response Plan Executed',         description:'Response plan is executed during or after a cybersecurity incident.',                status:'Passing',     evidenceCount:4, owner:'Alex C.',   lastTested:'2026-03-01' },
  { id:'RC.RP-01', frameworkId:'nist', domain:'Recover',  name:'Recovery Plan Executed',                  description:'Recovery plan is executed during or after a cybersecurity incident.',                status:'Passing',     evidenceCount:3, owner:'Alex C.',   lastTested:'2026-03-01' },
  { id:'PR.PS-01', frameworkId:'nist', domain:'Protect',  name:'Configuration Management',                description:'Configurations of hardware and software are maintained.',                           status:'Failing',     evidenceCount:1, owner:'David M.',  lastTested:'2025-12-01' },
  { id:'ID.GV-01', frameworkId:'nist', domain:'Govern',   name:'Cybersecurity Policy Established',        description:'Cybersecurity policy established and communicated.',                                status:'Passing',     evidenceCount:2, owner:'Sarah L.',  lastTested:'2026-01-10' },
  { id:'PR.IR-01', frameworkId:'nist', domain:'Protect',  name:'Awareness & Training Program',            description:'Awareness & training provided for all users.',                                      status:'In Progress', evidenceCount:2, owner:'Sarah L.',  lastTested:'2026-02-15' },
  { id:'DE.DP-01', frameworkId:'nist', domain:'Detect',   name:'Detection Processes & Procedures',        description:'Detection processes and procedures are maintained and tested.',                      status:'Not Tested',  evidenceCount:0, owner:'David M.',  lastTested:'' },

  // ISO 27001
  { id:'A.5.1',  frameworkId:'iso', domain:'Organizational Controls', name:'Policies for Information Security',    description:'InfoSec policies defined, approved and communicated to employees.',                status:'Passing',     evidenceCount:3, owner:'Sarah L.',  lastTested:'2026-03-10' },
  { id:'A.5.2',  frameworkId:'iso', domain:'Organizational Controls', name:'Information Security Roles & Responsibilities', description:'All InfoSec responsibilities are defined and allocated.',             status:'Passing',     evidenceCount:2, owner:'Sarah L.',  lastTested:'2026-03-10' },
  { id:'A.5.15', frameworkId:'iso', domain:'Organizational Controls', name:'Access Control Policy',               description:'Access control rules and procedures are defined and documented.',               status:'Passing',     evidenceCount:4, owner:'Alex C.',   lastTested:'2026-04-01' },
  { id:'A.5.23', frameworkId:'iso', domain:'Organizational Controls', name:'InfoSec for Cloud Services',          description:'Processes for acquiring, using, managing and exiting cloud services.',           status:'Failing',     evidenceCount:1, owner:'Elena R.',  lastTested:'2025-11-20' },
  { id:'A.6.1',  frameworkId:'iso', domain:'People Controls',         name:'Screening',                           description:'Background verification checks on candidates prior to employment.',              status:'Passing',     evidenceCount:2, owner:'Sarah L.',  lastTested:'2026-02-01' },
  { id:'A.6.3',  frameworkId:'iso', domain:'People Controls',         name:'InfoSec Awareness, Education & Training', description:'Awareness and training programmes for all personnel.',                    status:'In Progress', evidenceCount:1, owner:'Sarah L.',  lastTested:'2026-01-15' },
  { id:'A.7.1',  frameworkId:'iso', domain:'Physical Controls',       name:'Physical Security Perimeters',        description:'Physical security perimeters defined for areas containing information assets.',   status:'Passing',     evidenceCount:3, owner:'David M.',  lastTested:'2026-02-20' },
  { id:'A.7.4',  frameworkId:'iso', domain:'Physical Controls',       name:'Physical Security Monitoring',        description:'Premises are continually monitored for unauthorised physical access.',           status:'Passing',     evidenceCount:5, owner:'David M.',  lastTested:'2026-03-01' },
  { id:'A.8.1',  frameworkId:'iso', domain:'Technological Controls',  name:'User Endpoint Devices',               description:'Information on user endpoint devices is protected.',                           status:'Passing',     evidenceCount:4, owner:'David M.',  lastTested:'2026-04-05' },
  { id:'A.8.5',  frameworkId:'iso', domain:'Technological Controls',  name:'Secure Authentication',               description:'Secure authentication technology and procedures implemented.',                  status:'Passing',     evidenceCount:3, owner:'Alex C.',   lastTested:'2026-03-15' },
  { id:'A.8.8',  frameworkId:'iso', domain:'Technological Controls',  name:'Management of Technical Vulnerabilities', description:'Technical vulnerabilities managed and patch timelines defined.',            status:'Failing',     evidenceCount:1, owner:'David M.',  lastTested:'2025-10-01' },
  { id:'A.8.24', frameworkId:'iso', domain:'Technological Controls',  name:'Use of Cryptography',                 description:'Rules for use of cryptography, incl. management of cryptographic keys.',       status:'Passing',     evidenceCount:2, owner:'Elena R.',  lastTested:'2026-01-20' },

  // SOC 2
  { id:'CC1.1', frameworkId:'soc2', domain:'Control Environment',   name:'Commitment to Integrity & Ethics',     description:'Entity demonstrates commitment to integrity and ethical values.',                  status:'Passing',     evidenceCount:4, owner:'Sarah L.',  lastTested:'2026-02-01' },
  { id:'CC1.3', frameworkId:'soc2', domain:'Control Environment',   name:'Organisational Structure',             description:'Management establishes structures, reporting lines and appropriate authorities.',   status:'Passing',     evidenceCount:2, owner:'Sarah L.',  lastTested:'2026-02-01' },
  { id:'CC3.1', frameworkId:'soc2', domain:'Risk Assessment',       name:'Risk Assessment Objectives',           description:'Entity specifies objectives to identify and assess risks.',                       status:'Failing',     evidenceCount:1, owner:'Alex C.',   lastTested:'2025-08-01' },
  { id:'CC3.2', frameworkId:'soc2', domain:'Risk Assessment',       name:'Risk Identification & Analysis',       description:'Entity identifies risks to achievement of objectives.',                           status:'Failing',     evidenceCount:0, owner:'Alex C.',   lastTested:'2025-08-01' },
  { id:'CC5.2', frameworkId:'soc2', domain:'Control Activities',    name:'Technology Controls Deployed',         description:'Entity selects and develops technology controls to support achievement of objectives.', status:'In Progress', evidenceCount:1, owner:'David M.',  lastTested:'2026-01-10' },
  { id:'CC6.1', frameworkId:'soc2', domain:'Logical Access',        name:'Logical Access Security',              description:'Entity restricts logical access to assets to authorised users.',                  status:'Passing',     evidenceCount:5, owner:'Alex C.',   lastTested:'2026-04-01' },
  { id:'CC6.2', frameworkId:'soc2', domain:'Logical Access',        name:'New Access Provisioning',              description:'Prior to issuing credentials, entity registers and authorises new users.',        status:'Passing',     evidenceCount:3, owner:'Alex C.',   lastTested:'2026-04-01' },
  { id:'CC6.6', frameworkId:'soc2', domain:'Logical Access',        name:'Security Measures Outside Boundaries', description:'Security measures protect against threats outside system boundaries.',            status:'Failing',     evidenceCount:1, owner:'David M.',  lastTested:'2025-10-20' },
  { id:'CC7.1', frameworkId:'soc2', domain:'System Operations',     name:'Infrastructure Components Monitored',  description:'Entity detects and monitors for vulnerabilities in infrastructure components.',    status:'Passing',     evidenceCount:4, owner:'David M.',  lastTested:'2026-03-01' },
  { id:'CC7.2', frameworkId:'soc2', domain:'System Operations',     name:'Anomalies & Security Events Evaluated', description:'Entity monitors system components for anomalies and security events.',           status:'Passing',     evidenceCount:3, owner:'David M.',  lastTested:'2026-03-01' },
  { id:'CC8.1', frameworkId:'soc2', domain:'Change Management',     name:'Authorisation & Design of Changes',    description:'Entity authorises, designs and approves changes to infrastructure, data and software.',status:'Failing',    evidenceCount:1, owner:'Alex C.',   lastTested:'2025-11-01' },
  { id:'CC9.1', frameworkId:'soc2', domain:'Risk Mitigation',       name:'Risk Mitigation Activities',           description:'Entity identifies and selects responses to risks from business disruption.',        status:'Failing',     evidenceCount:0, owner:'Alex C.',   lastTested:'2025-09-01' },

  // PCI DSS
  { id:'R1.1', frameworkId:'pci', domain:'Network Security',     name:'Network Security Controls',       description:'Processes and mechanisms for installing and maintaining network security controls.', status:'Passing', evidenceCount:5, owner:'David M.', lastTested:'2026-03-01' },
  { id:'R2.1', frameworkId:'pci', domain:'Cardholder Data',      name:'Secure Configurations Applied',   description:'Processes and mechanisms for applying secure configurations to all system components.', status:'Passing', evidenceCount:4, owner:'David M.', lastTested:'2026-03-01' },
  { id:'R3.1', frameworkId:'pci', domain:'Cardholder Data',      name:'Account Data Protected',          description:'Processes and mechanisms for protecting stored account data.',                     status:'Passing', evidenceCount:6, owner:'Elena R.', lastTested:'2026-03-01' },
  { id:'R6.1', frameworkId:'pci', domain:'Vulnerability Mgmt',   name:'Bespoke Software Developed Securely', description:'All software is developed and maintained securely.',                          status:'Passing', evidenceCount:3, owner:'David M.', lastTested:'2026-03-01' },
  { id:'R7.1', frameworkId:'pci', domain:'Access Control',       name:'Access Restricted by Business Need', description:'Access to system components and cardholder data restricted.',                  status:'Passing', evidenceCount:4, owner:'Alex C.',  lastTested:'2026-03-01' },
  { id:'R10.1',frameworkId:'pci', domain:'Monitoring & Testing', name:'All Access to System Components Logged', description:'All access to system components and cardholder data is logged.',             status:'Passing', evidenceCount:5, owner:'David M.', lastTested:'2026-03-01' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ControlStatus, { bg: string; text: string; border: string; dot: string }> = {
  Passing:      { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  Failing:      { bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-600 dark:text-red-400',         border: 'border-red-200 dark:border-red-800',         dot: 'bg-red-500'     },
  'In Progress':{ bg: 'bg-blue-50 dark:bg-blue-900/20',       text: 'text-blue-600 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-800',       dot: 'bg-blue-500'    },
  'Not Tested': { bg: 'bg-slate-100 dark:bg-white/10',        text: 'text-slate-500 dark:text-slate-400',     border: 'border-slate-200 dark:border-aegis-border',  dot: 'bg-slate-400'   },
  Waived:       { bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-800',     dot: 'bg-amber-500'   },
};

function StatusBadge({ status }: { status: ControlStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border', c.bg, c.text, c.border)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />{status}
    </span>
  );
}

function readinessPct(fw: FrameworkDef) {
  const total = fw.passing + fw.failing + fw.inProgress + fw.notTested + fw.waived;
  return total > 0 ? Math.round((fw.passing / total) * 100) : 0;
}

function ReadinessRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-white/10" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fill={color} fontSize="12" fontWeight="900" className="rotate-90" style={{ transform: `rotate(90deg) translate(0, ${-size/2}px)` }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── Framework Detail Panel ───────────────────────────────────────────────────

type DetailTab = 'Overview' | 'Controls' | 'Gap Analysis' | 'Audit Readiness';

function FrameworkDetail({ fw, onClose, onNotify }: {
  fw: FrameworkDef;
  onClose: () => void;
  onNotify: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}) {
  const [tab, setTab] = useState<DetailTab>('Overview');
  const [search, setSearch] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<ControlStatus | 'All'>('All');

  const pct = readinessPct(fw);
  const total = fw.passing + fw.failing + fw.inProgress + fw.notTested + fw.waived;

  const controls = CONTROLS.filter(c => c.frameworkId === fw.id);
  const filteredControls = controls.filter(c => {
    if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDomain !== 'All' && c.domain !== filterDomain) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    return true;
  });

  const statusPieData = [
    { name: 'Passing', value: fw.passing, fill: '#10b981' },
    { name: 'Failing', value: fw.failing, fill: '#ef4444' },
    { name: 'In Progress', value: fw.inProgress, fill: '#3b82f6' },
    { name: 'Not Tested', value: fw.notTested, fill: '#94a3b8' },
  ].filter(d => d.value > 0);

  const domainChartData = fw.domains.map(d => ({
    name: d.shortName,
    pct: Math.round((d.passing / d.total) * 100),
    fill: d.color,
  }));

  const failingControls = controls.filter(c => c.status === 'Failing');
  const notTestedControls = controls.filter(c => c.status === 'Not Tested');

  const TABS: DetailTab[] = ['Overview', 'Controls', 'Gap Analysis', 'Audit Readiness'];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="fixed inset-x-4 top-[4%] bottom-[4%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-5xl bg-white dark:bg-aegis-surface shadow-2xl rounded-2xl z-[101] overflow-hidden flex flex-col border border-slate-200 dark:border-aegis-border"
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 dark:border-aegis-border flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${fw.color}08, transparent)` }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: fw.color }}>
              <fw.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">{fw.name}</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{fw.full} · {fw.auditType}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Readiness Ring */}
            <div className="relative flex items-center justify-center">
              <svg width="52" height="52" className="-rotate-90">
                <circle cx="26" cy="26" r="20" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-100 dark:text-white/10" />
                <circle cx="26" cy="26" r="20" fill="none" stroke={fw.color} strokeWidth="5"
                  strokeDasharray={`${(pct / 100) * (2 * Math.PI * 20)} ${2 * Math.PI * 20}`} strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-black" style={{ color: fw.color }}>{pct}%</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/5 px-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('py-3 px-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 -mb-px',
                tab === t ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}>
              {t}
              {t === 'Gap Analysis' && (fw.failing + fw.notTested) > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[7px]">{fw.failing + fw.notTested}</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
          {tab === 'Overview' && (
            <div className="p-7 space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{fw.description}</p>

              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Total Controls', value: total, color: 'text-slate-900 dark:text-white' },
                  { label: 'Passing', value: fw.passing, color: 'text-emerald-500' },
                  { label: 'Failing', value: fw.failing, color: 'text-red-500' },
                  { label: 'In Progress', value: fw.inProgress, color: 'text-blue-500' },
                  { label: 'Not Tested', value: fw.notTested, color: 'text-slate-400' },
                ].map((s, i) => (
                  <div key={i} className="glass-card p-4 text-center">
                    <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Donut */}
                <div className="glass-card p-5">
                  <p className="text-xs font-black text-slate-900 dark:text-white mb-4">Control Status Breakdown</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart style={{ background: 'transparent' }}>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {statusPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {statusPieData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                        <span className="text-[9px] font-bold text-slate-500">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domain Readiness Bars */}
                <div className="glass-card p-5">
                  <p className="text-xs font-black text-slate-900 dark:text-white mb-4">Readiness by Domain</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={domainChartData} margin={{ left: 0 }} style={{ background: 'transparent' }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} unit="%" />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(v: number) => [`${v}%`, 'Passing']} />
                      <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                        {domainChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Domain Detail */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain Breakdown</p>
                {fw.domains.map(d => {
                  const dpct = Math.round((d.passing / d.total) * 100);
                  return (
                    <div key={d.name} className="flex items-center gap-4">
                      <div className="w-28 flex-shrink-0">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{d.name}</span>
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${dpct}%`, backgroundColor: d.color }} />
                      </div>
                      <div className="flex-shrink-0 w-32 flex items-center gap-2">
                        <span className="text-xs font-black" style={{ color: d.color }}>{dpct}%</span>
                        <span className="text-[9px] text-slate-400">{d.passing}/{d.total} passing</span>
                        {d.failing > 0 && <span className="text-[9px] text-red-500 font-bold">{d.failing} failing</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Audit Info */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Last Assessment', value: fw.lastAssessment, icon: Calendar },
                  { label: 'Next Audit', value: fw.nextAudit, icon: Clock },
                  { label: 'Auditor / Type', value: `${fw.auditor} — ${fw.auditType}`, icon: ClipboardCheck },
                ].map((item, i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <item.icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONTROLS ──────────────────────────────────────────────────── */}
          {tab === 'Controls' && (
            <div className="p-7 space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search controls…"
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400" />
                </div>
                <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                  <option value="All">All Domains</option>
                  {fw.domains.map(d => <option key={d.name}>{d.name}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 bg-white dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-300">
                  <option value="All">All Statuses</option>
                  {(['Passing','Failing','In Progress','Not Tested','Waived'] as ControlStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
                <span className="text-[10px] text-slate-400 font-bold">{filteredControls.length} controls</span>
              </div>
              <div className="border border-slate-100 dark:border-aegis-border rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/5">
                      {['Control', 'Domain', 'Status', 'Evidence', 'Owner', 'Last Tested'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredControls.map(c => (
                      <tr key={c.id} className="border-b border-slate-50 dark:border-aegis-border/40 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-[9px] font-mono text-blue-500">{c.id}</div>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-500 dark:text-slate-400">{c.domain}</td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3">
                          <span className={cn('font-black', c.evidenceCount > 0 ? 'text-emerald-500' : 'text-red-400')}>{c.evidenceCount}</span>
                          <span className="text-slate-400 ml-1 text-[9px]">files</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.owner}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.lastTested || '—'}</td>
                      </tr>
                    ))}
                    {filteredControls.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">No controls match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── GAP ANALYSIS ──────────────────────────────────────────────── */}
          {tab === 'Gap Analysis' && (
            <div className="p-7 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 border-red-200 dark:border-red-900/40">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-black text-red-500">Failing Controls</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{fw.failing}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Active gaps requiring remediation</p>
                </div>
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-500">Not Tested</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{fw.notTested}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Controls awaiting initial evidence</p>
                </div>
              </div>

              {failingControls.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />Failing Controls — Action Required
                  </p>
                  <div className="space-y-2">
                    {failingControls.map(c => (
                      <div key={c.id} className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-mono font-black text-red-500">{c.id}</span>
                            <span className="text-[9px] text-slate-400">·</span>
                            <span className="text-[9px] text-slate-400">{c.domain}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{c.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-[9px] text-slate-400">Owner</p>
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{c.owner}</p>
                          <p className="text-[9px] text-red-400 mt-1">{c.evidenceCount} evidence files</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notTestedControls.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Not Tested — Evidence Required</p>
                  <div className="space-y-2">
                    {notTestedControls.map(c => (
                      <div key={c.id} className="p-4 rounded-xl border border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-aegis-bg flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-mono font-black text-slate-400">{c.id}</span>
                            <span className="text-[9px] text-slate-400">·</span>
                            <span className="text-[9px] text-slate-400">{c.domain}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex-shrink-0">
                          Upload Evidence
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {failingControls.length === 0 && notTestedControls.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                  <p className="text-base font-black text-slate-900 dark:text-white">No gaps identified</p>
                  <p className="text-sm text-slate-400 mt-1">All controls are passing or in active remediation.</p>
                </div>
              )}
            </div>
          )}

          {/* ── AUDIT READINESS ───────────────────────────────────────────── */}
          {tab === 'Audit Readiness' && (
            <div className="p-7 space-y-6">
              <div className="flex items-center gap-6 p-6 rounded-2xl border"
                style={{ borderColor: `${fw.color}30`, background: `${fw.color}08` }}>
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <svg width="96" height="96" className="-rotate-90">
                    <circle cx="48" cy="48" r="38" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/10" />
                    <circle cx="48" cy="48" r="38" fill="none" stroke={fw.color} strokeWidth="8"
                      strokeDasharray={`${(pct / 100) * (2 * Math.PI * 38)} ${2 * Math.PI * 38}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-2xl font-black leading-none" style={{ color: fw.color }}>{pct}%</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Ready</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{fw.name} Audit Readiness</h3>
                  <p className="text-sm text-slate-500 mt-1">Next audit: <span className="font-black text-slate-900 dark:text-white">{fw.nextAudit}</span> with {fw.auditor}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{fw.failing + fw.notTested} controls need attention before audit</p>
                </div>
              </div>

              <div className="space-y-3">
                {fw.domains.map(d => {
                  const dpct = Math.round((d.passing / d.total) * 100);
                  const ready = dpct >= 90;
                  return (
                    <div key={d.name} className={cn('p-4 rounded-xl border flex items-center gap-4', ready ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10' : d.failing > 0 ? 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-100 dark:border-aegis-border')}>
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', ready ? 'bg-emerald-500' : d.failing > 0 ? 'bg-red-500' : 'bg-amber-500')}>
                        {ready ? <CheckCircle2 className="w-4 h-4 text-white" /> : d.failing > 0 ? <AlertTriangle className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{d.name}</span>
                          <span className={cn('text-xs font-black', ready ? 'text-emerald-500' : d.failing > 0 ? 'text-red-500' : 'text-amber-500')}>{dpct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${dpct}%`, backgroundColor: d.color }} />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[9px] text-slate-400">{d.passing}/{d.total} passing</p>
                        {d.failing > 0 && <p className="text-[9px] text-red-500 font-bold">{d.failing} gaps</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 dark:border-aegis-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <span className="text-[9px] text-slate-400 font-bold">Last assessment: {fw.lastAssessment}</span>
          <div className="flex gap-3">
            <button onClick={() => onNotify({ title: 'Audit report exported', message: `${fw.name} audit readiness report exported.`, type: 'framework', audience: 'all' })}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
              <FileText className="w-3.5 h-3.5" />Export Report
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ComplianceViewProps {
  onNotify: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

// ─── Add Framework Modal ──────────────────────────────────────────────────────

const CATEGORY_ORDER = ['Cybersecurity', 'Privacy', 'Payment', 'Cloud', 'Defense', 'Healthcare'];

function AddFrameworkModal({ addedIds, onAdd, onClose }: {
  addedIds: string[];
  onAdd: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('All');

  const filtered = FRAMEWORK_CATALOG.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.shortName.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || f.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = ['All', ...CATEGORY_ORDER.filter(c => FRAMEWORK_CATALOG.some(f => f.category === c))];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="fixed inset-x-4 top-[6%] bottom-[6%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl bg-white dark:bg-aegis-surface shadow-2xl rounded-2xl z-[101] flex flex-col border border-slate-200 dark:border-aegis-border overflow-hidden"
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 dark:border-aegis-border flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Framework Catalog</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a compliance framework to add to your portfolio</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-7 py-4 border-b border-slate-100 dark:border-aegis-border flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search frameworks..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={cn('px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                  catFilter === c ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                )}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Framework List */}
        <div className="flex-1 overflow-y-auto p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(fw => {
              const isAdded = addedIds.includes(fw.id);
              return (
                <div key={fw.id} className={cn(
                  'p-4 rounded-xl border transition-all',
                  isAdded ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-aegis-border bg-white dark:bg-aegis-bg hover:border-slate-300 dark:hover:border-white/20'
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: fw.color }}>
                        <fw.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{fw.shortName}</span>
                          {fw.popular && <span className="text-[8px] font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded uppercase tracking-wider">Popular</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{fw.version} · {fw.category}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{fw.description}</p>
                        <div className="text-[10px] font-bold text-slate-400 mt-1.5">{fw.controlCount}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => !isAdded && onAdd(fw.id)}
                      disabled={isAdded}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                        isAdded
                          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {isAdded ? <><CheckCircle2 className="w-3 h-3" />Added</> : <><Plus className="w-3 h-3" />Add</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-7 py-4 border-t border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
          <span className="text-xs text-slate-400">{addedIds.length} frameworks added · {FRAMEWORK_CATALOG.length} available</span>
          <button onClick={onClose} className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider">Done</button>
        </div>
      </motion.div>
    </>
  );
}

export function ComplianceView({ onNotify }: ComplianceViewProps) {
  const [selectedFw, setSelectedFw] = useState<FrameworkDef | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [addedFrameworkIds, setAddedFrameworkIds] = useState<string[]>(['nist', 'iso', 'soc2', 'pci']);
  const [activeFrameworks, setActiveFrameworks] = useState<string[]>(['nist']);

  const visibleFrameworks = useMemo(() =>
    FRAMEWORKS.filter(f => addedFrameworkIds.includes(f.id)),
  [addedFrameworkIds]);

  const avgReadiness = useMemo(() => {
    const active = visibleFrameworks.filter(f => activeFrameworks.includes(f.id));
    if (active.length === 0) return 0;
    return Math.round(active.reduce((sum, f) => sum + readinessPct(f), 0) / active.length);
  }, [activeFrameworks, visibleFrameworks]);

  const totalControls = visibleFrameworks.filter(f => activeFrameworks.includes(f.id))
    .reduce((s, f) => s + f.passing + f.failing + f.inProgress + f.notTested, 0);

  const totalGaps = visibleFrameworks.filter(f => activeFrameworks.includes(f.id))
    .reduce((s, f) => s + f.failing, 0);

  const overviewData = visibleFrameworks.filter(f => activeFrameworks.includes(f.id)).map(f => ({
    name: f.name.split(' ')[0],
    readiness: readinessPct(f),
    fill: f.color,
  }));

  function handleAddFramework(id: string) {
    setAddedFrameworkIds(prev => prev.includes(id) ? prev : [...prev, id]);
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Frameworks</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Multi-framework compliance posture, control readiness, and audit management.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatalog(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Framework</button>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Frameworks', value: activeFrameworks.length, icon: Layers, color: 'text-blue-500' },
          { label: 'Avg Readiness', value: `${avgReadiness}%`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Total Controls', value: totalControls, icon: Shield, color: 'text-blue-500' },
          { label: 'Critical Gaps', value: totalGaps, icon: AlertTriangle, color: 'text-red-500', alert: totalGaps > 0 },
        ].map((s, i) => (
          <div key={i} className={cn('glass-card p-4 flex flex-col gap-2', s.alert ? 'border-red-200 dark:border-red-900/40' : '')}>
            <div className="flex items-center gap-2">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
            <p className={cn('text-2xl font-black leading-none', s.alert ? 'text-red-500' : 'text-slate-900 dark:text-white')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Framework Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleFrameworks.map(fw => {
          const pct = readinessPct(fw);
          const isActive = activeFrameworks.includes(fw.id);
          const total = fw.passing + fw.failing + fw.inProgress + fw.notTested;

          return (
            <motion.div key={fw.id} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
              className={cn('glass-card overflow-hidden cursor-pointer transition-all', isActive ? 'hover:border-blue-400/50' : 'opacity-50 grayscale-[0.6]')}
              onClick={() => isActive && setSelectedFw(fw)}>

              {/* Card Header */}
              <div className="px-6 pt-6 pb-4 flex items-start justify-between"
                style={{ background: `linear-gradient(135deg, ${fw.color}10, transparent)` }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: fw.color }}>
                    <fw.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">{fw.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{fw.full}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mini readiness ring */}
                  <div className="relative flex items-center justify-center">
                    <svg width="48" height="48" className="-rotate-90">
                      <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-100 dark:text-white/10" />
                      <circle cx="24" cy="24" r="18" fill="none" stroke={fw.color} strokeWidth="5"
                        strokeDasharray={`${(pct / 100) * (2 * Math.PI * 18)} ${2 * Math.PI * 18}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[10px] font-black" style={{ color: fw.color }}>{pct}%</span>
                  </div>
                  {/* Toggle */}
                  <button onClick={e => { e.stopPropagation(); setActiveFrameworks(prev => prev.includes(fw.id) ? prev.filter(id => id !== fw.id) : [...prev, fw.id]); }}
                    className={cn('relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors', isActive ? 'bg-blue-600' : 'bg-slate-200 dark:bg-aegis-border')}>
                    <span className={cn('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', isActive ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                </div>
              </div>

              {/* Status Bar */}
              <div className="px-6 pb-5 space-y-4">
                {/* Stacked status bar */}
                <div>
                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                    {fw.passing > 0    && <div className="bg-emerald-500 rounded-l-full" style={{ flex: fw.passing }} />}
                    {fw.inProgress > 0 && <div className="bg-blue-500" style={{ flex: fw.inProgress }} />}
                    {fw.failing > 0    && <div className="bg-red-500" style={{ flex: fw.failing }} />}
                    {fw.notTested > 0  && <div className="bg-slate-300 dark:bg-white/20 rounded-r-full" style={{ flex: fw.notTested }} />}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    {[
                      { label: 'Passing', value: fw.passing, color: 'text-emerald-500' },
                      { label: 'Failing', value: fw.failing, color: 'text-red-500' },
                      { label: 'In Progress', value: fw.inProgress, color: 'text-blue-500' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className={cn('text-sm font-black', s.color)}>{s.value}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors">
                    <span className="text-[9px] font-black uppercase tracking-widest">View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Domain mini-indicators */}
                <div className="flex gap-1.5">
                  {fw.domains.map(d => {
                    const dp = Math.round((d.passing / d.total) * 100);
                    return (
                      <div key={d.name} title={`${d.name}: ${dp}%`} className="flex-1">
                        <div className="h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${dp}%`, backgroundColor: d.color }} />
                        </div>
                        <p className="text-[7px] font-bold text-slate-400 text-center mt-0.5">{d.shortName}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Audit info */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-aegis-border">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] text-slate-400 font-bold">Next audit: {fw.nextAudit}</span>
                  </div>
                  {fw.failing > 0 && (
                    <span className="text-[9px] font-black text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{fw.failing} gaps
                    </span>
                  )}
                  {fw.failing === 0 && (
                    <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />No gaps
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Readiness Comparison */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Cross-Framework Readiness</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={overviewData} margin={{ left: 0 }} style={{ background: 'transparent' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} unit="%" />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
              formatter={(v: number) => [`${v}%`, 'Readiness']} />
            <Bar dataKey="readiness" radius={[6, 6, 0, 0]} maxBarSize={80}>
              {overviewData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedFw && (
          <FrameworkDetail fw={selectedFw} onClose={() => setSelectedFw(null)} onNotify={onNotify} />
        )}
        {showCatalog && (
          <AddFrameworkModal
            addedIds={addedFrameworkIds}
            onAdd={handleAddFramework}
            onClose={() => setShowCatalog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
