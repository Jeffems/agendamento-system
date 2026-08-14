import test from "node:test";
import assert from "node:assert/strict";
import {
  agendamentoSchema,
  atualizarAgendamentoSchema,
} from "./agendamentoSchemas.js";

const dadosMinimos = {
  nome: "Maria",
  servico: "Corte",
  data_agendamento: "2026-08-07T13:00:00.000Z",
};

test("preserva clienteId válido na criação", () => {
  const clienteId = "123e4567-e89b-12d3-a456-426614174000";
  const resultado = agendamentoSchema.parse({ ...dadosMinimos, clienteId });

  assert.equal(resultado.clienteId, clienteId);
});

test("aceita criação sem sobrenome", () => {
  const resultado = agendamentoSchema.parse(dadosMinimos);

  assert.equal(resultado.sobrenome, "");
});

test("atualização de status não injeta valores padrão", () => {
  const resultado = atualizarAgendamentoSchema.parse({ status: "confirmado" });

  assert.deepEqual(resultado, { status: "confirmado" });
});

test("rejeita clienteId inválido", () => {
  const resultado = agendamentoSchema.safeParse({
    ...dadosMinimos,
    clienteId: "cliente-invalido",
  });

  assert.equal(resultado.success, false);
});
