import { addMinutes, isValid } from "date-fns";
import prisma from "../lib/prisma.js";
import {
  agendamentoSchema,
  atualizarAgendamentoSchema,
} from "../validators/agendamentoSchemas.js";
import { enviarEmailLembrete } from "../services/lembreteService.js";

async function clientePertenceAoUsuario(clienteId, usuarioId) {
  if (!clienteId) return true;

  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioId },
    select: { id: true },
  });

  return Boolean(cliente);
}

function normalizeAtualizacaoPayload(body) {
  const parsed = atualizarAgendamentoSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  const data = { ...parsed.data };

  if (data.data_agendamento) {
    const dataConvertida = new Date(data.data_agendamento);

    if (!isValid(dataConvertida)) {
      return {
        success: false,
        error: {
          formErrors: ["data_agendamento inválida"],
          fieldErrors: {},
        },
      };
    }

    data.data_agendamento = dataConvertida;
  }

  return {
    success: true,
    data,
  };
}

function normalizeAgendamentoPayload(body) {
  const parsed = agendamentoSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  const data = new Date(parsed.data.data_agendamento);

  if (!isValid(data)) {
    return {
      success: false,
      error: { formErrors: ["data_agendamento inválida"], fieldErrors: {} },
    };
  }

  return {
    success: true,
    data: {
      ...parsed.data,
      data_agendamento: data,
    },
  };
}

function hasOverlap(existingStart, existingDuration, newStart, newDuration) {
  const existingEnd = addMinutes(existingStart, existingDuration);
  const newEnd = addMinutes(newStart, newDuration);

  return existingStart < newEnd && existingEnd > newStart;
}

async function checkHorarioConflitante({
  usuarioId,
  dataAgendamento,
  duracaoMin,
  ignoreId = null,
}) {
  const inicioDaBusca = addMinutes(dataAgendamento, -480);
  const fimDaBusca = addMinutes(dataAgendamento, duracaoMin);

  const existentes = await prisma.agendamento.findMany({
    where: {
      usuarioId,
      data_agendamento: {
        gte: inicioDaBusca,
        lt: fimDaBusca,
      },
      ...(ignoreId
        ? {
            id: {
              not: ignoreId,
            },
          }
        : {}),
      status: {
        not: "cancelado",
      },
    },
    select: {
      id: true,
      data_agendamento: true,
      duracao_min: true,
      nome: true,
      sobrenome: true,
    },
  });

  return existentes.find((item) =>
    hasOverlap(
      new Date(item.data_agendamento),
      item.duracao_min ?? 60,
      dataAgendamento,
      duracaoMin
    )
  );
}

export const listarAgendamentos = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const agendamentos = await prisma.agendamento.findMany({
      where: { usuarioId },
      orderBy: { data_agendamento: "desc" },
      include: { cliente: true },
    });

    return res.json(agendamentos);
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    return res.status(500).json({ error: "Erro ao listar agendamentos" });
  }
};

export const obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const agendamento = await prisma.agendamento.findFirst({
      where: { id, usuarioId },
      include: { cliente: true },
    });

    if (!agendamento) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    return res.json(agendamento);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
};

export const criarAgendamento = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const normalized = normalizeAgendamentoPayload(req.body);

    if (!normalized.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: normalized.error,
      });
    }

    if (
      !(await clientePertenceAoUsuario(normalized.data.clienteId, usuarioId))
    ) {
      return res.status(400).json({
        error: "Cliente inválido ou não pertence ao usuário logado",
      });
    }

    const conflito = await checkHorarioConflitante({
      usuarioId,
      dataAgendamento: normalized.data.data_agendamento,
      duracaoMin: normalized.data.duracao_min,
    });

    if (conflito) {
      return res.status(409).json({
        error: "Já existe um agendamento nesse horário",
        conflict: {
          id: conflito.id,
          nome: conflito.nome,
          sobrenome: conflito.sobrenome,
          data_agendamento: conflito.data_agendamento,
          duracao_min: conflito.duracao_min,
        },
      });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        ...normalized.data,
        usuarioId,
        lembrete_enviado: false,
      },
      include: { cliente: true },
    });

    return res.status(201).json(agendamento);
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};

export const atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const existente = await prisma.agendamento.findFirst({
      where: { id, usuarioId },
    });

    if (!existente) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    const normalized = normalizeAtualizacaoPayload(req.body);

    if (!normalized.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: normalized.error,
      });
    }

    const dadosAtualizados = normalized.data;

    if (
      Object.prototype.hasOwnProperty.call(dadosAtualizados, "clienteId") &&
      !(await clientePertenceAoUsuario(dadosAtualizados.clienteId, usuarioId))
    ) {
      return res.status(400).json({
        error: "Cliente inválido ou não pertence ao usuário logado",
      });
    }

    const camposQueInvalidamLembrete = [
      "nome",
      "sobrenome",
      "email",
      "contato",
      "servico",
      "data_agendamento",
    ];

    if (
      camposQueInvalidamLembrete.some((campo) =>
        Object.prototype.hasOwnProperty.call(dadosAtualizados, campo)
      )
    ) {
      dadosAtualizados.lembrete_enviado = false;
      dadosAtualizados.lembrete_email_enviado = false;
      dadosAtualizados.lembrete_whatsapp_enviado = false;
      dadosAtualizados.lembrete_email_processando_em = null;
      dadosAtualizados.lembrete_whatsapp_processando_em = null;
    }

    const novaData =
      dadosAtualizados.data_agendamento ?? existente.data_agendamento;

    const novaDuracao =
      dadosAtualizados.duracao_min ?? existente.duracao_min ?? 60;

    const deveValidarConflito =
      dadosAtualizados.data_agendamento !== undefined ||
      dadosAtualizados.duracao_min !== undefined;

    if (deveValidarConflito) {
      const conflito = await checkHorarioConflitante({
        usuarioId,
        dataAgendamento: new Date(novaData),
        duracaoMin: novaDuracao,
        ignoreId: id,
      });

      if (conflito) {
        return res.status(409).json({
          error: "Já existe um agendamento nesse horário",
          conflict: {
            id: conflito.id,
            nome: conflito.nome,
            sobrenome: conflito.sobrenome,
            data_agendamento: conflito.data_agendamento,
            duracao_min: conflito.duracao_min,
          },
        });
      }
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: dadosAtualizados,
      include: { cliente: true },
    });

    return res.json(agendamentoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
};

export const deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const existente = await prisma.agendamento.findFirst({
      where: { id, usuarioId },
      select: { id: true },
    });

    if (!existente) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    await prisma.agendamento.delete({
      where: { id },
    });

    return res.json({ message: "Agendamento deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    return res.status(500).json({ error: "Erro ao deletar agendamento" });
  }
};

export const enviarLembreteEmailManual = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const agendamento = await prisma.agendamento.findFirst({
      where: { id, usuarioId },
    });

    if (!agendamento) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    if (!agendamento.email) {
      return res.status(400).json({
        error: "Este agendamento não possui e-mail cadastrado",
      });
    }

    await enviarEmailLembrete(agendamento);

    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        lembrete_email_enviado: true,
        lembrete_enviado: true,
      },
      include: { cliente: true },
    });

    return res.json({
      message: "Lembrete enviado por e-mail com sucesso",
      agendamento: atualizado,
    });
  } catch (error) {
    console.error("Erro ao enviar lembrete manual por e-mail:", error);
    return res.status(502).json({
      error: "Não foi possível enviar o lembrete por e-mail",
    });
  }
};
