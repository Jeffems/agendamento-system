import express from "express";
import { listarConversas, listarMensagens, marcarConversaLida, responderConversa } from "../controllers/whatsappInboxController.js";
const router = express.Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.get("/conversas", asyncRoute(listarConversas));
router.get("/conversas/:id/mensagens", asyncRoute(listarMensagens));
router.post("/conversas/:id/mensagens", asyncRoute(responderConversa));
router.post("/conversas/:id/lida", asyncRoute(marcarConversaLida));
export default router;
