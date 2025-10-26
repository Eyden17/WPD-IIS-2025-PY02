import express from "express";
import { login, register } from "../controller/authController.js";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";

const router = express.Router();

// Ruta: POST /api/v1/auth/login
router.post("/login", apiKeyAuth, login);
// Ruta: POST /api/v1/auth/register
router.post("/register", apiKeyAuth, register);

export default router;
