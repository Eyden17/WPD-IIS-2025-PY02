import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
// Este apartado unicamente es para validar la proteccion de rutas que requieran autenticacion unicamente
router.get(
  '/', //Se debe cambiar por que login es publico, el menu del banco si debe estar protegido
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
