import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { updateUser,deleteUser, getUserByIdentificacion } from "../controller/userController.js"; 

const router = express.Router();
// Ruta GET 
router.get(
  '/:identificacion',
  authMiddleware,
  roleMiddleware(['admin', 'cliente']),
  getUserByIdentificacion
);

// Ruta DELETE (solo para administradores)
router.delete(
  "/:user_id",
  authMiddleware, // requiere JWT válido
  roleMiddleware(["admin"]), // solo admins pueden eliminar
  deleteUser // función del controlador
);

// Actualizar usuario (solo admin)
router.put(
  "/:user_id",
  authMiddleware,// requiere JWT válido
  roleMiddleware(["admin"]), // solo admins pueden Actualizar
  updateUser// función del controlador
);

export default router;
