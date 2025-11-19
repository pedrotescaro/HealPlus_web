<div align="center">

# 🏥 Heal+ - Plataforma Inteligente de Gestão e Análise de Feridas

![Status](https://img.shields.io/badge/status-production_ready-success?style=for-the-badge&logo=check-circle)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

![Java](https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=docker&logoColor=white)

**A plataforma inteligente para gestão e análise de feridas com tecnologia de ponta e Inteligência Artificial**

[🚀 Funcionalidades](#-funcionalidades) • [⚙️ Instalação](#-instalação) • [🤖 IA e Análises](#-inteligência-artificial) • [📊 Dashboard](#-dashboard) • [🔧 Tecnologias](#-tecnologias) • [📖 API](#-api) • [📂 Estrutura](#-estrutura-do-projeto)

[![Deploy](https://img.shields.io/badge/deploy-docker--compose-blue?style=for-the-badge)](https://docs.docker.com/compose/)
[![Tests](https://img.shields.io/badge/tests-passing-success?style=for-the-badge)](.github/workflows/tests.yml)
[![Contributions](https://img.shields.io/badge/contributions-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

</div>

---

## 📋 Sobre o Projeto

O **Heal+** é uma plataforma web moderna e completa desenvolvida com **Spring Boot** e **React**, projetada para profissionais de saúde gerenciarem e analisarem feridas de pacientes de forma eficiente e inteligente.

### 🎯 Destaques

- ✨ **Dashboard Inteligente** com gráficos, estatísticas e visualizações
- 🤖 **Análise de IA** usando Google Gemini para análise detalhada de imagens
- 📊 **Relatórios Comparativos** com análise de progressão de feridas
- 🗓️ **Agenda Integrada** com calendário e gestão de compromissos
- 💬 **Chat Assistente** para suporte aos profissionais
- 📱 **100% Responsivo** com design mobile-first
- 📱 **App Mobile Nativo** React Native com Expo
- 🔒 **Seguro** com autenticação JWT e validações

---

## ✨ Funcionalidades

### 🎯 Principais Recursos

| Funcionalidade | Descrição | Status |
|--------------|-----------|--------|
| 🤖 **Análise com IA** | Análise detalhada de imagens de feridas usando Google Gemini | ✅ |
| 📊 **Dashboard Completo** | Estatísticas, gráficos e visualizações interativas | ✅ |
| 📈 **Comparação de Imagens** | Análise comparativa de progressão de feridas | ✅ |
| 📝 **Sistema TIMERS** | Avaliação completa (Tecido, Infecção, Umidade, Bordas, Reparo, Social) | ✅ |
| 📄 **Relatórios PDF** | Geração automática de relatórios detalhados | ✅ |
| 👨‍⚕️ **Gestão de Pacientes** | Cadastro, listagem e histórico completo | ✅ |
| 🗓️ **Agenda Inteligente** | Calendário interativo com compromissos | ✅ |
| 🔐 **Autenticação JWT** | Sistema seguro de login e registro | ✅ |
| 💬 **Chat Assistente** | Suporte com histórico de mensagens | ✅ |
| 🔔 **Notificações** | Painel de notificações em tempo real | ✅ |

### 📊 Dashboard

O dashboard oferece uma visão completa das atividades:

- **6 Cards de Estatísticas**: Pacientes, Avaliações, Relatórios, Comparações, Este Mês, Taxa de Relatórios
- **Gráfico de Atividades**: Visualização em pizza das atividades realizadas
- **Agenda Interativa**: Calendário com visualização de compromissos
- **Resumo de Atividades**: Métricas detalhadas e progresso mensal
- **Ações Rápidas**: Acesso rápido às principais funcionalidades
- **Atividade Recente**: Timeline das últimas ações

### 🤖 Inteligência Artificial

#### Análise de Imagens de Feridas

A plataforma utiliza **Google Gemini 2.0** para análise detalhada de imagens:

- ✅ **Avaliação de Qualidade**: Iluminação, foco, ângulo, fundo, escala
- ✅ **Análise Dimensional**: Área total, dimensões da lesão
- ✅ **Análise Colorimétrica**: Cores dominantes com percentuais
- ✅ **Análise de Histograma**: Distribuição de cores
- ✅ **Análise de Textura**: Edema, descamação, bordas, brilho

#### Comparação de Imagens

- ✅ Análise individual de cada imagem
- ✅ Comparação quantitativa de progressão
- ✅ Resumo descritivo da evolução
- ✅ Verificação de consistência dos dados

#### Comparação de Relatórios

- ✅ Análise multimodal (texto + imagens)
- ✅ Validação cruzada entre texto e imagem
- ✅ Relatório comparativo integrado

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React 18 + Tailwind CSS)             │
│  Dashboard | Patients | Assessments | Chat | Reports        │
│  Components: ActivityChart, AgendaView, NotificationsPanel  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTP/REST (Nginx reverse proxy)
             │
┌────────────▼────────────────────────────────────────────────┐
│         BACKEND (Spring Boot 3.3, Java 17)                 │
│  Controllers: Auth | Patients | Wounds | Reports | Chat     │
│  Services: AIService (Google Gemini Integration)            │
│  Security: JWT Authentication | BCrypt Password Hashing    │
└────────────┬────────────────────────────────────────────────┘
             │
      ┌──────┴─────────┐
      │                │
┌─────▼───────┐  ┌─────▼────────────────────────┐
│ PostgreSQL  │  │ MongoDB                       │
│ Users,      │  │ WoundAnalysis, Reports, Chat   │
│ Patients,   │  │ (com análises de IA)           │
│ Appointments│  │                                │
└─────────────┘  └────────────────────────────────┘
```

---

## 🚀 Instalação

### Pré-requisitos

- 🐳 **Docker** e **Docker Compose** (recomendado)
- 📦 **Node.js 18+** (para desenvolvimento do frontend)
- ☕ **JDK 17** (para rodar local sem Docker)
- 🔑 **Google Gemini API Key** (opcional, para funcionalidades de IA)

### 🐳 Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/pedrotescaro/HealPlus_web.git
cd HealPlus_web

# Configure as variáveis de ambiente (opcional)
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY

# Inicie os containers
docker-compose up -d

# Verifique os logs
docker-compose logs -f
```

**Acesse:**
- 🌐 Frontend: `http://localhost`
- 🔌 API: `http://localhost/api`
- 📊 PostgreSQL: `localhost:5432`
- 🍃 MongoDB: `localhost:27017`

### 💻 Desenvolvimento Local

#### Backend

```bash
cd backend

# Configure application.yml ou variáveis de ambiente
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/heal_plus_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
export SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/heal_plus_db
export JWT_SECRET=sua_chave_secreta
export GEMINI_API_KEY=sua_chave_gemini  # Opcional

# Execute
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Configure a URL do backend
export REACT_APP_BACKEND_URL=http://localhost:8080

# Execute
npm start
```

#### 📱 App Mobile

```bash
cd mobile

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env com:
# EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
# ou use o IP da sua máquina para Android:
# EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:8001

# Inicie o servidor de desenvolvimento
npm start

# Execute no dispositivo:
# - Android: Pressione 'a' ou escaneie o QR code com Expo Go
# - iOS: Pressione 'i' ou escaneie o QR code com a câmera
# - Web: Pressione 'w'
```

**Nota**: Para mais detalhes sobre o app mobile, consulte o [README do mobile](mobile/README.md).

---

## 🔌 API

### 🔐 Autenticação

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

**Resposta:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nome Completo",
    "role": "professional"
  }
}
```

### 👨‍⚕️ Pacientes

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

### 🤖 Análise de Feridas com IA

#### Analisar Ferida
```http
POST /api/wounds/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "uuid",
  "imageBase64": "data:image/jpeg;base64,...",
  "timersData": {
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

**Resposta inclui análise de IA:**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "aiAnalysis": {
    "idImagem": "uuid",
    "dataHoraCaptura": "2025-01-15T10:30:00Z",
    "avaliacaoQualidade": {
      "iluminacao": "Adequada",
      "foco": "Nítido",
      "anguloConsistente": "Sim",
      "fundo": "Neutro",
      "escalaReferenciaPresente": "Sim"
    },
    "analiseDimensional": {
      "unidadeMedida": "cm",
      "areaTotalAfetada": 12.5
    },
    "analiseColorimetrica": {
      "coresDominantes": [...]
    }
  }
}
```

#### Comparar Duas Imagens
```http
POST /api/wounds/compare-images
Authorization: Bearer {token}
Content-Type: application/json

{
  "image1Base64": "data:image/jpeg;base64,...",
  "image1Id": "uuid1",
  "image1DateTime": "2025-01-10T10:00:00Z",
  "image2Base64": "data:image/jpeg;base64,...",
  "image2Id": "uuid2",
  "image2DateTime": "2025-01-15T10:00:00Z"
}
```

#### Comparar Relatórios
```http
POST /api/wounds/compare-reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "report1Content": "# Relatório 1...",
  "report2Content": "# Relatório 2...",
  "image1Base64": "data:image/jpeg;base64,...",
  "image2Base64": "data:image/jpeg;base64,...",
  "report1Date": "2025-01-10T10:00:00Z",
  "report2Date": "2025-01-15T10:00:00Z"
}
```

### 📄 Relatórios

#### Gerar Relatório PDF
```http
POST /api/reports/generate/{wound_id}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "report_id": "uuid",
  "pdf_base64": "JVBERi0xLjQK..."
}
```

### 💬 Chat

#### Enviar Mensagem
```http
POST /api/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Qual é o melhor curativo para feridas com umidade moderada?",
  "sessionId": "uuid_opcional"
}
```

### 📊 Dashboard

#### Estatísticas
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "total_patients": 25,
  "total_analyses": 150,
  "total_reports": 120,
  "upcoming_appointments": [...]
}
```

---

## 🛠️ Tecnologias

### Backend
- **Spring Boot 3.3** - Framework principal
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência PostgreSQL
- **Spring Data MongoDB** - Persistência MongoDB
- **JJWT** - Tokens JWT
- **BCrypt** - Hash de senhas
- **PDFBox** - Geração de relatórios PDF
- **RestTemplate** - Integração com Google Gemini API

### Frontend
- **React 18** - Biblioteca UI
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos e visualizações
- **date-fns** - Manipulação de datas
- **i18next** - Internacionalização (pt/en)

### Mobile
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **Expo Image Picker** - Seleção de imagens
- **Expo Camera** - Captura de fotos
- **AsyncStorage** - Armazenamento local

### Banco de Dados
- **PostgreSQL** - Dados relacionais (users, patients, appointments)
- **MongoDB** - Documentos (wound analyses, reports, chat)

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Nginx** - Reverse proxy e servidor web
- **GitHub Actions** - CI/CD

### Inteligência Artificial
- **Google Gemini 2.0 Flash** - Análise de imagens e comparação

---

## 📁 Estrutura do Projeto

```
HealPlus_web/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/healplus/
│           │   ├── HealPlusApplication.java
│           │   ├── config/
│           │   │   └── SecurityConfig.java
│           │   ├── controllers/
│           │   │   ├── AuthController.java
│           │   │   ├── PatientsController.java
│           │   │   ├── WoundsController.java      # Com IA
│           │   │   ├── ReportsController.java
│           │   │   ├── ChatController.java
│           │   │   ├── DashboardController.java
│           │   │   └── AppointmentsController.java
│           │   ├── services/
│           │   │   └── AIService.java            # Integração Gemini
│           │   ├── entities/                      # JPA - PostgreSQL
│           │   │   ├── User.java
│           │   │   ├── Patient.java
│           │   │   └── Appointment.java
│           │   ├── documents/                     # MongoDB
│           │   │   ├── WoundAnalysis.java
│           │   │   ├── Report.java
│           │   │   └── ChatMessage.java
│           │   ├── dto/
│           │   │   ├── AuthDtos.java
│           │   │   ├── PatientDtos.java
│           │   │   ├── WoundDtos.java
│           │   │   └── AIDtos.java               # DTOs para IA
│           │   ├── repositories/
│           │   │   ├── UserRepository.java
│           │   │   ├── PatientRepository.java
│           │   │   ├── AppointmentRepository.java
│           │   │   └── mongo/
│           │   │       ├── WoundAnalysisRepository.java
│           │   │       ├── ReportRepository.java
│           │   │       └── ChatMessageRepository.java
│           │   └── security/
│           │       ├── JwtUtil.java
│           │       └── JwtAuthFilter.java
│           └── resources/
│               └── application.yml
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       ├── components/
│       │   ├── Button.js
│       │   ├── Input.js
│       │   ├── Card.js
│       │   ├── Modal.js
│       │   ├── Alert.js
│       │   ├── Loading.js
│       │   ├── Layout.js
│       │   ├── Navbar.js
│       │   ├── Sidebar.js
│       │   └── dashboard/
│       │       ├── ActivitySummaryChart.js    # Gráfico de atividades
│       │       ├── AgendaView.js              # Calendário
│       │       └── NotificationsPanel.js     # Notificações
│       ├── pages/
│       │   ├── LandingPage.js
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js             # Dashboard completo
│       │   ├── PatientsPage.js
│       │   ├── AssessmentsPage.js
│       │   ├── ChatPage.js
│       │   └── ReportsPage.js
│       ├── contexts/
│       │   ├── AuthContext.js
│       │   └── SettingsContext.js
│       ├── services/
│       │   └── api.js
│       └── i18n/
│           ├── config.js
│           └── locales/
│               ├── pt.json
│               └── en.json
│
├── mobile/                          # App Mobile React Native
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── src/
│       ├── screens/
│       │   ├── auth/
│       │   │   ├── LoginScreen.js
│       │   │   └── RegisterScreen.js
│       │   └── main/
│       │       ├── DashboardScreen.js
│       │       ├── PatientsScreen.js
│       │       ├── AssessmentsScreen.js
│       │       ├── ChatScreen.js
│       │       └── ReportsScreen.js
│       ├── navigation/
│       │   └── AppNavigator.js
│       ├── contexts/
│       │   └── AuthContext.js
│       └── services/
│           └── api.js
│
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
└── README.md
```

---

## 🔒 Segurança

- ✅ **JWT** com expiração configurável
- ✅ **BCrypt** para hash de senhas
- ✅ **CORS** configurável por ambiente
- ✅ **Validação** com Bean Validation
- ✅ **Autenticação** obrigatória para endpoints protegidos
- ✅ **Sanitização** de dados de entrada

---

## 🧪 Testes

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```

---

## 📝 Variáveis de Ambiente

### Backend (.env ou application.yml)

```yaml
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/heal_plus_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/heal_plus_db

# Security
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRATION_HOURS=168

# CORS
CORS_ORIGINS=http://localhost:3000

# AI (Opcional)
GEMINI_API_KEY=sua_chave_gemini_aqui
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_DEMO_MODE=false
```

---

## 🚀 Deploy em Produção

### Docker Compose

```bash
# Configure as variáveis de ambiente
export GEMINI_API_KEY=sua_chave
export JWT_SECRET=chave_secreta_forte

# Inicie os serviços
docker-compose up -d

# Verifique os logs
docker-compose logs -f
```

### Nginx (Produção)

O projeto inclui configuração Nginx para:
- Reverse proxy para o backend
- Servir arquivos estáticos do frontend
- Configuração de SSL (adicionar certificados)

---

## 📊 Status do Projeto

- [x] Backend Spring Boot completo
- [x] Frontend React com dashboard expandido
- [x] Autenticação JWT
- [x] Gestão de pacientes
- [x] Análise de feridas com IA (Google Gemini)
- [x] Comparação de imagens e relatórios
- [x] Relatórios PDF
- [x] Chat com histórico
- [x] Agenda e dashboard interativo
- [x] Gráficos e visualizações
- [x] Notificações
- [x] Docker & Docker Compose
- [x] CI/CD com GitHub Actions
- [x] Documentação completa

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. 🍴 Faça um Fork do projeto
2. 🌿 Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔄 Abra um Pull Request

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

---

## 📞 Suporte

Para suporte, dúvidas ou sugestões:

- 📧 **Email**: contato@healplus.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/pedrotescaro/HealPlus_web/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/pedrotescaro/HealPlus_web/discussions)

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- Comunidade Open Source
- Spring Boot Community
- React Community
- Google Gemini API
- PostgreSQL e MongoDB

---

<div align="center">

**Desenvolvido com ❤️ pela equipe Heal+**

![Made with](https://img.shields.io/badge/made%20with-❤️-red?style=for-the-badge)
![Powered by](https://img.shields.io/badge/powered%20by-Spring%20Boot%20%7C%20React-green?style=for-the-badge)

</div>
