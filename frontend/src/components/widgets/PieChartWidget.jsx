import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useThemeStore } from '../../stores/themeStore';

const PIE_COLORS = [
  '#54bd95', '#4f46e5', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#10b981', '#f97316', '#6366f1',
];

export default function PieChartWidget({ widget }) {
  const { data, isLoading } = useWidgetData(widget);
  const { isDarkMode } = useThemeStore();
  const config = widget?.config || {};

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className={isDarkMode ? "w-32 h-32 rounded-full bg-gray-700 animate-pulse" : "skeleton w-32 h-32 rounded-full"} />
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={3}
            dataKey="value"
            stroke={isDarkMode ? '#1f2937' : '#e5e7eb'}
            strokeWidth={2}
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#e5e7eb' : '#1f2937',
            }}
            itemStyle={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
          />
          {config.show_legend !== false && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: '12px' }}>{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
