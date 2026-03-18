import { create } from 'zustand';

const useDashboardStore = create((set) => ({
  dateRange: 'all',
  dashboard: null,
  setDateRange: (range) => set({ dateRange: range }),
  setDashboard: (dashboard) => set({ dashboard }),
}));

export default useDashboardStore;
