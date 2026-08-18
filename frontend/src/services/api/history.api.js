import api from './axios';

export const historyApi = {
  /**
   * Get paginated archive history
   */
  getHistory: (params) => {
    return api.get('/history', { params });
  },

  /**
   * Get a specific report by ID
   */
  getReportById: (id) => {
    return api.get(`/history/report/${id}`);
  },

  /**
   * Get a specific batch report by ID
   */
  getBatchReportById: (id) => {
    return api.get(`/history/batch/${id}`);
  },
  
  /**
   * Toggle pin status of a report (handles both single and batch)
   */
  togglePin: (id) => {
    return api.patch(`/history/${id}/pin`);
  },

  /**
   * Delete a report (handles both single and batch)
   */
  deleteReport: (id) => {
    return api.delete(`/history/${id}`);
  }
};
