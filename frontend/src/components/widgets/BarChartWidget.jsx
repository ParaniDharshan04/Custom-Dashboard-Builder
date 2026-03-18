import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useThemeStore } from '../../stores/themeStore';

export default function BarChartWidget({ widget }) {
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
    name: label,
    value: data?.values?.[i] || 0,
  }));

  return (
    <div className="h-full w-full p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: axisColor }}
            stroke={axisColor}
            label={{ value: config.x_axis || '', position: 'insideBottom', offset: -10, fontSize: 12, fill: labelColor, fontWeight: 600 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: axisColor }}
            stroke={axisColor}
            label={{ value: config.y_axis || '', angle: -90, position: 'insideLeft', offset: 0, fontSize: 12, fill: labelColor, fontWeight: 600 }}
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
            labelStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontWeight: 600 }}
          />
          <Bar dataKey="value" fill={chartColor} radius={[6, 6, 0, 0]}>
            {config.show_data_labels && (
              <LabelList dataKey="value" position="top" fontSize={11} fill={labelColor} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
