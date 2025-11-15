# 🏥 HealPlus - Sistema Inteligente de Análise de Feridas

> Uma plataforma web avançada que utiliza Inteligência Artificial para análise automática de feridas, seguindo o protocolo TIMERS, com suporte a geração de relatórios e agendamento de consultas.

![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.10+-3776ab?logo=python)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react)

---

## 📋 Índice

- [Características](#características)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API](#api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias](#tecnologias)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## ✨ Características

### 🤖 Análise com IA
- **Análise de Imagens**: Utiliza Google Gemini 2.0 para análise detalhada de feridas
- **Protocolo TIMERS**: Avaliação estruturada com:
  - **T**issue (Tipo de tecido)
  - **I**nfection/Inflammation (Infecção/Inflamação)
  - **M**oisture (Nível de umidade)
  - **E**dge (Status das bordas)
  - **R**eiteration (Reavaliação)
  - **S**ocial factors (Fatores sociais)

### 📊 Relatórios Automatizados
- Geração de relatórios em PDF com análise completa
- Histórico de avaliações por paciente
- Recomendações terapêuticas baseadas em IA

### 📅 Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico de feridas e análises
- Agendamento de consultas
- Autenticação segura com JWT

### 💬 Chat com IA
- Assistente "Zelo" para orientações sobre cuidados com feridas
- Respostas baseadas em conhecimento médico
- Histórico de conversas por sessão

### 📈 Dashboard Analítico
- Estatísticas de pacientes e análises
- Próximas consultas agendadas
- Visão geral do trabalho realizado

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│         Components, Pages, Services, Contextos           │
└────────────┬──────────────────────────────────┬──────────┘
             │                                  │
         HTTP/CORS                          WebSocket
             │                                  │
┌────────────▼──────────────────────────────────▼──────────┐
│                    BACKEND (FastAPI)                     │
│    Auth | Patients | Wounds | Reports | Chat | Appts    │
└────────────┬──────────────────────────────────┬──────────┘
             │                                  │
             │                              Services
             │                            Google Gemini
             │                          Emergent LLM API
┌────────────▼──────────────────────────────────────────────┐
│               DATABASE (MongoDB)                          │
│    Users | Patients | Wounds | Reports | Messages        │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Pré-requisitos

### Backend
- Python 3.10+
- MongoDB (local ou Atlas)
- Conta no Google Cloud (para Gemini API)
- Chave de API da Emergent Integrations

### Frontend
- Node.js 16+
- npm ou yarn

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/pedrotescaro/HealPlus_web.git
cd HealPlus_web
```

### 2. Setup do Backend

```bash
# Navegue até o diretório backend
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# No Windows:
venv\Scripts\activate
# No macOS/Linux:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Setup do Frontend

```bash
# Navegue até o diretório frontend
cd frontend

# Instale as dependências
npm install

# Ou com yarn
yarn install
```

---

## ⚙️ Configuração

### Backend

Crie um arquivo `.env` no diretório `backend/`:

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=heal_plus_db

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168

# APIs
EMERGENT_LLM_KEY=sua_chave_api_emergent
GOOGLE_GENAI_KEY=sua_chave_google_genai

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend

Crie um arquivo `.env.local` no diretório `frontend/`:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 📖 Uso

### Iniciar o Backend

```bash
cd backend
python -m uvicorn server:app --reload
```

O servidor estará disponível em `http://localhost:8000`

**Documentação Interativa**: http://localhost:8000/docs

### Iniciar o Frontend

```bash
cd frontend
npm start
```

A aplicação estará disponível em `http://localhost:3000`

---

## 🔌 API

### Autenticação

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha_segura",
  "name": "Nome Completo",
  "role": "professional"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha_segura"
}
```

**Resposta**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nome Completo",
    "role": "professional",
    "created_at": "2025-11-15T10:30:00Z"
  }
}
```

### Pacientes

#### Criar Paciente
```http
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "age": 65,
  "gender": "M",
  "contact": "(11) 99999-9999"
}
```

#### Listar Pacientes
```http
GET /api/patients
Authorization: Bearer {token}
```

#### Obter Paciente
```http
GET /api/patients/{patient_id}
Authorization: Bearer {token}
```

### Análise de Feridas

#### Analisar Ferida
```http
POST /api/wounds/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": "uuid",
  "image_base64": "data:image/jpeg;base64,...",
  "timers_data": {
    "tissue_type": "granulation_with_slough",
    "infection_signs": ["redness", "warmth"],
    "moisture_level": "moderate",
    "edges_status": "rounded",
    "size_length": 5.5,
    "size_width": 3.2,
    "size_depth": 0.8
  }
}
```

