import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import ColorPicker from '../shared/ColorPicker';
import {
  METRIC_OPTIONS, NUMERIC_METRICS, CHART_AXIS_OPTIONS,
  PIE_DATA_OPTIONS, TABLE_COLUMN_OPTIONS, FILTER_OPERATORS,
} from '../../utils/validators';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

export default function WidgetSettingsPanel({ widget, onClose, onChange }) {
  const [config, setConfig] = useState(widget?.config || {});
  const [title, setTitle] = useState(widget?.title ?? 'Untitled');
  const [description, setDescription] = useState(widget?.description || '');
  const [gridW, setGridW] = useState(widget?.grid_w || 4);
  const [gridH, setGridH] = useState(widget?.grid_h || 4);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    setConfig(widget?.config || {});
    setTitle(widget?.title ?? 'Untitled');
    setDescription(widget?.description || '');
    setGridW(widget?.grid_w || 4);
    setGridH(widget?.grid_h || 4);
  }, [widget]);

  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onChange?.({
      ...widget,
      title,
      description,
      config: newConfig,
      grid_w: gridW,
      grid_h: gridH,
    });
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    onChange?.({ ...widget, title: val, description, config, grid_w: gridW, grid_h: gridH });
  };

  const handleDescChange = (val) => {
    setDescription(val);
    onChange?.({ ...widget, title, description: val, config, grid_w: gridW, grid_h: gridH });
  };

  const handleSizeChange = (w, h) => {
    setGridW(w);
    setGridH(h);
    onChange?.({ ...widget, title, description, config, grid_w: w, grid_h: h });
  };

  const type = widget?.widget_type;
  const isKPI = type === 'kpi';
  const isChart = ['bar_chart', 'line_chart', 'area_chart', 'scatter_plot'].includes(type);
  const isPie = type === 'pie_chart';
  const isTable = type === 'table';

  const typeLabels = {
    kpi: 'KPI',
    bar_chart: 'Bar Chart',
    line_chart: 'Line Chart',
    area_chart: 'Area Chart',
    scatter_plot: 'Scatter Plot',
    pie_chart: 'Pie Chart',
    table: 'Table',
  };

  const selectedMetric = config.metric || '';
  const isNumericMetric = NUMERIC_METRICS.includes(selectedMetric);

  // Filter management for table
  const filters = config.filters || [];
  const addFilter = () => {
    const newFilters = [...filters, { field: '', operator: 'equals', value: '' }];
    updateConfig('filters', newFilters);
  };
  const removeFilter = (idx) => {
    const newFilters = filters.filter((_, i) => i !== idx);
    updateConfig('filters', newFilters);
  };
  const updateFilter = (idx, key, val) => {
    const newFilters = [...filters];
    newFilters[idx] = { ...newFilters[idx], [key]: val };
    updateConfig('filters', newFilters);
  };

  const sectionClass = 'mb-6';
  const sectionTitleClass = cn(
    'text-xs font-semibold uppercase tracking-wider mb-3',
    isDarkMode ? 'text-gray-500' : 'text-gray-400'
  );
  const labelClass = cn(
    'block text-sm font-medium mb-1',
    isDarkMode ? 'text-gray-300' : 'text-gray-600'
  );
  const inputClass = cn(
    'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition',
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder:text-gray-500'
      : 'border-gray-200 text-gray-800'
  );
  const readOnlyClass = cn(
    inputClass,
    isDarkMode ? 'bg-gray-800 cursor-not-allowed' : 'bg-gray-50 cursor-not-allowed'
  );
  const checkboxClass = cn(
    'w-4 h-4 rounded border focus:ring-emerald-500',
    isDarkMode ? 'bg-gray-700 border-gray-600 text-emerald-400' : 'border-gray-300 text-emerald-500'
  );
  const checkboxLabelClass = cn('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600');
  const filterInputClass = cn(
    'flex-1 px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50',
    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-200'
  );

  return (
    <div className={cn(
      "fixed top-0 right-0 h-full w-[360px] shadow-2xl z-50 animate-slide-in-right flex flex-col",
      isDarkMode
        ? "bg-gray-800 border-l border-gray-700"
        : "bg-white border-l border-gray-200"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-5 py-4 shrink-0",
        isDarkMode ? "border-b border-gray-700" : "border-b border-gray-100"
      )}>
        <h3 className={cn("text-base font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>Widget Settings</h3>
        <button
          onClick={onClose}
          className={cn(
            "p-1.5 rounded-lg transition",
            isDarkMode ? "hover:bg-gray-700 text-gray-500 hover:text-gray-300" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          )}
          id="settings-panel-close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* GENERAL */}
        <div className={sectionClass}>
          <h4 className={sectionTitleClass}>General</h4>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Widget title</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputClass}
                placeholder="Untitled"
                id="settings-title"
              />
            </div>
            <div>
              <label className={labelClass}>Widget type</label>
              <input
                value={typeLabels[type] || type}
                readOnly
                className={readOnlyClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => handleDescChange(e.target.value)}
                className={cn(inputClass, 'resize-none')}
                rows={2}
                placeholder="Optional description..."
                id="settings-description"
              />
            </div>
          </div>
        </div>

        {/* WIDGET SIZE */}
        <div className={sectionClass}>
          <h4 className={sectionTitleClass}>Widget Size</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Width (Columns)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={gridW}
                onChange={(e) => handleSizeChange(Math.max(1, parseInt(e.target.value) || 1), gridH)}
                className={inputClass}
                id="settings-width"
              />
            </div>
            <div>
              <label className={labelClass}>Height (Rows)</label>
              <input
                type="number"
                min="1"
                value={gridH}
                onChange={(e) => handleSizeChange(gridW, Math.max(1, parseInt(e.target.value) || 1))}
                className={inputClass}
                id="settings-height"
              />
            </div>
          </div>
        </div>

        {/* DATA SETTINGS - KPI */}
        {isKPI && (
          <div className={sectionClass}>
            <h4 className={sectionTitleClass}>Data Settings</h4>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Select metric</label>
                <select
                  value={config.metric || ''}
                  onChange={(e) => {
                    updateConfig('metric', e.target.value);
                    if (!NUMERIC_METRICS.includes(e.target.value)) {
                      updateConfig('aggregation', 'count');
                    }
                  }}
                  className={inputClass}
                  id="settings-metric"
                >
                  <option value="">Select...</option>
                  {METRIC_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {isNumericMetric && (
                <div>
                  <label className={labelClass}>Aggregation</label>
                  <select
                    value={config.aggregation || 'count'}
                    onChange={(e) => updateConfig('aggregation', e.target.value)}
                    className={inputClass}
                    id="settings-aggregation"
                  >
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                  </select>
                </div>
              )}
              {!isNumericMetric && selectedMetric && (
                <div>
                  <label className={labelClass}>Aggregation</label>
                  <input value="Count" readOnly className={readOnlyClass} />
                </div>
              )}
              <div>
                <label className={labelClass}>Data format</label>
                <select
                  value={config.data_format || 'number'}
                  onChange={(e) => updateConfig('data_format', e.target.value)}
                  className={inputClass}
                  id="settings-data-format"
                >
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Decimal precision</label>
                <input
                  type="number"
                  min="0"
                  value={config.decimal_precision ?? 0}
                  onChange={(e) => updateConfig('decimal_precision', Math.max(0, parseInt(e.target.value) || 0))}
                  className={inputClass}
                  id="settings-precision"
                />
              </div>
            </div>
          </div>
        )}

        {/* DATA SETTINGS - Charts */}
        {isChart && (
          <div className={sectionClass}>
            <h4 className={sectionTitleClass}>Data Settings</h4>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>X-Axis data</label>
                <select
                  value={config.x_axis || ''}
                  onChange={(e) => updateConfig('x_axis', e.target.value)}
                  className={inputClass}
                  id="settings-x-axis"
                >
                  <option value="">Select...</option>
                  {CHART_AXIS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Y-Axis data</label>
                <select
                  value={config.y_axis || ''}
                  onChange={(e) => updateConfig('y_axis', e.target.value)}
                  className={inputClass}
                  id="settings-y-axis"
                >
                  <option value="">Select...</option>
                  {CHART_AXIS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Aggregation</label>
                <select
                  value={config.aggregation || 'count'}
                  onChange={(e) => updateConfig('aggregation', e.target.value)}
                  className={inputClass}
                  id="settings-chart-aggregation"
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Average</option>
                  <option value="count">Count</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* DATA SETTINGS - Pie */}
        {isPie && (
          <div className={sectionClass}>
            <h4 className={sectionTitleClass}>Data Settings</h4>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Choose chart data</label>
                <select
                  value={config.chart_data || ''}
                  onChange={(e) => updateConfig('chart_data', e.target.value)}
                  className={inputClass}
                  id="settings-chart-data"
                >
                  <option value="">Select...</option>
                  {PIE_DATA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.show_legend !== false}
                  onChange={(e) => updateConfig('show_legend', e.target.checked)}
                  className={checkboxClass}
                  id="settings-show-legend"
                />
                <label className={checkboxLabelClass}>Show legend</label>
              </div>
            </div>
          </div>
        )}

        {/* DATA SETTINGS - Table */}
        {isTable && (
          <div className={sectionClass}>
            <h4 className={sectionTitleClass}>Data Settings</h4>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Choose columns</label>
                <div className={cn(
                  "space-y-1.5 max-h-40 overflow-y-auto border rounded-lg p-3",
                  isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200"
                )}>
                  {TABLE_COLUMN_OPTIONS.map((opt) => (
                    <label key={opt.value} className={cn(
                      "flex items-center gap-2 text-sm cursor-pointer transition",
                      isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-800"
                    )}>
                      <input
                        type="checkbox"
                        checked={(config.columns || []).includes(opt.value)}
                        onChange={(e) => {
                          const cols = config.columns || [];
                          if (e.target.checked) {
                            updateConfig('columns', [...cols, opt.value]);
                          } else {
                            updateConfig('columns', cols.filter((c) => c !== opt.value));
                          }
                        }}
                        className={cn(
                          "w-3.5 h-3.5 rounded border focus:ring-emerald-500",
                          isDarkMode ? "bg-gray-700 border-gray-600 text-emerald-400" : "border-gray-300 text-emerald-500"
                        )}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Sort by</label>
                <select
                  value={config.sort_dir || 'desc'}
                  onChange={(e) => updateConfig('sort_dir', e.target.value)}
                  className={inputClass}
                  id="settings-sort"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                  <option value="order_date">Order date</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Pagination (rows per page)</label>
                <select
                  value={config.page_size || 10}
                  onChange={(e) => updateConfig('page_size', parseInt(e.target.value))}
                  className={inputClass}
                  id="settings-page-size"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={config.apply_filter || false}
                    onChange={(e) => updateConfig('apply_filter', e.target.checked)}
                    className={checkboxClass}
                    id="settings-apply-filter"
                  />
                  <label className={cn("text-sm font-medium", isDarkMode ? "text-gray-300" : "text-gray-600")}>Apply filter</label>
                </div>
                {config.apply_filter && (
                  <div className="space-y-2">
                    {filters.map((filter, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={filter.field}
                          onChange={(e) => updateFilter(idx, 'field', e.target.value)}
                          className={filterInputClass}
                        >
                          <option value="">Field...</option>
                          {TABLE_COLUMN_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(idx, 'operator', e.target.value)}
                          className={filterInputClass}
                        >
                          {FILTER_OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                        <input
                          value={filter.value}
                          onChange={(e) => updateFilter(idx, 'value', e.target.value)}
                          className={filterInputClass}
                          placeholder="Value"
                        />
                        <button
                          onClick={() => removeFilter(idx)}
                          className={cn(
                            "p-1 rounded transition",
                            isDarkMode ? "hover:bg-red-900/30 text-gray-500 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                          )}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFilter}
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium transition",
                        isDarkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-500 hover:text-emerald-600"
                      )}
                    >
                      <Plus size={14} /> Add filter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STYLING - Charts */}
        {isChart && (
          <div className={sectionClass}>
            <h4 className={sectionTitleClass}>Styling</h4>
            <div className="space-y-3">
              <ColorPicker
                label="Chart color"
                color={config.chart_color || '#54bd95'}
                onChange={(color) => updateConfig('chart_color', color)}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.show_data_labels || false}
                  onChange={(e) => updateConfig('show_data_labels', e.target.checked)}
                  className={checkboxClass}
                  id="settings-show-labels"
                />
                <label className={checkboxLabelClass}>Show data labels</label>
              </div>
            </div>
          </div>
        )}

        {/* STYLING - Table */}
        {isTable && (
          <div className={sectionClass}>
            <h4 className={sectionTitleClass}>Styling</h4>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Font size</label>
                <input
                  type="number"
                  min={12}
                  max={18}
                  value={config.font_size || 14}
                  onChange={(e) => updateConfig('font_size', Math.min(18, Math.max(12, parseInt(e.target.value) || 14)))}
                  className={inputClass}
                  id="settings-font-size"
                />
              </div>
              <ColorPicker
                label="Header background"
                color={config.header_bg || '#54bd95'}
                onChange={(color) => updateConfig('header_bg', color)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
