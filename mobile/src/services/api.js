import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
const DEMO_MODE = String(process.env.EXPO_PUBLIC_DEMO_MODE).toLowerCase() === 'true';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dados demo
const demoUser = {
  id: 'demo-user',
  name: 'Visitante',
  email: 'visitante@healplus.local',
  role: 'professional',
};

const demoToken = 'demo-token';

let demoPatients = [
  { id: 'p1', name: 'Maria Silva', age: 54, gender: 'female', contact: '11 99999-1111' },
  { id: 'p2', name: 'João Souza', age: 67, gender: 'male', contact: '21 98888-2222' },
  { id: 'p3', name: 'Ana Lima', age: 42, gender: 'female', contact: '31 97777-3333' },
];

let demoAppointments = [
  { patient_id: 'p1', scheduled_date: new Date(Date.now() + 86400000).toISOString(), status: 'scheduled' },
  { patient_id: 'p2', scheduled_date: new Date(Date.now() + 172800000).toISOString(), status: 'scheduled' },
];

const demoStats = {
  total_patients: demoPatients.length,
  total_analyses: 12,
  total_reports: 5,
  upcoming_appointments: demoAppointments,
};

// Auth Services
export const authService = {
  login: async (email, password) => {
    if (DEMO_MODE) {
      await AsyncStorage.setItem('token', demoToken);
      return { token: demoToken, user: demoUser };
    }
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (email, password, name, role) => {
    if (DEMO_MODE) {
      await AsyncStorage.setItem('token', demoToken);
      return { token: demoToken, user: { ...demoUser, name, email, role } };
    }
    const response = await api.post('/auth/register', { email, password, name, role });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  getMe: async () => {
    if (DEMO_MODE) {
      return demoUser;
    }
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  anonymousLogin: async () => {
    await AsyncStorage.setItem('token', demoToken);
    return { token: demoToken, user: demoUser };
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },
};

// Patient Services
export const patientService = {
  getAll: async () => {
    if (DEMO_MODE) {
      return demoPatients;
    }
    const response = await api.get('/patients');
    return response.data;
  },
  
  getById: async (id) => {
    if (DEMO_MODE) {
      return demoPatients.find(p => p.id === id) || null;
    }
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    if (DEMO_MODE) {
      const newPatient = { id: `p${demoPatients.length + 1}`, ...data };
      demoPatients = [newPatient, ...demoPatients];
      demoStats.total_patients = demoPatients.length;
      return newPatient;
    }
    const response = await api.post('/patients', data);
    return response.data;
  },
  
  update: async (id, data) => {
    if (DEMO_MODE) {
      const index = demoPatients.findIndex(p => p.id === id);
      if (index !== -1) {
        demoPatients[index] = { ...demoPatients[index], ...data };
        return demoPatients[index];
      }
      return null;
    }
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    if (DEMO_MODE) {
      demoPatients = demoPatients.filter(p => p.id !== id);
      demoStats.total_patients = demoPatients.length;
      return { success: true };
    }
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

// Wound Analysis Services
export const woundService = {
  analyze: async (data) => {
    if (DEMO_MODE) {
      return { result: 'ok', area_cm2: 12.4, perimeter_cm: 18.9, classification: 'granulating' };
    }
    const formData = new FormData();
    if (data.image) {
      formData.append('image', {
        uri: data.image.uri,
        type: data.image.type || 'image/jpeg',
        name: data.image.name || 'wound.jpg',
      });
    }
    if (data.patient_id) formData.append('patient_id', data.patient_id);
    if (data.notes) formData.append('notes', data.notes);
    
    const response = await api.post('/wounds/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getPatientWounds: async (patientId) => {
    if (DEMO_MODE) {
      return [
        { id: 'w1', patient_id: patientId, date: new Date().toISOString(), notes: 'Avaliação inicial' },
      ];
    }
    const response = await api.get(`/wounds/patient/${patientId}`);
    return response.data;
  },
};

// Report Services
export const reportService = {
  generate: async (woundId) => {
    if (DEMO_MODE) {
      return { report_id: `r-${woundId}`, url: '/demo/report.pdf' };
    }
    const response = await api.post(`/reports/generate/${woundId}`, {});
    return response.data;
  },
  
  getAll: async () => {
    if (DEMO_MODE) {
      return [];
    }
    const response = await api.get('/reports');
    return response.data;
  },
};

// Chat Services
export const chatService = {
  sendMessage: async (message, sessionId) => {
    if (DEMO_MODE) {
      return { session_id: sessionId || 'demo-session', reply: `Echo: ${message}` };
    }
    const response = await api.post('/chat', { message, session_id: sessionId });
    return response.data;
  },
  
  getHistory: async (sessionId) => {
    if (DEMO_MODE) {
      return [
        { role: 'user', content: 'Olá!' },
        { role: 'assistant', content: 'Olá! Como posso ajudar?' },
      ];
    }
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  },
};

// Appointment Services
export const appointmentService = {
  create: async (data) => {
    if (DEMO_MODE) {
      const newAppt = { ...data, status: data.status || 'scheduled' };
      demoAppointments = [newAppt, ...demoAppointments];
      demoStats.upcoming_appointments = demoAppointments;
      return newAppt;
    }
    const response = await api.post('/appointments', data);
    return response.data;
  },
  
  getAll: async () => {
    if (DEMO_MODE) {
      return demoAppointments;
    }
    const response = await api.get('/appointments');
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  getStats: async () => {
    if (DEMO_MODE) {
      return demoStats;
    }
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default api;