#### Obter Feridas do Paciente
```http
GET /api/wounds/patient/{patient_id}
Authorization: Bearer {token}
```

### Relatórios

#### Gerar Relatório
```http
POST /api/reports/generate/{wound_id}
Authorization: Bearer {token}
```

**Resposta**:
```json
{
  "report_id": "uuid",
  "pdf_base64": "JVBERi0xLjQK..."
}
```

### Chat

#### Enviar Mensagem
```http
POST /api/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Qual é o melhor curativo para feridas com umidade moderada?",
  "session_id": "uuid_opcional"
}
```

#### Histórico do Chat
```http
GET /api/chat/history/{session_id}
Authorization: Bearer {token}
```

### Dashboard

#### Estatísticas
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Resposta**:
```json
{
  "total_patients": 12,
  "total_analyses": 45,
  "total_reports": 38,
  "upcoming_appointments": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "scheduled_date": "2025-11-20T14:30:00Z",
      "notes": "Avaliação de ferida crônica",
      "status": "scheduled"
    }
  ]
}
```

---

## 📁 Estrutura do Projeto

```
HealPlus_web/
├── backend/
│   ├── server.py              # Aplicação FastAPI principal
│   ├── requirements.txt        # Dependências Python
│   └── .env                   # Variáveis de ambiente
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Componente raiz
│   │   ├── index.js           # Entry point
│   │   ├── index.css          # Estilos globais
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Sidebar.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── SettingsContext.js
│   │   ├── pages/
│   │   │   ├── DashboardPage.js
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── PatientsPage.js
│   │   │   └── RegisterPage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── i18n/
│   │       ├── config.js
│   │       ├── en.json
│   │       └── pt.json
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.local
│
├── tests/
│   └── __init__.py
│
├── README.md                  # Este arquivo
└── .gitignore
```

---

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web assíncrono
- **MongoDB** - Banco de dados NoSQL
- **PyJWT** - Autenticação com tokens JWT
- **Bcrypt** - Hash seguro de senhas
- **Google Gemini API** - Análise de imagens com IA
- **Emergent LLM** - Processamento de linguagem natural
- **ReportLab** - Geração de relatórios em PDF
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Biblioteca de UI
- **React Router v6** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilização
- **i18next** - Internacionalização (pt-BR, en-US)
- **Craco** - Configuração do CRA sem ejetar

### Banco de Dados
- **MongoDB** - Armazenamento de dados
- **Motor** - Driver assíncrono para MongoDB

---

## 🔒 Segurança

- ✅ Autenticação JWT com tokens com expiração
- ✅ Hashing de senhas com bcrypt
- ✅ CORS configurável
- ✅ Validação de dados com Pydantic
- ✅ Variáveis de ambiente para dados sensíveis

---

## 📝 Exemplo de Fluxo Completo

```
1. Usuário se registra/faz login
   └─> Recebe token JWT
   
2. Cria novo paciente
   └─> Salvo no banco de dados
   
3. Faz upload de foto da ferida
   └─> Enviada para análise com IA
   
4. Sistema preenche dados TIMERS
   └─> Gemini analisa a imagem
   
5. Relatório é gerado em PDF
   └─> Disponível para download
   
6. Consulta é agendada
   └─> Exibida no dashboard
   
7. Pode conversar com assistente "Zelo"
   └─> Recebe orientações sobre cuidados
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através de:
- 📧 Email: contato@healplus.com
- 🐛 Issues: [GitHub Issues](https://github.com/pedrotescaro/HealPlus_web/issues)

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙋 Autores

- **Pedro Tescaro** - *Desenvolvedor Principal* - [@pedrotescaro](https://github.com/pedrotescaro)

---

## 🙏 Agradecimentos

- Google Gemini by Google AI
- Emergent Integrations
- Comunidade Open Source
- MongoDB
- FastAPI Community

---

## 📊 Status do Projeto

- [x] Backend API básica
- [x] Autenticação JWT
- [x] Gestão de pacientes
- [x] Análise com IA (Gemini)
- [x] Geração de relatórios PDF
- [x] Chat com IA
- [x] Agendamento de consultas
- [ ] Frontend completo
- [ ] Testes automatizados
- [ ] Deploy em produção
- [ ] Mobile responsivo
- [ ] Integração com mais APIs de IA

---

**Desenvolvido com ❤️ por [Pedro Tescaro](https://github.com/pedrotescaro)**

---

*Última atualização: 15 de Novembro de 2025*
