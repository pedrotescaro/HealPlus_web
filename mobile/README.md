<div align="center">

# 📱 HealPlus Mobile

![Status](https://img.shields.io/badge/status-production_ready-success?style=for-the-badge&logo=check-circle)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

![React Native](https://img.shields.io/badge/React_Native-0.73-61DAFB?style=flat-square&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-50.0-000020?style=flat-square&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

**Aplicativo mobile React Native para a plataforma HealPlus**  
*Sistema Inteligente de Gestão e Análise de Feridas*

[🚀 Instalação](#-instalação-rápida) • [✨ Funcionalidades](#-funcionalidades) • [📖 Documentação](#-documentação) • [🔧 Tecnologias](#-tecnologias)

</div>

---

## 📋 Sobre o Projeto

O **HealPlus Mobile** é a versão mobile nativa da plataforma HealPlus, desenvolvida com **React Native** e **Expo**. O aplicativo permite que profissionais de saúde gerenciem pacientes, realizem análises de feridas com IA, gerem relatórios e interajam com o assistente virtual, tudo diretamente do celular.

### 🎯 Destaques

- ✨ **Interface Moderna** - Design intuitivo e responsivo
- 🚀 **Performance Otimizada** - Navegação fluida e rápida
- 🔒 **Seguro** - Autenticação JWT e armazenamento seguro
- 📸 **Câmera Integrada** - Capture fotos diretamente do app
- 🤖 **IA Integrada** - Análise de feridas com Google Gemini
- 🔄 **Sincronização** - Dados sincronizados com a versão web

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Login seguro com email e senha
- ✅ Registro de novos usuários
- ✅ Modo visitante (demo)
- ✅ Armazenamento seguro de tokens

### 📊 Dashboard
- ✅ Visão geral de estatísticas
- ✅ Cards informativos com métricas
- ✅ Próximos compromissos
- ✅ Ações rápidas para acesso direto

### 👥 Gestão de Pacientes
- ✅ Listagem completa de pacientes
- ✅ Busca e filtros
- ✅ Cadastro de novos pacientes
- ✅ Visualização de detalhes

### 📸 Análise de Feridas
- ✅ Captura de fotos com câmera
- ✅ Seleção de imagens da galeria
- ✅ Análise com IA (Google Gemini)
- ✅ Resultados detalhados da análise
- ✅ Associação com pacientes

### 💬 Chat Assistente
- ✅ Conversa com assistente "Zelo"
- ✅ Histórico de mensagens
- ✅ Interface de chat moderna
- ✅ Suporte em tempo real

### 📄 Relatórios
- ✅ Listagem de relatórios gerados
- ✅ Download de PDFs
- ✅ Compartilhamento de relatórios
- ✅ Histórico completo

### 🔔 Notificações
- ✅ Acompanhamento de compromissos
- ✅ Atividades recentes
- ✅ Alertas importantes

## 🚀 Instalação Rápida

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Ferramenta | Versão | Link |
|------------|--------|------|
| **Node.js** | 18+ | [Download](https://nodejs.org/) |
| **npm** ou **yarn** | Latest | Incluído com Node.js |
| **Expo CLI** | Latest | `npm install -g expo-cli` |
| **Expo Go** | Latest | [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |

> ⚠️ **Importante**: O backend HealPlus deve estar rodando. Veja o [README principal](../README.md) para mais detalhes.

---

### 📦 Passo a Passo

#### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/pedrotescaro/HealPlus_web.git
cd HealPlus_web/mobile
```

#### 2️⃣ Instale as Dependências

```bash
npm install
# ou
yarn install
```

#### 3️⃣ Configure as Variáveis de Ambiente

Crie um arquivo `.env` na pasta `mobile/`:

```env
# URL do Backend
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# Modo Demo (true/false)
EXPO_PUBLIC_DEMO_MODE=false
```

> 💡 **Dica**: Para Android, use o IP da sua máquina ao invés de `localhost`:
> ```env
> EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:8001
> ```

#### 4️⃣ Inicie o Servidor

```bash
npm start
# ou
yarn start
```

#### 5️⃣ Execute no Dispositivo

| Plataforma | Comando | Ação |
|------------|---------|------|
| **Android** | Pressione `a` | Ou escaneie o QR code com Expo Go |
| **iOS** | Pressione `i` | Ou escaneie o QR code com a câmera |
| **Web** | Pressione `w` | Abre no navegador |

---

### 🎯 Quick Start (Comandos Rápidos)

```bash
# Instalação completa
cd mobile && npm install && npm start

# Com modo demo (sem backend)
EXPO_PUBLIC_DEMO_MODE=true npm start
```

## 📱 Executando no Dispositivo

### 🎮 Usando Expo Go (Recomendado)

> ⚡ **Mais rápido para desenvolvimento** - Teste imediatamente sem build!

1. 📥 Instale o **Expo Go**:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Play Store (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 🚀 Execute o servidor:
   ```bash
   npm start
   ```

3. 📷 Escaneie o QR code:
   - **iOS**: Use a câmera nativa do iPhone
   - **Android**: Use o app Expo Go

### 🏗️ Build de Produção

Para gerar builds de produção (APK/IPA):

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Configurar projeto
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

> 📝 **Nota**: Requer conta Expo e configuração do EAS (Expo Application Services).  
> 📚 Veja a [documentação do EAS](https://docs.expo.dev/build/introduction/) para mais detalhes.

## 🏗️ Estrutura do Projeto

```
mobile/
├── 📱 App.js                    # Componente raiz da aplicação
├── ⚙️ app.json                  # Configuração do Expo
├── 📦 package.json             # Dependências do projeto
├── 🔧 babel.config.js          # Configuração do Babel
├── 🚂 metro.config.js          # Configuração do Metro bundler
├── 📖 README.md                # Documentação
│
└── 📂 src/
    ├── 🎭 contexts/             # Contextos React
    │   └── AuthContext.js       # Contexto de autenticação
    │
    ├── 🧭 navigation/           # Navegação
    │   └── AppNavigator.js      # Configuração de rotas
    │
    ├── 📱 screens/              # Telas do aplicativo
    │   ├── 🔐 auth/
    │   │   ├── LoginScreen.js   # Tela de login
    │   │   └── RegisterScreen.js # Tela de registro
    │   │
    │   └── 🏠 main/
    │       ├── DashboardScreen.js    # Dashboard principal
    │       ├── PatientsScreen.js     # Gestão de pacientes
    │       ├── AssessmentsScreen.js # Análise de feridas
    │       ├── ChatScreen.js        # Chat com assistente
    │       └── ReportsScreen.js     # Relatórios
    │
    └── 🌐 services/             # Serviços de API
        └── api.js                # Cliente HTTP e serviços
```

### 📊 Organização

| Pasta | Descrição | Arquivos |
|-------|-----------|----------|
| `contexts/` | Gerenciamento de estado global | AuthContext |
| `navigation/` | Configuração de rotas | AppNavigator |
| `screens/` | Telas da aplicação | 7 telas |
| `services/` | Comunicação com backend | api.js |

## 🔧 Tecnologias

### 🎨 Frontend Mobile

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Native** | 0.73 | Framework mobile |
| **Expo** | 50.0 | Plataforma de desenvolvimento |
| **React Navigation** | 6.x | Navegação entre telas |
| **Axios** | 1.6 | Cliente HTTP |
| **AsyncStorage** | 1.21 | Armazenamento local |
| **date-fns** | 2.30 | Manipulação de datas |

### 📸 Recursos Nativos

| Módulo | Descrição |
|--------|-----------|
| **Expo Image Picker** | Seleção de imagens da galeria |
| **Expo Camera** | Captura de fotos com câmera |
| **Expo Vector Icons** | Biblioteca de ícones |

### 🎯 Principais Bibliotecas

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native-stack": "^6.9.17",
    "axios": "^1.6.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "expo-image-picker": "~14.7.1",
    "expo-camera": "~14.0.0"
  }
}
```

## 🔌 Integração com Backend

O aplicativo se conecta ao **mesmo backend** da versão web, garantindo sincronização total dos dados.

### ⚙️ Configuração

```env
# Arquivo .env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

### 🔐 Autenticação

- **Método**: JWT (JSON Web Tokens)
- **Armazenamento**: AsyncStorage (seguro e persistente)
- **Renovação**: Automática via interceptors

### 📡 Endpoints Utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Autenticação |
| `POST` | `/api/auth/register` | Registro de usuário |
| `GET` | `/api/auth/me` | Dados do usuário |
| `GET` | `/api/patients` | Listar pacientes |
| `POST` | `/api/patients` | Criar paciente |
| `POST` | `/api/wounds/analyze` | Analisar ferida |
| `POST` | `/api/chat` | Enviar mensagem |
| `GET` | `/api/dashboard/stats` | Estatísticas |

### 🔄 Sincronização

✅ Dados sincronizados em tempo real  
✅ Cache local para performance  
✅ Pull-to-refresh em todas as listas  
✅ Tratamento de erros de conexão

## 📸 Permissões

O aplicativo solicita as seguintes permissões do dispositivo:

| Permissão | Uso | Quando é solicitada |
|-----------|-----|---------------------|
| 📷 **Câmera** | Capturar fotos de feridas | Ao acessar análise de feridas |
| 🖼️ **Galeria** | Selecionar imagens existentes | Ao escolher imagem da galeria |
| 💾 **Armazenamento** | Salvar relatórios e imagens | Ao baixar relatórios |

> ℹ️ Todas as permissões são solicitadas apenas quando necessárias e podem ser revogadas nas configurações do dispositivo.

## 🐛 Troubleshooting

### ❌ Problemas Comuns

#### 🔴 Erro de Conexão com Backend

**Sintomas**: App não consegue conectar ao backend

**Soluções**:
```bash
# 1. Verifique se o backend está rodando
curl http://localhost:8001/api/health

# 2. Para Android, use o IP da máquina
# Encontre seu IP:
# Windows: ipconfig
# Mac/Linux: ifconfig
# Use: http://192.168.1.XXX:8001

# 3. Verifique o firewall
# Certifique-se de que a porta 8001 está aberta
```

#### 🔴 Erro ao Instalar Dependências

**Sintomas**: `npm install` falha ou erros de dependências

**Solução**:
```bash
# Limpe tudo e reinstale
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

#### 🔴 App não Abre no Dispositivo

**Sintomas**: QR code não funciona ou app não carrega

**Soluções**:
- ✅ Certifique-se de que dispositivo e computador estão na **mesma rede Wi-Fi**
- ✅ Para Android, tente:
  ```bash
  adb reverse tcp:8001 tcp:8001
  ```
- ✅ Reinicie o servidor Expo: `npm start -- --clear`
- ✅ Reinstale o Expo Go no dispositivo

#### 🔴 Erro de Permissões

**Sintomas**: Câmera ou galeria não abrem

**Solução**:
- Vá em **Configurações** do dispositivo
- Encontre **Expo Go** ou **HealPlus**
- Ative as permissões de **Câmera** e **Armazenamento**

### 📞 Ainda com Problemas?

- 📖 Consulte a [documentação do Expo](https://docs.expo.dev/)
- 🐛 Abra uma [issue no GitHub](https://github.com/pedrotescaro/HealPlus_web/issues)
- 💬 Entre em contato com a equipe de desenvolvimento

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | 🚀 Inicia o servidor de desenvolvimento |
| `npm run android` | 🤖 Executa no Android |
| `npm run ios` | 🍎 Executa no iOS |
| `npm run web` | 🌐 Executa no navegador |

### 🎯 Comandos Úteis

```bash
# Iniciar com cache limpo
npm start -- --clear

# Iniciar em modo tunnel (para testar remotamente)
npm start -- --tunnel

# Ver logs do dispositivo
npx react-native log-android  # Android
npx react-native log-ios       # iOS
```

## 🤝 Contribuindo

Contribuições são **muito bem-vindas**! 🎉

### 📋 Processo

1. 🍴 Faça um **fork** do projeto
2. 🌿 Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaFeatureIncrivel
   ```
3. 💻 Faça suas **alterações**
4. ✅ **Commit** suas mudanças:
   ```bash
   git commit -m 'feat: Adiciona feature incrível'
   ```
5. 📤 **Push** para a branch:
   ```bash
   git push origin feature/MinhaFeatureIncrivel
   ```
6. 🔄 Abra um **Pull Request**

### 📝 Padrões de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

## 🔗 Links Úteis

### 📚 Documentação

| Recurso | Link |
|---------|------|
| 📖 Expo Docs | [docs.expo.dev](https://docs.expo.dev/) |
| ⚛️ React Native | [reactnative.dev](https://reactnative.dev/) |
| 🧭 React Navigation | [reactnavigation.org](https://reactnavigation.org/) |
| 📦 Expo Vector Icons | [expo.github.io/vector-icons](https://expo.github.io/vector-icons/) |

### 🛠️ Ferramentas

- [Expo Snack](https://snack.expo.dev/) - Teste código online
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger) - Debug avançado
- [Flipper](https://fbflipper.com/) - Ferramenta de debug

---

## 📞 Suporte

### 🆘 Precisa de Ajuda?

- 🐛 **Bugs**: Abra uma [issue no GitHub](https://github.com/pedrotescaro/HealPlus_web/issues)
- 💡 **Sugestões**: Use [GitHub Discussions](https://github.com/pedrotescaro/HealPlus_web/discussions)
- 📧 **Email**: Entre em contato com a equipe

### ⭐ Gostou do Projeto?

Deixe uma ⭐ no repositório! Isso nos ajuda muito! 🙏

---

<div align="center">

**Desenvolvido com ❤️ para profissionais de saúde**

[⬆ Voltar ao topo](#-healplus-mobile)

</div>

