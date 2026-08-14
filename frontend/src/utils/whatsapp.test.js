import test from "node:test";
import assert from "node:assert/strict";
import { buildWhatsAppReminderLink } from "./whatsapp.js";

const agendamento = {
  nome: "Maria",
  contato: "(66) 99999-9999",
  data_agendamento: "2026-08-07T13:00:00.000Z",
  servico: "Corte",
};

test("gera link direcionado ao telefone do cliente", () => {
  const url = buildWhatsAppReminderLink({ agendamento });

  assert.match(url, /^https:\/\/wa\.me\/5566999999999\?text=/);
});

test("recusa agendamento sem telefone", () => {
  assert.throws(
    () => buildWhatsAppReminderLink({ agendamento: { ...agendamento, contato: "" } }),
    /sem telefone cadastrado/
  );
});
