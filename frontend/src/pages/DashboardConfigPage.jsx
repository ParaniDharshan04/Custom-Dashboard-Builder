import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard, useSaveDashboard } from '../hooks/useDashboard';
import DashboardCanvas from '../components/dashboard/DashboardCanvas';
import WidgetSettingsPanel from '../components/dashboard/WidgetSettingsPanel';
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal';
import { v4 as uuidv4 } from 'uuid';
import {
  BarChart3, LineChart, PieChart, AreaChart, ScatterChart,
  Table2, TrendingUp, ChevronDown, ChevronRight, Save, X, GripVertical, Sparkles, Loader2, Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore } from '../stores/themeStore';
import { aiApi } from '../services/api';

const WIDGET_LIBRARY = [
  {
    section: 'Charts',
    items: [
      { type: 'bar_chart', label: 'Bar Chart', icon: BarChart3, defaultW: 5, defaultH: 5 },
      { type: 'line_chart', label: 'Line Chart', icon: LineChart, defaultW: 5, defaultH: 5 },
      { type: 'pie_chart', label: 'Pie Chart', icon: PieChart, defaultW: 4, defaultH: 4 },
      { type: 'area_chart', label: 'Area Chart', icon: AreaChart, defaultW: 5, defaultH: 5 },
      { type: 'scatter_plot', label: 'Scatter Plot', icon: ScatterChart, defaultW: 5, defaultH: 5 },
    ],
  },
  {
    section: 'Tables',
    items: [
      { type: 'table', label: 'Table', icon: Table2, defaultW: 4, defaultH: 4 },
    ],
  },
  {
    section: 'KPIs',
    items: [
      { type: 'kpi', label: 'KPI Value', icon: TrendingUp, defaultW: 2, defaultH: 2 },
    ],
  },
];

