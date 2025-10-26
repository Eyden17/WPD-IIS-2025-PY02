import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  '/',
  authMiddleware, // Verifica el JWT
  roleMiddleware(['admin', 'cliente']), // Verifica roles permitidos
  (req, res) => {
    res.json({
      message: `Bienvenido ${req.user.username}`,
      role: req.user.role,
    });
  }
);

export default router;
