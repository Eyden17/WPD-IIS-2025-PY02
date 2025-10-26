import express from "express";
import { login } from "../controller/authController.js";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";

const router = express.Router();

// Ruta: POST /api/v1/auth/login
router.post("/login", apiKeyAuth, login);

export default router;
