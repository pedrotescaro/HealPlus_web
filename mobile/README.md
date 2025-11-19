# 📱 HealPlus Mobile

Aplicativo mobile React Native para a plataforma HealPlus - Sistema Inteligente de Gestão e Análise de Feridas.

## 📋 Sobre o Projeto

O **HealPlus Mobile** é a versão mobile da plataforma HealPlus, desenvolvida com React Native e Expo. O aplicativo permite que profissionais de saúde gerenciem pacientes, realizem análises de feridas com IA, gerem relatórios e interajam com o assistente virtual, tudo diretamente do celular.

## ✨ Funcionalidades

- 🔐 **Autenticação**: Login e registro de usuários
- 📊 **Dashboard**: Visão geral de estatísticas e atividades
- 👥 **Gestão de Pacientes**: Cadastro, listagem e busca de pacientes
- 📸 **Análise de Feridas**: Captura e análise de imagens com IA
- 💬 **Chat Assistente**: Conversa com assistente virtual "Zelo"
- 📄 **Relatórios**: Visualização e download de relatórios gerados
- 🔔 **Notificações**: Acompanhamento de compromissos e atividades

## 🚀 Instalação

### Pré-requisitos

- **Node.js** 18+ instalado
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- Backend HealPlus rodando (veja o README principal do projeto)

### Passos para Instalação

1. **Clone o repositório** (se ainda não tiver):
```bash
git clone https://github.com/pedrotescaro/HealPlus_web.git
cd HealPlus_web
```

2. **Navegue para a pasta mobile**:
```bash
cd mobile
```

3. **Instale as dependências**:
```bash
npm install
# ou
yarn install
```

4. **Configure as variáveis de ambiente**:
   
   Crie um arquivo `.env` na pasta `mobile/` com:
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
EXPO_PUBLIC_DEMO_MODE=false
```

   **Nota**: Para desenvolvimento local, você pode precisar usar o IP da sua máquina ao invés de `localhost`:
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:8001
```

5. **Inicie o servidor de desenvolvimento**:
```bash
npm start
# ou
yarn start
```

6. **Execute no dispositivo**:
   - **Android**: Pressione `a` no terminal ou escaneie o QR code com o app Expo Go
   - **iOS**: Pressione `i` no terminal ou escaneie o QR code com a câmera do iPhone
   - **Web**: Pressione `w` no terminal

## 📱 Executando no Dispositivo

### Usando Expo Go (Recomendado para desenvolvimento)

1. Instale o app **Expo Go** na App Store (iOS) ou Google Play (Android)
2. Execute `npm start` no terminal
3. Escaneie o QR code que aparece no terminal com:
   - **iOS**: Câmera nativa do iPhone
   - **Android**: App Expo Go

### Build de Produção

Para gerar um build de produção:

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

**Nota**: Requer conta Expo e configuração do EAS (Expo Application Services).

## 🏗️ Estrutura do Projeto

```
mobile/
├── App.js                 # Componente raiz
├── app.json              # Configuração do Expo
├── package.json          # Dependências
├── babel.config.js       # Configuração do Babel
└── src/
    ├── contexts/         # Contextos React (Auth, etc)
    │   └── AuthContext.js
    ├── navigation/       # Configuração de navegação
    │   └── AppNavigator.js
    ├── screens/          # Telas do aplicativo
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   └── RegisterScreen.js
    │   └── main/
    │       ├── DashboardScreen.js
    │       ├── PatientsScreen.js
    │       ├── AssessmentsScreen.js
    │       ├── ChatScreen.js
    │       └── ReportsScreen.js
    └── services/         # Serviços de API
        └── api.js
```

## 🔧 Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local
- **Expo Image Picker** - Seleção de imagens
- **Expo Camera** - Captura de fotos
- **date-fns** - Manipulação de datas
- **@expo/vector-icons** - Ícones

## 🔌 Integração com Backend

O aplicativo se conecta ao mesmo backend da versão web:

- **URL Base**: Configurada via `EXPO_PUBLIC_BACKEND_URL`
- **Autenticação**: JWT tokens armazenados no AsyncStorage
- **Endpoints**: Mesmos endpoints da API REST do backend

### Endpoints Principais

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/patients` - Listar pacientes
- `POST /api/wounds/analyze` - Analisar ferida
- `POST /api/chat` - Enviar mensagem ao chat
- `GET /api/dashboard/stats` - Estatísticas do dashboard

## 📸 Permissões Necessárias

O aplicativo solicita as seguintes permissões:

- **Câmera**: Para capturar fotos de feridas
- **Galeria**: Para selecionar imagens existentes
- **Armazenamento**: Para salvar relatórios e imagens

## 🐛 Troubleshooting

### Erro de conexão com backend

- Verifique se o backend está rodando
- Confirme a URL no arquivo `.env`
- Para Android, use o IP da máquina ao invés de `localhost`
- Verifique se o firewall não está bloqueando a conexão

### Erro ao instalar dependências

```bash
# Limpe o cache e reinstale
rm -rf node_modules
npm cache clean --force
npm install
```

### Erro ao executar no dispositivo

- Certifique-se de que o dispositivo e o computador estão na mesma rede Wi-Fi
- Para Android, tente usar `adb reverse tcp:8001 tcp:8001` para redirecionar a porta

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run web` - Executa no navegador

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🔗 Links Úteis

- [Documentação do Expo](https://docs.expo.dev/)
- [Documentação do React Native](https://reactnative.dev/)
- [Documentação do React Navigation](https://reactnavigation.org/)

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

---

Desenvolvido com ❤️ para profissionais de saúde

