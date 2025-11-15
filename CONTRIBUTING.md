# 🤝 Guia de Contribuição - HealPlus

Obrigado por considerar contribuir para o HealPlus! Este documento fornece diretrizes e instruções para contribuir ao projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Processo de Pull Request](#processo-de-pull-request)
- [Guias de Estilo](#guias-de-estilo)
- [Commit Messages](#commit-messages)
- [Testes](#testes)

---

## 📜 Código de Conduta

### Nossa Promessa

Nós nos comprometemos a fornecer um ambiente acolhedor e inclusivo para todos, independentemente de:
- Idade, corpo, deficiência, etnia, gênero
- Identidade e expressão de gênero, nível de experiência
- Educação, status socioeconômico, nacionalidade
- Aparência, raça, religião, identidade e orientação sexual

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo:
- Usar linguagem acolhedora e inclusiva
- Ser respeitoso com pontos de vista e experiências divergentes
- Aceitar críticas construtivas com graça
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

---

## 🚀 Como Contribuir

### 1. Reportar Bugs

Antes de criar um bug report, por favor verifique a lista de issues.

**Como reportar um bug:**

1. Use um título descritivo
2. Descreva os passos exatos para reproduzir o problema
3. Forneça exemplos específicos para demonstrar os passos
4. Descreva o comportamento observado
5. Descreva o comportamento esperado
6. Inclua screenshots se possível
7. Inclua seu ambiente (OS, navegador, versão Node, etc)

### 2. Sugerir Enhancements

**Como sugerir um enhancement:**

1. Use um título descritivo
2. Descreva o enhancement em detalhes
3. Descreva o comportamento atual
4. Descreva o comportamento esperado
5. Justifique por que esse enhancement seria útil

### 3. Pull Requests

**Para resolver um issue:**

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/incrivel`)
3. Faça seus commits com mensagens claras
4. Push para a branch (`git push origin feature/incrivel`)
5. Abra um Pull Request

---

## 📝 Processo de Pull Request

### Antes de Submeter

- [ ] Verifique se o PR está contra a branch `develop`
- [ ] Atualize sua branch local com o upstream
- [ ] Rode os testes localmente e se passarem
- [ ] Siga os guias de estilo do projeto
- [ ] Adicione testes para novas funcionalidades
- [ ] Atualize a documentação

### Checklist do PR

```markdown
## Descrição
Explique brevemente as mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Testes passam
- [ ] Coverage não diminuiu
- [ ] Funciona em desktop
- [ ] Funciona em mobile

## Checklist
- [ ] Código segue o estilo do projeto
- [ ] Comentários adicionados para código complexo
- [ ] Documentação atualizada
- [ ] Não há warnings de console
```

---

## 🎨 Guias de Estilo

### Python (Backend)

```python
# Use PEP 8
# Imports em ordem: stdlib, third-party, local
import os
from typing import Optional

import requests

from models import User

# Type hints
def get_user(user_id: str) -> Optional[User]:
    """Docstring descritiva com 79 caracteres max."""
    pass

# Max 79 caracteres por linha
# 2 linhas em branco entre funções/classes
```

**Ferramentas:**
- black: Formatter
- flake8: Linter
- isort: Import sorter

```bash
black backend/
flake8 backend/
isort backend/
```

### JavaScript/React (Frontend)

```jsx
// Use Prettier + ESLint
import React, { useState } from 'react';
import Button from '@/components/Button';

// Arrow functions para componentes
const MyComponent = ({ title, onClick }) => {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Count: {count}
      </Button>
    </div>
  );
};

export default MyComponent;
```

**Regras:**
- Functional components
- Hooks ao invés de class components
- Prop drilling minimizado (use Context quando necessário)
- Componentes pequenos e reutilizáveis

---

## 💬 Commit Messages

### Convenção de Commits

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: Nova funcionalidade
- **fix**: Bug fix
- **docs**: Mudanças de documentação
- **style**: Mudanças de formatação
- **refactor**: Refatoração de código
- **perf**: Mudanças de performance
- **test**: Adição de testes
- **chore**: Mudanças de build, dependências, etc

### Exemplos

```
feat(auth): adiciona autenticação com Google

- Implementa OAuth 2.0 com Google
- Adiciona novo provider de autenticação
- Testes para novo flow de login

Closes #123
```

```
fix(patients): corrige busca de pacientes

A busca estava retornando resultados duplicados
devido a join incorreto no banco de dados.

Fixes #456
```

---

## 🧪 Testes

### Backend (Python)

```bash
# Instalar dependências
pip install pytest pytest-cov pytest-asyncio

# Rodar testes
pytest tests/ -v

# Com coverage
pytest tests/ --cov=. --cov-report=html

# Teste específico
pytest tests/test_auth.py::TestAuthentication::test_login_success -v
```

### Frontend (JavaScript)

```bash
# Rodar testes
npm test

# Com coverage
npm test -- --coverage

# Modo watch
npm test -- --watch

# Teste específico
npm test -- Button.test.js
```

### Cobertura de Testes

- Backend: Mínimo 80% de cobertura
- Frontend: Mínimo 70% de cobertura

---

## 🔄 Fluxo de Review

1. **Automático**: GitHub Actions executa testes
2. **Revisão**: 1-2 revisores analisam o código
3. **Comentários**: Podem ser feitas sugestões
4. **Ajustes**: Faça os ajustes necessários
5. **Aprovação**: Após 2 aprovações, pode fazer merge
6. **Merge**: Use "Squash and merge" para manter historico limpo

---

## 📚 Recursos Úteis

- [Guia de Estilo Python](https://pep8.org/)
- [Guia de Estilo React](https://airbnb.io/javascript/react/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Workflow](https://guides.github.com/introduction/flow/)

---

## ❓ Perguntas?

- 💬 Abra uma discussion no GitHub
- 📧 Email: dev@healplus.com
- 🐛 Issues: https://github.com/pedrotescaro/HealPlus_web/issues

---

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT que o projeto.

---

**Obrigado por contribuir! 🎉**
