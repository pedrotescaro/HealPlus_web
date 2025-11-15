import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email, password, name, role) => {
    const response = await api.post('/auth/register', { email, password, name, role });
    return response.data;
  },
  
  getMe: async (token) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Patient Services
export const patientService = {
  getAll: async (token) => {
    const response = await api.get('/patients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getById: async (id, token) => {
    const response = await api.get(`/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  create: async (data, token) => {
    const response = await api.post('/patients', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Wound Analysis Services
export const woundService = {
  analyze: async (data, token) => {
    const response = await api.post('/wounds/analyze', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getPatientWounds: async (patientId, token) => {
    const response = await api.get(`/wounds/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Report Services
export const reportService = {
  generate: async (woundId, token) => {
    const response = await api.post(`/reports/generate/${woundId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Chat Services
export const chatService = {
  sendMessage: async (message, sessionId, token) => {
    const response = await api.post('/chat', { message, session_id: sessionId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getHistory: async (sessionId, token) => {
    const response = await api.get(`/chat/history/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Appointment Services
export const appointmentService = {
  create: async (data, token) => {
    const response = await api.post('/appointments', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getAll: async (token) => {
    const response = await api.get('/appointments', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  getStats: async (token) => {
    const response = await api.get('/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default api;
