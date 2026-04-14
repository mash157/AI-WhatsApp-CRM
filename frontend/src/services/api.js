import axios from 'axios';
import jwtDecode from 'jwt-decode';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${baseURL}${baseURL.endsWith('/api') ? '' : '/api'}`;

// Set up axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  developerLogin: (data) => apiClient.post('/auth/developer-login', data),
  developerRegister: (data) => apiClient.post('/auth/developer-register', data),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => apiClient.post('/chat/send', data),
  getConversation: (conversationId) => apiClient.get(`/chat/${conversationId}`),
  getUserConversations: () => apiClient.get('/chat'),
  deleteConversation: (conversationId) => apiClient.delete(`/chat/${conversationId}`),
};

// Payment API
export const paymentAPI = {
  createRazorpayOrder: (data) => apiClient.post('/payment/razorpay/create-order', data),
  verifyRazorpayPayment: (data) => apiClient.post('/payment/razorpay/verify', data),
  createStripeIntent: (data) => apiClient.post('/payment/stripe/create-intent', data),
  confirmStripePayment: (data) => apiClient.post('/payment/stripe/confirm', data),
  getPaymentHistory: () => apiClient.get('/payment/history'),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  getUsageStats: () => apiClient.get('/user/usage'),
  getTrialStatus: () => apiClient.get('/user/trial'),
  connectWhatsApp: (data) => apiClient.post('/user/whatsapp/connect', data),
  getCustomers: (params) => apiClient.get('/user/customers', { params }),
  addCustomer: (data) => apiClient.post('/user/customers/add', data),
  deleteCustomer: (id) => apiClient.delete(`/user/customers/${id}`),
  deleteMultipleCustomers: (data) => apiClient.post('/user/customers/delete/multiple', data),
};

// Voice API
export const voiceAPI = {
  processVoice: (data) => apiClient.post('/voice/process', data),
  synthesizeSpeech: (data) => apiClient.post('/voice/synthesize', data),
};

// WhatsApp API
export const whatsappAPI = {
  sendMessage: (data) => apiClient.post('/whatsapp/send', data),
  sendBookingReminder: (data) => apiClient.post('/whatsapp/send-booking-reminder', data),
  sendPaymentReminder: (data) => apiClient.post('/whatsapp/send-payment-reminder', data),
};

// Automation API
export const automationAPI = {
  createAutomation: (data) => apiClient.post('/automation', data),
  getAutomations: () => apiClient.get('/automation'),
  updateAutomation: (id, data) => apiClient.put(`/automation/${id}`, data),
  deleteAutomation: (id) => apiClient.delete(`/automation/${id}`),
  deleteMultipleAutomations: (data) => apiClient.post('/automation/delete/multiple', data),
  triggerAutomation: (id) => apiClient.post(`/automation/${id}/trigger`),
  sendFollowUp: (data) => apiClient.post('/automation/followup/send', data),
};

// Auth token management
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export default apiClient;
