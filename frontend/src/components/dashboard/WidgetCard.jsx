import React, { useState } from 'react';
import KPIWidget from '../widgets/KPIWidget';
import BarChartWidget from '../widgets/BarChartWidget';
import LineChartWidget from '../widgets/LineChartWidget';
import AreaChartWidget from '../widgets/AreaChartWidget';
import PieChartWidget from '../widgets/PieChartWidget';
import ScatterPlotWidget from '../widgets/ScatterPlotWidget';
import TableWidget from '../widgets/TableWidget';
import { Settings, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';
import { aiApi } from '../../services/api';
import WidgetExplainModal from './WidgetExplainModal';

const widgetComponents = {
  kpi: KPIWidget,
  bar_chart: BarChartWidget,
  line_chart: LineChartWidget,
  area_chart: AreaChartWidget,
  pie_chart: PieChartWidget,
  scatter_plot: ScatterPlotWidget,
  table: TableWidget,
};

const widgetTypeLabels = {
  kpi: 'KPI',
  bar_chart: 'Bar Chart',
  line_chart: 'Line Chart',
  area_chart: 'Area Chart',
  pie_chart: 'Pie Chart',
  scatter_plot: 'Scatter Plot',
  table: 'Table',
};

// Check if the widget has minimum config to show data
function hasMinimalConfig(widget) {
  const config = widget?.config || {};
  const type = widget?.widget_type;
  
  // Any metric definition satisfies KPI
  if (type === 'kpi') return !!(config.metric || config.y_axis || config.metrics?.[0]);
  
  // Any grouping definition satisfies a chart
  if (['bar_chart', 'line_chart', 'area_chart', 'scatter_plot', 'pie_chart'].includes(type)) {
      return !!(config.x_axis || config.chart_data || config.group_by || config.dataKey);
  }
  
  if (type === 'table') return true;
  return false;
}

export default function WidgetCard({ widget, editable, onSettings, onDelete }) {
  const Component = widgetComponents[widget.widget_type];
  const { isDarkMode } = useThemeStore();
  const widgetId = widget.id || widget._tempId || 'new';
  const isConfigured = hasMinimalConfig(widget);

  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState(null);

  // Prevent react-grid-layout from capturing clicks on action buttons
  const handleButtonMouseDown = (e) => {
    e.stopPropagation();
  };

  const handleExplain = async () => {
    setIsExplainOpen(true);
    setIsExplaining(true);
    setExplanation(null);
    try {
      const response = await aiApi.explainWidget({
        title: widget.title || 'Untitled',
        widget_type: widget.widget_type,
        config: widget.config || {}
      });
      setExplanation(response.data.explanation);
    } catch (err) {
      console.error('Failed to explain widget:', err);
      setExplanation("Sorry, I couldn't analyze this widget right now. Please try again later.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className={cn(
      "h-full w-full rounded-2xl overflow-hidden group relative flex flex-col transition-all duration-300",
      isDarkMode
        ? "bg-gray-800 shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#404040]"
        : "bg-gray-200 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between w-full min-w-0 px-4 py-2.5 shrink-0 transition-colors duration-300",
        isDarkMode ? "border-b border-gray-700" : "border-b border-gray-300/50"
      )}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h4 className={cn(
            "text-sm font-semibold truncate transition-colors duration-300",
            isDarkMode ? "text-gray-200" : "text-gray-700"
          )}>{widget.title || 'Untitled'}</h4>
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-lg shrink-0 transition-colors duration-300",
            isDarkMode
              ? "bg-gray-700 text-gray-400"
              : "bg-gray-300/60 text-gray-500"
          )}>
            {widgetTypeLabels[widget.widget_type] || widget.widget_type}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onMouseDown={handleButtonMouseDown}
            onClick={(e) => { e.stopPropagation(); handleExplain(); }}
            className={cn(
              "p-1.5 rounded-lg transition cursor-pointer z-10",
              isDarkMode
                ? "hover:bg-emerald-900/30 text-emerald-500 hover:text-emerald-400"
                : "hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600"
            )}
            title="Why is this happening?"
          >
            <Sparkles size={14} />
          </button>
          
          {editable && (
            <>
              <button
                onMouseDown={handleButtonMouseDown}
                onClick={(e) => { e.stopPropagation(); onSettings?.(widget); }}
                className={cn(
                  "p-1.5 rounded-lg transition cursor-pointer z-10",
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-500 hover:text-gray-300"
                    : "hover:bg-gray-300/50 text-gray-400 hover:text-gray-600"
                )}
                id={`widget-settings-${widgetId}`}
              >
                <Settings size={14} />
              </button>
              <button
                onMouseDown={handleButtonMouseDown}
                onClick={(e) => { e.stopPropagation(); onDelete?.(widget); }}
                className={cn(
                  "p-1.5 rounded-lg transition cursor-pointer z-10",
                  isDarkMode
                    ? "hover:bg-red-900/30 text-gray-500 hover:text-red-400"
                    : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                )}
                id={`widget-delete-${widgetId}`}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className={cn(
        "flex-1 overflow-hidden transition-colors duration-300",
        isDarkMode ? "bg-gray-800" : "bg-gray-200"
      )}>
        {Component && isConfigured ? (
          <Component widget={widget} />
        ) : Component && !isConfigured ? (
          <div className={cn(
            "h-full flex flex-col items-center justify-center text-center p-4",
          )}>
            <AlertCircle size={24} className={isDarkMode ? "text-gray-600 mb-2" : "text-gray-400 mb-2"} />
            <p className={cn(
              "text-xs font-medium",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>
              Click the <Settings size={12} className="inline mx-0.5" /> icon to configure this widget's data
            </p>
          </div>
        ) : (
          <div className={cn(
            "h-full flex items-center justify-center text-sm",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )}>
            Unknown widget type
          </div>
        )}
      </div>

      <WidgetExplainModal 
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        isLoading={isExplaining}
        explanation={explanation}
        title={widget.title || 'Untitled'}
      />
    </div>
  );
}
