# Análise técnica do sistema de agendamento

## 1) Visão geral da arquitetura
- **Frontend**: React + Vite com roteamento via `react-router-dom`, tela de login/cadastro, callback OAuth e dashboard principal de agendamentos.
- **Backend**: Express + Prisma, com autenticação JWT, login Google (Passport), CRUD de agendamentos e job de lembretes por e-mail (Resend + cron).
- **Banco**: PostgreSQL modelado via Prisma com entidades principais `Usuario` e `Agendamento`.

## 2) Pontos fortes
1. **Boas bases de autenticação e consentimento**
   - Cadastro manual exige aceite de termos/política e salva versão dos documentos.
   - Há fluxo para aceitar termos também após login social.
2. **Isolamento de dados por usuário no CRUD**
   - As consultas de agendamento filtram por `usuarioId` vindo do token.
3. **Lembretes com timezone explícito**
   - O serviço calcula janela de “amanhã” com `date-fns-tz`, reduzindo erros de fuso.
4. **UX do frontend organizada**
   - Fluxo de lista/edição/filtro está claro e com feedback de toast.

## 3) Riscos e problemas encontrados (priorizados)

### Crítico
1. **Rotas de auth manual não estão expostas no backend**
   - O frontend chama `/auth/register`, `/auth/login`, `/auth/me` e `/auth/accept-terms`, mas o router atual de auth só publica Google OAuth (`/auth/google` e `/auth/google/callback`).
   - Impacto: login/cadastro manual e checagens de termos podem falhar integralmente.

2. **Inconsistência de payload JWT (`id` vs `userId`)**
   - Token do Google inclui `id`, já o token do login manual inclui `userId`.
   - O middleware salva `req.user = decoded` e o CRUD usa `req.user.id`.
   - Impacto: usuário logado manualmente pode não conseguir acessar/agir nos próprios agendamentos.

### Alto
3. **Bug potencial de runtime no modal de termos**
   - O componente usa `useState`, mas não importa `useState` de React.
   - Isso tende a quebrar em execução ao abrir o modal.

4. **Código legado comentado extenso em arquivos de produção**
   - Há blocos grandes de implementações antigas comentadas em server/controllers/pages.
   - Impacto: manutenção mais difícil, risco de confusão e regressões.

### Médio
5. **Validação do domínio de agendamento ainda parcial no backend**
   - Há validação de data e normalização de campos, mas faltam regras estruturadas (ex.: zod para payload completo, enum de status etc.).
   - Impacto: maior superfície para dados inconsistentes.

6. **Segurança de redirecionamento OAuth depende de env sem salvaguarda**
   - `FRONTEND_URL` é usado diretamente para redirect com token na URL.
   - Impacto: risco operacional se env estiver incorreta (token pode ir para destino indevido).

## 4) Recomendações objetivas

## Fase 1 — correções imediatas (alta prioridade)
1. Publicar rotas manuais de auth no backend (`register`, `login`, `me`, `accept-terms`) com middleware JWT apropriado para as rotas protegidas.
2. Padronizar payload JWT para **sempre** usar a mesma chave (`id`, por exemplo) e adaptar middleware/controladores.
3. Corrigir import do `useState` no `TermsModal`.

## Fase 2 — robustez
4. Introduzir schemas Zod no CRUD de agendamentos (criação/edição), com enum de status e limites de tamanho para textos.
5. Remover blocos comentados antigos e manter histórico no Git (não no código-fonte).
6. Adicionar testes de integração mínimos para:
   - login manual + acesso ao CRUD;
   - fluxo OAuth callback + `/auth/me`;
   - aceite de termos;
   - filtros básicos de agendamentos.

## Fase 3 — melhoria contínua
7. Revisar estratégia de transporte de token no callback OAuth (preferir fluxo mais seguro com troca server-to-server ou hash + validações adicionais).
8. Instrumentar logs com correlação (request id) e métricas (erros de auth, lembretes enviados/falhos).

## 5) Diagnóstico final
O sistema está com uma base boa e moderna, mas hoje há **inconsistências de integração entre frontend e backend na autenticação** que podem bloquear funcionalidades essenciais. Corrigindo as rotas de auth manual e unificando o payload JWT, o produto ganha estabilidade rapidamente e fica pronto para evoluções com menor risco.
