import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'react-toastify';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard');
      return data;
    },
  });
}

export function useSaveDashboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dashboardData) => {
      const { data } = await api.post('/api/dashboard', dashboardData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Dashboard saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save dashboard');
    },
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/dashboard/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Dashboard deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete dashboard');
    },
  });
}

export function useUpdateLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dashboardId, positions }) => {
      const { data } = await api.put(`/api/dashboard/${dashboardId}/layout`, { positions });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