export default function DashboardConfigPage() {
  const navigate = useNavigate();
  const { data: dashboard } = useDashboard();
  const saveDashboard = useSaveDashboard();
  const { isDarkMode } = useThemeStore();

  const [widgets, setWidgets] = useState([]);
  const [settingsWidget, setSettingsWidget] = useState(null);
  const [deleteWidget, setDeleteWidget] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingWidget, setIsGeneratingWidget] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const handleAIGenerateWidget = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGeneratingWidget) return;
    
    setIsGeneratingWidget(true);
    try {
      const { data } = await aiApi.generateWidget(aiPrompt.trim());
      const maxY = widgets.reduce((max, w) => Math.max(max, (w.grid_y || 0) + (w.grid_h || 4)), 0);
      const newWidget = {
        _tempId: uuidv4(),
        widget_type: data.widget_type,
        title: data.title || aiPrompt.trim(),
        description: '',
        config: data.config || {},
        grid_x: 0,
        grid_y: maxY,
        grid_w: data.grid_w || 4,
        grid_h: data.grid_h || 4,
      };
      setWidgets((prev) => [...prev, newWidget]);
      setAiPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingWidget(false);
    }
  };

  useEffect(() => {
    if (dashboard?.widgets) {
      setWidgets(
        dashboard.widgets.map((w) => ({
          ...w,
          _tempId: w.id || uuidv4(),
        }))
      );
    }
  }, [dashboard]);

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDragStart = (e, widgetDef) => {
    e.dataTransfer.setData('widget-type', JSON.stringify(widgetDef));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    try {
      const widgetDef = JSON.parse(e.dataTransfer.getData('widget-type'));
      const maxY = widgets.reduce((max, w) => Math.max(max, (w.grid_y || 0) + (w.grid_h || 4)), 0);
      const newWidget = {
        _tempId: uuidv4(),
        widget_type: widgetDef.type,
        title: 'Untitled',
        description: '',
        config: {},
        grid_x: 0,
        grid_y: maxY,
        grid_w: widgetDef.defaultW || 4,
        grid_h: widgetDef.defaultH || 4,
      };
      setWidgets((prev) => [...prev, newWidget]);
    } catch (err) {
      // ignore
    }
  }, [widgets]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleLayoutChange = useCallback((layout) => {
    setWidgets((prev) =>
      prev.map((w) => {
        const item = layout.find((l) => l.i === (w.id || w._tempId));
        if (item) {
          return { ...w, grid_x: item.x, grid_y: item.y, grid_w: item.w, grid_h: item.h };
        }
        return w;
      })
    );
  }, []);

  const handleWidgetUpdate = (updatedWidget) => {
    setWidgets((prev) =>
      prev.map((w) =>
        (w.id || w._tempId) === (updatedWidget.id || updatedWidget._tempId)
          ? { ...w, ...updatedWidget }
          : w
      )
    );
    setSettingsWidget(updatedWidget);
  };

  const handleDeleteWidget = () => {
    if (deleteWidget) {
      setWidgets((prev) =>
        prev.filter((w) => (w.id || w._tempId) !== (deleteWidget.id || deleteWidget._tempId))
      );
      if (settingsWidget && (settingsWidget.id || settingsWidget._tempId) === (deleteWidget.id || deleteWidget._tempId)) {
        setSettingsWidget(null);
      }
      setDeleteWidget(null);
    }
  };

  const handleDeleteAllWidgets = () => {
    setWidgets([]);
    setShowDeleteAllConfirm(false);
    setSettingsWidget(null);
  };

  const handleSave = () => {
    const widgetData = widgets.map((w) => ({
      widget_type: w.widget_type,
      title: w.title || 'Untitled',
      description: w.description || '',
      config: w.config || {},
      grid_x: w.grid_x || 0,
      grid_y: w.grid_y || 0,
      grid_w: w.grid_w || 4,
      grid_h: w.grid_h || 4,
    }));

    saveDashboard.mutate(
      {
        name: dashboard?.name || 'My Dashboard',
        layout_config: widgetData.map((w) => ({
          i: w.title,
          x: w.grid_x,
          y: w.grid_y,
          w: w.grid_w,
          h: w.grid_h,
        })),
        widgets: widgetData,
      },
      {
        onSuccess: () => navigate('/dashboard'),
      }
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      {/* LEFT PANEL - Widget Library */}
      <div className={cn(
        "w-[260px] flex flex-col shrink-0 p-3 transition-colors duration-300",
        isDarkMode ? "bg-gray-800" : "bg-gray-200"
      )}>
        <div className={cn(
          "h-full rounded-2xl flex flex-col transition-all duration-300",
          isDarkMode
            ? "bg-gray-800 shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#404040]"
            : "bg-gray-200 shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
        )}>
          <div className={cn(
            "px-4 py-4",
            isDarkMode ? "border-b border-gray-700" : "border-b border-gray-300/50"
          )}>
            <h3 className={cn(
              "text-sm font-bold transition-colors duration-300",
              isDarkMode ? "text-gray-200" : "text-gray-700"
            )}>Widget Library</h3>
            <p className={cn(
              "text-xs mt-0.5 transition-colors duration-300",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>Drag widgets to the canvas</p>
          </div>

          {/* AI Generator */}
          <div className={cn("px-4 py-3 border-b", isDarkMode ? "border-gray-700" : "border-gray-300/50")}>
            <form onSubmit={handleAIGenerateWidget} className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
                <Sparkles size={14} /> AI Generator
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. revenue by product"
                className={cn(
                  "w-full px-3 py-2 text-xs rounded-lg focus:outline-none transition-colors",
                  isDarkMode ? "bg-gray-700/50 text-gray-200 placeholder-gray-500 focus:bg-gray-700" : "bg-gray-300/30 text-gray-700 placeholder-gray-500 focus:bg-white"
                )}
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || isGeneratingWidget}
                className={cn(
                  "w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  isDarkMode
                    ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                )}
              >
                {isGeneratingWidget ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                Generate Widget
              </button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {WIDGET_LIBRARY.map((section) => (
              <div key={section.section}>
                <button
                  onClick={() => toggleSection(section.section)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
                    isDarkMode ? "text-gray-500 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-300/40"
                  )}
                >
                  <span>{section.section}</span>
                  {collapsedSections[section.section] ? (
                    <ChevronRight size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
                {!collapsedSections[section.section] && (
                  <div className="space-y-2 ml-1 mt-1">
                    {section.items.map((item) => (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab transition-all duration-200 group active:cursor-grabbing",
                          isDarkMode
                            ? "bg-gray-800 shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#404040] hover:shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#404040] active:shadow-[inset_3px_3px_6px_#1a1a1a,inset_-3px_-3px_6px_#404040]"
                            : "bg-gray-200 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          isDarkMode
                            ? "bg-gray-700 group-hover:bg-emerald-900/30"
                            : "bg-gray-300/50 group-hover:bg-emerald-100"
                        )}>
                          <item.icon size={16} className={cn(
                            "transition-colors",
                            isDarkMode
                              ? "text-gray-400 group-hover:text-emerald-400"
                              : "text-gray-500 group-hover:text-emerald-600"
                          )} />
                        </div>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        )}>{item.label}</span>
                        <GripVertical size={14} className={cn(
                          "ml-auto",
                          isDarkMode ? "text-gray-600" : "text-gray-400"
                        )} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Canvas */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className={cn(
          "flex-1 overflow-auto p-4 transition-colors duration-300",
          isDarkMode ? "bg-gray-800" : "bg-gray-200"
        )}>
          {widgets.length === 0 ? (
            <div className={cn(
              "h-full flex items-center justify-center rounded-2xl transition-all duration-300",
              isDarkMode
                ? "border-2 border-dashed border-gray-700"
                : "border-2 border-dashed border-gray-300"
            )}>
              <div className="text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200",
                  isDarkMode
                    ? "bg-gray-800 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040]"
                    : "bg-gray-200 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]"
                )}>
                  <BarChart3 size={28} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
                </div>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                )}>Drag widgets from the library to start building</p>
              </div>
            </div>
          ) : (
            <DashboardCanvas
              widgets={widgets}
              editable={true}
              onLayoutChange={handleLayoutChange}
              onWidgetSettings={(w) => setSettingsWidget(w)}
              onWidgetDelete={(w) => setDeleteWidget(w)}
            />
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className={cn(
          "px-6 py-3 flex items-center justify-end gap-3 shrink-0 transition-colors duration-300",
          isDarkMode
            ? "bg-gray-800 border-t border-gray-700"
            : "bg-gray-200 border-t border-gray-300/50"
        )}>
          {widgets.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className={cn(
                "mr-auto flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                isDarkMode
                  ? "bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-900/60 shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#404040]"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]"
              )}
              id="config-delete-all-btn"
            >
              <Trash2 size={16} />
              Delete All
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
              isDarkMode
                ? "bg-gray-800 text-gray-400 shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#404040] hover:text-gray-300"
                : "bg-gray-200 text-gray-600 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] hover:text-gray-800"
            )}
            id="config-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveDashboard.isPending}
            className={cn(
              "flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50",
              isDarkMode
                ? "bg-gray-800 text-emerald-400 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040] hover:shadow-[7px_7px_14px_#1a1a1a,-7px_-7px_14px_#404040]"
                : "bg-gray-200 text-emerald-600 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#bebebe,-7px_-7px_14px_#ffffff]"
            )}
            id="config-save-btn"
          >
            {saveDashboard.isPending ? (
              <span className={cn(
                "w-4 h-4 border-2 rounded-full animate-spin",
                isDarkMode ? "border-gray-600 border-t-emerald-400" : "border-gray-300 border-t-emerald-600"
              )} />
            ) : (
              <Save size={16} />
            )}
            Save Configuration
          </button>
        </div>
      </div>

      {/* Settings Panel Overlay */}
      {settingsWidget && (
        <>
          <div
            className="fixed inset-0 bg-black/10 z-40 backdrop-blur-sm"
            onClick={() => setSettingsWidget(null)}
          />
          <WidgetSettingsPanel
            widget={settingsWidget}
            onClose={() => setSettingsWidget(null)}
            onChange={handleWidgetUpdate}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={!!deleteWidget}
        onClose={() => setDeleteWidget(null)}
        onConfirm={handleDeleteWidget}
        title="Delete Widget"
        message="Are you sure you want to remove this widget from the dashboard?"
      />

      <ConfirmDeleteModal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleDeleteAllWidgets}
        title="Delete All Widgets"
        message="Are you sure you want to remove all widgets from the dashboard? This action cannot be undone."
      />
    </div>
  );
}

