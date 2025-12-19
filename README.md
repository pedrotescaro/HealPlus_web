<div align="center">

# 🏥 HealPlus

### Plataforma Inteligente de Gestão e Análise de Feridas com IA

[![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge&logo=checkmarx&logoColor=white)](/)
[![Version](https://img.shields.io/badge/Version-3.0.0-blue?style=for-the-badge&logo=semver&logoColor=white)](/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

<br/>

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![DeepLearning4J](https://img.shields.io/badge/DL4J-ML_Engine-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="linha" width="100%"/>

**🚀 Sistema completo para profissionais de saúde com Machine Learning proprietário para análise de feridas**

[Funcionalidades](#-funcionalidades) •
[Instalação](#-instalação) •
[IA & Machine Learning](#-inteligência-artificial--machine-learning) •
[API](#-documentação-da-api) •
[Contribuição](#-contribuição)

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="linha" width="100%"/>

</div>

<br/>

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
  - [Docker Compose (Recomendado)](#-docker-compose-recomendado)
  - [Script Automático](#-script-automático-quickstart)
  - [Desenvolvimento Local](#-desenvolvimento-local)
  - [Produção](#-deploy-em-produção)
- [IA & Machine Learning](#-inteligência-artificial--machine-learning)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API](#-documentação-da-api)
- [Contribuição](#-contribuição)

---

## 🎯 Sobre o Projeto

O **HealPlus** é uma plataforma web moderna e completa desenvolvida para **profissionais de saúde** gerenciarem e analisarem feridas de pacientes de forma eficiente e inteligente.

### ✨ Diferenciais

| 🧠 | **IA Proprietária** | Sistema de Machine Learning próprio com DeepLearning4J para análise de feridas |
|:--:|---------------------|-------------------------------------------------------------------------------|
| 📊 | **Análise Temporal** | Acompanhamento da evolução da ferida ao longo do tempo com gráficos e métricas |
| 🔍 | **XAI - IA Explicável** | Heatmaps e explicações detalhadas de como a IA chegou às conclusões |
| 📋 | **Anamnese Completa** | Formulário profissional com Escala de Braden, comorbidades, medicações |
| 🔐 | **Segurança** | Autenticação JWT com HttpOnly cookies, BCrypt, CSRF protection |
| 📱 | **100% Responsivo** | Interface adaptada para desktop, tablet e mobile |

---

## 🚀 Funcionalidades

<table>
<tr>
<td width="50%">

### 🤖 Análise com IA

- Segmentação automática de tecidos
- Classificação do tipo de ferida
- Identificação do estágio/grau
- Recomendações de tratamento
- Heatmaps de ativação (XAI)
- Análise multimodal (imagem + dados clínicos)

### 👨‍⚕️ Gestão de Pacientes

- Cadastro completo de pacientes
- Histórico de avaliações
- Prontuário digital
- Busca e filtros avançados

### 📊 Dashboard Inteligente

- Estatísticas em tempo real
- Gráficos interativos
- Agenda integrada
- Notificações

</td>
<td width="50%">

### 📝 Sistema de Avaliação

- Formulário TIMERS completo
- Escala de Braden integrada
- Avaliação de dor multidimensional
- Barra visual de tecidos
- Upload e validação de imagens
- Medição na imagem

### 📈 Evolução Temporal

- Gráficos de progressão
- Taxa de cicatrização
- Previsão de dias para cura
- Comparação entre avaliações
- Prognóstico automático

### 💬 Chat Assistente

- Suporte integrado
- Histórico de conversas
- Orientações rápidas

</td>
</tr>
</table>

---

## 🛠️ Tecnologias

<table>
<tr>
<td align="center" width="20%">

**Backend**

</td>
<td align="center" width="20%">

**Frontend**

</td>
<td align="center" width="20%">

**Machine Learning**

</td>
<td align="center" width="20%">

**Banco de Dados**

</td>
<td align="center" width="20%">

**DevOps**

</td>
</tr>
<tr>
<td>

- Java 17
- Spring Boot 3.3
- Spring Security
- Spring Data JPA
- Maven

</td>
<td>

- React 18
- Tailwind CSS
- Framer Motion
- React Router
- Axios

</td>
<td>

- DeepLearning4J
- ND4J
- CNN (ResNet-like)
- Image Processing
- Grad-CAM (XAI)

</td>
<td>

- PostgreSQL 16
- MongoDB 7.0
- Redis (cache)

</td>
<td>

- Docker
- Docker Compose
- Nginx
- GitHub Actions

</td>
</tr>
</table>

---

## 📦 Instalação

### Pré-requisitos

| Ferramenta | Versão Mínima | Uso |
|------------|---------------|-----|
| Docker | 20.10+ | Containers |
| Docker Compose | 2.0+ | Orquestração |
| Git | 2.30+ | Versionamento |
| Node.js | 18+ | Frontend (dev local) |
| JDK | 17+ | Backend (dev local) |
| Maven | 3.8+ | Build (dev local) |

---

### 🐳 Docker Compose (Recomendado)

A forma mais rápida e simples de rodar o projeto completo:

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/HealPlus_web.git
cd HealPlus_web

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. (Opcional) Edite as variáveis
nano .env

# 4. Inicie todos os serviços
docker-compose up -d

# 5. Acompanhe os logs
docker-compose logs -f
```

**🌐 Acesse:**

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost | Interface web |
| API | http://localhost/api | Backend REST |
| PostgreSQL | localhost:5432 | Banco relacional |
| MongoDB | localhost:27017 | Banco NoSQL |

**⏹️ Comandos úteis:**

```bash
# Parar os serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart backend

# Ver logs de um serviço
docker-compose logs -f backend

# Rebuild após alterações
docker-compose up -d --build

# Remover tudo (incluindo volumes)
docker-compose down -v --rmi all
```

---

### ⚡ Script Automático (Quickstart)

Para Linux/macOS, use o script de inicialização rápida:

```bash
# Torne o script executável
chmod +x quickstart.sh

# Execute
./quickstart.sh
```

O script irá:
1. ✅ Verificar pré-requisitos (Docker, Docker Compose)
2. ✅ Criar arquivo `.env` se não existir
3. ✅ Build das imagens
4. ✅ Iniciar todos os containers
5. ✅ Aguardar serviços ficarem saudáveis
6. ✅ Abrir o navegador automaticamente

---

### 💻 Desenvolvimento Local

Para desenvolvimento com hot-reload:

#### 🔧 Backend (Spring Boot)

**Linux/macOS:**
```bash
cd backend

# Opção 1: Com Maven Wrapper
./mvnw spring-boot:run

# Opção 2: Com Maven instalado
mvn spring-boot:run

# Opção 3: Compilar e executar JAR
mvn clean package -DskipTests
java -jar target/healplus-backend-*.jar
```

**Windows CMD:**
```cmd
cd backend

REM Opção 1: Com Maven Wrapper
mvnw.cmd spring-boot:run

REM Opção 2: Com Maven instalado
mvn spring-boot:run

REM Opção 3: Compilar e executar JAR
mvn clean package -DskipTests
java -jar target\healplus-backend-*.jar
```

**Windows PowerShell:**
```powershell
cd backend

# Opção 1: Com Maven Wrapper
.\mvnw.cmd spring-boot:run

# Opção 2: Com Maven instalado
mvn spring-boot:run

# Opção 3: Compilar e executar JAR
mvn clean package -DskipTests
java -jar (Get-ChildItem target\healplus-backend-*.jar).FullName
```

**Variáveis de ambiente necessárias:**

<details>
<summary>🐧 Linux/macOS</summary>

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/heal_plus_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
export SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/heal_plus_db
export JWT_SECRET=sua_chave_secreta_muito_segura_com_pelo_menos_32_caracteres
export GEMINI_API_KEY=sua_api_key_google_gemini
```

</details>

<details>
<summary>🪟 Windows PowerShell</summary>

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/heal_plus_db"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="postgres"
$env:SPRING_DATA_MONGODB_URI="mongodb://localhost:27017/heal_plus_db"
$env:JWT_SECRET="sua_chave_secreta_muito_segura_com_pelo_menos_32_caracteres"
$env:GEMINI_API_KEY="sua_api_key_google_gemini"
```

</details>

<details>
<summary>🪟 Windows CMD</summary>

```cmd
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/heal_plus_db
set SPRING_DATASOURCE_USERNAME=postgres
set SPRING_DATASOURCE_PASSWORD=postgres
set SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/heal_plus_db
set JWT_SECRET=sua_chave_secreta_muito_segura_com_pelo_menos_32_caracteres
set GEMINI_API_KEY=sua_api_key_google_gemini
```

</details>

---

#### ⚛️ Frontend (React)

```bash
cd frontend

# Instalar dependências
npm install

# Modo desenvolvimento (com hot-reload)
npm start

# Build para produção
npm run build

# Executar testes
npm test

# Executar testes com cobertura
npm test -- --coverage
```

**Variáveis de ambiente do frontend:**

Crie um arquivo `.env` na pasta `frontend`:

```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_DEMO_MODE=false
```

---

#### 🗄️ Banco de Dados Local

Se preferir não usar Docker para os bancos:

**PostgreSQL:**

```bash
# Linux
sudo -u postgres createdb heal_plus_db

# macOS com Homebrew
createdb heal_plus_db

# Windows (via psql)
psql -U postgres -c "CREATE DATABASE heal_plus_db;"
```

**MongoDB:**

```bash
# O MongoDB cria o banco automaticamente ao conectar
# Apenas inicie o serviço:

# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Windows
net start MongoDB
```

---

### 🚀 Deploy em Produção

#### Opção 1: Docker Compose em VPS

```bash
# 1. Clone na VPS
git clone https://github.com/seu-usuario/HealPlus_web.git
cd HealPlus_web

# 2. Configure as variáveis de produção
cp .env.example .env
nano .env  # Configure com valores seguros

# 3. Inicie em modo produção
docker-compose -f docker-compose.yml up -d

# 4. Configure SSL com Certbot (opcional)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

#### Opção 2: Deploy Manual

```bash
# Backend
cd backend
mvn clean package -Pprod -DskipTests
java -jar -Dspring.profiles.active=prod target/healplus-backend-*.jar

# Frontend (servir com Nginx)
cd frontend
npm run build
# Copie a pasta build para /var/www/html
```

#### Opção 3: Cloud Providers

Consulte o guia detalhado em [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md).

| Provider | Serviço Recomendado |
|----------|---------------------|
| AWS | ECS + RDS + DocumentDB |
| GCP | Cloud Run + Cloud SQL |
| Azure | App Service + Cosmos DB |
| DigitalOcean | App Platform + Managed DB |
| Heroku | Dynos + Add-ons |

---

### 📱 App Mobile (React Native)

```bash
cd mobile

# Instalar dependências
npm install

# Iniciar com Expo
npx expo start

# Executar no Android
npx expo start --android

# Executar no iOS
npx expo start --ios

# Build para produção
npx expo build:android
npx expo build:ios
```

---

## 🧠 Inteligência Artificial & Machine Learning

O HealPlus possui um **sistema de IA proprietário** desenvolvido com DeepLearning4J:

### Arquitetura do ML

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PIPELINE DE ANÁLISE DE FERIDAS                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐    │
│  │   IMAGEM    │───▶│ Preprocessor │───▶│ WoundClassifierNet  │    │
│  │  (Upload)   │    │  224x224 RGB │    │   CNN ResNet-like   │    │
│  └─────────────┘    └──────────────┘    └──────────┬──────────┘    │
│                                                     │               │
│                                                     ▼               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ANÁLISE MULTIMODAL                        │   │
│  ├─────────────────┬─────────────────┬─────────────────────────┤   │
│  │ Segmentação     │ Classificação   │ Dados Clínicos          │   │
│  │ de Tecidos      │ de Ferida       │ (Anamnese)              │   │
│  │                 │                 │                         │   │
│  │ • Granulação    │ • Tipo          │ • Comorbidades          │   │
│  │ • Epitelização  │ • Estágio       │ • Medicações            │   │
│  │ • Esfacelo      │ • Fase cura     │ • Idade, IMC            │   │
│  │ • Necrose       │                 │ • Braden Score          │   │
│  └────────┬────────┴────────┬────────┴────────────┬────────────┘   │
│           │                 │                     │                │
│           ▼                 ▼                     ▼                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              EXPLAINABLE AI (XAI) SERVICE                   │   │
│  │  • Grad-CAM Heatmaps  • Regiões de Interesse  • Narrativa  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                     │
│                              ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   RESULTADO FINAL                            │   │
│  │  • Score de Cicatrização    • Recomendações Personalizadas  │   │
│  │  • Análise de Riscos        • Prognóstico                   │   │
│  │  • Disclaimer Legal         • Explicação da IA              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Serviços de ML

| Serviço | Descrição |
|---------|-----------|
| **WoundMLService** | Classificação e segmentação de tecidos |
| **WoundTemporalAnalysisService** | Análise de evolução temporal |
| **MultimodalWoundAnalysisService** | Integração imagem + dados clínicos |
| **ExplainableAIService** | Heatmaps Grad-CAM e explicações |

### Tipos de Tecido Detectados

| Tecido | Cor | Significado |
|--------|-----|-------------|
| 🔴 Granulação | Vermelho vivo | Tecido saudável de cicatrização |
| 🩷 Epitelização | Rosa | Novo tecido epitelial |
| 🟡 Esfacelo | Amarelo | Tecido desvitalizado |
| ⚫ Necrose | Preto/Marrom | Tecido morto |
| 🔵 Hipergranulação | Vermelho escuro | Granulação excessiva |
| 🟤 Fibrina | Creme | Película fibrosa |

---

## 📁 Estrutura do Projeto

```
HealPlus_web/
├── 📁 backend/                    # API Spring Boot
│   ├── 📁 src/main/java/com/healplus/
│   │   ├── 📁 config/            # Configurações
│   │   ├── 📁 controller/        # Controllers REST
│   │   ├── 📁 model/             # Entidades JPA
│   │   ├── 📁 repository/        # Repositórios
│   │   ├── 📁 service/           # Lógica de negócio
│   │   ├── 📁 security/          # JWT, Auth
│   │   └── 📁 ml/                # Machine Learning
│   ├── 📁 src/main/resources/
│   │   ├── application.yml
│   │   └── application-*.yml
│   └── pom.xml
│
├── 📁 frontend/                   # React SPA
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes reutilizáveis
│   │   │   └── 📁 anamnesis/     # Formulários de anamnese
│   │   ├── 📁 pages/             # Páginas da aplicação
│   │   ├── 📁 contexts/          # React Contexts
│   │   ├── 📁 services/          # API calls
│   │   └── 📁 i18n/              # Internacionalização
│   ├── package.json
│   └── tailwind.config.js
│
├── 📁 mobile/                     # App React Native
│   ├── 📁 src/
│   └── app.json
│
├── 📄 docker-compose.yml          # Orquestração Docker
├── 📄 Dockerfile.backend          # Build do backend
├── 📄 Dockerfile.frontend         # Build do frontend
├── 📄 nginx.conf                  # Configuração Nginx
├── 📄 quickstart.sh               # Script de inicialização
└── 📄 README.md                   # Este arquivo
```

---

## 📚 Documentação da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Registrar novo usuário |
| `POST` | `/api/auth/login` | Fazer login |
| `POST` | `/api/auth/logout` | Fazer logout |
| `POST` | `/api/auth/refresh` | Renovar token |

### Pacientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/patients` | Listar pacientes |
| `GET` | `/api/patients/{id}` | Buscar paciente |
| `POST` | `/api/patients` | Criar paciente |
| `PUT` | `/api/patients/{id}` | Atualizar paciente |
| `DELETE` | `/api/patients/{id}` | Remover paciente |

### Análise de Feridas (ML)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/ml/analyze` | Análise básica de imagem |
| `POST` | `/api/ml/analyze/complete` | Análise completa (multimodal + XAI) |
| `POST` | `/api/ml/analyze/multimodal` | Análise com dados clínicos |
| `GET` | `/api/ml/analyze/temporal/{patientId}` | Evolução temporal |
| `POST` | `/api/ml/explain` | Explicação detalhada da IA |

### Avaliações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/wounds/patient/{id}` | Avaliações do paciente |
| `POST` | `/api/wounds/analyze` | Nova avaliação |
| `POST` | `/api/wounds/compare-images` | Comparar imagens |

---

## 🧪 Testes

```bash
# Backend - Testes unitários e integração
cd backend
mvn test

# Frontend - Testes com Jest
cd frontend
npm test

# Coverage
npm test -- --coverage
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

```bash
# 1. Fork o projeto
# 2. Crie sua branch
git checkout -b feature/MinhaFeature

# 3. Commit suas mudanças
git commit -m 'feat: Adiciona MinhaFeature'

# 4. Push para a branch
git push origin feature/MinhaFeature

# 5. Abra um Pull Request
```

---

## 📞 Suporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/pedrotescaro/HealPlus_web/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/pedrotescaro/HealPlus_web/discussions)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Pedro Tescaro** - *Desenvolvedor Principal* - [GitHub](https://github.com/pedrotescaro)

---

## 🙏 Agradecimentos

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [DeepLearning4J](https://deeplearning4j.konduit.ai/)
- [Tailwind CSS](https://tailwindcss.com/)
- Comunidade Open Source

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

<br/>

Feito com ❤️ para profissionais de saúde

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="linha" width="100%"/>

</div>
