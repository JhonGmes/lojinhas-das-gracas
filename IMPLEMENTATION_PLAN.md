# 🚀 Plano de Implementação - Projeto Production-Ready
## Lojinha das Graças

**Objetivo:** Levar o projeto a estado **production-ready** com testes, SEO, UI refinada e deploy final.

---

## 📋 FASES DE IMPLEMENTAÇÃO

### ✅ FASE 1: Correções Críticas (30min)
**Prioridade:** 🔴 CRÍTICA

#### 1.1 SQL Schema Fix
- [ ] Executar SQL no Supabase para adicionar coluna `code`
- [ ] Validar que admin consegue salvar código SKU
- [ ] Verificar que produto exibe código na página

#### 1.2 ESLint + Prettier Setup
- [ ] Instalar dependências
- [ ] Configurar `.eslintrc.json`
- [ ] Configurar `.prettierrc`
- [ ] Adicionar scripts no `package.json`

---

### ✅ FASE 2: Testing Infrastructure (45min)
**Prioridade:** 🔴 CRÍTICA

#### 2.1 Vitest Setup (Unit Tests)
- [ ] Instalar Vitest + Testing Library
- [ ] Configurar `vitest.config.ts`
- [ ] Setup test environment
- [ ] Criar pasta `__tests__`

#### 2.2 Playwright Setup (E2E Tests)
- [ ] Instalar Playwright
- [ ] Configurar `playwright.config.ts`
- [ ] Setup test browsers
- [ ] Criar pasta `e2e-tests`

---

### ✅ FASE 3: Unit Tests (1h)
**Prioridade:** 🟡 ALTA

#### 3.1 Utils Tests
- [ ] `formatCurrency.test.ts` - Formatação de moeda
- [ ] `cn.test.ts` - Merge de classNames

#### 3.2 Context Tests
- [ ] `CartContext.test.tsx` - Adicionar/remover produtos
- [ ] `CartContext.test.tsx` - Cálculo de desconto Pix
- [ ] `CartContext.test.tsx` - Persistência localStorage

#### 3.3 Component Tests
- [ ] `ProductCard.test.tsx` - Renderização
- [ ] `ProductCard.test.tsx` - Hover interactions

**Target Coverage:** 70%

---

### ✅ FASE 4: E2E Tests (1h)
**Prioridade:** 🟡 ALTA

#### 4.1 Fluxo de Compra (Critical Path)
```
Cenário: Cliente compra produto com Pix
  1. Acessa homepage
  2. Navega para produto
  3. Adiciona ao carrinho
  4. Seleciona Pix (5% desconto aplicado)
  5. Preenche dados
  6. Finaliza pedido (WhatsApp)
```

#### 4.2 Admin Flow
```
Cenário: Admin cria produto
  1. Login no admin
  2. Cria novo produto com código SKU
  3. Verifica produto na loja
```

#### 4.3 Mobile Flow
```
Cenário: Cliente mobile compra
  1. Acessa em mobile viewport
  2. Usa menu hamburger
  3. Galeria swipe funciona
  4. Checkout mobile
```

---

### ✅ FASE 5: SEO Optimization (45min)
**Prioridade:** 🟡 ALTA

#### 5.1 Meta Tags Dinâmicas
- [ ] Instalar `react-helmet-async`
- [ ] Configurar no `App.tsx`
- [ ] Adicionar em `Home.tsx`
- [ ] Adicionar em `ProductDetail.tsx`
- [ ] Adicionar em `Cart.tsx`

#### 5.2 Sitemap & Robots
- [ ] Gerar `sitemap.xml` (produtos + páginas)
- [ ] Criar `robots.txt`
- [ ] Colocar em `/public`

#### 5.3 Structured Data
- [ ] Schema.org Product markup
- [ ] Schema.org Organization
- [ ] Schema.org BreadcrumbList

---

### ✅ FASE 6: UI Refinements - Sacred Minimalism (1.5h)
**Prioridade:** 🟢 MÉDIA

#### 6.1 Design System Aplicado
- [x] Tailwind config - Paleta Sacred Minimalism
- [x] CSS Global - Transições contemplativas
- [ ] ProductCard - Bordas sharp, sombras soft
- [ ] Layout - Header/Footer refinados
- [ ] Home - Hero + Sections com tipografia Cinzel
- [ ] Buttons - Hover states sutis

