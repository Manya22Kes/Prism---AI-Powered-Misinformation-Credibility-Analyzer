import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 1 minute timeout for heavy AI operations if not using SSE
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // We can add auth tokens here later if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return the response directly
    return response.data;
  },
  (error) => {
    // Handle global errors here
    const customError = new Error();
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      customError.message = error.response.data?.message || 'Server returned an error.';
      customError.status = error.response.status;
      customError.data = error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      customError.message = 'No response received from the server. Please check your connection.';
      customError.status = 503;
    } else {
      // Something happened in setting up the request that triggered an Error
      customError.message = error.message;
      customError.status = 500;
    }

    return Promise.reject(customError);
  }
);

export default api;
