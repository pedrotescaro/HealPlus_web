#!/bin/bash

# 🚀 Script de Quick Start - HealPlus

echo "╔════════════════════════════════════════════════════════╗"
echo "║         HealPlus - Sistema de Análise de Feridas       ║"
echo "║              Quick Start Script v1.0                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 encontrado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

# Verificar pré-requisitos
echo -e "${BLUE}Verificando pré-requisitos...${NC}"
echo ""

all_ok=true
check_command "docker" || all_ok=false
check_command "docker-compose" || all_ok=false
check_command "git" || all_ok=false

echo ""

if [ "$all_ok" = false ]; then
    echo -e "${RED}❌ Alguns pré-requisitos não foram encontrados.${NC}"
    echo "Por favor, instale Docker, Docker Compose e Git."
    exit 1
fi

echo -e "${GREEN}✓ Todos os pré-requisitos estão instalados!${NC}"
echo ""

# Menu de opções
echo -e "${BLUE}Escolha uma opção:${NC}"
echo "1) Iniciar ambiente de desenvolvimento"
echo "2) Rodar testes"
echo "3) Fazer build para produção"
echo "4) Deploy em produção"
echo "5) Ver logs"
echo "6) Parar containers"
echo "0) Sair"
echo ""

read -p "Digite o número da opção: " choice

case $choice in
    1)
        echo -e "${YELLOW}Iniciando ambiente de desenvolvimento...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Ambiente iniciado!${NC}"
        echo ""
        echo "URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:8000"
        echo "  API Docs: http://localhost:8000/docs"
        echo "  MongoDB: localhost:27017"
        ;;
    2)
        echo -e "${YELLOW}Rodando testes...${NC}"
        echo ""
        echo "Backend:"
        cd backend && pytest tests/ -v && cd ..
        echo ""
        echo "Frontend:"
        cd frontend && npm test -- --coverage && cd ..
        ;;
    3)
        echo -e "${YELLOW}Fazendo build para produção...${NC}"
        docker build -f Dockerfile.backend -t heal-plus-backend:latest .
        docker build -f Dockerfile.frontend -t heal-plus-frontend:latest .
        echo -e "${GREEN}✓ Build concluído!${NC}"
        ;;
    4)
        echo -e "${RED}⚠️  Deploy em produção${NC}"
        read -p "Tem certeza? (s/n): " confirm
        if [ "$confirm" = "s" ]; then
            docker-compose -f docker-compose.prod.yml up -d
            echo -e "${GREEN}✓ Deploy concluído!${NC}"
        fi
        ;;
    5)
        read -p "Qual serviço? (backend/frontend/mongodb/all): " service
        docker-compose logs -f $service
        ;;
    6)
        echo -e "${YELLOW}Parando containers...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Containers parados!${NC}"
        ;;
    0)
        echo "Saindo..."
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida!${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}Para mais informações, consulte README.md${NC}"
