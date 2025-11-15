# 📱 Guia de Responsividade Mobile - HealPlus

## Visão Geral

A HealPlus foi desenvolvida com **Mobile-First Design** usando Tailwind CSS. Todos os componentes são totalmente responsivos e testados em dispositivos móveis.

---

## 🎯 Breakpoints Tailwind CSS

```css
/* Mobile First - padrão */
/* xs: 0px - padrão */

/* sm: 640px - Tablets pequenos */
@media (min-width: 640px) { ... }

/* md: 768px - Tablets */
@media (min-width: 768px) { ... }

/* lg: 1024px - Desktops pequenos */
@media (min-width: 1024px) { ... }

/* xl: 1280px - Desktops */
@media (min-width: 1280px) { ... }

/* 2xl: 1536px - Desktops grandes */
@media (min-width: 1536px) { ... }
```

---

## 📐 Exemplos de Componentes Responsivos

### Grid Responsivo

```jsx
// Mobile: 1 coluna
// Tablet (md): 2 colunas
// Desktop (lg): 3 colunas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Conteúdo */}
</div>
```

### Layout Flex Responsivo

```jsx
// Mobile: Coluna (stack vertical)
// Desktop (md): Linha (lado a lado)
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Conteúdo</div>
</div>
```

### Typography Responsivo

```jsx
// Tamanho diferente em mobile vs desktop
<h1 className="text-2xl md:text-4xl font-bold">
  Título Responsivo
</h1>

// Padding responsivo
<div className="p-4 md:p-8 lg:p-12">
  Conteúdo com padding adaptável
</div>
```

---

## 🏗️ Estrutura de Páginas Responsivas

### Dashboard Page

```jsx
// Mobile: 1 coluna
// Tablet: 2 colunas
// Desktop: 3 colunas para stats
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {statCards.map((stat) => (
    <Card key={stat.id}>{stat.content}</Card>
  ))}
</div>
```

### Patients Page

```jsx
// Mobile: 1 coluna (stacked)
// Tablet: 2 colunas
// Desktop: 3 colunas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {patients.map((patient) => (
    <PatientCard key={patient.id} patient={patient} />
  ))}
</div>
```

### Modal Responsivo

```jsx
// Mobile: full screen com padding
// Desktop: max-width limitada
<div className="fixed inset-0 flex items-center justify-center p-4">
  <div className="w-full max-w-md bg-white rounded-lg">
    {/* Conteúdo */}
  </div>
</div>
```

---

## 📱 Testes de Responsividade

### Testes no Chrome DevTools

1. Abrir DevTools: `F12`
2. Ativar Device Toolbar: `Ctrl+Shift+M`
3. Testar em diferentes dispositivos:
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Desktop (1920x1080)

### Dispositivos para Testar

```javascript
// Breakpoints para testar
const testDevices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12/13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Galaxy S21', width: 360, height: 800 },
  { name: 'iPad (7ª gen)', width: 810, height: 1080 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop HD', width: 1280, height: 720 },
  { name: 'Desktop FHD', width: 1920, height: 1080 },
  { name: 'Desktop 2K', width: 2560, height: 1440 },
];
```

---

## ⚙️ Componentes Responsivos Implementados

### Button Responsivo

```jsx
<Button
  size="sm"          // Mobile
  className="md:px-8" // Desktop padding maior
>
  Clique
</Button>
```

### Input Responsivo

```jsx
<Input
  className="w-full md:max-w-md"
  placeholder="Pesquisa..."
/>
```

### Card Responsivo

```jsx
<Card className="p-4 md:p-6 lg:p-8">
  {/* Conteúdo com padding adaptável */}
</Card>
```

---

## 🎨 Utilities Tailwind Responsivos

### Visibility

```jsx
// Mostrar apenas em mobile
<div className="md:hidden">Mobile Menu</div>

// Mostrar apenas em desktop
<div className="hidden md:block">Desktop Menu</div>
```

### Spacing

```jsx
// Margin responsivo
<div className="mb-4 md:mb-8 lg:mb-12">Conteúdo</div>

// Padding responsivo
<div className="p-2 sm:p-4 md:p-6 lg:p-8">Conteúdo</div>
```

### Font Size

```jsx
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
  Título
</h1>
```

### Width

```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Conteúdo
</div>
```

---

## 📋 Checklist de Responsividade

- [ ] Todos os textos são legíveis em mobile
- [ ] Botões têm tamanho adequado para tocar (min 44x44px)
- [ ] Imagens fazem scale corretamente
- [ ] Menus colapsam em mobile
- [ ] Forms são touch-friendly
- [ ] Não há scroll horizontal em mobile
- [ ] Espaçamento é adequado em todos os tamanhos
- [ ] Performance é boa em conexões 3G
- [ ] Modo escuro funciona bem em mobile
- [ ] Não há conteúdo cortado em nenhum breakpoint

---

## 🧪 Testes Automáticos para Responsividade

### Teste com Playwright

```javascript
import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('deve render corretamente em mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    
    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    
    // Testar visibilidade de elementos
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('deve render corretamente em tablet', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    
    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    
    const grid = page.locator('.grid');
    await expect(grid).toHaveClass(/grid-cols-2/);
  });

  test('deve render corretamente em desktop', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    
    const grid = page.locator('.grid');
    await expect(grid).toHaveClass(/grid-cols-3/);
  });
});
```

---

## 🎬 Animações Responsivas

```jsx
// Animações desabilitadas em mobile para melhor performance
<div className="transform transition-transform duration-200 md:hover:scale-105">
  Conteúdo
</div>

// Reduce motion para acessibilidade
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔍 Ferramentas Úteis

### Para Testar Responsividade

1. **Chrome DevTools**: DevTools nativo
   - Ativar: `F12` → `Ctrl+Shift+M`

2. **Responsive Viewer**: Extensão Chrome
   - Ver múltiplos breakpoints simultaneamente

3. **BrowserStack**: Teste em dispositivos reais
   - https://www.browserstack.com

4. **Google Mobile-Friendly Test**
   - https://search.google.com/test/mobile-friendly

---

## 📊 Performance em Mobile

### Otimizações Implementadas

```javascript
// Code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Lazy loading de imagens
<img loading="lazy" src="..." />

// Minificação automática
npm run build  // Tailwind CSS purgado

// Compressão Gzip
// Configurado no nginx.conf
```

### Métricas de Performance

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Lighthouse Mobile**: > 90

---

## 🎯 Melhores Práticas

### 1. Mobile First Design

```jsx
// ✅ Começar com estilos mobile
<div className="text-sm p-2 md:text-base md:p-4">
  Conteúdo
</div>

// ❌ Evitar
<div className="hidden md:block">Conteúdo só em desktop</div>
```

### 2. Touch-Friendly

```jsx
// ✅ Botões com tamanho adequado
<button className="px-4 py-3 min-h-[44px]">
  Clique aqui
</button>

// ❌ Botões muito pequenos
<button className="px-2 py-1">X</button>
```

### 3. Legibilidade

```jsx
// ✅ Texto legível em mobile
<p className="text-base leading-relaxed">Paragráfo</p>

// ❌ Texto muito pequeno
<p className="text-xs">Texto</p>
```

---

## 📚 Referências

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Web Docs - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile-Friendly Guidelines](https://developers.google.com/search/mobile-sites)

---

**Última atualização: 15 de Novembro de 2025**
