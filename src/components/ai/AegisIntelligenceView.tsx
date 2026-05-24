import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  MessageSquareText,
  Paperclip,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  UserRound,
  Wand2,
  X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { CurrentUser } from '@/src/rbac';

type ChatRole = 'user' | 'assistant';
type WorkspaceTab = 'chat' | 'skills';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
}

interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

interface AgentSkill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const AEGIS_LOGO_SRC = '/regenerated_image_1777458964528.png';
const THREADS_KEY = 'aegis.intelligence.threads.v3';
const SKILLS_KEY = 'aegis.intelligence.skills.v3';

const STARTER_PROMPTS = [
  "Summarize today's risk posture",
  'Which audit evidence is the weakest?',
  'Prioritize SOC 2 controls by urgency',
  'Draft recommendations for the next audit',
];

const DEFAULT_SKILLS: AgentSkill[] = [
  {
    id: 'risk',
    name: 'Risk Analyst',
    description: 'Analyzes risks, impact, likelihood, and remediation plans.',
    enabled: true,
  },
  {
    id: 'audit',
    name: 'Audit Evidence Reviewer',
    description: 'Reviews audit evidence completeness, quality, and control gaps.',
    enabled: true,
  },
  {
    id: 'controls',
    name: 'Control Mapper',
    description: 'Maps controls to frameworks, owners, policies, and evidence.',
    enabled: false,
  },
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createThread(): ChatThread {
  const now = Date.now();
  return {
    id: makeId('chat'),
    title: 'New chat',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function titleFromPrompt(prompt: string) {
  return prompt.length > 44 ? `${prompt.slice(0, 44)}...` : prompt;
}

function readStoredThreads() {
  if (typeof window === 'undefined') return [createThread()];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(THREADS_KEY) || '[]') as ChatThread[];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    return [createThread()];
  }

  return [createThread()];
}

function readStoredSkills() {
  if (typeof window === 'undefined') return DEFAULT_SKILLS;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SKILLS_KEY) || '[]') as AgentSkill[];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    return DEFAULT_SKILLS;
  }

  return DEFAULT_SKILLS;
}

function formatThreadDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(timestamp);
}

function AegisLogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('shrink-0 overflow-hidden border border-blue-500/30 bg-slate-950 shadow-lg shadow-blue-500/20', className)}>
      <img src={AEGIS_LOGO_SRC} alt="Aegis Logo" className="h-full w-full object-cover" />
    </div>
  );
}

