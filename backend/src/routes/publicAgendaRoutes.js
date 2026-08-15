import express from "express";
import { criarAgendamentoPublico, listarHorariosPublicos, obterAgendaPublica } from "../controllers/publicAgendaController.js";
const router = express.Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.get("/:slug", asyncRoute(obterAgendaPublica));
router.get("/:slug/horarios", asyncRoute(listarHorariosPublicos));
router.post("/:slug/agendamentos", asyncRoute(criarAgendamentoPublico));
export default router;
