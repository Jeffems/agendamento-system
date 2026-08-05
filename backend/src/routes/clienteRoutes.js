import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
  listarClientes,
  obterCliente,
  criarCliente,
  atualizarCliente,
  deletarCliente,
} from "../controllers/clienteController.js";

const router = express.Router();

router.get("/", authMiddleware, listarClientes);
router.get("/:id", authMiddleware, obterCliente);
router.post("/", authMiddleware, criarCliente);
router.put("/:id", authMiddleware, atualizarCliente);
router.delete("/:id", authMiddleware, deletarCliente);

export default router;