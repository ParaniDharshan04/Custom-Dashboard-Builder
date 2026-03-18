import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI Features
export const aiApi = {
  generateWidget: (prompt) => api.post('/api/ai/generate-widget', { prompt }),
  suggestDashboard: () => api.post('/api/ai/suggest-dashboard'),
  chatInsights: (message) => api.post('/api/ai/chat', { message }),
  explainWidget: (payload) => api.post('/api/ai/explain', payload),
};

export default api;
