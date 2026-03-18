import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import DashboardCanvas from '../components/dashboard/DashboardCanvas';
import DateRangeFilter from '../components/shared/DateRangeFilter';
import AIChatPanel from '../components/dashboard/AIChatPanel';
import { Settings, LayoutDashboard, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore } from '../stores/themeStore';
import { aiApi } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useDashboard();
  const { isDarkMode } = useThemeStore();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const hasWidgets = dashboard?.widgets?.length > 0;

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      await aiApi.suggestDashboard();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error('Failed to generate dashboard', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className={cn(
          "w-48 h-8 rounded-xl",
          isDarkMode ? "bg-gray-700 animate-pulse" : "skeleton"
        )} />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cn(
              "h-48 rounded-2xl",
              isDarkMode ? "bg-gray-700 animate-pulse" : "skeleton"
            )} />
          ))}
        </div>
      </div>
    );
  }

  if (!hasWidgets) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-200",
            isDarkMode
              ? "bg-gray-800 shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#404040]"
              : "bg-gray-200 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]"
          )}>
            <LayoutDashboard size={36} className={isDarkMode ? "text-emerald-400" : "text-emerald-500"} />
          </div>
          <h2 className={cn(
            "text-2xl font-bold mb-2 transition-colors duration-300",
            isDarkMode ? "text-gray-200" : "text-gray-800"
          )}>No dashboard configured yet</h2>
          <p className={cn(
            "mb-6 max-w-md transition-colors duration-300",
            isDarkMode ? "text-gray-500" : "text-gray-500"
          )}>
            Create your custom dashboard by adding widgets, charts, and tables to visualize your data.
          </p>
          <button
            onClick={() => navigate('/dashboard/configure')}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-200",
              isDarkMode
                ? "bg-gray-800 text-emerald-400 shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#404040] hover:shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#404040]"
                : "bg-gray-200 text-emerald-600 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
            )}
            id="configure-dashboard-btn"
          >
            Configure Dashboard
          </button>
          
          <div className="mt-4">
            <button
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className={cn(
                "flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl font-medium transition-all duration-200",
                isDarkMode
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 disabled:opacity-50"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
              )}
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isGenerating ? 'Generating Layout...' : 'Auto-Generate Dashboard with AI'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <DateRangeFilter />
        <button
          onClick={() => navigate('/dashboard/configure')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
            isDarkMode
              ? "bg-gray-800 text-emerald-400 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040] hover:shadow-[7px_7px_14px_#1a1a1a,-7px_-7px_14px_#404040]"
              : "bg-gray-200 text-emerald-600 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#bebebe,-7px_-7px_14px_#ffffff]"
          )}
          id="configure-dashboard-top-btn"
        >
          <Settings size={16} />
          Configure Dashboard
        </button>
      </div>

      <DashboardCanvas
        widgets={dashboard.widgets}
        editable={false}
      />
      <AIChatPanel />
    </div>
  );
}
