import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileText,
  FolderArchive,
  History,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  Upload,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { UserRole } from '@/src/rbac';
import { api } from '@/src/lib/api';
import {
  AuditProgram, AuditEvidenceItem, AuditFinding as AuditFindingT,
  AuditStatus as AuditStatusT, AuditType as AuditTypeT,
  AuditEvidenceStatus, AuditFindingType,
} from '@/src/types';

type AuditStatus = AuditStatusT;
type AuditType = AuditTypeT;
type EvidenceStatus = AuditEvidenceStatus;
type FindingType = AuditFindingType;
type EvidenceItem = AuditEvidenceItem;
type AuditFinding = AuditFindingT;

const TEAM = ['Alex C.', 'Sarah L.', 'Elena R.', 'David M.', 'Michael K.'];


const STATUS_META: Record<AuditStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  Planning: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  Fieldwork: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
  Review: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
  Finalized: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Archived: { color: 'text-slate-400 dark:text-slate-500', bg: 'bg-slate-50 dark:bg-white/5', icon: <Archive className="w-3.5 h-3.5" /> },
};

const FINDING_META: Record<FindingType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Strength: { label: 'Liked', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <ThumbsUp className="w-3.5 h-3.5" /> },
  Gap: { label: 'Did not like', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: <ThumbsDown className="w-3.5 h-3.5" /> },
  Observation: { label: 'Observation', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: <MessageSquare className="w-3.5 h-3.5" /> },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function AuditManagementView({ role }: { role: UserRole }) {
  const isAuditor = role === 'Auditor';
  const [audits, setAudits] = useState<AuditProgram[]>([]);
  const [view, setView] = useState<'active' | 'history'>('active');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [findingType, setFindingType] = useState<FindingType>('Gap');
  const [findingTitle, setFindingTitle] = useState('');
  const [findingDetail, setFindingDetail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    api.getAudits()
      .then(data => { if (active) { setAudits(data); setSelectedId(data[0]?.id ?? ''); } })
      .catch(() => { /* keep empty list on failure */ })
      .finally(() => { if (active) hydrated.current = true; });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    void api.replaceAudits(audits);
  }, [audits]);

  useEffect(() => {
    if (!audits.some(audit => audit.id === selectedId)) setSelectedId(audits[0]?.id ?? '');
  }, [audits, selectedId]);

  const visibleAudits = useMemo(() => {
    const q = search.trim().toLowerCase();
    return audits.filter(audit => {
      const matchesView = view === 'history' ? audit.status === 'Archived' : audit.status !== 'Archived';
      const matchesSearch = !q || audit.title.toLowerCase().includes(q) || audit.id.toLowerCase().includes(q) || audit.auditor.toLowerCase().includes(q);
      return matchesView && matchesSearch;
    });
  }, [audits, search, view]);

  const selectedAudit = visibleAudits.find(audit => audit.id === selectedId) ?? visibleAudits[0] ?? audits[0];
  const activeCount = audits.filter(audit => audit.status !== 'Archived').length;
  const archivedCount = audits.filter(audit => audit.status === 'Archived').length;
  const averageScore = Math.round(audits.filter(audit => audit.status !== 'Archived').reduce((sum, audit) => sum + audit.score, 0) / Math.max(activeCount, 1));
  const openFindings = audits.filter(audit => audit.status !== 'Archived').reduce((sum, audit) => sum + audit.findings.filter(finding => finding.type === 'Gap').length, 0);

  function patchAudit(auditId: string, patch: Partial<AuditProgram>) {
    setAudits(current => current.map(audit => audit.id === auditId ? { ...audit, ...patch } : audit));
  }

  function createAudit() {
    const audit: AuditProgram = {
      id: id('AUD'),
      title: 'New Audit Program',
      type: 'Internal',
      status: 'Planning',
      auditor: 'Internal Audit',
      owner: TEAM[0],
      startDate: today(),
      dueDate: today(),
      score: 0,
      scope: ['Security'],
      evidence: [],
      findings: [],
      finalAssessment: '',
      nextRecommendations: '',
    };
    setAudits(current => [audit, ...current]);
    setSelectedId(audit.id);
    setView('active');
  }

  function addFinding() {
    if (!selectedAudit || !findingTitle.trim()) return;
    const finding: AuditFinding = {
      id: id('AF'),
      type: findingType,
      title: findingTitle.trim(),
      detail: findingDetail.trim(),
      severity: findingType === 'Gap' ? 'High' : findingType === 'Observation' ? 'Medium' : 'Low',
      owner: selectedAudit.owner,
      createdAt: today(),
    };
    patchAudit(selectedAudit.id, { findings: [finding, ...selectedAudit.findings] });
    setFindingTitle('');
    setFindingDetail('');
  }

  function uploadEvidence(files: FileList | null) {
    if (!selectedAudit || !files?.length) return;
    const next: EvidenceItem[] = Array.from(files).map(file => ({
      id: id('EV'),
      name: file.name,
      category: 'Uploaded Evidence',
      uploadedBy: selectedAudit.owner,
      uploadedAt: today(),
      status: 'Uploaded',
      size: formatBytes(file.size),
    }));
    patchAudit(selectedAudit.id, { evidence: [...next, ...selectedAudit.evidence] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function archiveAudit() {
    if (!selectedAudit) return;
    patchAudit(selectedAudit.id, { status: 'Archived', archivedAt: today() });
    setView('history');
  }

  function renderStatus(status: AuditStatus) {
    const meta = STATUS_META[status];
    return (
      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider', meta.color, meta.bg)}>
        {meta.icon}
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Audit Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Evidence, auditor scoring, findings, final assessment, and archived audit history.</p>
        </div>
        {isAuditor && (
          <button onClick={createAudit} className="btn-primary flex items-center gap-2 w-fit">
            <Plus className="w-4 h-4" />
            New Audit
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Audits', value: activeCount, icon: ClipboardCheck, color: 'text-blue-500' },
          { label: 'History', value: archivedCount, icon: History, color: 'text-slate-500' },
          { label: 'Avg Score', value: `${averageScore}%`, icon: ShieldCheck, color: scoreColor(averageScore) },
          { label: 'Open Gaps', value: openFindings, icon: AlertTriangle, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6">
        <aside className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-aegis-border space-y-3">
            <div className="flex rounded-xl bg-slate-100 dark:bg-aegis-bg p-1">
              {(['active', 'history'] as const).map(item => (
                <button
                  key={item}
                  onClick={() => {
                    setView(item);
                    const first = audits.find(audit => item === 'history' ? audit.status === 'Archived' : audit.status !== 'Archived');
                    if (first) setSelectedId(first.id);
                  }}
                  className={cn('flex-1 rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-wider', view === item ? 'bg-white dark:bg-aegis-surface text-slate-900 dark:text-white shadow-sm' : 'text-slate-500')}
                >
                  {item === 'active' ? 'Active' : 'History'}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search audits..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-330px)] overflow-y-auto p-2 space-y-2">
            {visibleAudits.map(audit => (
              <button
                key={audit.id}
                onClick={() => setSelectedId(audit.id)}
                className={cn('w-full rounded-xl border p-4 text-left transition-all', selectedAudit?.id === audit.id ? 'border-blue-300 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]')}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{audit.id}</span>
                  {renderStatus(audit.status)}
                </div>
                <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">{audit.title}</h3>
                <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>{audit.type}</span>
                  <span>{formatDate(audit.dueDate)}</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${audit.score}%` }} />
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selectedAudit && (
          <main className="space-y-6 min-w-0">
            <section className="glass-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderStatus(selectedAudit.status)}
                    <span className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-wider">{selectedAudit.type}</span>
                  </div>
                  {isAuditor ? (
                    <input
                      value={selectedAudit.title}
                      onChange={event => patchAudit(selectedAudit.id, { title: event.target.value })}
                      className="mt-4 w-full bg-transparent text-2xl font-black tracking-tight text-slate-900 dark:text-white focus:outline-none"
                    />
                  ) : (
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{selectedAudit.title}</h3>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" />Auditor: {selectedAudit.auditor}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Due {formatDate(selectedAudit.dueDate)}</span>
                    <span className="flex items-center gap-1.5"><FolderArchive className="w-3.5 h-3.5" />{selectedAudit.evidence.length} evidence</span>
                  </div>
                </div>
                <div className="w-full lg:w-64 rounded-2xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditor Score</p>
                    <p className={cn('text-3xl font-black', scoreColor(selectedAudit.score))}>{selectedAudit.score}</p>
                  </div>
                  {isAuditor ? (
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selectedAudit.score}
                      onChange={event => patchAudit(selectedAudit.id, { score: Number(event.target.value) })}
                      className="mt-4 w-full"
                    />
                  ) : (
                    <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">Auditor-controlled score. Upload evidence below for review.</p>
                  )}
                  {isAuditor && selectedAudit.status !== 'Archived' && (
                    <button onClick={archiveAudit} className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-900 flex items-center justify-center gap-2">
                      <Archive className="w-4 h-4" />
                      Archive to History
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Evidence Upload</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Attach audit proof and review status</p>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={event => uploadEvidence(event.target.files)} />
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedAudit.evidence.map(item => (
                    <div key={item.id} className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-slate-900 dark:text-white">{item.name}</p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">{item.category} · {item.size} · {formatDate(item.uploadedAt)}</p>
                        </div>
                        {isAuditor ? (
                          <select
                            value={item.status}
                            onChange={event => patchAudit(selectedAudit.id, { evidence: selectedAudit.evidence.map(e => e.id === item.id ? { ...e, status: event.target.value as EvidenceStatus } : e) })}
                            className="rounded-lg border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface px-2 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300"
                          >
                            {(['Requested', 'Uploaded', 'Accepted', 'Rejected'] as EvidenceStatus[]).map(status => <option key={status}>{status}</option>)}
                          </select>
                        ) : (
                          <span className="rounded-lg bg-slate-100 dark:bg-aegis-surface px-2 py-1 text-[10px] font-black text-slate-500 dark:text-slate-300">{item.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {!selectedAudit.evidence.length && <p className="rounded-xl border border-dashed border-slate-200 dark:border-aegis-border p-6 text-center text-xs font-bold text-slate-400">No evidence uploaded yet.</p>}
                </div>
              </div>

              {isAuditor ? (
              <div className="glass-card p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Auditor Findings</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">What worked, what failed, and observations</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Strength', 'Gap', 'Observation'] as FindingType[]).map(type => {
                    const meta = FINDING_META[type];
                    return (
                      <button key={type} onClick={() => setFindingType(type)} className={cn('rounded-xl px-3 py-2 text-[10px] font-black flex items-center justify-center gap-1.5', findingType === type ? `${meta.bg} ${meta.color}` : 'bg-slate-100 dark:bg-aegis-bg text-slate-500')}>
                        {meta.icon}
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                <input value={findingTitle} onChange={event => setFindingTitle(event.target.value)} placeholder="Finding title..." className="w-full rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
                <textarea value={findingDetail} onChange={event => setFindingDetail(event.target.value)} placeholder="Auditor notes..." className="h-20 w-full resize-none rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
                <button onClick={addFinding} className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-900">Add Finding</button>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedAudit.findings.map(finding => {
                    const meta = FINDING_META[finding.type];
                    return (
                      <div key={finding.id} className="rounded-xl border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-bg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black', meta.color, meta.bg)}>{meta.icon}{meta.label}</span>
                          <span className="text-[10px] font-bold text-slate-400">{finding.severity}</span>
                        </div>
                        <p className="mt-2 text-xs font-black text-slate-900 dark:text-white">{finding.title}</p>
                        {finding.detail && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{finding.detail}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
              ) : (
                <div className="glass-card p-5 space-y-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Audit Summary</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-slate-50 dark:bg-aegis-bg p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liked</p>
                      <p className="mt-2 text-xl font-black text-emerald-500">{selectedAudit.findings.filter(f => f.type === 'Strength').length}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-aegis-bg p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gaps</p>
                      <p className="mt-2 text-xl font-black text-red-500">{selectedAudit.findings.filter(f => f.type === 'Gap').length}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-aegis-bg p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Obs.</p>
                      <p className="mt-2 text-xl font-black text-blue-500">{selectedAudit.findings.filter(f => f.type === 'Observation').length}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{selectedAudit.finalAssessment || 'Final auditor assessment will appear here after review.'}</p>
                </div>
              )}
            </section>

            {isAuditor && (
            <section className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" />Final Assessment</h3>
                <textarea
                  value={selectedAudit.finalAssessment}
                  onChange={event => patchAudit(selectedAudit.id, { finalAssessment: event.target.value })}
                  placeholder="Write the auditor's final assessment..."
                  className="h-36 w-full resize-none rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-4 py-3 text-sm leading-7 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />Next Audit Recommendations</h3>
                <textarea
                  value={selectedAudit.nextRecommendations}
                  onChange={event => patchAudit(selectedAudit.id, { nextRecommendations: event.target.value })}
                  placeholder="Recommendations for the next audit cycle..."
                  className="h-36 w-full resize-none rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-4 py-3 text-sm leading-7 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </section>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
