{/*import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export const listarAgendamentos = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const agendamentos = await prisma.agendamento.findMany({
      where: { usuarioId },
      orderBy: { data_agendamento: "desc" },
    });

    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar agendamentos" });
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

    res.json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
};



export const criarAgendamento = async (req, res) => {
  try {
    const dados = req.body;
    const usuarioId = req.user.id;

    const data = new Date(dados.data_agendamento);
    if (isNaN(data.getTime())) {
      return res.status(400).json({ error: "data_agendamento inválida" });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        email: dados.email,
        servico: dados.servico,
        data_agendamento: data,
        status: dados.status || "pendente",
        observacoes: dados.observacoes || null,
        lembrete_enviado: false,
        usuarioId: usuarioId, // pode usar direto
      },
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};


export const atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    const usuarioId = req.user.id;

    // garante que só atualiza se o agendamento for do usuário logado
    const result = await prisma.agendamento.updateMany({
      where: { id, usuarioId },
      data: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        email: dados.email,
        servico: dados.servico,
        data_agendamento: new Date(dados.data_agendamento),
        status: dados.status,
        observacoes: dados.observacoes,
        lembrete_enviado: dados.lembrete_enviado,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    // opcional: buscar o registro atualizado para retornar
    const agendamentoAtualizado = await prisma.agendamento.findFirst({
      where: { id, usuarioId },
    });

    res.json(agendamentoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
};

export const deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const result = await prisma.agendamento.deleteMany({
      where: { id, usuarioId },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json({ message: "Agendamento deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar agendamento" });
  }
};
*/}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listarAgendamentos = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const agendamentos = await prisma.agendamento.findMany({
      where: { usuarioId },
      orderBy: { data_agendamento: "desc" },
    });

    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar agendamentos" });
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

    res.json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
};

export const criarAgendamento = async (req, res) => {
  try {
    const dados = req.body;
    const usuarioId = req.user.id;

    const data = new Date(dados.data_agendamento);
    if (isNaN(data.getTime())) {
      return res.status(400).json({ error: "data_agendamento inválida" });
    }

    const email = (dados.email || "").trim() || null;
    const contato = (dados.contato || "").trim() || null;
    const observacoes = (dados.observacoes || "").trim() || null;

    const agendamento = await prisma.agendamento.create({
      data: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        email, // opcional
        contato, // opcional (novo campo)
        servico: dados.servico,
        data_agendamento: data,
        status: dados.status || "pendente",
        observacoes,
        lembrete_enviado: false,
        usuarioId,
      },
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};

export const atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    const usuarioId = req.user.id;

    const data = new Date(dados.data_agendamento);
    if (isNaN(data.getTime())) {
      return res.status(400).json({ error: "data_agendamento inválida" });
    }

    const email = (dados.email || "").trim() || null;
    const contato = (dados.contato || "").trim() || null;
    const observacoes = (dados.observacoes || "").trim() || null;

    const result = await prisma.agendamento.updateMany({
      where: { id, usuarioId },
      data: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        email,
        contato,
        servico: dados.servico,
        data_agendamento: data,
        status: dados.status,
        observacoes,
        ...(typeof dados.lembrete_enviado === "boolean"
          ? { lembrete_enviado: dados.lembrete_enviado }
          : {}),
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    const agendamentoAtualizado = await prisma.agendamento.findFirst({
      where: { id, usuarioId },
    });

    res.json(agendamentoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
};

export const deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const result = await prisma.agendamento.deleteMany({
      where: { id, usuarioId },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json({ message: "Agendamento deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar agendamento" });
  }
};
