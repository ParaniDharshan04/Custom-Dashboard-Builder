import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/shared/Sidebar';
import Topbar from './components/shared/Topbar';
import DashboardPage from './pages/DashboardPage';
import DashboardConfigPage from './pages/DashboardConfigPage';
import OrdersPage from './pages/OrdersPage';
import { cn } from './lib/utils';
import { useThemeStore } from './stores/themeStore';

function AppShell({ children }) {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={cn(
      "flex h-screen transition-colors duration-300",
      isDarkMode ? "bg-gray-800" : "bg-gray-200"
    )}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className={cn(
          "flex-1 overflow-auto p-4 transition-colors duration-300",
          isDarkMode ? "bg-gray-800" : "bg-gray-200"
        )}>
          <div className={cn(
            "min-h-full rounded-2xl transition-colors duration-300",
            isDarkMode
              ? "bg-gray-800 shadow-[inset_8px_8px_16px_#1a1a1a,inset_-8px_-8px_16px_#404040]"
              : "bg-gray-200 shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
      <Route path="/dashboard/configure" element={<AppShell><DashboardConfigPage /></AppShell>} />
      <Route path="/orders" element={<AppShell><OrdersPage /></AppShell>} />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
