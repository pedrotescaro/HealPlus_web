import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
const DEMO_MODE = String(process.env.REACT_APP_DEMO_MODE).toLowerCase() === 'true';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

// Demo data
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

let demoWoundAnalyses = [
  {
    id: 'w1',
    patientId: 'p1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    imageBase64: '',
    notes: 'Avaliação inicial - lesão por pressão',
    aiAnalysis: {
      classificacao_etiologica: {
        tipo_probabilistico: 'Lesão por Pressão Estágio II',
        confianca_percentual: 87,
        fase_cicatrizacao: 'Inflamatória'
      },
      analise_dimensional: {
        area_total_afetada: 12.5,
        profundidade_estimada: 0.5
      },
      recomendacoes_prioritarias: [
        'Manter curativo úmido',
        'Avaliar posicionamento do paciente',
        'Monitorar sinais de infecção'
      ]
    }
  },
  {
    id: 'w2',
    patientId: 'p1',
    createdAt: new Date().toISOString(),
    imageBase64: '',
    notes: 'Reavaliação - melhora significativa',
    aiAnalysis: {
      classificacao_etiologica: {
        tipo_probabilistico: 'Lesão por Pressão Estágio II',
        confianca_percentual: 92,
        fase_cicatrizacao: 'Proliferativa'
      },
      analise_dimensional: {
        area_total_afetada: 8.3,
        profundidade_estimada: 0.3
      },
      recomendacoes_prioritarias: [
        'Continuar tratamento atual',
        'Proteger tecido de granulação',
        'Manter hidratação adequada'
      ]
    }
  }
];

