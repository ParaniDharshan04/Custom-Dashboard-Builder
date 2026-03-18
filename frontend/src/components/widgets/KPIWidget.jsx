import { useWidgetData } from '../../hooks/useWidgetData';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

export default function KPIWidget({ widget }) {
  const { data, isLoading } = useWidgetData(widget);
  const { isDarkMode } = useThemeStore();
  const config = widget?.config || {};

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className={isDarkMode ? "w-24 h-8 mb-2 rounded bg-gray-700 animate-pulse" : "skeleton w-24 h-8 mb-2"} />
        <div className={isDarkMode ? "w-32 h-4 rounded bg-gray-700 animate-pulse" : "skeleton w-32 h-4"} />
      </div>
    );
  }

  const value = data?.total ?? 0;
  const formatted =
    config.data_format === 'currency'
      ? formatCurrency(value, config.decimal_precision ?? 2)
      : formatNumber(value, config.decimal_precision ?? 0);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-200",
        isDarkMode
          ? "bg-gray-700 shadow-[3px_3px_6px_#1a1a1a,-3px_-3px_6px_#404040]"
          : "bg-gray-300/40 shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff]"
      )}>
        <TrendingUp size={22} className={isDarkMode ? "text-emerald-400" : "text-emerald-500"} />
      </div>
      <p className={cn(
        "text-3xl font-extrabold transition-colors duration-300",
        isDarkMode ? "text-white" : "text-gray-900"
      )}>{formatted}</p>
      <p className={cn(
        "text-sm font-medium mt-1 transition-colors duration-300",
        isDarkMode ? "text-gray-400" : "text-gray-600"
      )}>{widget?.title || 'Untitled'}</p>
      {config.description && (
        <p className={cn(
          "text-xs mt-1 transition-colors duration-300",
          isDarkMode ? "text-gray-500" : "text-gray-400"
        )}>{config.description}</p>
      )}
    </div>
  );
}
