import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/configure': 'Configure Dashboard',
  '/orders': 'Customer Orders',
};

const breadcrumbs = {
  '/dashboard': [{ label: 'Dashboard', path: '/dashboard' }],
  '/dashboard/configure': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Configure', path: '/dashboard/configure' },
  ],
  '/orders': [{ label: 'Orders', path: '/orders' }],
};

export default function Topbar() {
  const location = useLocation();
  const { isDarkMode } = useThemeStore();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const crumbs = breadcrumbs[location.pathname] || [];

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-6 shrink-0 transition-colors duration-300",
      isDarkMode ? "bg-gray-800" : "bg-gray-200"
    )}>
      <div>
        <h1 className={cn(
          "text-xl font-bold transition-colors duration-300",
          isDarkMode ? "text-gray-200" : "text-gray-800"
        )}>{title}</h1>
        {crumbs.length > 1 && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-0.5 transition-colors duration-300",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )}>
            {crumbs.map((crumb, idx) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight size={12} />}
                <span className={cn(
                  idx === crumbs.length - 1
                    ? isDarkMode ? "text-gray-300" : "text-gray-600"
                    : ""
                )}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>


    </header>
  );
}
