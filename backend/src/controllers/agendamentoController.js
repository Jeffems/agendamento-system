import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export const listarAgendamentos = async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: { data_agendamento: 'desc' }
    });
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
};

export const obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await prisma.agendamento.findUnique({
      where: { id }
    });
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamento' });
  }
};

/*export const criarAgendamento = async (req, res) => {
  try {
    const dados = req.body;
    const agendamento = await prisma.agendamento.create({
      data: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        email: dados.email,
        servico: dados.servico,
        data_agendamento: new Date(dados.data_agendamento),
        status: dados.status || 'pendente',
        observacoes: dados.observacoes || null,
        lembrete_enviado: false
      }
    });
    res.status(201).json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
};
*/
export const criarAgendamento = async (req, res) => {
  try {
    const dados = req.body;
    const usuarioId = req.user.id; // 👈 vem do JWT

    const agendamento = await prisma.agendamento.create({
      data: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        email: dados.email,
        servico: dados.servico,
        data_agendamento: new Date(dados.data_agendamento),
        status: dados.status || "pendente",
        observacoes: dados.observacoes || null,
        lembrete_enviado: false,

        // 🔥 VINCULA AO USUÁRIO LOGADO
        usuario: {
          connect: { id: usuarioId },
        },
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
    
    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        email: dados.email,
        servico: dados.servico,
        data_agendamento: new Date(dados.data_agendamento),
        status: dados.status,
        observacoes: dados.observacoes,
        lembrete_enviado: dados.lembrete_enviado
      }
    });
    
    res.json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
};

export const deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.agendamento.delete({
      where: { id }
    });
    res.json({ message: 'Agendamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
};