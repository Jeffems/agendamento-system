/*import express from 'express';
import {
  listarAgendamentos,
  obterAgendamento,
  criarAgendamento,
  atualizarAgendamento,
  deletarAgendamento
} from '../controllers/agendamentoController.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";

router.get("/", authMiddleware, listarAgendamentos);
router.get("/:id", authMiddleware, obterAgendamento);
router.post("/", authMiddleware, criarAgendamento);
router.put("/:id", authMiddleware, atualizarAgendamento);
router.delete("/:id", authMiddleware, deletarAgendamento);
const router = express.Router();

router.get('/', listarAgendamentos);
router.get('/:id', obterAgendamento);
router.post('/', criarAgendamento);
router.put('/:id', atualizarAgendamento);
router.delete('/:id', deletarAgendamento);

export default router;
*/

import express from "express";
import {
  listarAgendamentos,
  obterAgendamento,
  criarAgendamento,
  atualizarAgendamento,
  deletarAgendamento
} from "../controllers/agendamentoController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router(); // ✅ PRIMEIRO declara

router.get("/", authMiddleware, listarAgendamentos);
router.get("/:id", authMiddleware, obterAgendamento);
router.post("/", authMiddleware, criarAgendamento);
router.put("/:id", authMiddleware, atualizarAgendamento);
router.delete("/:id", authMiddleware, deletarAgendamento);

export default router;
