import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOrders, useDeleteOrder } from '../../hooks/useOrders';
import CreateOrderModal from './CreateOrderModal';
import EditOrderModal from './EditOrderModal';
import ConfirmDeleteModal from '../shared/ConfirmDeleteModal';
import { truncateUUID, formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, MoreVertical, Edit, Trash2, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';

export default function OrderTable() {
  const { data: orders, isLoading } = useOrders();
  const deleteOrder = useDeleteOrder();
  const { isDarkMode } = useThemeStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => setMenuOpen(null);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [menuOpen]);

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    if (menuOpen === id) {
      setMenuOpen(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right
      });
      setMenuOpen(id);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteOrder.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const statusColors = {
    'Pending': isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'In progress': isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700',
    'Completed': isDarkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-green-100 text-green-700',
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cn(
            "w-full h-12 rounded-xl",
            isDarkMode ? "bg-gray-700 animate-pulse" : "skeleton"
          )} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className={cn(
          "text-lg font-bold transition-colors duration-300",
          isDarkMode ? "text-gray-200" : "text-gray-800"
        )}>Customer Orders</h2>
        <button
          onClick={() => setShowCreate(true)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
            isDarkMode
              ? "bg-gray-800 text-emerald-400 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040] hover:shadow-[7px_7px_14px_#1a1a1a,-7px_-7px_14px_#404040]"
              : "bg-gray-200 text-emerald-600 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#bebebe,-7px_-7px_14px_#ffffff]",
            isDarkMode
              ? "active:shadow-[inset_3px_3px_6px_#1a1a1a,inset_-3px_-3px_6px_#404040]"
              : "active:shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]"
          )}
          id="create-order-btn"
        >
          <Plus size={18} />
          Create Order
        </button>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-16">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
            isDarkMode
              ? "bg-gray-800 shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#404040]"
              : "bg-gray-200 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]"
          )}>
            <Package size={28} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
          </div>
          <h3 className={cn("text-lg font-medium", isDarkMode ? "text-gray-300" : "text-gray-600")}>
            No orders found
          </h3>
          <p className={cn("text-sm mt-1", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Create your first order to get started
          </p>
        </div>
      ) : (
        <div className={cn(
          "rounded-2xl transition-all duration-300",
          isDarkMode
            ? "bg-gray-800 shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#404040]"
            : "bg-gray-200 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]"
        )}>
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? "bg-gray-750" : "bg-gray-300/40"}>
                  {['Order ID', 'Customer Name', 'Product', 'Qty', 'Unit Price', 'Total', 'Status', 'Created By', 'Order Date', 'Actions'].map((h) => (
                    <th key={h} className={cn(
                      "text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDarkMode ? "divide-gray-700" : "divide-gray-300/30")}>
                {orders.map((order) => (
                  <tr key={order.id} className={cn(
                    "transition-colors duration-150",
                    isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-300/30"
                  )}>
                    <td className={cn("px-4 py-3 font-mono text-xs", isDarkMode ? "text-gray-500" : "text-gray-500")}>{truncateUUID(order.id)}</td>
                    <td className={cn("px-4 py-3 font-medium", isDarkMode ? "text-gray-200" : "text-gray-800")}>{order.first_name} {order.last_name}</td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-gray-400" : "text-gray-600")}>{order.product}</td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-gray-400" : "text-gray-600")}>{order.quantity}</td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-gray-400" : "text-gray-600")}>{formatCurrency(order.unit_price)}</td>
                    <td className={cn("px-4 py-3 font-medium", isDarkMode ? "text-gray-200" : "text-gray-800")}>{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-gray-400" : "text-gray-600")}>{order.created_by}</td>
                    <td className={cn("px-4 py-3 text-xs", isDarkMode ? "text-gray-500" : "text-gray-500")}>{formatDate(order.order_date)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleMenuClick(e, order.id)}
                        className={cn(
                          "p-1.5 rounded-lg transition",
                          isDarkMode ? "hover:bg-gray-700 text-gray-500" : "hover:bg-gray-300/50 text-gray-400"
                        )}
                        id={`order-menu-${order.id}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === order.id && createPortal(
                        <div className="portal-root" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
                          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(null)} />
                          <div 
                            className={cn(
                              "absolute py-1 w-36 z-50 rounded-xl",
                              isDarkMode
                                ? "bg-gray-800 shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#404040] border border-gray-700"
                                : "bg-gray-100 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] border border-gray-200"
                            )}
                            style={{ top: menuCoords.top, right: menuCoords.right }}
                          >
                            <button
                              onClick={() => { setEditOrder(order); setMenuOpen(null); }}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm transition",
                                isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => { setDeleteId(order.id); setMenuOpen(null); }}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm transition",
                                isDarkMode ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50"
                              )}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>,
                        document.body
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} />}
      {editOrder && <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} />}
      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
      />
    </div>
  );
}
