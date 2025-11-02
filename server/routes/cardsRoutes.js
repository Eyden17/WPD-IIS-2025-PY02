import express from "express";
import {
  createCard,
  listCards,
  getCard,
  listCardMovements,
  addCardMovement,
  createCardOtp,
  viewCardDetailsWithOtp
} from "../controller/cardsController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = express.Router();

// Base: /api/v1/cards

// Crear tarjeta (POST /api/v1/cards)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  createCard
);

// Listar tarjetas del usuario (GET /api/v1/cards)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  listCards
);

// Traer tarjeta por id (GET /api/v1/cards/:cardId)
router.get(
  "/:cardId",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  getCard
);

// Movimientos de tarjeta (GET /api/v1/cards/:cardId/movements)
router.get(
  "/:cardId/movements",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  listCardMovements
);

// Agregar movimiento (POST /api/v1/cards/:cardId/movements)
router.post(
  "/:cardId/movements",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  addCardMovement
);

// Generar OTP para ver detalles (POST /api/v1/cards/:cardId/otp)
router.post(
  "/:cardId/otp",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  createCardOtp
);

// Ver detalles sensibles (PIN/CVV) con verificacion OTP (POST /api/v1/cards/:cardId/view-details)
router.post(
  "/:cardId/view-details",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  viewCardDetailsWithOtp
);

router.use(errorHandler);


export default router;
