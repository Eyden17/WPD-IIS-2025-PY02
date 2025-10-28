import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { updateUser,deleteUser, getCurrentUser} from "../controller/userController.js"; 

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

// Obtener usuario actual autenticado
router.get(
  "/me",
  authMiddleware,
  roleMiddleware(["admin"]),
  getCurrentUser
);


export default router;