const demoStats = {
  total_patients: demoPatients.length,
  total_analyses: demoWoundAnalyses.length,
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

  update: async (id, data, token) => {
    if (DEMO_MODE) {
      const index = demoPatients.findIndex(p => p.id === id);
      if (index !== -1) {
        demoPatients[index] = { ...demoPatients[index], ...data };
        return demoPatients[index];
      }
      return null;
    }
    const response = await api.put(`/patients/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id, token) => {
    if (DEMO_MODE) {
      demoPatients = demoPatients.filter(p => p.id !== id);
      demoStats.total_patients = demoPatients.length;
      return { success: true };
    }
    const response = await api.delete(`/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Wound Analysis Services (ML-powered)
export const woundService = {
  analyze: async (data, token) => {
    if (DEMO_MODE) {
      const newAnalysis = {
        id: `w${demoWoundAnalyses.length + 1}`,
        patientId: data.patientId,
        createdAt: new Date().toISOString(),
        imageBase64: data.imageBase64,
        timersData: data.timersData,
        aiAnalysis: {
          classificacao_etiologica: {
            tipo_probabilistico: 'Análise Demo',
            confianca_percentual: 85,
            fase_cicatrizacao: 'Inflamatória',
            justificativa: 'Análise realizada pelo modelo de ML proprietário HealPlus'
          },
          analise_dimensional: {
            area_total_afetada: Math.random() * 20 + 5,
            profundidade_estimada: Math.random() * 2
          },
          recomendacoes_prioritarias: [
            'Manter curativo úmido',
            'Monitorar sinais de infecção',
            'Reavaliar em 7 dias'
          ],
          observacoes_clinicas: [
            'Tecido de granulação presente',
            'Bordas bem definidas',
            'Exsudato moderado'
          ]
        }
      };
      demoWoundAnalyses = [newAnalysis, ...demoWoundAnalyses];
      demoStats.total_analyses = demoWoundAnalyses.length;
      return newAnalysis;
    }
    const response = await api.post('/wounds/analyze', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  
  getPatientWounds: async (patientId, token) => {
    if (DEMO_MODE) {
      return demoWoundAnalyses.filter(w => w.patientId === patientId);
    }
    const response = await api.get(`/wounds/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getById: async (woundId, token) => {
    if (DEMO_MODE) {
      return demoWoundAnalyses.find(w => w.id === woundId) || null;
    }
    const response = await api.get(`/wounds/${woundId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  compareImages: async (data, token) => {
    if (DEMO_MODE) {
      return {
        analiseImagem1: {
          idImagem: data.image1Id,
          dataHoraCaptura: data.image1DateTime
        },
        analiseImagem2: {
          idImagem: data.image2Id,
          dataHoraCaptura: data.image2DateTime
        },
        relatorioComparativo: {
          periodoAnalise: `${data.image1DateTime} a ${data.image2DateTime}`,
          intervaloTempo: 'Calculado',
          resumoDescritivoEvolucao: 'Evolução positiva observada. Redução da área afetada e melhora no tecido de granulação.'
        }
      };
    }
    const response = await api.post('/wounds/compare-images', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  compareReports: async (data, token) => {
    if (DEMO_MODE) {
      return {
        analiseImagem1: { idImagem: 'report1', dataHoraCaptura: data.report1Date },
        analiseImagem2: { idImagem: 'report2', dataHoraCaptura: data.report2Date },
        relatorioComparativo: {
          periodoAnalise: `${data.report1Date} a ${data.report2Date}`,
          resumoDescritivoEvolucao: 'Comparação de relatórios realizada com sucesso.'
        }
      };
    }
    const response = await api.post('/wounds/compare-reports', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// ML Analysis Services (direct access to ML endpoints)
export const mlService = {
  analyzeImage: async (image, token) => {
    if (DEMO_MODE) {
      return {
        woundType: 'PRESSURE_ULCER',
        woundTypeConfidence: 0.87,
        healingPhase: 'PROLIFERATIVE',
        healingPhaseConfidence: 0.82,
        estimatedArea: 12.5,
        estimatedDepth: 0.5,
        tissuePercentages: {
          GRANULATION: 45,
          EPITHELIAL: 25,
          SLOUGH: 20,
          NECROTIC: 10
        },
        clinicalObservations: [
          'Tecido predominante: Granulação (45%)',
          'Boa formação de tecido de granulação',
          'Fase de cicatrização: Proliferativa'
        ],
        recommendations: [
          'Proteger tecido de granulação com curativos não aderentes',
          'Manter ambiente úmido ideal',
          'Considerar terapia por pressão negativa se indicado'
        ],
        riskAssessment: {
          level: 'MODERADO',
          infectionRisk: 25,
          chronicityRisk: 20,
          riskFactors: []
        },
        evolutionPrediction: {
          estimatedHealingDays: 21,
          healingProbability: 85,
          expectedNextPhase: 'Remodelação',
          evolutionIndicators: [
            'Formação de tecido de granulação em progresso',
            'Epitelização deve iniciar nas bordas'
          ]
        }
      };
    }
    const response = await api.post('/ml/analyze/base64', { image }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getMLHealth: async () => {
    if (DEMO_MODE) {
      return {
        status: 'HEALTHY',
        framework: 'DeepLearning4J',
        modelsLoaded: true,
        timestamp: new Date().toISOString()
      };
    }
    const response = await api.get('/ml/health');
    return response.data;
  },
};

// Report Services
export const reportService = {
  generate: async (woundId, token) => {
    if (DEMO_MODE) {
      return { 
        report_id: `r-${woundId}`, 
        url: '/demo/report.pdf',
        createdAt: new Date().toISOString()
      };
    }
    const response = await api.post(`/reports/generate/${woundId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAll: async (token) => {
    if (DEMO_MODE) {
      return demoWoundAnalyses.map(w => ({
        id: `r-${w.id}`,
        woundAnalysisId: w.id,
        patientId: w.patientId,
        createdAt: w.createdAt
      }));
    }
    const response = await api.get('/reports', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getById: async (reportId, token) => {
    if (DEMO_MODE) {
      return { id: reportId, url: '/demo/report.pdf' };
    }
    const response = await api.get(`/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  downloadPDF: async (reportId, token) => {
    if (DEMO_MODE) {
      return { url: '/demo/report.pdf' };
    }
    const response = await api.get(`/reports/${reportId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    return response.data;
  },
};

// Chat Services
export const chatService = {
  sendMessage: async (message, sessionId, token) => {
    if (DEMO_MODE) {
      const responses = [
        'Entendi sua pergunta. Com base no protocolo TIMERS, a avaliação da ferida deve considerar vários aspectos clínicos.',
        'A análise de imagem por IA pode ajudar a identificar o tipo de tecido e a fase de cicatrização.',
        'Recomendo monitorar sinais de infecção como eritema, calor local e exsudato purulento.',
        'Para feridas crônicas, é importante avaliar fatores sistêmicos como nutrição e perfusão.',
      ];
      return { 
        session_id: sessionId || 'demo-session', 
        reply: responses[Math.floor(Math.random() * responses.length)]
      };
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
        { role: 'assistant', content: 'Olá! Sou o Zelo, seu assistente médico. Como posso ajudar?' },
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
      const newAppt = { 
        id: `a${demoAppointments.length + 1}`,
        ...data, 
        status: data.status || 'scheduled' 
      };
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

  getByDate: async (date, token) => {
    if (DEMO_MODE) {
      return demoAppointments.filter(a => 
        new Date(a.scheduled_date).toDateString() === new Date(date).toDateString()
      );
    }
    const response = await api.get(`/appointments/date/${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (id, data, token) => {
    if (DEMO_MODE) {
      const index = demoAppointments.findIndex(a => a.id === id);
      if (index !== -1) {
        demoAppointments[index] = { ...demoAppointments[index], ...data };
        return demoAppointments[index];
      }
      return null;
    }
    const response = await api.put(`/appointments/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id, token) => {
    if (DEMO_MODE) {
      demoAppointments = demoAppointments.filter(a => a.id !== id);
      return { success: true };
    }
    const response = await api.delete(`/appointments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  getStats: async (token) => {
    if (DEMO_MODE) {
      return {
        ...demoStats,
        total_analyses: demoWoundAnalyses.length,
        total_patients: demoPatients.length,
      };
    }
    const response = await api.get('/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// System Services
export const systemService = {
  health: async () => {
    try {
      const res = await axios.get(`${API_URL}/actuator/health`, { 
        withCredentials: false,
        timeout: 5000 
      });
      return res.data;
    } catch (error) {
      return { status: 'DOWN', error: error.message };
    }
  },

  mlHealth: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ml/health`, { 
        withCredentials: false,
        timeout: 5000 
      });
      return res.data;
    } catch (error) {
      return { status: 'DOWN', framework: 'DeepLearning4J', error: error.message };
    }
  },
};

export default api;
