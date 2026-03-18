import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Settings,
  Users, Sun, Moon, Menu, X, ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/dashboard/configure', label: 'Configure', icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          "md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
          isDarkMode
            ? "bg-gray-800 text-gray-300 shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#404040]"
            : "bg-gray-200 text-gray-600 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]"
        )}
        id="sidebar-toggle"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static z-40 h-full transition-all duration-300 ease-in-out p-3",
          isDarkMode ? "bg-gray-800" : "bg-gray-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-[88px]" : "w-[260px]"
        )}
      >
        <div className={cn(
          "h-full rounded-2xl p-5 flex flex-col transition-colors duration-300",
          isDarkMode
            ? "bg-gray-800 shadow-[12px_12px_24px_#1a1a1a,-12px_-12px_24px_#404040]"
            : "bg-gray-200 shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {!isCollapsed && (
              <div className={cn(
                "px-4 py-2.5 rounded-xl transition-colors duration-300",
                isDarkMode
                  ? "bg-gray-800 shadow-[inset_5px_5px_10px_#1a1a1a,inset_-5px_-5px_10px_#404040]"
                  : "bg-gray-200 shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]"
              )}>
                <h1 className={cn(
                  "text-base font-bold tracking-tight transition-colors duration-300",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>Dashboard</h1>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                  isDarkMode
                    ? "bg-gray-800 text-yellow-400 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040] hover:shadow-[7px_7px_14px_#1a1a1a,-7px_-7px_14px_#404040]"
                    : "bg-gray-200 text-gray-500 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#bebebe,-7px_-7px_14px_#ffffff]",
                  isDarkMode
                    ? "active:shadow-[inset_3px_3px_6px_#1a1a1a,inset_-3px_-3px_6px_#404040]"
                    : "active:shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]"
                )}
                id="theme-toggle"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-200",
                  isDarkMode
                    ? "bg-gray-800 text-gray-400 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040] hover:shadow-[7px_7px_14px_#1a1a1a,-7px_-7px_14px_#404040]"
                    : "bg-gray-200 text-gray-500 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#bebebe,-7px_-7px_14px_#ffffff]"
                )}
                id="sidebar-collapse"
              >
                <ChevronLeft size={16} className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-medium text-sm",
                  isDarkMode ? "bg-gray-800" : "bg-gray-200",
                  isActive
                    ? isDarkMode
                      ? "shadow-[inset_6px_6px_12px_#1a1a1a,inset_-6px_-6px_12px_#404040] text-emerald-400"
                      : "shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] text-emerald-600"
                    : isDarkMode
                      ? "text-gray-400 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040] hover:shadow-[7px_7px_14px_#1a1a1a,-7px_-7px_14px_#404040] hover:text-emerald-400"
                      : "text-gray-600 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#bebebe,-7px_-7px_14px_#ffffff] hover:text-emerald-600",
                  isCollapsed && "justify-center"
                )}
                id={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className={cn(
            "mt-6 pt-5 transition-colors duration-300",
            isDarkMode ? "border-t border-gray-700" : "border-t border-gray-300"
          )}>
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors duration-300",
              isDarkMode
                ? "bg-gray-800 shadow-[inset_3px_3px_6px_#1a1a1a,inset_-3px_-3px_6px_#404040]"
                : "bg-gray-200 shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]",
              isCollapsed && "justify-center"
            )}>
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                isDarkMode
                  ? "bg-gray-800 shadow-[3px_3px_6px_#1a1a1a,-3px_-3px_6px_#404040]"
                  : "bg-gray-200 shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff]"
              )}>
                <Users size={16} className={isDarkMode ? "text-emerald-400" : "text-emerald-500"} />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate transition-colors duration-300",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>Admin User</p>
                  <p className={cn(
                    "text-xs truncate transition-colors duration-300",
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  )}>admin@system.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
