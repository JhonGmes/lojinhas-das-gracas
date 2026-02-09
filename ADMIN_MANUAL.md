# Manual do Painel Administrativo - Lojinhas das Graças

Este guia rápido explica como usar as funcionalidades do seu novo painel administrativo.

## Acesso
- **URL:** `/admin` (Redireciona para login se não autenticado)
- **Login:** Use o email/senha cadastrados na tabela `auth.users` (ou crie um novo usuário com role 'admin' se necessário).

## Funcionalidades Principais

### 1. Dashboard (Visão Geral)
- **Vendas Hoje:** Total vendido no dia.
- **Pedidos Pendentes:** Pedidos que precisam de atenção.
- **Alerta de Estoque:** Produtos com estoque baixo (< 5 unidades).

### 2. Estoque (Inventory)
Aqui você gerencia seus produtos rapidamente:
- **Atualizar Preço:** Digite o novo valor e clique fora ou Enter.
- **Promoção Rápida:**
  - Digite um valor na coluna "% Desc." para aplicar desconto automático.
  - O sistema calcula o novo `Preço Promocional`.
  - Para remover a promoção, apague o valor do preço promocional.
- **Estoque:** Ajuste a quantidade disponível.
- **Ações:** Editar detalhes completos ou excluir produto.

### 3. Adicionar Produto
- **Nome, Descrição, Preço, Categoria.**
- **Imagens:** Upload de múltiplas imagens (a primeira será a principal).
- **Destaque:** Marque "Produto em Destaque" para aparecer no topo da Home.

### 4. Pedidos (Orders)
- Veja a lista de pedidos vindos do carrinho/WhatsApp.
- Altere o status (Pendente -> Pago -> Enviado).
- Veja os itens comprados e o total.

### 5. Configurações (Settings)
- **Identidade da Loja:** Nome, Email, WhatsApp (para onde os pedidos vão).
- **Aparência:** Cor primária (afeta botões e detalhes), Logo.
- **Banner da Home:** Título, Subtítulo e Imagem de fundo da página inicial.

## Dicas
- **Imagens:** Use imagens quadradas (1:1) ou retrato (4:5) para melhor visualização.
- **Categorias:** Mantenha nomes curtos (ex: Terços, Imagens) para caber nos filtros.
