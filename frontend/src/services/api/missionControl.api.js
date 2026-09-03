import api from './axios.js';

export const missionControlApi = {
  /**
   * Fetches the real-time mission control operational telemetry
   */
  getMissionControlData: async () => {
    const response = await api.get('/mission-control');
    return response;
  }
};
