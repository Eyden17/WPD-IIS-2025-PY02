import express from "express";
import { internalTransfer, externalTransfer } from "../controller/transferController.js";
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

// POST /api/v1/transfers/external
router.post(
  "/external",
  authMiddleware,
  roleMiddleware(["cliente", "admin"]),
  externalTransfer
);

router.use(errorHandler);

export default router;
