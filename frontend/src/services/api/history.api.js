import api from './axios';

export const historyApi = {
  /**
   * Get paginated archive history
   */
  getHistory: (params) => {
    return api.get('/history', { params });
  },

  /**
   * Get saved reports
   */
  getSavedReports: (params) => {
    return api.get('/history/saved', { params });
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
   * Toggle the pinned status of a report
   */
  togglePin: (id) => {
    return api.patch(`/history/${id}/pin`);
  },

  /**
   * Toggle the saved status of a report
   */
  toggleSave: (id) => {
    return api.patch(`/history/${id}/save`);
  },

  /**
   * Delete a report (handles both single and batch)
   */
  deleteReport: (id) => {
    return api.delete(`/history/${id}`);
  }
};
