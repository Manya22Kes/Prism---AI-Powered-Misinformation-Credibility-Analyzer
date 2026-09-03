import api from './axios.js';

export const settingsApi = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response;
  },
  
  updateSettings: async (settings) => {
    const response = await api.put('/settings', settings);
    return response;
  }
};
