/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ComplianceView } from './components/compliance/ComplianceView';
import { RiskView } from './components/risks/RiskView';
import { FindingsView } from './components/findings/FindingsView';
import { PoliciesView } from './components/policies/PoliciesView';
import { VendorsView } from './components/vendors/VendorsView';
import { ConnectorsView } from './components/connectors/ConnectorsView';
import { ReportingView } from './components/reporting/ReportingView';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { LoginView } from './components/auth/LoginView';
import { RequirementHubView } from './components/controls/RequirementHubView';
import { EvidenceView } from './components/evidence/EvidenceView';
import { NotesView } from './components/notes/NotesView';
import { AuditManagementView } from './components/audits/AuditManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { AegisIntelligenceView } from './components/ai/AegisIntelligenceView';
import { AssetManagementView } from './components/assets/AssetManagementView';
import { BIAView } from './components/bia/BIAView';
import { User, Bell, Search, Sun, Moon, CheckCheck, CalendarClock, AlertTriangle, ShieldAlert, ClipboardList, FileWarning, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from './types';
import { canAccess, CurrentUser, DEFAULT_USERS, readRoleAccess } from './rbac';
import { api, getToken, setToken } from './lib/api';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Critical risk updated',
    message: 'R-101 remains open after the latest cloud storage review.',
    type: 'risk',
    audience: 'all',
    createdAt: 'Just now',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Calendar event assigned',
    message: 'You were added to Q2 Audit Kickoff on 2026-04-29.',
    type: 'calendar',
    audience: ['Admin'],
    createdAt: '5m ago',
    read: false,
  },
];

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 10000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-aegis-bg flex flex-col items-center justify-center gap-8 px-6"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10">
          <img src="/regenerated_image_1777458964528.png" alt="Aegis" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-white">AEGIS <span className="text-blue-500 font-normal">GRC</span></h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Enterprise GRC Platform</p>
        </div>
      </motion.div>

      {/* Concept art notice */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="max-w-lg text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Concept Art
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          This is a <span className="text-white font-bold">concept art</span> — inspired by several
          existing industry tools, unified into a single{' '}
          <span className="text-blue-400 font-bold">ultimate GRC platform</span>.
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="w-64 space-y-2"
      >
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 1.9, duration: 7.8, ease: 'linear' }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
        <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest">Loading platform...</p>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_USERS[0]);
  const [, setRoleAccessVersion] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Restore an existing session from a stored token on first load.
  useEffect(() => {
    if (!getToken()) return;
    api.me()
      .then((user) => {
        setCurrentUser(user as CurrentUser);
        setIsLoggedIn(true);
        setActiveTab(readRoleAccess()[user.role][0] ?? 'dashboard');
      })
      .catch(() => setToken(null));
  }, []);

  function logout() {
    setToken(null);
    setIsLoggedIn(false);
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => notification.audience === 'all' || notification.audience.includes(currentUser.name)),
    [notifications, currentUser.name]
  );

  const unreadCount = visibleNotifications.filter((notification) => !notification.read).length;

  const pushNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.audience === 'all' || notification.audience.includes(currentUser.name)
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'task': return <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'calendar': return <CalendarClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'framework': return <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'finding': return <FileWarning className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); setShowSplash(true); setActiveTab(readRoleAccess()[user.role][0] ?? 'dashboard'); }} />;
  }

  if (showSplash) {
    return (
      <div className="dark">
        <AnimatePresence>
          <SplashScreen onDone={() => setShowSplash(false)} />
        </AnimatePresence>
      </div>
    );
  }

  const renderView = () => {
    const tab = canAccess(currentUser.role, activeTab) ? activeTab : (readRoleAccess()[currentUser.role][0] ?? 'dashboard');
    switch (tab) {
      case 'dashboard': return <DashboardView onTabChange={setActiveTab} />;
      case 'intelligence': return <AegisIntelligenceView currentUser={currentUser} />;
      case 'compliance': return <ComplianceView onNotify={pushNotification} />;
      case 'tasks': return <TasksView currentUser={currentUser.name} onNotify={pushNotification} />;
      case 'calendar': return <CalendarView currentUser={currentUser.name} onNotify={pushNotification} />;
      case 'risks': return <RiskView onNotify={pushNotification} />;
      case 'findings': return <FindingsView onNotify={pushNotification} />;
      case 'policies': return <PoliciesView />;
      case 'vendors': return <VendorsView />;
      case 'connectors': return <ConnectorsView />;
      case 'reporting': return <ReportingView />;
      case 'controls': return <RequirementHubView />;
      case 'evidence': return <EvidenceView />;
      case 'assets': return <AssetManagementView />;
      case 'bia': return <BIAView />;
      case 'audits': return <AuditManagementView role={currentUser.role} />;
      case 'notes': return <NotesView />;
      case 'settings': return <SettingsView currentUser={currentUser} onRoleAccessChange={() => setRoleAccessVersion(v => v + 1)} />;
      default: return <DashboardView onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={currentUser.role} onLogout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface flex items-center justify-between px-6 lg:px-10 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative max-w-[380px] w-full min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources, findings, or controls..." 
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-aegis-bg border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-slate-400 text-[var(--ink)] truncate"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-aegis-border rounded-xl transition-all"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="p-2.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-aegis-border relative rounded-xl transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-aegis-surface shadow-sm" />
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-lg">
                      {unreadCount}
                    </span>
                  </>
                )}
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 top-14 w-[380px] bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-2xl shadow-2xl overflow-hidden z-30"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-aegis-border flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Notifications</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live activity feed</p>
                      </div>
                      <button
                        onClick={markAllNotificationsRead}
                        className="flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-aegis-border">
                      {visibleNotifications.length > 0 ? visibleNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-5 py-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-aegis-bg flex items-center justify-center shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{notification.title}</p>
                              {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notification.message}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{notification.createdAt}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="px-5 py-10 text-center">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">No notifications yet</p>
                          <p className="text-xs text-slate-400 mt-2">New task, calendar, risk, and framework updates will appear here.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-aegis-border hidden lg:block" />
            
            <div className="relative flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none whitespace-nowrap">{currentUser.name}</p>
                <p className="text-[9px] text-blue-500 font-bold mt-1 uppercase tracking-widest whitespace-nowrap opacity-80">{currentUser.role}</p>
              </div>
              <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20 border border-white/10 cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
              >
                <User className="text-white w-5 h-5" />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-14 w-44 bg-white dark:bg-aegis-surface border border-slate-200 dark:border-aegis-border rounded-xl shadow-2xl overflow-hidden z-30"
                  >
                    {canAccess(currentUser.role, 'settings') && (
                      <>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setActiveTab('settings'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <div className="border-t border-slate-100 dark:border-aegis-border" />
                      </>
                    )}
                    <button
                      onClick={() => { setIsUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      End Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide bg-slate-50 dark:bg-aegis-bg">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
