import { NavLink } from "react-router-dom";
import { LayoutDashboard, User, BookOpen, Map, Settings, LogOut, CheckSquare, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  
  const menuItems = [
    { name: t('sidebar.dashboard'), path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: t('sidebar.profile'), path: "/profile", icon: <User size={20} /> },
    { name: t('sidebar.assessments'), path: "/assessment", icon: <CheckSquare size={20} /> },
    { name: t('sidebar.learningPath'), path: "/learning-path", icon: <Map size={20} /> },
    { name: t('sidebar.history'), path: "/history", icon: <Clock size={20} /> },
    { name: t('sidebar.curriculum'), path: "/curriculum", icon: <BookOpen size={20} /> },
    { name: t('sidebar.settings'), path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-cards border-r border-borderCustom h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-borderCustom">
        <h1 className="text-xl font-semibold text-primary">NeoLearn AI</h1>
      </div>
      <div className="flex-1 py-4 flex flex-col gap-2 px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-custom text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-textSecondary hover:bg-borderCustom/30 hover:text-textPrimary"
              )
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>
      <div className="p-4 border-t border-borderCustom">
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
