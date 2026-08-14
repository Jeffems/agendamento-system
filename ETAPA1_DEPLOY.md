# Etapa 1 — implantação

Esta versão corrige o vínculo entre cliente e agendamento, o envio manual de
e-mail, o destino do WhatsApp, a atualização de status e a confiabilidade dos
lembretes automáticos.

## Antes de publicar

1. Faça um backup do PostgreSQL do Railway.
2. Confirme que o frontend usa a URL correta do backend em `VITE_API_URL`.
3. Cadastre no Railway as variáveis abaixo.

```env
DATABASE_URL=postgresql://...
JWT_SECRET=uma-chave-aleatoria-com-pelo-menos-32-caracteres
FRONTEND_URL=https://seu-frontend.vercel.app
APP_TIMEZONE=America/Cuiaba
ENABLE_REMINDER_CRON=true
RESEND_API_KEY=re_...
EMAIL_FROM=agenda@seudominio.com.br
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_CONFIG_SECRET=...
ADMIN_EMAILS=administrador@seudominio.com.br
TERMS_VERSION=2026-08-06
PRIVACY_VERSION=2026-08-06
```

`EMAIL_FROM` deve usar um domínio autorizado no Resend. Separe vários e-mails
administrativos em `ADMIN_EMAILS` com vírgula.

## Banco de dados

O comando de início do backend executa `prisma migrate deploy`. A migration
nova somente adiciona os campos usados para impedir lembretes duplicados.

## Validação local

No backend:

```bash
npm install
npm test
npm run build
```

No frontend:

```bash
npm install
npm test
npm run build
```

## Verificações depois do deploy

1. Criar um cliente sem sobrenome.
2. Criar um agendamento selecionando esse cliente.
3. Atualizar o status para confirmado e concluído.
4. Enviar um lembrete manual por e-mail.
5. Abrir o lembrete do WhatsApp e conferir o número do destinatário.
6. Editar a data do agendamento e confirmar que os indicadores de lembrete
   voltaram para não enviados.
