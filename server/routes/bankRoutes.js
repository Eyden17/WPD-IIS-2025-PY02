import express from "express";
import { validateBankAccount } from "../controller/bankController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/v1/bank/validate-account
router.post(
  "/validate-account",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  validateBankAccount
);

export default router;
