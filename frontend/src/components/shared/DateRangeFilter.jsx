import { DATE_RANGE_OPTIONS } from '../../utils/validators';
import useDashboardStore from '../../stores/dashboardStore';
import { Calendar } from 'lucide-react';

export default function DateRangeFilter() {
  const dateRange = useDashboardStore((state) => state.dateRange);
  const setDateRange = useDashboardStore((state) => state.setDateRange);

  return (
    <div className="flex items-center gap-2">
      <Calendar size={16} className="text-gray-400" />
      <select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition cursor-pointer"
        id="date-range-filter"
      >
        {DATE_RANGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
