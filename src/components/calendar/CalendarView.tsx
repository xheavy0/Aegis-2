import React, { useState } from 'react';
import { MOCK_CALENDAR_EVENTS, TEAM_MEMBERS } from '@/src/constants';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ExternalLink,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { AppNotification, CalendarEvent } from '@/src/types';

interface CalendarViewProps {
  currentUser: string;
  onNotify: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

export function CalendarView({ currentUser, onNotify }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-29'));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CalendarEvent>({
    id: '',
    title: '',
    description: '',
    date: '2026-04-29',
    startTime: '09:00 AM',
    duration: '1h',
    type: 'Meeting',
    assignees: [currentUser],
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      date: '2026-04-29',
      startTime: '09:00 AM',
      duration: '1h',
      type: 'Meeting',
      assignees: [currentUser],
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: CalendarEvent = {
      ...formData,
      id: `E-${Math.floor(Math.random() * 900) + 100}`,
      assignees: formData.assignees?.length ? formData.assignees : [currentUser],
    };

    setEvents((prev) => [newEvent, ...prev]);
    onNotify({
      title: 'New calendar event',
      message: `${newEvent.title} was scheduled for ${newEvent.date} at ${newEvent.startTime}.`,
      type: 'calendar',
      audience: newEvent.assignees ?? [currentUser],
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const toggleAssignee = (member: string) => {
    setFormData((prev) => {
      const currentAssignees = prev.assignees ?? [];
      const nextAssignees = currentAssignees.includes(member)
        ? currentAssignees.filter((name) => name !== member)
        : [...currentAssignees, member];

      return { ...prev, assignees: nextAssignees };
    });
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const startDay = firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border-r border-b border-slate-100 dark:border-aegis-border bg-slate-50/20 dark:bg-transparent" />);
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      const isToday = i === 29 && currentDate.getMonth() === 3;

      days.push(
        <div key={i} className="h-32 border-r border-b border-slate-100 dark:border-aegis-border p-2 group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg",
              isToday ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400"
            )}>
              {i}
            </span>
            {dayEvents.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="px-2 py-1 text-[9px] font-black uppercase tracking-tight bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-900/30 rounded truncate cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Team Matrix</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Strategic scheduling of audits, reviews, and infrastructure releases.</p>
        </div>
        <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-slate-100 dark:bg-aegis-surface text-slate-900 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-aegis-border hover:bg-slate-200 transition-all">Sync Outlook</button>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Schedule Event
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar View */}
        <div className="lg:col-span-3 glass-card p-0 overflow-hidden bg-white dark:bg-aegis-surface">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-aegis-border">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-aegis-bg p-1 rounded-xl border border-slate-100 dark:border-aegis-border">
                    <button className="px-3 py-1 text-[10px] font-black uppercase bg-white dark:bg-aegis-surface text-blue-600 rounded-lg shadow-sm">Month</button>
                    <button className="px-3 py-1 text-[10px] font-black uppercase text-slate-400">Week</button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-aegis-border">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                    <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-aegis-border last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 border-l border-slate-100 dark:border-aegis-border">
                {renderDays()}
            </div>
        </div>

        {/* Upcoming List */}
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Upcoming Ops</h3>
                <div className="space-y-6">
                    {events.map((event) => (
                        <div 
                          key={event.id} 
                          onClick={() => setSelectedEvent(event)}
                          className={cn(
                            "relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 transition-all cursor-pointer hover:pl-7 group",
                            event.type === 'Audit' ? "before:bg-red-500" : event.type === 'Review' ? "before:bg-blue-500" : "before:bg-emerald-500"
                          )}
                        >
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{event.date} · {event.startTime}</span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 group-hover:text-blue-500">{event.title}</h4>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex -space-x-2">
                                    {(event.assignees ?? []).slice(0, 3).map((member, i) => (
                                        <div key={member} className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 border-2 border-white dark:border-aegis-surface flex items-center justify-center text-[8px] font-black text-slate-500">
                                            {i === 2 && (event.assignees?.length ?? 0) > 3 ? '+' : member.split(' ').map(part => part[0]).join('').slice(0, 2)}
                                        </div>
                                    ))}
                                </div>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight",
                                    event.type === 'Audit' ? "bg-red-50 text-red-600 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30"
                                )}>{event.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card bg-slate-900 p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-all">
                    <CalendarIcon className="w-20 h-20" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black leading-tight mb-2">Team Readiness</h3>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-6">Internal Audit Cycle Q2</p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black">
                            <span className="uppercase text-slate-400">Preparation Progress</span>
                            <span>82%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: '82%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedEvent(null)}
               className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]" 
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white dark:bg-aegis-surface shadow-2xl rounded-2xl z-[111] p-8 border border-slate-200 dark:border-aegis-border"
            >
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">Strategic {selectedEvent.type}</span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedEvent.title}</h3>
                        </div>
                    </div>
                    <button onClick={() => setSelectedEvent(null)}><CheckCircle2 className="w-6 h-6 text-slate-300 hover:text-emerald-500 transition-colors" /></button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Timeframe</label>
                            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                {selectedEvent.startTime} · {selectedEvent.duration}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-aegis-bg rounded-xl border border-slate-100 dark:border-aegis-border">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</label>
                            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                HQ Conference
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contextual Briefing</label>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-2 border-blue-500 pl-4">
                            "{selectedEvent.description}"
                        </p>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assigned Team</label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedEvent.assignees ?? []).map((assignee) => (
                            <span key={assignee} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-aegis-bg text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-aegis-border">
                              {assignee}
                            </span>
                          ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-aegis-border flex items-center gap-3">
                        <button className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">Confirm Attendance</button>
                        <button className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-blue-500 transition-all"><ExternalLink className="w-5 h-5" /></button>
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white dark:bg-aegis-surface rounded-2xl shadow-2xl z-[121] border border-slate-200 dark:border-aegis-border overflow-hidden"
            >
              <form onSubmit={handleCreateEvent}>
                <div className="px-6 py-5 border-b border-slate-100 dark:border-aegis-border flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Schedule Event</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assigned users will receive notifications</p>
                  </div>
                  <button type="button" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl p-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <input
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                      placeholder="10:00 AM"
                      className="w-full bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="1h"
                      className="w-full bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                      className="w-full bg-slate-50 dark:bg-aegis-bg border border-slate-200 dark:border-aegis-border rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="Meeting">Meeting</option>
                      <option value="Audit">Audit</option>
                      <option value="Review">Review</option>
                      <option value="Release">Release</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notify Assigned Team</label>
                    <div className="flex flex-wrap gap-2">
                      {TEAM_MEMBERS.filter((member) => member !== 'Unassigned').map((member) => {
                        const selected = (formData.assignees ?? []).includes(member);
                        return (
                          <button
                            key={member}
                            type="button"
                            onClick={() => toggleAssignee(member)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              selected
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                : "bg-slate-50 dark:bg-aegis-bg text-slate-500 dark:text-slate-300 border-slate-200 dark:border-aegis-border"
                            )}
                          >
                            {member}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all">
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
