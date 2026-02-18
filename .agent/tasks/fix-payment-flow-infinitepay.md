# Tarefa: Correção Definitiva do Fluxo de Pagamento InfinitePay

## 1. Contexto
O usuário relatou que o projeto está "saindo do controle" devido a atualizações que desfazem comportamentos anteriores. O problema atual é a integração com InfinitePay que não respeita a escolha de Pix/Cartão e não exibe as opções corretamente no checkout externo.

## 2. Requisitos Críticos
- **Automação**: O redirecionamento deve ser imediato após clicar em "Finalizar".
- **Contexto de Pagamento**: Se o usuário escolheu PIX no site, a InfinitePay deve abrir no PIX. Se escolheu CARTÃO, deve abrir no CARTÃO.
- **Multi-Tenant**: A configuração deve ser individual por loja via `infinitepay_handle`.
- **Limpeza**: O carrinho deve ser esvaziado APENAS após o sucesso do redirecionamento.

## 3. Plano de Implementação (Fases)

### Fase 1: Análise e Reversão
- Identificar por que o link estático não está mostrando PIX.
- Revisar o componente `Cart.tsx` e o serviço `api.ts`.

### Fase 2: Solutioning (Arquitetura)
- Implementar a geração de link via API `/invoices` da InfinitePay (se possível via proxy) ou ajustar o URL scheme para forçar o método.
- Criar um helper de redirecionamento centralizado para evitar código espalhado.

### Fase 3: Implementação
- [ ] Atualizar `Cart.tsx` para usar o novo fluxo.
- [ ] Ajustar `OrderSuccess.tsx` para ser apenas um fallback e não a fonte da verdade do pagamento.

### Fase 4: Verificação
- [x] Testar fluxo de PIX (Forçando `["pix"]`).
- [x] Testar fluxo de Cartão (Forçando `["credit_card"]`).
- [x] Verificar se o carrinho limpa corretamente (Movido para após o sucesso do link).

---
**Status**: ✅ Concluído
**Responsável**: Antigravity (@orchestrator)
