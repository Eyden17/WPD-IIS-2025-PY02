import express from "express";
import { login } from "../controller/authController.js";
import { apiKeyMiddleware } from "../middleware/apiKeyMiddleware.js";

const router = express.Router();

/**
 * POST /auth/login
 * Recibe un username y un role, devuelve un token JWT válido.
 */
router.post("/login", apiKeyMiddleware, login);

export default router;
