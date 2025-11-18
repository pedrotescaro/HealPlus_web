<div align="center">

# 🏥 Heal+ - Plataforma de Gestão e Análise de Feridas

![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Java](https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A plataforma inteligente para gestão e análise de feridas com tecnologia de ponta**

[🚀 Funcionalidades](#-funcionalidades) • [⚙️ Instalação](#-instalação) • [🔧 Tecnologias](#-tecnologias) • [📂 Estrutura](#-estrutura-do-projeto)

</div>

---

## 📋 Sobre o Projeto

O **Heal+** é uma plataforma web moderna com backend em **Spring Boot** e frontend em **React**, que oferece uma solução completa para profissionais de saúde gerenciarem e analisarem feridas de pacientes. Com suporte a **TIMERS**, **relatórios PDF**, **agenda** e **chat**, a solução é containerizada com **Docker** e utiliza **PostgreSQL** (entidades principais) e **MongoDB** (documentos analíticos).

---

## ✨ Funcionalidades

### 🎯 Principais Recursos

| Funcionalidade | Descrição |
|--------------|-----------|
| 🤖 Análise | Persistência da análise de ferida com TIMERS |
| 📊 Relatórios | Geração de relatórios PDF a partir das análises |
| 👨‍⚕️ Pacientes | Cadastro e listagem de pacientes |
| 🗓️ Agenda | Agendamentos e visualização no dashboard |
| 🔐 Autenticação | JWT com expiração, senha com BCrypt |
| 💬 Chat | Histórico de mensagens por sessão |

### 📝 Sistema de Avaliação TIMERS

- Tecido, Infecção, Umidade, Bordas, Reparo, Social
- Registro de dimensões e observações clínicas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Nginx)             │
│         Components, Pages, Services, Contextos           │
└────────────┬────────────────────────────────────────────┘
             │
             │ HTTP (Nginx proxy /api → backend:8080)
             │
┌────────────▼────────────────────────────────────────────┐
│              BACKEND (Spring Boot 3, Java 17)           │
│  Auth | Patients | Wounds | Reports | Chat | Appoints   │
└────────────┬────────────────────────────────────────────┘
             │
      ┌──────┴─────────┐
      │                │
┌─────▼───────┐  ┌─────▼────────────────────────┐
│ PostgreSQL  │  │ MongoDB                       │
│ Users,      │  │ WoundAnalysis, Reports, Chat │
│ Patients,   │  │                                │
│ Appointments│  │                                │
└─────────────┘  └────────────────────────────────┘
```

---

## 🚀 Instalação

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento do frontend)
- JDK 17 (para rodar local sem Docker)

### Com Docker (recomendado)

```bash
git clone https://github.com/pedrotescaro/HealPlus_web.git
cd HealPlus_web
docker-compose up -d
```

- Frontend: `http://localhost`
- API: `http://localhost/api` (via Nginx → backend:8080)

### Local (sem Docker)

```bash
# Backend
mvn -f backend/pom.xml spring-boot:run

# Frontend
cd frontend && npm install && npm start
```

Configure variáveis através de `application.yml` ou env:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/heal_plus_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/heal_plus_db
JWT_SECRET=uma_chave_segura
```

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
    "createdAt": "2025-11-15T10:30:00Z"
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
  "sessionId": "uuid_opcional"
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

---

## 📁 Estrutura do Projeto

```
HealPlus_web/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/healplus/
│       │   ├── HealPlusApplication.java
│       │   ├── config/ (Security/CORS)
│       │   ├── controllers/ (REST /api/*)
│       │   ├── entities/ (JPA - Postgres)
│       │   ├── documents/ (Mongo)
│       │   ├── repositories/ (JPA/Mongo)
│       │   └── security/ (JWT)
│       └── main/resources/application.yml
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/api.js
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
├── .github/workflows/
│   ├── tests.yml
│   └── deploy.yml
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## 🛠️ Tecnologias

### Backend
- Spring Boot 3 (Web, Security, Validation)
- Spring Data JPA (PostgreSQL)
- Spring Data MongoDB
- JJWT (JWT), BCrypt
- PDFBox (relatórios PDF)

### Frontend
- React 18, React Router, Axios, Tailwind CSS
- i18n (pt, en)

### Banco de Dados
- PostgreSQL (users, patients, appointments)
- MongoDB (wound analyses, reports, chat)

---

## 🔒 Segurança

- JWT com expiração
- Hashing de senhas (BCrypt)
- CORS configurável
- Validação com Bean Validation

---

## 📝 Exemplo de Fluxo Completo

```
1. Usuário se registra/faz login
   └─> Recebe token JWT

2. Cria novo paciente
   └─> Salvo no PostgreSQL

3. Faz upload de foto da ferida
   └─> Dados TIMERS persistidos no MongoDB

4. Relatório é gerado em PDF
   └─> Base64 retornado para download

5. Consulta é agendada
   └─> Exibida no dashboard

6. Chat registra mensagens
   └─> Histórico por sessão
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através de:
- 📧 Email: contato@healplus.com
- 🐛 Issues: GitHub Issues

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo `LICENSE` para detalhes.

---

## 🙋 Autores

- Equipe Heal+

---

## 🙏 Agradecimentos

- Comunidade Open Source
- PostgreSQL
- MongoDB
- Spring Boot Community

---

## 📊 Status do Projeto

- [x] Backend Spring Boot
- [x] Autenticação JWT
- [x] Gestão de pacientes
- [x] Relatórios PDF
- [x] Chat (persistência)
- [x] Agenda/Dashboard
- [x] Frontend React com componentes reutilizáveis
- [x] Docker & Docker Compose
- [x] CI/CD com GitHub Actions

---

## 🚀 Quick Start

### Desenvolvimento Local

```bash
docker-compose up -d

# Frontend: http://localhost
# API: http://localhost/api
# PostgreSQL: localhost:5432
# MongoDB: localhost:27017
```

### Production Deploy

```bash
docker-compose -f docker-compose.yml up -d
```

### Rodar Testes

```bash
mvn -f backend/pom.xml test
cd frontend && npm test
```

---

**Desenvolvido com ❤️ pela equipe Heal+**