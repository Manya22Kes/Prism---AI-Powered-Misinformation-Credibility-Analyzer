import api from './axios';

export const watchlistApi = {
  getWatchlistItems: () => api.get('/watchlist'),
  
  getWatchlistItem: (id) => api.get(`/watchlist/${id}`),
  
  createWatchlistItem: (data) => api.post('/watchlist', data),
  
  updateWatchlistItem: (id, data) => api.put(`/watchlist/${id}`, data),
  
  deleteWatchlistItem: (id) => api.delete(`/watchlist/${id}`),
  
  checkWatchlistItem: (id) => api.post(`/watchlist/${id}/check`)
};