#### 6.2 Micro-interactions
- [ ] Toast notifications (adicionar ao carrinho)
- [ ] Loading skeletons (todas páginas)
- [ ] Empty states elaborados
- [ ] Error boundaries com UI

#### 6.3 Accessibility
- [ ] Focus rings reverentes
- [ ] Keyboard navigation testada
- [ ] ARIA labels completos
- [ ] Contrast ratio validado

---

### ✅ FASE 7: Performance Optimization (30min)
**Prioridade:** 🟢 MÉDIA

#### 7.1 Code Splitting
- [ ] Lazy loading de rotas
- [ ] React.memo em componentes pesados
- [ ] Dynamic imports

#### 7.2 Image Optimization
- [ ] WebP conversion (se necessário)
- [ ] Lazy loading implementado (já tem)
- [ ] srcset para responsive images

#### 7.3 Bundle Analysis
- [ ] Instalar rollup-plugin-visualizer
- [ ] Analisar bundle size
- [ ] Otimizar imports pesados

---

### ✅ FASE 8: Pre-Deploy Checklist (30min)
**Prioridade:** 🔴 CRÍTICA

#### 8.1 Quality Gates
- [ ] `npm run build` - Build bem-sucedido
- [ ] `npm run test` - Todos testes passando
- [ ] `npx tsc --noEmit` - Zero erros TypeScript
- [ ] Lighthouse audit - Score > 90

#### 8.2 Environment Variables
- [ ] `.env.example` criado
- [ ] Variáveis configuradas no Vercel
- [ ] Secrets validados

#### 8.3 Documentation
- [ ] README.md atualizado
- [ ] PRD.md completo (já feito)
- [ ] AUDIT_REPORT.md atual (já feito)

---

### ✅ FASE 9: Deploy Final (15min)
**Prioridade:** 🔴 CRÍTICA

#### 9.1 Git Workflow
```bash
git add .
git commit -m "Production ready: Tests, SEO, UI refinements"
git push origin main
```

#### 9.2 Vercel Deploy
- [ ] Trigger deploy automático
- [ ] Monitorar build logs
- [ ] Validar preview URL

#### 9.3 Production Validation
- [ ] Smoke test em produção
- [ ] Verificar Supabase connection
- [ ] Testar fluxo de compra end-to-end
- [ ] Mobile testing em device real

---

## 📊 TIMELINE ESTIMADO

| Fase | Duração | Status |
|------|---------|--------|
| 1. Correções Críticas | 30min | ⏳ A Fazer |
| 2. Testing Infrastructure | 45min | ⏳ A Fazer |
| 3. Unit Tests | 1h | ⏳ A Fazer |
| 4. E2E Tests | 1h | ⏳ A Fazer |
| 5. SEO Optimization | 45min | ⏳ A Fazer |
| 6. UI Refinements | 1.5h | ⏳ A Fazer |
| 7. Performance | 30min | ⏳ A Fazer |
| 8. Pre-Deploy | 30min | ⏳ A Fazer |
| 9. Deploy Final | 15min | ⏳ A Fazer |
| **TOTAL** | **~6.5h** | **0% Completo** |

---

## 🎯 CRITÉRIOS DE SUCESSO

### Métricas de Qualidade
- ✅ **Test Coverage:** > 70%
- ✅ **TypeScript Errors:** 0
- ✅ **Lighthouse Score:** > 90
- ✅ **Bundle Size:** < 500KB
- ✅ **SEO Score:** > 80

### Checklist Final
- [ ] Todos testes passando (unit + E2E)
- [ ] Build de produção sem erros
- [ ] Deploy bem-sucedido
- [ ] Smoke tests em produção OK
- [ ] Performance validada (Lighthouse)

---

## 🚀 INÍCIO DA IMPLEMENTAÇÃO

**Status:** Preparado para execução  
**Próximo Passo:** FASE 1 - Correções Críticas

---

**Criado por:** AI Orchestrator  
**Data:** 10/02/2026  
**Aprovação Necessária:** ✅ Usuário confirmou escopo completo
