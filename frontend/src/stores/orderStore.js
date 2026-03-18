import { create } from 'zustand';

const useOrderStore = create((set) => ({
  orders: [],
  selectedOrder: null,
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  clearSelectedOrder: () => set({ selectedOrder: null }),
}));

export default useOrderStore;
