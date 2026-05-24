import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus, Search, Circle, Clock, CheckCircle2, AlertCircle, XCircle,
  ChevronDown, Flag, User, Calendar, Tag, Link2, Shield, AlertTriangle,
  FileText, X, LayoutList, Columns, Filter, MoreHorizontal,
  Grip, Edit3, Trash2, ArrowUpRight, Check, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { AppNotification } from '@/src/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Status   = 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Done' | 'Cancelled';
type Priority = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None';
type TaskType = 'Remediation' | 'Evidence' | 'Audit' | 'Policy' | 'General';

interface LinkedItem { type: 'risk' | 'control' | 'finding' | 'policy'; id: string; label: string; }

interface Task {
  id: string; title: string; description: string;
  status: Status; priority: Priority; type: TaskType;
  assignee: string; dueDate: string;
  labels: string[];
  linkedItems: LinkedItem[];
  createdAt: string; updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = ['Alex C.', 'Sarah L.', 'Archili K.', 'David M.', 'Elena R.', 'Unassigned'];

const STATUSES: { value: Status; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: 'Backlog',     label: 'Backlog',     icon: <Circle className="w-3.5 h-3.5" />,       color: 'text-slate-400',  bg: 'bg-slate-100 dark:bg-white/5' },
  { value: 'Todo',        label: 'Todo',        icon: <Circle className="w-3.5 h-3.5" />,       color: 'text-slate-500',  bg: 'bg-slate-100 dark:bg-white/5' },
  { value: 'In Progress', label: 'In Progress', icon: <Clock className="w-3.5 h-3.5" />,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'In Review',   label: 'In Review',   icon: <Clock className="w-3.5 h-3.5" />,        color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { value: 'Done',        label: 'Done',        icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'Cancelled',   label: 'Cancelled',   icon: <XCircle className="w-3.5 h-3.5" />,      color: 'text-slate-300',  bg: 'bg-slate-50 dark:bg-white/5' },
];

const PRIORITIES: { value: Priority; label: string; color: string; dot: string }[] = [
  { value: 'Urgent', label: 'Urgent', color: 'text-red-500',    dot: 'bg-red-500' },
  { value: 'High',   label: 'High',   color: 'text-orange-500', dot: 'bg-orange-500' },
  { value: 'Medium', label: 'Medium', color: 'text-amber-500',  dot: 'bg-amber-400' },
  { value: 'Low',    label: 'Low',    color: 'text-slate-400',  dot: 'bg-slate-400' },
  { value: 'None',   label: 'None',   color: 'text-slate-300',  dot: 'bg-slate-200' },
];

const TASK_TYPES: { value: TaskType; color: string; bg: string }[] = [
  { value: 'Remediation', color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20' },
  { value: 'Evidence',    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'Audit',       color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { value: 'Policy',      color: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { value: 'General',     color: 'text-slate-500',  bg: 'bg-slate-100 dark:bg-white/5' },
];

const KANBAN_COLS: Status[] = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];

// ─── Seed Data ────────────────────────────────────────────────────────────────
const INITIAL_TASKS: Task[] = [
  {
    id: 'T-001', title: 'Update Firewall Egress Rules', type: 'Remediation',
    description: 'Review and tighten outbound filtering rules for AWS VPCs. Focus on ports 80/443 egress and deny all others.',
    status: 'In Progress', priority: 'Urgent', assignee: 'Alex C.', dueDate: '2026-05-20',
    labels: ['AWS', 'Network'], linkedItems: [{ type: 'risk', id: 'R-012', label: 'Lateral Movement Risk' }, { type: 'control', id: 'PR.AC-05', label: 'Network Integrity' }],
    createdAt: '2026-05-01', updatedAt: '2026-05-10',
  },
  {
    id: 'T-002', title: 'Quarterly IAM Access Review', type: 'Audit',
    description: 'Review and certify all IAM roles and permissions for production and staging environments.',
    status: 'Todo', priority: 'High', assignee: 'Sarah L.', dueDate: '2026-05-25',
    labels: ['IAM', 'SOC2'], linkedItems: [{ type: 'control', id: 'PR.AA-03', label: 'Authentication' }],
    createdAt: '2026-05-05', updatedAt: '2026-05-09',
  },
  {
    id: 'T-003', title: 'SOC 2 Evidence Export', type: 'Evidence',
    description: 'Export and package all control evidence for the Trust Services Criteria assessment window Q2 2026.',
    status: 'Done', priority: 'High', assignee: 'Alex C.', dueDate: '2026-05-10',
    labels: ['SOC2', 'Audit'], linkedItems: [],
    createdAt: '2026-04-20', updatedAt: '2026-05-10',
  },
  {
    id: 'T-004', title: 'Third-party Risk Assessment — Acme Corp', type: 'Remediation',
    description: 'Complete vendor security due diligence. Require SOC 2, pen test, and BCP from Acme Corp.',
    status: 'Backlog', priority: 'Medium', assignee: 'Unassigned', dueDate: '2026-06-01',
    labels: ['Vendor'], linkedItems: [{ type: 'risk', id: 'R-021', label: 'Third-party Risk' }],
    createdAt: '2026-05-07', updatedAt: '2026-05-07',
  },
  {
    id: 'T-005', title: 'Update Information Security Policy', type: 'Policy',
    description: 'Revise IS policy to include NIST CSF 2.0 GOVERN function requirements and update board charter references.',
    status: 'In Review', priority: 'Medium', assignee: 'Elena R.', dueDate: '2026-05-30',
    labels: ['NIST', 'Policy'], linkedItems: [{ type: 'policy', id: 'P-001', label: 'IS Policy' }],
    createdAt: '2026-05-03', updatedAt: '2026-05-11',
  },
  {
    id: 'T-006', title: 'MFA Enforcement — Legacy SAP', type: 'Remediation',
    description: 'Deploy SAML connector for SAP legacy ERP to enforce MFA via Okta. Test with 10 pilot users.',
    status: 'Todo', priority: 'Urgent', assignee: 'David M.', dueDate: '2026-05-22',
    labels: ['MFA', 'SAP'], linkedItems: [{ type: 'finding', id: 'F-034', label: 'MFA Gap Finding' }, { type: 'risk', id: 'R-007', label: 'MFA Bypass Risk' }],
    createdAt: '2026-05-08', updatedAt: '2026-05-10',
  },
  {
    id: 'T-007', title: 'Penetration Test — Q2 2026', type: 'Audit',
    description: 'Coordinate external pen test with CrowdStrike Services. Scope: web app + internal network.',
    status: 'Backlog', priority: 'High', assignee: 'Archili K.', dueDate: '2026-06-15',
    labels: ['PenTest'], linkedItems: [],
    createdAt: '2026-05-10', updatedAt: '2026-05-10',
  },
  {
    id: 'T-008', title: 'Data-at-Rest Encryption Gap', type: 'Remediation',
    description: 'Enable encryption for all S3 buckets and RDS instances not yet covered. Document exceptions.',
    status: 'Cancelled', priority: 'Low', assignee: 'David M.', dueDate: '2026-05-15',
    labels: ['Encryption', 'AWS'], linkedItems: [{ type: 'control', id: 'PR.DS-01', label: 'Data Protection' }],
    createdAt: '2026-04-15', updatedAt: '2026-05-08',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatus(v: Status) { return STATUSES.find(s => s.value === v) ?? STATUSES[1]; }
function getPriority(v: Priority) { return PRIORITIES.find(p => p.value === v) ?? PRIORITIES[4]; }
function getType(v: TaskType) { return TASK_TYPES.find(t => t.value === v) ?? TASK_TYPES[4]; }
function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }
function initials(name: string) { return name === 'Unassigned' ? '?' : name.split(' ').map(n => n[0]).join(''); }
function avatarColor(name: string) {
  const colors = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
  return colors[Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];
}
function isOverdue(d: string, s: Status) { return s !== 'Done' && s !== 'Cancelled' && daysUntil(d) < 0; }

// ─── Reusable Dropdown ────────────────────────────────────────────────────────
function Dropdown<T extends string>({ trigger, items, onSelect }: {
  trigger: React.ReactNode;
  items: { value: T; label: string; icon?: React.ReactNode }[];
  onSelect: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div onClick={e => { e.stopPropagation(); setOpen(v => !v); }} className="cursor-pointer">{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }}
            className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl shadow-xl py-1 min-w-[150px]">
            {items.map(item => (
              <button key={item.value} onClick={e => { e.stopPropagation(); onSelect(item.value); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, onChange }: { status: Status; onChange?: (s: Status) => void }) {
  const s = getStatus(status);
  const badge = (
    <span className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider', s.color, s.bg)}>
      {s.icon}{s.label}
    </span>
  );
  if (!onChange) return badge;
  return (
    <Dropdown trigger={badge} onSelect={onChange}
      items={STATUSES.map(st => ({ value: st.value, label: st.label, icon: <span className={st.color}>{st.icon}</span> }))} />
  );
}

// ─── Priority Dot ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority, onChange }: { priority: Priority; onChange?: (p: Priority) => void }) {
  const p = getPriority(priority);
  const badge = (
    <span className={cn('flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider', p.color)}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', p.dot)} />{p.label}
    </span>
  );
  if (!onChange) return badge;
  return (
    <Dropdown trigger={badge} onSelect={onChange}
      items={PRIORITIES.map(pr => ({ value: pr.value, label: pr.label, icon: <span className={cn('w-2 h-2 rounded-full', pr.dot)} /> }))} />
  );
}

// ─── Assignee Chip ────────────────────────────────────────────────────────────
function AssigneeBadge({ assignee, onChange }: { assignee: string; onChange?: (a: string) => void }) {
  const badge = (
    <span className="flex items-center gap-1.5">
      <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white', assignee === 'Unassigned' ? 'bg-slate-300 dark:bg-slate-600' : avatarColor(assignee))}>
        {initials(assignee)}
      </span>
      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 hidden sm:block">{assignee.split(' ')[0]}</span>
    </span>
  );
  if (!onChange) return badge;
  return (
    <Dropdown trigger={badge} onSelect={onChange}
      items={TEAM_MEMBERS.map(m => ({ value: m, label: m, icon: <span className={cn('w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center', m === 'Unassigned' ? 'bg-slate-300' : avatarColor(m))}>{initials(m)}</span> }))} />
  );
}

// ─── Task Detail Panel ────────────────────────────────────────────────────────
function TaskDetailPanel({ task, onClose, onUpdate, onDelete }: {
  task: Task; onClose: () => void;
  onUpdate: (t: Task) => void; onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc]   = useState(task.description);

  function save() { onUpdate({ ...task, title, description: desc, updatedAt: new Date().toISOString().slice(0, 10) }); setEditing(false); }

  const LINK_ICONS = { risk: <AlertTriangle className="w-3 h-3 text-red-400" />, control: <Shield className="w-3 h-3 text-blue-400" />, finding: <AlertCircle className="w-3 h-3 text-orange-400" />, policy: <FileText className="w-3 h-3 text-teal-400" /> };

  const days = daysUntil(task.dueDate);
  const overdue = isOverdue(task.dueDate, task.status);
  const typeStyle = getType(task.type);

  return (
    <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
      className="w-96 flex-shrink-0 border-l border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-aegis-border flex-shrink-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.id}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title + desc */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-aegis-border">
          {editing ? (
            <div className="space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
                className="w-full text-base font-black text-slate-900 dark:text-white bg-transparent border-b border-blue-500 focus:outline-none pb-1" />
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                className="w-full text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-aegis-bg rounded-lg p-2.5 focus:outline-none resize-none border border-slate-200 dark:border-aegis-border" />
              <div className="flex gap-2">
                <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-black">
                  <Check className="w-3 h-3" />Save
                </button>
                <button onClick={() => { setTitle(task.title); setDesc(task.description); setEditing(false); }} className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-500 rounded-lg text-[11px] font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => setEditing(true)}>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-blue-500 transition-colors">{task.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{task.description || <span className="italic opacity-50">No description</span>}</p>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-blue-500 flex items-center gap-1"><Edit3 className="w-3 h-3" />Click to edit</span>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="px-5 py-4 space-y-3.5 border-b border-slate-100 dark:border-aegis-border">
          {[
            { label: 'Status',   value: <StatusBadge status={task.status} onChange={s => onUpdate({ ...task, status: s, updatedAt: new Date().toISOString().slice(0, 10) })} /> },
            { label: 'Priority', value: <PriorityBadge priority={task.priority} onChange={p => onUpdate({ ...task, priority: p, updatedAt: new Date().toISOString().slice(0, 10) })} /> },
            { label: 'Assignee', value: <AssigneeBadge assignee={task.assignee} onChange={a => onUpdate({ ...task, assignee: a, updatedAt: new Date().toISOString().slice(0, 10) })} /> },
            { label: 'Type',     value: <span className={cn('px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider', typeStyle.color, typeStyle.bg)}>{task.type}</span> },
            {
              label: 'Due Date',
              value: (
                <span className={cn('text-[11px] font-bold', overdue ? 'text-red-500' : days <= 3 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400')}>
                  {task.dueDate} {overdue ? '· Overdue' : days === 0 ? '· Today' : days > 0 ? `· in ${days}d` : ''}
                </span>
              )
            },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-20 flex-shrink-0">{row.label}</span>
              {row.value}
            </div>
          ))}
        </div>

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="px-5 py-4 border-b border-slate-100 dark:border-aegis-border">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Labels</div>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map(l => (
                <span key={l} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  <Tag className="w-2.5 h-2.5" />{l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Linked GRC items */}
        {task.linkedItems.length > 0 && (
          <div className="px-5 py-4 border-b border-slate-100 dark:border-aegis-border">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Linked Items</div>
            <div className="space-y-1.5">
              {task.linkedItems.map(l => (
                <div key={l.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-aegis-bg rounded-lg border border-slate-100 dark:border-aegis-border">
                  {LINK_ICONS[l.type]}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-slate-400 uppercase">{l.type} · {l.id}</div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{l.label}</div>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta footer */}
        <div className="px-5 py-4">
          <div className="text-[9px] text-slate-300 dark:text-slate-600 space-y-1">
            <div>Created {task.createdAt}</div>
            <div>Updated {task.updatedAt}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, selected, onClick, onUpdate }: {
  task: Task; selected: boolean;
  onClick: () => void; onUpdate: (t: Task) => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const days = daysUntil(task.dueDate);
  const typeStyle = getType(task.type);

  return (
    <motion.div layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-aegis-border cursor-pointer group transition-colors',
        selected ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.03]'
      )}>
      {/* Status */}
      <div onClick={e => e.stopPropagation()}>
        <StatusBadge status={task.status} onChange={s => onUpdate({ ...task, status: s, updatedAt: new Date().toISOString().slice(0, 10) })} />
      </div>

      {/* ID */}
      <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 w-10 flex-shrink-0">{task.id}</span>

      {/* Title */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn('text-[12px] font-bold truncate', task.status === 'Done' || task.status === 'Cancelled' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white')}>{task.title}</span>
        {task.linkedItems.length > 0 && <Link2 className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
      </div>

      {/* Type chip */}
      <span className={cn('hidden lg:block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex-shrink-0', typeStyle.color, typeStyle.bg)}>{task.type}</span>

      {/* Labels */}
      {task.labels.slice(0, 2).map(l => (
        <span key={l} className="hidden xl:block px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-[9px] font-bold text-slate-500 flex-shrink-0">{l}</span>
      ))}

      {/* Priority */}
      <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
        <PriorityBadge priority={task.priority} onChange={p => onUpdate({ ...task, priority: p, updatedAt: new Date().toISOString().slice(0, 10) })} />
      </div>

      {/* Assignee */}
      <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
        <AssigneeBadge assignee={task.assignee} onChange={a => onUpdate({ ...task, assignee: a, updatedAt: new Date().toISOString().slice(0, 10) })} />
      </div>

      {/* Due date */}
      <span className={cn('text-[10px] font-bold flex-shrink-0 w-20 text-right', overdue ? 'text-red-500' : days <= 3 ? 'text-amber-500' : 'text-slate-400')}>
        {overdue ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
      </span>
    </motion.div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────
function KanbanCard({ task, onClick, onUpdate }: { task: Task; onClick: () => void; onUpdate: (t: Task) => void }) {
  const overdue = isOverdue(task.dueDate, task.status);
  const typeStyle = getType(task.type);
  const prio = getPriority(task.priority);
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      onClick={onClick}
      className="bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-blue-400/50 dark:hover:border-blue-500/40 cursor-pointer group transition-all space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[9px] font-black text-slate-300 dark:text-slate-600">{task.id}</span>
        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-black uppercase', typeStyle.color, typeStyle.bg)}>{task.type}</span>
      </div>
      <p className={cn('text-[12px] font-bold leading-snug', task.status === 'Done' || task.status === 'Cancelled' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors')}>{task.title}</p>
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map(l => <span key={l} className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-[9px] font-bold text-slate-500">{l}</span>)}
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', prio.dot)} />
          <AssigneeBadge assignee={task.assignee} />
        </div>
        <span className={cn('text-[10px] font-bold', overdue ? 'text-red-500' : 'text-slate-400')}>
          {overdue ? `${Math.abs(daysUntil(task.dueDate))}d ago` : task.dueDate.slice(5)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── New Task Form ────────────────────────────────────────────────────────────
function NewTaskForm({ onSave, onCancel, defaultStatus }: { onSave: (t: Task) => void; onCancel: () => void; defaultStatus?: Status }) {
  const [form, setForm] = useState({
    title: '', description: '', status: defaultStatus ?? 'Todo' as Status, priority: 'Medium' as Priority,
    type: 'General' as TaskType, assignee: 'Unassigned', dueDate: '', labels: '',
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      id: `T-${String(Math.floor(Math.random() * 900 + 100)).padStart(3, '0')}`,
      title: form.title.trim(), description: form.description,
      status: form.status, priority: form.priority, type: form.type,
      assignee: form.assignee, dueDate: form.dueDate || now,
      labels: form.labels ? form.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
      linkedItems: [], createdAt: now, updatedAt: now,
    });
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
        className="bg-white dark:bg-aegis-surface rounded-2xl border border-slate-200 dark:border-aegis-border shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-aegis-border">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">New Task</h3>
          <button onClick={onCancel}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Task title..." autoFocus
            className="w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-aegis-border pb-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
            placeholder="Description (optional)..."
            className="w-full text-sm bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-300 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Status', key: 'status', opts: STATUSES.map(s => ({ v: s.value, l: s.label })) },
              { label: 'Priority', key: 'priority', opts: PRIORITIES.map(p => ({ v: p.value, l: p.label })) },
              { label: 'Type', key: 'type', opts: TASK_TYPES.map(t => ({ v: t.value, l: t.value })) },
              { label: 'Assignee', key: 'assignee', opts: TEAM_MEMBERS.map(m => ({ v: m, l: m })) },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                <select value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-lg px-2.5 py-2 focus:outline-none text-slate-700 dark:text-slate-300 appearance-none">
                  {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-lg px-2.5 py-2 focus:outline-none text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Labels (comma-sep)</label>
              <input value={form.labels} onChange={e => setForm(f => ({ ...f, labels: e.target.value }))} placeholder="e.g. SOC2, AWS"
                className="w-full text-xs bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-lg px-2.5 py-2 focus:outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors">Create Task</button>
            <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-500 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
interface TasksViewProps { currentUser: string; onNotify: (n: Omit<import('@/src/types').AppNotification, 'id' | 'createdAt' | 'read'>) => void; }

type ViewMode = 'list' | 'board';

const STATUS_GROUPS: { status: Status; label: string }[] = [
  { status: 'Backlog', label: 'Backlog' },
  { status: 'Todo', label: 'To Do' },
  { status: 'In Progress', label: 'In Progress' },
  { status: 'In Review', label: 'In Review' },
  { status: 'Done', label: 'Done' },
];

export function TasksView({ currentUser, onNotify }: TasksViewProps) {
  const [tasks, setTasks]           = useState<Task[]>(INITIAL_TASKS);
  const [view, setView]             = useState<ViewMode>('list');
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNew, setShowNew]       = useState(false);
  const [newColStatus, setNewColStatus] = useState<Status | undefined>();

  function updateTask(t: Task) {
    setTasks(ts => ts.map(x => x.id === t.id ? t : x));
    if (selectedTask?.id === t.id) setSelectedTask(t);
  }
  function deleteTask(id: string) { setTasks(ts => ts.filter(t => t.id !== id)); if (selectedTask?.id === id) setSelectedTask(null); }
  function createTask(t: Task) { setTasks(ts => [t, ...ts]); setShowNew(false); onNotify({ title: 'Task created', message: `${t.title} assigned to ${t.assignee}`, type: 'task', audience: [t.assignee] }); }

  const filtered = useMemo(() => tasks.filter(t => {
    const ms = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()) || t.labels.some(l => l.toLowerCase().includes(search.toLowerCase()));
    const mst = filterStatus === 'All' || t.status === filterStatus;
    const mp  = filterPriority === 'All' || t.priority === filterPriority;
    return ms && mst && mp;
  }), [tasks, search, filterStatus, filterPriority]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    open:  tasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
    done: tasks.filter(t => t.status === 'Done').length,
  }), [tasks]);

  const groupedByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = { 'Backlog': [], 'Todo': [], 'In Progress': [], 'In Review': [], 'Done': [], 'Cancelled': [] };
    filtered.forEach(t => map[t.status].push(t));
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Top header */}
      <div className="flex items-end justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tasks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track remediation, evidence, and audit work across the team.</p>
        </div>
        <button onClick={() => { setNewColStatus(undefined); setShowNew(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors shadow-md shadow-blue-600/20">
          <Plus className="w-4 h-4" />New Task
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-4 flex-shrink-0">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-900 dark:text-white' },
          { label: 'Open', value: stats.open, color: 'text-blue-600' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-500' },
          { label: 'Done', value: stats.done, color: 'text-emerald-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl px-4 py-3 shadow-sm">
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-[12px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors" />
        </div>

        {/* Status filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="py-2 px-3 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer">
          <option value="All">All Status</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Priority filter */}
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as any)}
          className="py-2 px-3 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer">
          <option value="All">All Priority</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
          <button onClick={() => setView('list')} className={cn('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-white dark:bg-aegis-surface shadow text-blue-600' : 'text-slate-400 hover:text-slate-600')}>
            <LayoutList className="w-4 h-4" />
          </button>
          <button onClick={() => setView('board')} className={cn('p-1.5 rounded-lg transition-all', view === 'board' ? 'bg-white dark:bg-aegis-surface shadow text-blue-600' : 'text-slate-400 hover:text-slate-600')}>
            <Columns className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface shadow-sm">
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'list' ? (
            /* ── LIST VIEW ───────────────────────────────────────── */
            <div className="flex-1 overflow-y-auto">
              {/* Column headers */}
              <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 dark:border-aegis-border bg-slate-50/50 dark:bg-white/[0.02] sticky top-0 z-10">
                <span className="w-[110px] flex-shrink-0 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <span className="w-10 flex-shrink-0" />
                <span className="flex-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Title</span>
                <span className="w-20 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Type</span>
                <span className="w-20 text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assignee</span>
                <span className="w-20 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Due</span>
              </div>

              {/* Grouped by status */}
              {STATUS_GROUPS.map(({ status, label }) => {
                const group = groupedByStatus[status];
                if (group.length === 0 && filterStatus !== 'All') return null;
                const statusStyle = getStatus(status);
                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-aegis-border">
                      <span className={statusStyle.color}>{statusStyle.icon}</span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">{label}</span>
                      <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/10 rounded px-1.5">{group.length}</span>
                    </div>
                    {group.map(t => (
                      <TaskRow key={t.id} task={t} selected={selectedTask?.id === t.id} onClick={() => setSelectedTask(t)} onUpdate={updateTask} />
                    ))}
                    {group.length === 0 && (
                      <div className="px-4 py-2 text-[11px] text-slate-300 dark:text-slate-700 italic">No tasks</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── BOARD VIEW ──────────────────────────────────────── */
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-3 p-4 h-full min-w-max">
                {KANBAN_COLS.map(col => {
                  const colStyle = getStatus(col);
                  const cards = groupedByStatus[col];
                  return (
                    <div key={col} className="w-64 flex flex-col flex-shrink-0">
                      <div className="flex items-center justify-between mb-2.5 px-1">
                        <div className="flex items-center gap-1.5">
                          <span className={colStyle.color}>{colStyle.icon}</span>
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{col}</span>
                          <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/10 rounded px-1.5 py-0.5">{cards.length}</span>
                        </div>
                        <button onClick={() => { setNewColStatus(col); setShowNew(true); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                        <AnimatePresence>
                          {cards.map(t => <KanbanCard key={t.id} task={t} onClick={() => setSelectedTask(t)} onUpdate={updateTask} />)}
                        </AnimatePresence>
                        {cards.length === 0 && (
                          <div className="border-2 border-dashed border-slate-100 dark:border-aegis-border rounded-xl py-6 text-center">
                            <p className="text-[10px] text-slate-300 dark:text-slate-700">No tasks</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedTask && (
            <TaskDetailPanel key={selectedTask.id} task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={updateTask} onDelete={deleteTask} />
          )}
        </AnimatePresence>
      </div>

      {/* New task modal */}
      <AnimatePresence>
        {showNew && <NewTaskForm onSave={createTask} onCancel={() => setShowNew(false)} defaultStatus={newColStatus} />}
      </AnimatePresence>
    </div>
  );
}
