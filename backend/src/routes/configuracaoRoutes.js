import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { obterConfiguracoes, atualizarConfiguracoes } from "../controllers/configuracaoController.js";
const router = express.Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.get("/", authMiddleware, asyncRoute(obterConfiguracoes));
router.put("/", authMiddleware, asyncRoute(atualizarConfiguracoes));
export default router;
