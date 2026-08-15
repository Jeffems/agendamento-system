CREATE TABLE "whatsapp_conversations" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "contato" TEXT NOT NULL,
  "nome" TEXT,
  "ultima_mensagem" TEXT,
  "ultima_mensagem_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nao_lidas" INTEGER NOT NULL DEFAULT 0,
  "janela_atendimento_ate" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "whatsapp_messages" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "agendamentoId" TEXT,
  "wa_message_id" TEXT NOT NULL,
  "direcao" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'text',
  "conteudo" TEXT,
  "status" TEXT NOT NULL DEFAULT 'accepted',
  "erro_codigo" TEXT,
  "erro_mensagem" TEXT,
  "mensagem_em" TIMESTAMPTZ(6) NOT NULL,
  "entregue_em" TIMESTAMPTZ(6),
  "lida_em" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_conversations_usuarioId_contato_key" ON "whatsapp_conversations"("usuarioId", "contato");
CREATE INDEX "whatsapp_conversations_usuarioId_ultima_mensagem_em_idx" ON "whatsapp_conversations"("usuarioId", "ultima_mensagem_em");
CREATE UNIQUE INDEX "whatsapp_messages_wa_message_id_key" ON "whatsapp_messages"("wa_message_id");
CREATE INDEX "whatsapp_messages_conversationId_mensagem_em_idx" ON "whatsapp_messages"("conversationId", "mensagem_em");
CREATE INDEX "whatsapp_messages_usuarioId_status_idx" ON "whatsapp_messages"("usuarioId", "status");
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "whatsapp_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
