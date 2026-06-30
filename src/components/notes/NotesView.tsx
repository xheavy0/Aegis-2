import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Folder,
  FolderOpen,
  Hash,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Pin,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Strikethrough,
  Tag,
  Trash2,
  Type,
  Underline,
  UserRound,
  Users,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import {
  Note, NoteFolder, NoteShareEntry, NoteAccessLevel, NotePermission,
} from '@/src/types';

type AccessLevel = NoteAccessLevel;
type Permission = NotePermission;
type ShareEntry = NoteShareEntry;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'alex', name: 'Alex C.', role: 'GRC Lead', initials: 'AC', color: '#2563eb' },
  { id: 'sarah', name: 'Sarah L.', role: 'Security Analyst', initials: 'SL', color: '#059669' },
  { id: 'elena', name: 'Elena R.', role: 'Compliance Manager', initials: 'ER', color: '#7c3aed' },
  { id: 'david', name: 'David M.', role: 'Risk Owner', initials: 'DM', color: '#d97706' },
  { id: 'michael', name: 'Michael K.', role: 'Audit Liaison', initials: 'MK', color: '#0891b2' },
];

const FOLDER_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#64748b'];


const ACCESS_META: Record<AccessLevel, { label: string; icon: React.ReactNode; className: string }> = {
  Private: {
    label: 'Private',
    icon: <Lock className="w-3.5 h-3.5" />,
    className: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800',
  },
  Team: {
    label: 'Team',
    icon: <Users className="w-3.5 h-3.5" />,
    className: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  },
  Shared: {
    label: 'Shared',
    icon: <Share2 className="w-3.5 h-3.5" />,
    className: 'text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
  },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function wordCount(text: string) {
  return htmlToText(text).trim().split(/\s+/).filter(Boolean).length;
}

function cleanNoteContent(content: string) {
  return content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^- \[[x ]\]\s+/gm, '')
    .replace(/^- /gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`(.*?)`/g, '$1');
}

function htmlToText(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ');
}

function textToEditorHtml(value: string) {
  if (value.includes('<')) return value;
  return value
    .split('\n')
    .map(line => line.trim() ? `<p>${line}</p>` : '<p><br /></p>')
    .join('');
}

function memberById(id: string) {
  return TEAM_MEMBERS.find(member => member.id === id) ?? TEAM_MEMBERS[0];
}

