# Caixa de conversas do WhatsApp

Esta versão adiciona uma caixa de entrada por empresa, com histórico de mensagens, não lidas, respostas em texto, status de entrega e vínculo dos lembretes automáticos ao agendamento.

## Publicação

1. Substitua os arquivos do projeto pelos deste pacote.
2. No Railway, mantenha as variáveis já configuradas e adicione, se ainda não existir:

   ```env
   WHATSAPP_GRAPH_VERSION=v20.0
   ```

3. No deploy do backend, execute a migração do Prisma antes de iniciar a aplicação:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Confirme que o webhook da Meta aponta para:

   ```text
   https://SEU-BACKEND/whatsapp/webhook
   ```

5. No painel da Meta, assine o campo `messages` do webhook. Ele entrega tanto mensagens recebidas quanto atualizações de status.
6. Faça o deploy normal do frontend na Vercel.

## Como validar

1. Entre em **Conversas** no menu lateral.
2. Envie uma mensagem de um celular cliente para o número da Cloud API.
3. A conversa deve aparecer em até alguns segundos com o contador de não lidas.
4. Abra a conversa e responda. A resposta é permitida dentro da janela de atendimento de 24 horas iniciada pela mensagem do cliente.
5. Confira a evolução do status: enviada, entregue e lida.
6. Envie um lembrete de teste ou aguarde um lembrete automático; ele também deve aparecer no histórico.

## Escopo desta primeira versão

- Respostas livres são bloqueadas fora da janela de 24 horas da Meta.
- Mensagens de texto são exibidas integralmente.
- Imagens, áudios, vídeos, documentos e localização recebidos aparecem como identificadores no histórico; download e reprodução podem ser adicionados depois.
- Conversas feitas pelo link manual `wa.me` não passam pela Cloud API e, por isso, não aparecem nesta caixa.
- O histórico pertence sempre à empresa autenticada; uma conta não acessa conversas de outra.

## Se uma mensagem não aparecer

- confira `WHATSAPP_APP_SECRET` e `WHATSAPP_VERIFY_TOKEN` no Railway;
- confirme a assinatura do campo `messages` no aplicativo da Meta;
- confira se o `Phone Number ID` salvo no sistema é o mesmo informado no webhook;
- consulte os logs do Railway procurando por `webhookHandler error`;
- confirme que a migração criou as tabelas `whatsapp_conversations` e `whatsapp_messages`.
