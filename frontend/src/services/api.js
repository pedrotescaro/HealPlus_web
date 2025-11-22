import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
const DEMO_MODE = String(process.env.REACT_APP_DEMO_MODE).toLowerCase() === 'true';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
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
      return { token: demoToken, user: demoUser };
    }
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email, password, name, role) => {
    if (DEMO_MODE) {
      return { token: demoToken, user: { ...demoUser, name, email, role } };
    }
    const response = await api.post('/auth/register', { email, password, name, role });
    return response.data;
  },
  
  getMe: async (token) => {
    if (DEMO_MODE) {
      return demoUser;
    }
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  anonymousLogin: async () => {
    return { token: demoToken, user: demoUser };
  },
};

// Patient Services
export const patientService = {
  getAll: async (token) => {
    if (DEMO_MODE) {
      return demoPatients;
    }
    const response = await api.get('/patients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getById: async (id, token) => {
    if (DEMO_MODE) {
      return demoPatients.find(p => p.id === id) || null;
    }
    const response = await api.get(`/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  create: async (data, token) => {
    if (DEMO_MODE) {
      const newPatient = { id: `p${demoPatients.length + 1}`, ...data };
      demoPatients = [newPatient, ...demoPatients];
      demoStats.total_patients = demoPatients.length;
      return newPatient;
    }
    const response = await api.post('/patients', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Wound Analysis Services
export const woundService = {
  analyze: async (data, token) => {
    if (DEMO_MODE) {
      return { result: 'ok', area_cm2: 12.4, perimeter_cm: 18.9, classification: 'granulating' };
    }
    const response = await api.post('/wounds/analyze', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getPatientWounds: async (patientId, token) => {
    if (DEMO_MODE) {
      return [
        { id: 'w1', patient_id: patientId, date: new Date().toISOString(), notes: 'Avaliação inicial' },
      ];
    }
    const response = await api.get(`/wounds/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Report Services
export const reportService = {
  generate: async (woundId, token) => {
    if (DEMO_MODE) {
      return { report_id: `r-${woundId}`, url: '/demo/report.pdf' };
    }
    const response = await api.post(`/reports/generate/${woundId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Chat Services
export const chatService = {
  sendMessage: async (message, sessionId, token) => {
    if (DEMO_MODE) {
      return { session_id: sessionId || 'demo-session', reply: `Echo: ${message}` };
    }
    const response = await api.post('/chat', { message, session_id: sessionId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getHistory: async (sessionId, token) => {
    if (DEMO_MODE) {
      return [
        { role: 'user', content: 'Olá!' },
        { role: 'assistant', content: 'Olá! Como posso ajudar?' },
      ];
    }
    const response = await api.get(`/chat/history/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Appointment Services
export const appointmentService = {
  create: async (data, token) => {
    if (DEMO_MODE) {
      const newAppt = { ...data, status: data.status || 'scheduled' };
      demoAppointments = [newAppt, ...demoAppointments];
      demoStats.upcoming_appointments = demoAppointments;
      return newAppt;
    }
    const response = await api.post('/appointments', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getAll: async (token) => {
    if (DEMO_MODE) {
      return demoAppointments;
    }
    const response = await api.get('/appointments', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  getStats: async (token) => {
    if (DEMO_MODE) {
      return demoStats;
    }
    const response = await api.get('/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export const systemService = {
  health: async () => {
    const res = await axios.get(`${API_URL}/actuator/health`, { withCredentials: false });
    return res.data;
  },
};

export default api;
