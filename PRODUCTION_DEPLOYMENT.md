# Guia de Deploy em Produção - HealPlus

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração do Servidor](#configuração-do-servidor)
- [Deploy com Docker](#deploy-com-docker)
- [Configuração SSL/TLS](#configuração-ssltls)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Monitoramento](#monitoramento)
- [Backup](#backup)

---

## 🔧 Pré-requisitos

### Servidor
- Ubuntu 20.04 LTS ou superior
- 4GB RAM mínimo
- 20GB espaço em disco
- Acesso SSH

### Software
- Docker (v20.10+)
- Docker Compose (v2.0+)
- Nginx (v1.18+)
- Git

### Instalação do Docker

```bash
# Atualizar repositórios
sudo apt-get update

# Instalar Docker
sudo apt-get install -y docker.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

---

## 🚀 Configuração do Servidor

### 1. Clonar Repositório

```bash
cd /var/www
sudo git clone https://github.com/pedrotescaro/HealPlus_web.git
cd HealPlus_web
```

### 2. Criar Arquivo de Configuração

```bash
sudo cp .env.example .env.production
sudo nano .env.production
```

Adicionar variáveis (ver seção abaixo)

### 3. Criar Diretórios Necessários

```bash
sudo mkdir -p /var/www/HealPlus_web/data/mongodb
sudo mkdir -p /var/www/HealPlus_web/logs
sudo chown -R $USER:$USER /var/www/HealPlus_web
```

### 4. Configurar Firewall

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

---

## 🐳 Deploy com Docker

### Usar docker-compose.prod.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - ./data/mongodb:/data/db
    networks:
      - heal_plus_network
    restart: always

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      MONGO_URL: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017
      DB_NAME: heal_plus_db
      JWT_SECRET: ${JWT_SECRET}
      EMERGENT_LLM_KEY: ${EMERGENT_LLM_KEY}
      GOOGLE_GENAI_KEY: ${GOOGLE_GENAI_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - mongodb
    networks:
      - heal_plus_network
    restart: always

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      REACT_APP_BACKEND_URL: ${BACKEND_URL}
    networks:
      - heal_plus_network
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    networks:
      - heal_plus_network
    restart: always

networks:
  heal_plus_network:
    driver: bridge
```

### Executar Deploy

```bash
# Construir imagens
docker-compose -f docker-compose.prod.yml build

# Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 🔐 Configuração SSL/TLS

### Usando Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot certonly --standalone -d seu_dominio.com -d www.seu_dominio.com

# Arquivos estarão em:
# /etc/letsencrypt/live/seu_dominio.com/

# Copiar para pasta do projeto
sudo cp /etc/letsencrypt/live/seu_dominio.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/seu_dominio.com/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*
```

### Renovação Automática

```bash
# Criar cron job
sudo crontab -e

# Adicionar:
0 2 * * * certbot renew --quiet && docker-compose -f /var/www/HealPlus_web/docker-compose.prod.yml restart nginx
```

---

## 🔑 Variáveis de Ambiente

### .env.production

```env
# Database
MONGO_USER=admin_user
MONGO_PASSWORD=very_secure_password_here
MONGO_URL=mongodb://admin_user:very_secure_password_here@mongodb:27017

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_change_this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168

# APIs
EMERGENT_LLM_KEY=your_emergent_key
GOOGLE_GENAI_KEY=your_google_gemini_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Frontend
REACT_APP_BACKEND_URL=https://api.seu_dominio.com

# CORS
CORS_ORIGINS=https://seu_dominio.com,https://www.seu_dominio.com

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# Ambiente
ENVIRONMENT=production
LOG_LEVEL=info
```

**Importante:** Nunca compartilhe o `.env.production` em repositórios!

---

## 📊 Monitoramento

### Verificar Saúde dos Serviços

```bash
# Criar script de verificação
cat > /usr/local/bin/check_healplus.sh << 'EOF'
#!/bin/bash

echo "Verificando HealPlus..."

# Backend
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "✓ Backend OK"
else
    echo "✗ Backend FALHOU"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✓ Frontend OK"
else
    echo "✗ Frontend FALHOU"
fi

# MongoDB
if docker exec heal_plus_db mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "✓ MongoDB OK"
else
    echo "✗ MongoDB FALHOU"
fi
EOF

chmod +x /usr/local/bin/check_healplus.sh
```

### Adicionar ao Cron

```bash
# Executar a cada 5 minutos
*/5 * * * * /usr/local/bin/check_healplus.sh
```

### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de serviço específico
docker-compose logs -f backend

# Limpar logs antigos
docker container prune -f
```

---

## 💾 Backup

### Backup Manual

```bash
# Criar script de backup
cat > /usr/local/bin/backup_healplus.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/healplus"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec heal_plus_db mongodump --out /data/backup/$DATE

# Copiar arquivos
cp -r /var/www/HealPlus_web/data/mongodb /backups/healplus/$DATE/

# Comprimir
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE/

# Remover backup antigos (> 30 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $BACKUP_DIR/backup_$DATE.tar.gz"
EOF

chmod +x /usr/local/bin/backup_healplus.sh
```

### Backup Automático Diário

```bash
# Adicionar ao crontab
0 2 * * * /usr/local/bin/backup_healplus.sh
```

### Restaurar Backup

```bash
# Extrair backup
tar -xzf backup_20250115_020000.tar.gz

# Restaurar no MongoDB
docker exec heal_plus_db mongorestore /data/backup/20250115_020000/
```

---

## 🔄 Atualizações

### Atualizar Aplicação

```bash
cd /var/www/HealPlus_web

# Puxar atualizações
git pull origin main

# Reconstruir imagens
docker-compose -f docker-compose.prod.yml build

# Reiniciar serviços
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### Serviço não inicia

```bash
# Verificar status
docker-compose ps

# Ver erros
docker-compose logs backend

# Reiniciar
docker-compose restart backend
```

### Sem conexão com banco de dados

```bash
# Verificar MongoDB
docker-compose logs mongodb

# Testar conexão
docker exec heal_plus_backend python -c "from motor.motor_asyncio import AsyncIOMotorClient; print('OK')"
```

### Alto uso de memória

```bash
# Ver consumo de recursos
docker stats

# Limpar recursos não utilizados
docker system prune -a
```

---

## 📞 Suporte

Para mais informações:
- 📧 Email: deploy@healplus.com
- 📖 Docs: https://github.com/pedrotescaro/HealPlus_web
- 🐛 Issues: https://github.com/pedrotescaro/HealPlus_web/issues

---

**Última atualização: 15 de Novembro de 2025**
