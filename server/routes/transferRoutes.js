import express from "express";
import { internalTransfer } from "../controller/transferController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = express.Router();

// POST /api/v1/transfers/internal
router.post(
  "/internal",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  internalTransfer
);

router.use(errorHandler);

export default router;
