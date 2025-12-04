import express from "express";
import { validateBankAccount } from "../controller/bankController.js";

const router = express.Router();

// POST /api/v1/bank/validate-account
router.post(
  "/validate-account",
  validateBankAccount
);

export default router;
