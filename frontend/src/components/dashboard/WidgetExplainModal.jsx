import { createPortal } from 'react-dom';
import { X, Sparkles, Loader2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

export default function WidgetExplainModal({ isOpen, onClose, isLoading, explanation, title }) {
  const { isDarkMode } = useThemeStore();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={cn(
        "w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200",
        isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <Sparkles size={16} />
            </div>
            <h3 className={cn(
              "font-bold text-lg",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>AI Root Cause Analysis</h3>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className={cn(
            "text-sm font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5",
            isDarkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-600"
          )}>
            <Info size={14} />
            Analyzing: <span className={isDarkMode ? "text-emerald-400" : "text-emerald-600"}>{title}</span>
          </div>
          
          <div className={cn(
            "p-5 rounded-xl text-sm leading-relaxed",
            isDarkMode ? "bg-gray-900/50 text-gray-300" : "bg-gray-50 text-gray-700"
          )}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <Loader2 size={24} className="animate-spin text-emerald-500" />
                <p className="text-emerald-500/70 animate-pulse text-xs font-medium">Investigating latest orders...</p>
              </div>
            ) : explanation ? (
              <p>{explanation}</p>
            ) : (
              <p className="text-red-500">Failed to load explanation. Please try again.</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
