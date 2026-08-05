import { z } from "zod";
import prisma from "../lib/prisma.js";

const clienteSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  sobrenome: z.string().trim().optional().transform((v) => v || null),
  email: z
    .union([z.string().trim().email("Email inválido"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v.trim() : null)),
  contato: z.string().trim().optional().transform((v) => v || null),
  observacoes: z.string().trim().optional().transform((v) => v || null),
});

export async function listarClientes(req, res) {
  try {
    const usuarioId = req.user.id;

    const clientes = await prisma.cliente.findMany({
      where: { usuarioId },
      orderBy: { nome: "asc" },
    });

    return res.json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return res.status(500).json({ error: "Erro ao listar clientes" });
  }
}

export async function obterCliente(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;

    const cliente = await prisma.cliente.findFirst({
      where: { id, usuarioId },
      include: {
        agendamentos: {
          orderBy: { data_agendamento: "desc" },
          take: 20,
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return res.status(500).json({ error: "Erro ao buscar cliente" });
  }
}

export async function criarCliente(req, res) {
  try {
    const usuarioId = req.user.id;
    const parsed = clienteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: parsed.error.flatten(),
      });
    }

    const cliente = await prisma.cliente.create({
      data: {
        ...parsed.data,
        usuarioId,
      },
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

export async function atualizarCliente(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;

    const existente = await prisma.cliente.findFirst({
      where: { id, usuarioId },
    });

    if (!existente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const parsed = clienteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: parsed.error.flatten(),
      });
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: parsed.data,
    });

    return res.json(cliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
}

export async function deletarCliente(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;

    const existente = await prisma.cliente.findFirst({
      where: { id, usuarioId },
      select: { id: true },
    });

    if (!existente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    await prisma.cliente.delete({
      where: { id },
    });

    return res.json({ message: "Cliente deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return res.status(500).json({ error: "Erro ao deletar cliente" });
  }
}