function normalizeTag(value: string) {
  return value.trim().replace(/^#/, '');
}

function nextFolderName(folders: NoteFolder[]) {
  return `New Folder ${folders.length + 1}`;
}

export function NotesView() {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [activeScope, setActiveScope] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderDraft, setFolderDraft] = useState('');
  const [colorPickerFolderId, setColorPickerFolderId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  const activeNote = notes.find(note => note.id === selectedNoteId) ?? notes[0];

  useEffect(() => {
    let active = true;
    api.getNotesWorkspace()
      .then(ws => {
        if (!active) return;
        setFolders(ws.folders);
        const cleaned = ws.notes.map(note => ({ ...note, content: cleanNoteContent(note.content) }));
        setNotes(cleaned);
        setSelectedNoteId(cleaned[0]?.id ?? '');
      })
      .catch(() => { /* keep empty workspace on failure */ })
      .finally(() => { if (active) hydrated.current = true; });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    void api.replaceNotesWorkspace({ notes, folders });
  }, [notes, folders]);

  useEffect(() => {
    if (!notes.length) {
      setSelectedNoteId('');
      return;
    }
    if (!notes.some(note => note.id === selectedNoteId)) setSelectedNoteId(notes[0].id);
  }, [notes, selectedNoteId]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes
      .filter(note => {
        const owner = memberById(note.ownerId);
        const matchesSearch =
          !q ||
          note.title.toLowerCase().includes(q) ||
          htmlToText(note.content).toLowerCase().includes(q) ||
          note.tags.some(tag => tag.toLowerCase().includes(q)) ||
          owner.name.toLowerCase().includes(q);
        const matchesTag = !activeTag || note.tags.includes(activeTag);
        const matchesScope =
          activeScope === 'all' ||
          (activeScope === 'pinned' && note.pinned) ||
          (activeScope === 'shared' && (note.access !== 'Private' || note.sharedWith.length > 0)) ||
          note.folderId === activeScope;
        return matchesSearch && matchesTag && matchesScope;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [activeScope, activeTag, notes, search]);

  const notesByFolder = useMemo(() => {
    const grouped: Record<string, Note[]> = {};
    folders.forEach(folder => { grouped[folder.id] = []; });
    filteredNotes.forEach(note => {
      if (note.folderId) (grouped[note.folderId] ??= []).push(note);
    });
    return grouped;
  }, [filteredNotes, folders]);

  const looseNotes = filteredNotes.filter(note => !note.folderId);

  function updateNote(id: string, patch: Partial<Note>) {
    setNotes(current =>
      current.map(note =>
        note.id === id ? { ...note, ...patch, updatedAt: patch.updatedAt ?? today() } : note
      )
    );
  }

  function createNote(folderId: string | null = activeScope !== 'all' && !['pinned', 'shared'].includes(activeScope) ? activeScope : null) {
    const id = createId('note');
    const now = today();
    const ownerId = TEAM_MEMBERS[0].id;
    const note: Note = {
      id,
      title: 'Untitled',
      content: '',
      folderId,
      tags: [],
      pinned: false,
      access: 'Private',
      ownerId,
      sharedWith: [],
      createdAt: now,
      updatedAt: now,
    };
    setNotes(current => [note, ...current]);
    setSelectedNoteId(id);
    setShareOpen(false);
  }

  function syncEditorContent() {
    if (!activeNote || !editorRef.current) return;
    updateNote(activeNote.id, { content: editorRef.current.innerHTML });
  }

  function applyEditorCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorContent();
  }

  function saveAndCreateNote() {
    syncEditorContent();
    createNote();
  }

  function deleteNote(id: string) {
    setNotes(current => {
      const next = current.filter(note => note.id !== id);
      if (selectedNoteId === id) setSelectedNoteId(next[0]?.id ?? '');
      return next;
    });
  }

  function createFolder() {
    const folder: NoteFolder = {
      id: createId('folder'),
      name: nextFolderName(folders),
      color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
      collapsed: false,
    };
    setFolders(current => [...current, folder]);
    setActiveScope(folder.id);
    setEditingFolderId(folder.id);
    setFolderDraft(folder.name);
  }

  function renameFolder(folderId: string) {
    const name = folderDraft.trim();
    if (name) setFolders(current => current.map(folder => folder.id === folderId ? { ...folder, name } : folder));
    setEditingFolderId(null);
  }

  function setFolderColor(folderId: string, color: string) {
    setFolders(current => current.map(folder => folder.id === folderId ? { ...folder, color } : folder));
    setColorPickerFolderId(null);
  }

  function toggleFolder(folderId: string) {
    setFolders(current => current.map(folder => folder.id === folderId ? { ...folder, collapsed: !folder.collapsed } : folder));
  }

  function addTag() {
    if (!activeNote) return;
    const tag = normalizeTag(tagDraft);
    if (!tag || activeNote.tags.includes(tag)) {
      setTagDraft('');
      return;
    }
    updateNote(activeNote.id, { tags: [...activeNote.tags, tag] });
    setTagDraft('');
  }

  function removeTag(tag: string) {
    if (!activeNote) return;
    updateNote(activeNote.id, { tags: activeNote.tags.filter(item => item !== tag) });
    if (activeTag === tag) setActiveTag(null);
  }

  function toggleShare(memberId: string) {
    if (!activeNote) return;
    const exists = activeNote.sharedWith.some(entry => entry.memberId === memberId);
    updateNote(activeNote.id, {
      access: 'Shared',
      sharedWith: exists
        ? activeNote.sharedWith.filter(entry => entry.memberId !== memberId)
        : [...activeNote.sharedWith, { memberId, permission: 'Can view' }],
    });
  }

  function setMemberPermission(memberId: string, permission: Permission) {
    if (!activeNote) return;
    updateNote(activeNote.id, {
      sharedWith: activeNote.sharedWith.map(entry => entry.memberId === memberId ? { ...entry, permission } : entry),
    });
  }

  function renderScopeButton(id: string, label: string, icon: React.ReactNode, count: number) {
    const active = activeScope === id;
    return (
      <button
        key={id}
        onClick={() => setActiveScope(id)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all',
          active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
        )}
      >
        {icon}
        <span className="text-xs font-bold truncate">{label}</span>
        <span className="ml-auto text-[10px] font-black text-slate-400">{count}</span>
      </button>
    );
  }

  function renderNoteRow(note: Note, nested = false) {
    const owner = memberById(note.ownerId);
    const access = ACCESS_META[note.access];
    return (
      <button
        key={note.id}
        onClick={() => setSelectedNoteId(note.id)}
        className={cn(
          'w-full flex items-start gap-2 rounded-lg text-left transition-all',
          nested ? 'px-3 py-2 ml-5 w-[calc(100%-1.25rem)]' : 'px-3 py-2',
          selectedNoteId === note.id
            ? 'bg-white dark:bg-aegis-surface shadow-sm border border-slate-200 dark:border-aegis-border'
            : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
        )}
      >
        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {note.pinned && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">{note.title || 'Untitled'}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
            <span>{formatDate(note.updatedAt)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{owner.initials}</span>
            <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md', access.className)}>{access.icon}</span>
          </div>
        </div>
      </button>
    );
  }

  function renderTeamSharingSection() {
    if (!activeNote) return null;
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Sharing</p>
          <span className="text-[10px] font-black text-slate-400">{activeNote.sharedWith.length} selected</span>
        </div>
        <div className="max-h-80 overflow-y-auto pr-1 space-y-2">
          {TEAM_MEMBERS.map(member => {
            const share = activeNote.sharedWith.find(entry => entry.memberId === member.id);
            const isShared = Boolean(share);
            return (
              <div key={member.id} className="rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg p-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleShare(member.id)}
                    className={cn('h-5 w-5 rounded-md border flex items-center justify-center', isShared ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent')}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ backgroundColor: member.color }}>
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-800 dark:text-slate-100">{member.name}</p>
                    <p className="truncate text-[10px] font-bold text-slate-400">{member.role}</p>
                  </div>
                </div>
                {isShared && (
                  <select
                    value={share?.permission ?? 'Can view'}
                    onChange={event => setMemberPermission(member.id, event.target.value as Permission)}
                    className="mt-2 w-full rounded-lg border border-slate-200 dark:border-aegis-border bg-slate-50 dark:bg-aegis-surface px-2 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
                  >
                    {(['Can view', 'Can comment', 'Can edit'] as Permission[]).map(permission => <option key={permission}>{permission}</option>)}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface shadow-xl">
      <div className="grid h-full grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-slate-200 dark:border-aegis-border bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="p-4 border-b border-slate-200 dark:border-aegis-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">Notes</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">GRC Workspace</p>
              </div>
              <button onClick={() => createNote()} className="btn-primary h-9 w-9 p-0 flex items-center justify-center" title="New note">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-5">
            <section className="space-y-1">
              {renderScopeButton('all', 'All Notes', <BookOpen className="w-4 h-4" />, notes.length)}
              {renderScopeButton('pinned', 'Pinned', <Pin className="w-4 h-4" />, notes.filter(note => note.pinned).length)}
              {renderScopeButton('shared', 'Shared', <Share2 className="w-4 h-4" />, notes.filter(note => note.access !== 'Private' || note.sharedWith.length > 0).length)}
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Folders</p>
                <button onClick={createFolder} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10" title="New folder">
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-1">
                {folders.map(folder => (
                  <div key={folder.id} className="relative">
                    <div
                      className={cn(
                        'group flex items-center gap-2 rounded-lg px-2 py-1.5',
                        activeScope === folder.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                      )}
                    >
                      <button onClick={() => toggleFolder(folder.id)} className="p-0.5 rounded hover:bg-white/70 dark:hover:bg-white/10">
                        {folder.collapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                      <button onClick={() => setActiveScope(folder.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                        {folder.collapsed ? (
                          <Folder className="w-4 h-4 shrink-0" style={{ color: folder.color }} />
                        ) : (
                          <FolderOpen className="w-4 h-4 shrink-0" style={{ color: folder.color }} />
                        )}
                        {editingFolderId === folder.id ? (
                          <input
                            value={folderDraft}
                            onChange={event => setFolderDraft(event.target.value)}
                            onBlur={() => renameFolder(folder.id)}
                            onKeyDown={event => {
                              if (event.key === 'Enter') renameFolder(folder.id);
                              if (event.key === 'Escape') setEditingFolderId(null);
                            }}
                            autoFocus
                            className="min-w-0 flex-1 rounded bg-white dark:bg-aegis-bg border border-blue-500 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                          />
                        ) : (
                          <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{folder.name}</span>
                        )}
                      </button>
                      <span className="text-[10px] font-black text-slate-400">{notes.filter(note => note.folderId === folder.id).length}</span>
                      <button
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setFolderDraft(folder.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/70 dark:hover:bg-white/10"
                        title="Rename folder"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => setColorPickerFolderId(colorPickerFolderId === folder.id ? null : folder.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/70 dark:hover:bg-white/10"
                        title="Folder color"
                      >
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                    {colorPickerFolderId === folder.id && (
                      <div className="ml-8 mt-1 flex flex-wrap gap-1.5 rounded-lg border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface p-2 shadow-xl">
                        {FOLDER_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setFolderColor(folder.id, color)}
                            className="h-5 w-5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                            style={{ backgroundColor: color }}
                            title="Set folder color"
                          />
                        ))}
                      </div>
                    )}

                    {!folder.collapsed && (
                      <div className="mt-1 space-y-1">
                        {(notesByFolder[folder.id] ?? []).map(note => renderNoteRow(note, true))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {looseNotes.length > 0 && (
              <section className="space-y-2">
                <p className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unfiled</p>
                <div className="space-y-1">{looseNotes.map(note => renderNoteRow(note))}</div>
              </section>
            )}
          </div>
        </aside>

        {activeNote ? (
          <main className="grid min-w-0 grid-cols-[minmax(0,1fr)_320px]">
            <section className="flex min-w-0 flex-col">
              <div className="border-b border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface px-8 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider', ACCESS_META[activeNote.access].className)}>
                        {ACCESS_META[activeNote.access].icon}
                        {ACCESS_META[activeNote.access].label}
                      </span>
                      {activeNote.tags.slice(0, 4).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black',
                            activeTag === tag ? 'bg-blue-600 text-white' : 'bg-white/80 dark:bg-white/10 text-slate-500 dark:text-slate-300'
                          )}
                        >
                          <Hash className="w-3 h-3" />
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input
                      value={activeNote.title}
                      onChange={event => updateNote(activeNote.id, { title: event.target.value })}
                      className="mt-5 w-full bg-transparent text-4xl font-black tracking-tight text-slate-950 dark:text-white placeholder:text-slate-300 focus:outline-none"
                      placeholder="Untitled"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Updated {formatDate(activeNote.updatedAt)}</span>
                      <span className="flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5" />{memberById(activeNote.ownerId).name}</span>
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{wordCount(activeNote.content)} words</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => updateNote(activeNote.id, { pinned: !activeNote.pinned })}
                      className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-colors', activeNote.pinned ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' : 'bg-white/70 dark:bg-white/10 text-slate-500')}
                      title="Pin note"
                    >
                      <Star className={cn('w-4 h-4', activeNote.pinned && 'fill-current')} />
                    </button>
                    <button onClick={() => setShareOpen(!shareOpen)} className="btn-primary flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button onClick={() => deleteNote(activeNote.id)} className="h-9 w-9 rounded-lg flex items-center justify-center bg-white/70 dark:bg-white/10 text-slate-500 hover:text-red-500 transition-colors" title="Delete note">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 dark:border-aegis-border px-8 py-2.5 flex flex-wrap items-center gap-2">
                {[
                  { label: 'B', command: 'bold', className: 'font-black' },
                  { label: 'I', command: 'italic', className: 'italic' },
                  { label: 'U', command: 'underline', icon: <Underline className="w-3.5 h-3.5" /> },
                  { label: 'S', command: 'strikeThrough', icon: <Strikethrough className="w-3.5 h-3.5" /> },
                ].map(item => (
                  <button
                    key={item.command}
                    onClick={() => applyEditorCommand(item.command)}
                    className={cn('h-8 min-w-8 rounded-lg px-2 text-xs font-black text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10', item.className)}
                  >
                    {item.icon ?? item.label}
                  </button>
                ))}
                <div className="h-6 w-px bg-slate-200 dark:bg-aegis-border" />
                <select
                  onChange={event => applyEditorCommand('fontName', event.target.value)}
                  className="h-8 rounded-lg border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-2 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
                  defaultValue="Sora"
                >
                  {['Sora', 'Inter', 'Arial', 'Georgia', 'Courier New'].map(font => <option key={font}>{font}</option>)}
                </select>
                <label className="h-8 rounded-lg border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-2 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" />
                  <input type="color" onChange={event => applyEditorCommand('foreColor', event.target.value)} className="h-5 w-6 bg-transparent" />
                </label>
                <button onClick={saveAndCreateNote} className="ml-auto rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white">
                  Save & New
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
                <div
                  key={activeNote.id}
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncEditorContent}
                  onBlur={syncEditorContent}
                  className="min-h-full w-full rounded-xl border border-transparent bg-white px-5 py-4 text-[15px] leading-8 text-slate-700 shadow-sm outline-none empty:before:content-['Write_clean_notes_here...'] empty:before:text-slate-300 focus:border-blue-200 dark:bg-aegis-bg dark:text-slate-300 dark:empty:before:text-slate-600 dark:focus:border-blue-900/60"
                  dangerouslySetInnerHTML={{ __html: textToEditorHtml(activeNote.content) }}
                />
              </div>
            </section>

            <aside className="min-h-0 overflow-y-auto border-l border-slate-200 dark:border-aegis-border bg-slate-50/80 dark:bg-white/[0.02] p-5 space-y-6">
              {shareOpen && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Share Note</h3>
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Set access and choose team members.</p>
                </div>
              )}

              {renderTeamSharingSection()}

              <section className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Properties</p>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Folder</span>
                    <select
                      value={activeNote.folderId ?? ''}
                      onChange={event => updateNote(activeNote.id, { folderId: event.target.value || null })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Unfiled</option>
                      {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</span>
                    <select
                      value={activeNote.ownerId}
                      onChange={event => updateNote(activeNote.id, { ownerId: event.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {TEAM_MEMBERS.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access</span>
                    <select
                      value={activeNote.access}
                      onChange={event => updateNote(activeNote.id, { access: event.target.value as AccessLevel })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {(['Private', 'Team', 'Shared'] as AccessLevel[]).map(access => <option key={access}>{access}</option>)}
                    </select>
                  </label>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tags</p>
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeNote.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border px-2 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300"
                    >
                      <Hash className="w-3 h-3 text-blue-500" />
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagDraft}
                    onChange={event => setTagDraft(event.target.value)}
                    onKeyDown={event => { if (event.key === 'Enter') addTag(); }}
                    placeholder="Add tag"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-bg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button onClick={addTag} className="h-9 w-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </section>

              {allTags.length > 0 && (
                <section className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tag Filter</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={cn(
                          'rounded-lg px-2 py-1 text-[10px] font-black',
                          activeTag === tag ? 'bg-blue-600 text-white' : 'bg-white dark:bg-aegis-bg text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-aegis-border'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</p>
                {[
                  { icon: <Circle className="w-3.5 h-3.5" />, label: `Created ${formatDate(activeNote.createdAt)}` },
                  { icon: <Sparkles className="w-3.5 h-3.5" />, label: `Updated ${formatDate(activeNote.updatedAt)}` },
                  { icon: <MessageSquare className="w-3.5 h-3.5" />, label: `${activeNote.sharedWith.length} collaborator${activeNote.sharedWith.length === 1 ? '' : 's'}` },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </section>
            </aside>
          </main>
        ) : (
          <main className="flex items-center justify-center text-center">
            <div>
              <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">No notes yet</h3>
              <button onClick={() => createNote()} className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
