import api from './axios';

export const collectionApi = {
  /**
   * Get all collections
   */
  getCollections: () => {
    return api.get('/collections');
  },

  /**
   * Get a specific collection by ID
   */
  getCollectionById: (id) => {
    return api.get(`/collections/${id}`);
  },

  /**
   * Create a new collection
   */
  createCollection: (data) => {
    return api.post('/collections', data);
  },

  /**
   * Update a collection
   */
  updateCollection: (id, data) => {
    return api.put(`/collections/${id}`, data);
  },

  /**
   * Delete a collection
   */
  deleteCollection: (id) => {
    return api.delete(`/collections/${id}`);
  },

  /**
   * Add a report to a collection
   */
  addReportToCollection: (collectionId, reportId) => {
    return api.post(`/collections/${collectionId}/reports/${reportId}`);
  },

  /**
   * Remove a report from a collection
   */
  removeReportFromCollection: (collectionId, reportId) => {
    return api.delete(`/collections/${collectionId}/reports/${reportId}`);
  }
};
