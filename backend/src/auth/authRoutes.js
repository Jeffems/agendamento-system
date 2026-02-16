import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Router } from "express";
import {
  register,
  login,
  me,
  acceptTerms,
} from "../controllers/authManualController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  register,
  login,
  me,
  acceptTerms,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auth manual
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/accept-terms", authMiddleware, acceptTerms);

// Inicia login com Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback do Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const usuario = req.user;

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redireciona para o frontend com o token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);


// ====== MANUAL ======
router.post("/register", register);
router.post("/login", login);

// ====== TERMOS / PERFIL ======
router.get("/me", authMiddleware, me);
router.post("/accept-terms", authMiddleware, acceptTerms);


export default router;