export function AegisIntelligenceView({ currentUser }: { currentUser: CurrentUser }) {
  const [threads, setThreads] = useState<ChatThread[]>(readStoredThreads);
  const [activeThreadId, setActiveThreadId] = useState(() => threads[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('chat');
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const [skills, setSkills] = useState<AgentSkill[]>(readStoredSkills);
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  const [editingSkillDescription, setEditingSkillDescription] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const activeThread = useMemo(
    () => threads.find(thread => thread.id === activeThreadId) ?? threads[0],
    [activeThreadId, threads]
  );

  const activeSkills = useMemo(() => skills.filter(skill => skill.enabled), [skills]);

  const slashMatches = useMemo(() => {
    const q = slashQuery.toLowerCase();
    return skills.filter(skill => skill.name.toLowerCase().includes(q));
  }, [skills, slashQuery]);

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter(thread => thread.title.toLowerCase().includes(query));
  }, [searchQuery, threads]);

  useEffect(() => {
    window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    window.localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    if (activeThreadId && threads.some(thread => thread.id === activeThreadId)) return;
    setActiveThreadId(threads[0]?.id ?? '');
  }, [activeThreadId, threads]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [input]);

  useEffect(() => {
    if (activeTab !== 'chat') return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeThread?.messages.length, activeTab]);

  function newChat() {
    const thread = createThread();
    setThreads(current => [thread, ...current]);
    setActiveThreadId(thread.id);
    setActiveTab('chat');
    setInput('');
  }

  function selectThread(threadId: string) {
    setActiveThreadId(threadId);
    setActiveTab('chat');
  }

  function deleteThread(threadId: string) {
    setThreads(current => {
      if (current.length === 1) return [createThread()];
      return current.filter(thread => thread.id !== threadId);
    });
  }

  function sendMessage(messageText = input) {
    const clean = messageText.trim();
    if (!clean || !activeThread) return;

    const now = Date.now();
    const skillContext = activeSkills.map(skill => skill.name).join(', ') || 'Default GRC context';
    const userMessage: ChatMessage = {
      id: makeId('user'),
      role: 'user',
      text: clean,
      createdAt: now,
    };
    const assistantMessage: ChatMessage = {
      id: makeId('assistant'),
      role: 'assistant',
      text: `Got it. In Aegis GRC mode, I will review related risks, controls, audit history, and evidence. Active skills: ${skillContext}.`,
      createdAt: now + 1,
    };

    setThreads(current => current.map(thread => {
      if (thread.id !== activeThread.id) return thread;

      return {
        ...thread,
        title: thread.messages.length === 0 ? titleFromPrompt(clean) : thread.title,
        updatedAt: now,
        messages: [...thread.messages, userMessage, assistantMessage],
      };
    }));
    setInput('');
  }

  function addSkill() {
    const cleanName = skillName.trim();
    if (!cleanName) return;

    setSkills(current => [
      ...current,
      {
        id: makeId('skill'),
        name: cleanName,
        description: skillDescription.trim() || 'Custom domain context for the Aegis AI agent.',
        enabled: true,
      },
    ]);
    setSkillName('');
    setSkillDescription('');
  }

  function startEditingSkill(skill: AgentSkill) {
    setEditingSkillId(skill.id);
    setEditingSkillName(skill.name);
    setEditingSkillDescription(skill.description);
  }

  function cancelEditingSkill() {
    setEditingSkillId(null);
    setEditingSkillName('');
    setEditingSkillDescription('');
  }

  function saveEditingSkill(skillId: string) {
    const cleanName = editingSkillName.trim();
    if (!cleanName) return;

    setSkills(current => current.map(skill => skill.id === skillId
      ? {
          ...skill,
          name: cleanName,
          description: editingSkillDescription.trim() || 'Custom domain context for the Aegis AI agent.',
        }
      : skill
    ));
    cancelEditingSkill();
  }

  function deleteSkill(skillId: string) {
    setSkills(current => current.filter(skill => skill.id !== skillId));
    if (editingSkillId === skillId) cancelEditingSkill();
  }

  function toggleSkill(skillId: string) {
    setSkills(current => current.map(skill => skill.id === skillId ? { ...skill, enabled: !skill.enabled } : skill));
  }

  return (
    <div className="relative h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-aegis-border dark:bg-aegis-surface">
      <div className="grid h-full grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-aegis-border dark:bg-white/[0.02]">
          <div className="border-b border-slate-200 p-4 dark:border-aegis-border">
            <button
              onClick={newChat}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={cn(
                'mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black transition',
                activeTab === 'skills'
                  ? 'border-blue-200 bg-white text-blue-600 shadow-sm dark:border-blue-900/60 dark:bg-aegis-surface dark:text-blue-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600 dark:border-aegis-border dark:bg-transparent dark:text-slate-300 dark:hover:border-blue-800'
              )}
            >
              <Wand2 className="h-4 w-4" />
              Skills
            </button>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search history"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-aegis-border dark:bg-aegis-bg dark:text-white"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {filteredThreads.map(thread => (
              <div
                key={thread.id}
                className={cn(
                  'group flex w-full items-start gap-2 rounded-xl border px-3 py-3 transition',
                  activeThread?.id === thread.id && activeTab === 'chat'
                    ? 'border-blue-200 bg-white shadow-sm dark:border-blue-900/60 dark:bg-aegis-surface'
                    : 'border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-aegis-border dark:hover:bg-white/5'
                )}
              >
                <button
                  onClick={() => selectThread(thread.id)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-slate-800 dark:text-slate-100">{thread.title}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-400">
                      {formatThreadDate(thread.updatedAt)} - {thread.messages.length}
                    </span>
                  </span>
                </button>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    deleteThread(thread.id);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {filteredThreads.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-sm font-bold text-slate-400 dark:border-aegis-border">
                No chats found
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col bg-white dark:bg-aegis-surface">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5 dark:border-aegis-border">
            <div className="flex min-w-0 items-center gap-3">
              <AegisLogoMark className="h-10 w-10 rounded-xl" />
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-slate-950 dark:text-white">Aegis Intelligence</h2>
                <p className="truncate text-xs font-bold text-slate-400">{currentUser.name}</p>
              </div>
            </div>

          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            {activeTab === 'chat' ? (
              <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col">
                {activeThread?.messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                    <AegisLogoMark className="mb-5 h-16 w-16 rounded-2xl" />
                    <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                      How can I help you, {currentUser.name}?
                    </h1>
                    <div className="mt-7 grid w-full max-w-3xl grid-cols-1 gap-2 md:grid-cols-2">
                      {STARTER_PROMPTS.map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage(prompt)}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold leading-6 text-slate-700 transition hover:border-blue-300 hover:bg-white dark:border-aegis-border dark:bg-aegis-bg dark:text-slate-200 dark:hover:border-blue-800"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-6">
                    {activeThread?.messages.map(message => (
                      <div key={message.id} className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}>
                        <div className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden',
                          message.role === 'assistant'
                            ? ''
                            : 'bg-slate-200 text-slate-600 dark:bg-aegis-bg dark:text-slate-300'
                        )}>
                          {message.role === 'assistant'
                            ? <AegisLogoMark className="h-9 w-9 rounded-xl" />
                            : <UserRound className="h-4 w-4" />}
                        </div>
                        <div className={cn(
                          'max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7',
                          message.role === 'assistant'
                            ? 'rounded-tl-sm bg-blue-50 text-slate-700 dark:bg-blue-950/30 dark:text-slate-100'
                            : 'rounded-tr-sm bg-slate-100 text-slate-800 dark:bg-aegis-bg dark:text-slate-100'
                        )}>
                          {message.text}
                        </div>
                      </div>
                    ))}
                    <div ref={endRef} />
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-5xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">AI Skills</h1>
                    <p className="mt-1 text-sm font-bold text-slate-400">{activeSkills.length} active of {skills.length} total</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-aegis-border dark:text-slate-200 dark:hover:border-blue-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to chat
                  </button>
                </div>

                <div className="space-y-4">
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-aegis-border dark:bg-aegis-bg">
                    <h2 className="flex items-center gap-2 text-base font-black text-slate-950 dark:text-white">
                      <Wand2 className="h-5 w-5 text-blue-500" />
                      Add skill
                    </h2>
                    <div className="mt-4 grid gap-3 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_150px]">
                      <input
                        value={skillName}
                        onChange={event => setSkillName(event.target.value)}
                        placeholder="Example: Vendor Security Analyst"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-aegis-border dark:bg-aegis-surface dark:text-white"
                      />
                      <input
                        value={skillDescription}
                        onChange={event => setSkillDescription(event.target.value)}
                        placeholder="Agent training context"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-aegis-border dark:bg-aegis-surface dark:text-white"
                      />
                      <button
                        onClick={addSkill}
                        disabled={!skillName.trim()}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-white dark:text-slate-900 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                      >
                        <Save className="h-4 w-4" />
                        Save skill
                      </button>
                    </div>
                  </section>

                  <section className="grid gap-3 2xl:grid-cols-2">
                    {skills.map(skill => {
                      const isEditing = editingSkillId === skill.id;

                      return (
                        <div
                          key={skill.id}
                          data-testid="skill-card"
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-aegis-border dark:bg-aegis-bg"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <input
                                value={editingSkillName}
                                onChange={event => setEditingSkillName(event.target.value)}
                                placeholder="Skill name"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-aegis-border dark:bg-aegis-surface dark:text-white"
                              />
                              <textarea
                                value={editingSkillDescription}
                                onChange={event => setEditingSkillDescription(event.target.value)}
                                placeholder="Training context"
                                className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-aegis-border dark:bg-aegis-surface dark:text-white"
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => saveEditingSkill(skill.id)}
                                  disabled={!editingSkillName.trim()}
                                  className="flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                >
                                  <Save className="h-4 w-4" />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditingSkill}
                                  className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-600 transition hover:bg-white dark:border-aegis-border dark:text-slate-300 dark:hover:bg-white/5"
                                >
                                  <X className="h-4 w-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => toggleSkill(skill.id)}
                                    className={cn(
                                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition',
                                      skill.enabled
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-slate-300 text-transparent hover:border-blue-300 dark:border-slate-600'
                                    )}
                                    aria-label={`${skill.enabled ? 'Disable' : 'Enable'} ${skill.name}`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <h3 className="text-base font-black text-slate-950 dark:text-white">{skill.name}</h3>
                                  <span className={cn(
                                    'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider',
                                    skill.enabled
                                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                      : 'bg-slate-100 text-slate-400 dark:bg-white/5'
                                  )}>
                                    {skill.enabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{skill.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditingSkill(skill)}
                                  className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-aegis-border dark:text-slate-300 dark:hover:border-blue-800"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteSkill(skill.id)}
                                  className="flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {skills.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm font-bold text-slate-400 dark:border-aegis-border 2xl:col-span-2">
                        No skills yet
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>

          {activeTab === 'chat' && (
            <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 dark:border-aegis-border dark:bg-aegis-surface">
              <div className="relative mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm transition focus-within:border-blue-500 dark:border-aegis-border dark:bg-aegis-bg">
                {slashOpen && slashMatches.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-aegis-border dark:bg-aegis-surface overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-aegis-border">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skills</span>
                    </div>
                    {slashMatches.map((skill, i) => (
                      <button
                        key={skill.id}
                        onMouseDown={event => {
                          event.preventDefault();
                          setInput(`/${skill.name} `);
                          setSlashOpen(false);
                          inputRef.current?.focus();
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 px-3 py-2.5 text-left transition',
                          i === slashIndex
                            ? 'bg-blue-50 dark:bg-blue-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                        )}
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                          <Wand2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </span>
                        <span>
                          <span className="block text-sm font-black text-slate-900 dark:text-white">/{skill.name}</span>
                          <span className="block text-xs font-medium text-slate-400 leading-5">{skill.description}</span>
                        </span>
                        {skill.enabled && (
                          <span className="ml-auto mt-0.5 shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={event => {
                    const val = event.target.value;
                    setInput(val);
                    const slashMatch = val.match(/(?:^|\s)\/(\S*)$/);
                    if (slashMatch) {
                      setSlashQuery(slashMatch[1]);
                      setSlashIndex(0);
                      setSlashOpen(true);
                    } else {
                      setSlashOpen(false);
                    }
                  }}
                  onKeyDown={event => {
                    if (slashOpen) {
                      if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setSlashIndex(i => Math.min(i + 1, slashMatches.length - 1));
                        return;
                      }
                      if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setSlashIndex(i => Math.max(i - 1, 0));
                        return;
                      }
                      if (event.key === 'Tab' || event.key === 'Enter') {
                        const picked = slashMatches[slashIndex];
                        if (picked) {
                          event.preventDefault();
                          setInput(`/${picked.name} `);
                          setSlashOpen(false);
                          return;
                        }
                      }
                      if (event.key === 'Escape') {
                        setSlashOpen(false);
                        return;
                      }
                    }
                    if (event.key !== 'Enter' || event.shiftKey) return;
                    event.preventDefault();
                    sendMessage();
                  }}
                  onBlur={() => setSlashOpen(false)}
                  placeholder="Ask about risks, audits, controls... or type / for skills"
                  className="max-h-40 min-h-10 w-full resize-none bg-transparent px-3 py-2 text-sm font-semibold leading-6 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <div className="flex items-center justify-between gap-2 px-1 pb-1">
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200" aria-label="Attach file">
                      <Paperclip className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
