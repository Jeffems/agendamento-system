# Etapa 6 — site de vendas e preparação para lançamento

## Entrega

- landing page pública e responsiva;
- apresentação de recursos, planos, FAQ e chamadas para teste;
- painel autenticado movido de `/` para `/app`;
- Termos de Uso e Política de Privacidade;
- cadastro público controlado por variável;
- métricas agregadas do funil no painel administrativo;
- página 404, tela global de erro, favicon, SEO e `robots.txt`.

## Migration

`20260814234500_add_marketing_metrics` cria uma tabela para contagem de eventos
do site. Ela não guarda IP, nome, e-mail nem conteúdo de agendamentos.

## Variáveis da Vercel

Copie e preencha `frontend/.env.example`. Não publique enquanto estes campos
estiverem com valores de exemplo:

```env
VITE_APP_NAME="AgendaPro"
VITE_SUPPORT_EMAIL="suporte@seudominio.com.br"
VITE_PRIVACY_EMAIL="privacidade@seudominio.com.br"
VITE_LEGAL_NAME="Sua Razão Social"
VITE_LEGAL_DOCUMENT="00.000.000/0001-00"
VITE_LEGAL_ADDRESS="Rua, número, cidade - UF"
VITE_LEGAL_VERSION="14 de agosto de 2026"
VITE_PLAN_BASIC_PRICE_CENTS="2990"
VITE_PLAN_PROFESSIONAL_PRICE_CENTS="5990"
VITE_ALLOW_PUBLIC_SIGNUP="false"
```

Os valores exibidos no site e os preços reais do Stripe devem ser iguais.

## Cadastro público

Enquanto estiver testando, mantenha fechado:

```env
ALLOW_PUBLIC_SIGNUP=false
VITE_ALLOW_PUBLIC_SIGNUP=false
```

No lançamento, altere as duas variáveis para `true` simultaneamente, a primeira
na Railway e a segunda na Vercel. O sistema de convites continuará funcionando.

## Mudança de endereço

- site público: `/`;
- painel: `/app`;
- login: `/login`;
- agenda do cliente: `/agendar/:slug`.

Favoritos antigos que apontam para `/` abrirão o site de vendas; basta clicar
em Entrar para acessar o painel.

## Revisão jurídica obrigatória

Os documentos foram estruturados considerando LGPD, direitos dos titulares,
papéis de controlador/operador e fornecedores usados pelo sistema. Eles são uma
base operacional, não substituem revisão por profissional jurídico que conheça
a empresa, atividade, retenção, contratos e operação real.

## Checklist de lançamento

1. Fazer backup do PostgreSQL.
2. Executar testes e build do backend e frontend.
3. Publicar Railway e confirmar a migration.
4. Publicar Vercel com cadastro público ainda fechado.
5. Revisar landing page em computador e celular.
6. Conferir todos os dados nos Termos e Privacidade.
7. Testar cadastro por convite, login, `/app` e agenda pública.
8. Configurar preços e webhooks Stripe em modo de teste.
9. Fazer um pagamento completo de teste.
10. Abrir o cadastro público nas duas plataformas.
11. Configurar domínio próprio e e-mails do domínio.
12. Adicionar o domínio ao `FRONTEND_URL` e republicar o backend.
