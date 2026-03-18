import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import useDashboardStore from '../stores/dashboardStore';

export function useWidgetData(widgetConfig) {
  const dateRange = useDashboardStore((state) => state.dateRange);
  const { widget_type, config } = widgetConfig || {};

  return useQuery({
    queryKey: ['widgetData', widget_type, config, dateRange],
    queryFn: async () => {
      if (!widget_type) return null;

      if (widget_type === 'table') {
        const columns = config?.columns?.join(',') || 'id,first_name,last_name,product,quantity,unit_price,total_amount,status,created_by,order_date';
        const params = {
          columns,
          sort_by: config?.sort_by || 'order_date',
          sort_dir: config?.sort_dir || 'desc',
          page: config?.page || 1,
          page_size: config?.page_size || 10,
          date_range: dateRange,
        };
        if (config?.filters?.length) {
          params.filters = JSON.stringify(config.filters);
        }
        const { data } = await api.get('/api/data/table', { params });
        return data;
      }

      // For KPI, charts
      const metric = config?.metric || config?.y_axis || config?.metrics?.[0] || 'total_amount';
      const groupBy = config?.group_by || config?.x_axis || config?.chart_data || config?.dataKey;

      const params = {
        metric: metric,
        aggregation: config?.aggregation || 'count',
        date_range: dateRange,
      };
      if (groupBy) {
        params.group_by = groupBy;
      }
      const { data } = await api.get('/api/data/aggregate', { params });
      return data;
    },
    enabled: !!widget_type,
    refetchInterval: 60000,
  });
}
