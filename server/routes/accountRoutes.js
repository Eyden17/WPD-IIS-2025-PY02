// routes/accountRoute.js
import express from "express";
import {createAccount, getAccount, updateAccountStatus, getAccountMovements  } from "../controller/accountController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();

// Base: /api/v1/accounts
//Si se hace get con "/id?" da error 

// Obtener TODAS las cuentas del usuario
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]), //Tanto el admin como el cliente podran gestionar el crear
  getAccount
);

// Obtener UNA cuenta específica
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]), //Tanto el admin como el cliente podran gestionar el crear
  getAccount
);

// Crear una cuenta nueva
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]), //Tanto el admin como el cliente podran gestionar el crear
  createAccount
);

// Actualizar el estado de una cuenta
router.put(
    "/status", 
    authMiddleware,
    roleMiddleware([ "admin"]),
     updateAccountStatus
    );

// Obtiene los movimientos de una cuenta (por IBAN)
router.get(
  "/:iban/movements",
  authMiddleware,
  getAccountMovements
);

export default router;
