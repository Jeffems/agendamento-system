import { addMinutes, isValid } from "date-fns";
import prisma from "../lib/prisma.js";
import { agendamentoSchema } from "../validators/agendamentoSchemas.js";

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
  const dayStart = new Date(dataAgendamento);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dataAgendamento);
  dayEnd.setHours(23, 59, 59, 999);

  const existentes = await prisma.agendamento.findMany({
    where: {
      usuarioId,
      data_agendamento: {
        gte: dayStart,
        lte: dayEnd,
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

    const normalized = normalizeAgendamentoPayload(req.body);

    if (!normalized.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: normalized.error,
      });
    }

    const conflito = await checkHorarioConflitante({
      usuarioId,
      dataAgendamento: normalized.data.data_agendamento,
      duracaoMin: normalized.data.duracao_min,
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

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        ...normalized.data,
        ...(typeof req.body.lembrete_enviado === "boolean"
          ? { lembrete_enviado: req.body.lembrete_enviado }
          : {}),
      },
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