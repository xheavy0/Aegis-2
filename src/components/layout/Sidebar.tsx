import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Users,
  Search,
  Database,
  BarChart3,
  TrendingUp,
  CheckSquare,
  Calendar,
  FileCheck,
  Archive,
  Monitor,
  ClipboardCheck,
  StickyNote,
  Sparkles
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { canAccess, UserRole } from '@/src/rbac';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  onLogout?: () => void;
}

const navGroups = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Home', icon: Home },
      { id: 'intelligence', label: 'Aegis Intelligence', icon: Sparkles },
      { id: 'reporting', label: 'Reports', icon: BarChart3 },
      { id: 'assets', label: 'Assets', icon: Monitor },
    ]
  },
  {
    title: 'Continuous Monitoring',
    items: [
      { id: 'compliance', label: 'Frameworks', icon: ShieldCheck },
      { id: 'controls', label: 'Requirement Hub', icon: FileCheck },
      { id: 'policies', label: 'Policies', icon: FileText },
      { id: 'findings', label: 'Findings', icon: Search },
    ]
  },
  {
    title: 'Risk Management',
    items: [
      { id: 'risks', label: 'Risks', icon: AlertTriangle },
      { id: 'vendors', label: 'TPSA', icon: Users },
      { id: 'bia', label: 'BIA', icon: TrendingUp },
    ]
  },
  {
    title: 'Data',
    items: [
      { id: 'connectors', label: 'Integrations', icon: Database },
      { id: 'evidence', label: 'Evidences', icon: Archive },
    ]
  },
  {
    title: 'Tasks',
    items: [
      { id: 'tasks', label: 'Task List', icon: CheckSquare },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'notes', label: 'Notes', icon: StickyNote },
      { id: 'audits', label: 'Audits', icon: ClipboardCheck },
    ]
  }
];

export function Sidebar({ activeTab, setActiveTab, role, onLogout }: SidebarProps) {
  const visibleGroups = navGroups
    .map(group => ({ ...group, items: group.items.filter(item => canAccess(role, item.id)) }))
    .filter(group => group.items.length > 0);

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface flex flex-col h-screen sticky top-0 transition-colors duration-300">
      <div className="p-8 pb-6 flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transform group-hover:scale-110 transition-transform duration-500">
             <img 
               src="/regenerated_image_1777458964528.png" 
               alt="Aegis Logo" 
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Aegis&background=0d6efd&color=fff';
               }}
             />
          </div>
        </div>
        <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">AEGIS <span className="text-blue-600 font-normal">GRC</span></h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-blue-500" />
              Enterprise GRC
            </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto scrollbar-hide">
        {visibleGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              {group.title}
            </h3>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "nav-item w-full group transition-all duration-200",
                  activeTab === item.id ? "active scale-[1.02]" : "hover:pl-4 opacity-70 hover:opacity-100"
                )}
              >
                <item.icon className={cn(
                    "w-4 h-4 transition-colors",
                    activeTab === item.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span className="text-sm font-semibold">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

    </aside>
  );
}
