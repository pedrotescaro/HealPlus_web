import axios from 'axios';

// ==================== Configuração Base ====================

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
const DEMO_MODE = String(process.env.REACT_APP_DEMO_MODE).toLowerCase() === 'true';

/**
 * Instância Axios configurada com:
 * - withCredentials para enviar cookies automaticamente
 * - Interceptors para refresh token automático
 * - Tratamento de erros padronizado
 */
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // IMPORTANTE: Envia cookies automaticamente
});

// ==================== Interceptors ====================

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor - Adiciona token se disponível (fallback para localStorage em desenvolvimento)
api.interceptors.request.use(
  (config) => {
    // Em modo cookie, o token é enviado automaticamente via cookie HttpOnly
    // Este fallback é para compatibilidade durante transição
    const token = localStorage.getItem('healplus_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Tratamento de erros e refresh token
api.interceptors.response.use(
  (response) => {
    // Extrair dados do formato padronizado se existir
    if (response.data && response.data.status === 'success') {
      // Manter estrutura original mas facilitar acesso aos dados
      response.apiData = response.data.data;
      response.apiMessage = response.data.message;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Se for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está fazendo refresh, aguardar na fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Tentar refresh token
        const refreshResponse = await api.post('/auth/refresh');
        
        if (refreshResponse.data?.status === 'success') {
          processQueue(null);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Limpar dados locais e redirecionar para login
        handleAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Tratamento de erro 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error('Acesso negado');
    }
    
    // Tratamento de erro 500 (Server Error)
    if (error.response?.status >= 500) {
      console.error('Erro interno do servidor');
    }
    
    return Promise.reject(formatError(error));
  }
);

// ==================== Helpers ====================

/**
 * Limpa dados de autenticação e redireciona para login
 */
const handleAuthFailure = () => {
  localStorage.removeItem('healplus_token');
  localStorage.removeItem('healplus_user');
  
  // Dispara evento customizado para o AuthContext
  window.dispatchEvent(new CustomEvent('auth:logout'));
  
  // Redirecionar apenas se não estiver na página de login
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login?session=expired';
  }
};

/**
 * Formata erros da API para um formato consistente
 */
const formatError = (error) => {
  const response = error.response;
  
  if (!response) {
    return {
      status: 'error',
      message: 'Erro de conexão. Verifique sua internet.',
      code: 'NETWORK_ERROR',
      errors: [],
    };
  }
  
  // Se a resposta já está no formato padronizado
  if (response.data?.status === 'error') {
    return {
      status: 'error',
      message: response.data.message || 'Erro desconhecido',
      code: response.status,
      errors: response.data.errors || [],
    };
  }
  
  // Mapear códigos HTTP para mensagens amigáveis
  const messageMap = {
    400: 'Dados inválidos. Verifique os campos.',
    401: 'Sessão expirada. Faça login novamente.',
    403: 'Você não tem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    422: 'Dados inválidos. Verifique os campos.',
    429: 'Muitas tentativas. Aguarde um momento.',
    500: 'Erro interno. Tente novamente mais tarde.',
    502: 'Serviço indisponível. Tente novamente.',
    503: 'Serviço em manutenção. Tente mais tarde.',
  };
  
  return {
    status: 'error',
    message: messageMap[response.status] || 'Erro desconhecido',
    code: response.status,
    errors: [],
  };
};

/**
 * Extrai dados da resposta padronizada
 */
export const extractData = (response) => {
  if (response.data?.status === 'success') {
    return response.data.data;
  }
  return response.data;
};

/**
 * Verifica se a resposta foi bem-sucedida
 */
export const isSuccess = (response) => {
  return response.data?.status === 'success' || (response.status >= 200 && response.status < 300);
};

// ==================== Demo Data ====================

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

// ==================== Auth Services ====================

export const authService = {
  /**
   * Login com email e senha
   * Tokens são armazenados em cookies HttpOnly automaticamente
   */
  login: async (email, password) => {
    if (DEMO_MODE) {
      return { token: demoToken, user: demoUser };
    }
    const response = await api.post('/auth/login', { email, password });
    const data = extractData(response);
    
    // Armazenar token como fallback (o principal está no cookie)
    if (data.token) {
      localStorage.setItem('healplus_token', data.token);
    }
    
    return data;
  },
  
  /**
   * Registro de novo usuário
   */
  register: async (email, password, name, role = 'professional') => {
    if (DEMO_MODE) {
      return { token: demoToken, user: { ...demoUser, name, email, role } };
    }
    const response = await api.post('/auth/register', { email, password, name, role });
    const data = extractData(response);
    
    if (data.token) {
      localStorage.setItem('healplus_token', data.token);
    }
    
    return data;
  },
  
  /**
   * Obtém dados do usuário atual
   */
  getMe: async () => {
    if (DEMO_MODE) {
      return demoUser;
    }
    const response = await api.get('/auth/me');
    return extractData(response);
  },
  
  /**
   * Renova tokens usando refresh token (cookie)
   */
  refresh: async () => {
    if (DEMO_MODE) {
      return { token: demoToken, user: demoUser };
    }
    const response = await api.post('/auth/refresh');
    const data = extractData(response);
    
    if (data.token) {
      localStorage.setItem('healplus_token', data.token);
    }
    
    return data;
  },
  
  /**
   * Logout - revoga tokens e limpa cookies
   */
  logout: async () => {
    if (DEMO_MODE) {
      localStorage.removeItem('healplus_token');
      return { success: true };
    }
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('healplus_token');
      localStorage.removeItem('healplus_user');
    }
    return { success: true };
  },
  
  /**
   * Verifica status de autenticação
   */
  checkAuth: async () => {
    if (DEMO_MODE) {
      return { authenticated: true, user: demoUser };
    }
    const response = await api.get('/auth/check');
    return extractData(response);
  },

  /**
   * Login anônimo para modo demo
   */
  anonymousLogin: async () => {
    return { token: demoToken, user: demoUser };
  },

  /**
   * Obtém URL para login com Google
   */
  getGoogleAuthUrl: async () => {
    if (DEMO_MODE) {
      return { url: '/demo/google', provider: 'google' };
    }
    const response = await api.get('/auth/google/url');
    return extractData(response);
  },
};

// ==================== Patient Services ====================

export const patientService = {
  getAll: async () => {
    if (DEMO_MODE) {
      return demoPatients;
    }
    const response = await api.get('/patients');
    return extractData(response);
  },
  
  getById: async (id) => {
    if (DEMO_MODE) {
      return demoPatients.find(p => p.id === id) || null;
    }
    const response = await api.get(`/patients/${id}`);
    return extractData(response);
  },
  
  create: async (data) => {
    if (DEMO_MODE) {
      const newPatient = { id: `p${demoPatients.length + 1}`, ...data };
      demoPatients = [newPatient, ...demoPatients];
      demoStats.total_patients = demoPatients.length;
      return newPatient;
    }
    const response = await api.post('/patients', data);
    return extractData(response);
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
    return extractData(response);
  },

  delete: async (id) => {
    if (DEMO_MODE) {
      demoPatients = demoPatients.filter(p => p.id !== id);
      demoStats.total_patients = demoPatients.length;
      return { success: true };
    }
    const response = await api.delete(`/patients/${id}`);
    return extractData(response);
  },
};

// ==================== Wound Analysis Services (ML-powered) ====================

export const woundService = {
  analyze: async (data) => {
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
    const response = await api.post('/wounds/analyze', data);
    return extractData(response);
  },
  
  getPatientWounds: async (patientId) => {
    if (DEMO_MODE) {
      return demoWoundAnalyses.filter(w => w.patientId === patientId);
    }
    const response = await api.get(`/wounds/patient/${patientId}`);
    return extractData(response);
  },

  getById: async (woundId) => {
    if (DEMO_MODE) {
      return demoWoundAnalyses.find(w => w.id === woundId) || null;
    }
    const response = await api.get(`/wounds/${woundId}`);
    return extractData(response);
  },

  compareImages: async (data) => {
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
    const response = await api.post('/wounds/compare-images', data);
    return extractData(response);
  },

  compareReports: async (data) => {
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
    const response = await api.post('/wounds/compare-reports', data);
    return extractData(response);
  },
};

// ==================== ML Analysis Services ====================

export const mlService = {
  analyzeImage: async (image) => {
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
    const response = await api.post('/ml/analyze/base64', { image });
    return extractData(response);
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
    return extractData(response);
  },
};

// ==================== Report Services ====================

export const reportService = {
  generate: async (woundId) => {
    if (DEMO_MODE) {
      return { 
        report_id: `r-${woundId}`, 
        url: '/demo/report.pdf',
        createdAt: new Date().toISOString()
      };
    }
    const response = await api.post(`/reports/generate/${woundId}`);
    return extractData(response);
  },

  getAll: async () => {
    if (DEMO_MODE) {
      return demoWoundAnalyses.map(w => ({
        id: `r-${w.id}`,
        woundAnalysisId: w.id,
        patientId: w.patientId,
        createdAt: w.createdAt
      }));
    }
    const response = await api.get('/reports');
    return extractData(response);
  },

  getById: async (reportId) => {
    if (DEMO_MODE) {
      return { id: reportId, url: '/demo/report.pdf' };
    }
    const response = await api.get(`/reports/${reportId}`);
    return extractData(response);
  },

  downloadPDF: async (reportId) => {
    if (DEMO_MODE) {
      return { url: '/demo/report.pdf' };
    }
    const response = await api.get(`/reports/${reportId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ==================== Chat Services ====================

export const chatService = {
  sendMessage: async (message, sessionId) => {
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
    const response = await api.post('/chat', { message, session_id: sessionId });
    return extractData(response);
  },
  
  getHistory: async (sessionId) => {
    if (DEMO_MODE) {
      return [
        { role: 'user', content: 'Olá!' },
        { role: 'assistant', content: 'Olá! Sou o Zelo, seu assistente médico. Como posso ajudar?' },
      ];
    }
    const response = await api.get(`/chat/history/${sessionId}`);
    return extractData(response);
  },
};

// ==================== Appointment Services ====================

export const appointmentService = {
  create: async (data) => {
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
    const response = await api.post('/appointments', data);
    return extractData(response);
  },
  
  getAll: async () => {
    if (DEMO_MODE) {
      return demoAppointments;
    }
    const response = await api.get('/appointments');
    return extractData(response);
  },

  getByDate: async (date) => {
    if (DEMO_MODE) {
      return demoAppointments.filter(a => 
        new Date(a.scheduled_date).toDateString() === new Date(date).toDateString()
      );
    }
    const response = await api.get(`/appointments/date/${date}`);
    return extractData(response);
  },

  update: async (id, data) => {
    if (DEMO_MODE) {
      const index = demoAppointments.findIndex(a => a.id === id);
      if (index !== -1) {
        demoAppointments[index] = { ...demoAppointments[index], ...data };
        return demoAppointments[index];
      }
      return null;
    }
    const response = await api.put(`/appointments/${id}`, data);
    return extractData(response);
  },

  delete: async (id) => {
    if (DEMO_MODE) {
      demoAppointments = demoAppointments.filter(a => a.id !== id);
      return { success: true };
    }
    const response = await api.delete(`/appointments/${id}`);
    return extractData(response);
  },
};

// ==================== Dashboard Services ====================

export const dashboardService = {
  getStats: async () => {
    if (DEMO_MODE) {
      return {
        ...demoStats,
        total_analyses: demoWoundAnalyses.length,
        total_patients: demoPatients.length,
      };
    }
    const response = await api.get('/dashboard/stats');
    return extractData(response);
  },
};

// ==================== System Services ====================

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
