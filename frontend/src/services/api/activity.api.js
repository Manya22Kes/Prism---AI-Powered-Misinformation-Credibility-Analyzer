import api from './axios.js';

export const activityApi = {
  /**
   * Retrieves chronological activity history
   * @param {Object} params - Query params (type, page, limit)
   */
  getActivity: async (params) => {
    const response = await api.get('/activity', { params });
    return response;
  },

  /**
   * Logs a frontend export event to the backend
   * @param {string} reportId - ID of the exported report
   */
  logExport: async (reportId) => {
    const response = await api.post('/activity/export', { reportId });
    return response;
  }
};
