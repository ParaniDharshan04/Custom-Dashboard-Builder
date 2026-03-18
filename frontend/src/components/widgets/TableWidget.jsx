import { useWidgetData } from '../../hooks/useWidgetData';
import { formatCurrency, formatDate, truncateUUID } from '../../utils/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

export default function TableWidget({ widget }) {
  const config = widget?.config || {};
  const [page, setPage] = useState(1);
  const { isDarkMode } = useThemeStore();

  const widgetWithPage = {
    ...widget,
    config: { ...config, page },
  };

  const { data, isLoading } = useWidgetData(widgetWithPage);
  const headerBg = config.header_bg || '#54bd95';
  const fontSize = config.font_size || 14;
  const pageSize = config.page_size || 10;

  if (isLoading) {
    return (
      <div className="h-full p-3 space-y-2">
        <div className={isDarkMode ? "w-full h-8 rounded bg-gray-700 animate-pulse" : "skeleton w-full h-8"} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className={isDarkMode ? "w-full h-6 rounded bg-gray-700 animate-pulse" : "skeleton w-full h-6"} />
        ))}
      </div>
    );
  }

  const rows = data?.rows || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const columns = config.columns || ['id', 'first_name', 'product', 'total_amount'];

  const formatCell = (col, value) => {
    if (col === 'id') return truncateUUID(value);
    if (col === 'total_amount' || col === 'unit_price') return formatCurrency(value);
    if (col === 'order_date' || col === 'created_at') return formatDate(value);
    return value;
  };

  const colLabels = {
    id: 'ID',
    first_name: 'First Name',
    last_name: 'Last Name',
    customer_name: 'Customer Name',
    email: 'Email',
    phone_number: 'Phone',
    address: 'Address',
    order_date: 'Order Date',
    product: 'Product',
    quantity: 'Qty',
    unit_price: 'Unit Price',
    total_amount: 'Total',
    status: 'Status',
    created_by: 'Created By',
    created_at: 'Created At',
  };

  return (
    <div className="h-full flex flex-col p-2 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse" style={{ fontSize: `${fontSize}px` }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ backgroundColor: headerBg }}
                >
                  {colLabels[col] || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={cn(
                  "text-center py-8 text-sm",
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  No data found
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className={cn(
                  "transition",
                  isDarkMode
                    ? "border-b border-gray-700 hover:bg-gray-700/50"
                    : "border-b border-gray-200 hover:bg-gray-100/50"
                )}>
                  {columns.map((col) => (
                    <td key={col} className={cn(
                      "px-3 py-2 whitespace-nowrap",
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    )}>
                      {formatCell(col, row[col])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize && totalPages > 1 && (
        <div className={cn(
          "flex items-center justify-between pt-2 mt-1",
          isDarkMode ? "border-t border-gray-700" : "border-t border-gray-200"
        )}>
          <span className={cn(
            "text-xs",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            Page {page} of {totalPages} ({total} records)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className={cn(
                "p-1 rounded disabled:opacity-30 transition",
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-200 text-gray-500"
              )}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className={cn(
                "p-1 rounded disabled:opacity-30 transition",
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-200 text-gray-500"
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
