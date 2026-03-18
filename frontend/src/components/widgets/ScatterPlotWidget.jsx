import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useThemeStore } from '../../stores/themeStore';

export default function ScatterPlotWidget({ widget }) {
  const { data, isLoading } = useWidgetData(widget);
  const { isDarkMode } = useThemeStore();
  const config = widget?.config || {};
  const chartColor = config.chart_color || '#54bd95';

  const axisColor = isDarkMode ? '#9ca3af' : '#64748b';
  const gridColor = isDarkMode ? '#374151' : '#e2e8f0';
  const labelColor = isDarkMode ? '#d1d5db' : '#374151';

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className={isDarkMode ? "w-full h-full rounded-lg bg-gray-700 animate-pulse" : "skeleton w-full h-full rounded-lg"} />
      </div>
    );
  }

  const chartData = (data?.labels || []).map((label, i) => ({
    x: i + 1,
    y: data?.values?.[i] || 0,
    name: label,
  }));

  return (
    <div className="h-full w-full p-3">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            type="number"
            dataKey="x"
            tick={{ fontSize: 11, fill: axisColor }}
            stroke={axisColor}
            name="Index"
            label={{ value: config.x_axis || 'Index', position: 'insideBottom', offset: -10, fontSize: 12, fill: labelColor, fontWeight: 600 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            tick={{ fontSize: 11, fill: axisColor }}
            stroke={axisColor}
            name="Value"
            label={{ value: config.y_axis || 'Value', angle: -90, position: 'insideLeft', offset: 0, fontSize: 12, fill: labelColor, fontWeight: 600 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#e5e7eb' : '#1f2937',
            }}
            itemStyle={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
            formatter={(value, name, props) => {
              if (name === 'y') return [value, 'Value'];
              return [props.payload.name, 'Label'];
            }}
          />
          <Scatter data={chartData} fill={chartColor}>
            {config.show_data_labels && (
              <LabelList dataKey="y" position="top" fontSize={11} fill={labelColor} />
            )}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
