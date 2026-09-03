import api from './axios.js';

export const healthApi = {
  /**
   * Fetches real-time system health telemetry from the backend
   */
  getHealth: async () => {
    const response = await api.get('/health');
    return response;
  }
};
