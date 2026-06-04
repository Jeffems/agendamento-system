import express from "express";

import {
  register,
  login,
  me,
  acceptTerms,
} from "../controllers/authManualController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/accept-terms", authMiddleware, acceptTerms);

export default router;