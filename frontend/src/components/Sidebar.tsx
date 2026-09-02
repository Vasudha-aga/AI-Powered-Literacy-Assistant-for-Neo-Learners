import { NavLink, Link } from "react-router-dom";
import { 
  LayoutDashboard, User, BookOpen, Map, Settings, LogOut, 
  CheckSquare, Clock, Mic, Trophy, FileText 
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  
  const menuItems = [
    { name: t('sidebar.dashboard', 'Dashboard'), path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: t('sidebar.voice', 'Voice Learning'), path: "/voice", icon: <Mic size={20} /> },
    { name: t('sidebar.achievements', 'Achievements & Streaks'), path: "/achievements", icon: <Trophy size={20} /> },
    { name: t('sidebar.reports', 'Learning Reports'), path: "/reports", icon: <FileText size={20} /> },
    { name: t('sidebar.curriculum', 'Curriculum'), path: "/curriculum", icon: <BookOpen size={20} /> },
    { name: t('sidebar.learningPath', 'Learning Path'), path: "/learning-path", icon: <Map size={20} /> },
    { name: t('sidebar.assessments', 'Assessments'), path: "/assessment", icon: <CheckSquare size={20} /> },
    { name: t('sidebar.history', 'Assessment History'), path: "/history", icon: <Clock size={20} /> },
    { name: t('sidebar.profile', 'My Profile'), path: "/profile", icon: <User size={20} /> },
    { name: t('sidebar.settings', 'Settings'), path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-background/80 backdrop-blur-md border-r border-white/10 h-full flex-shrink-0 flex flex-col hidden md:flex z-20">
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <Link to="/" className="text-xl font-semibold text-primary hover:text-white transition-colors">NeoLearn AI</Link>
      </div>
      <div className="flex-1 py-4 flex flex-col gap-2 px-4 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-custom text-sm font-medium transition-colors flex-shrink-0",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-textSecondary hover:bg-borderCustom/30 hover:text-textPrimary"
              )
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>
      <div className="p-4 border-t border-borderCustom flex-shrink-0">
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-custom transition-colors"
        >
          <LogOut size={20} />
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
}
