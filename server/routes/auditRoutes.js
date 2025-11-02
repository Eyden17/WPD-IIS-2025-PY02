import express from "express";
import { listUserAudit } from "../controller/auditController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = express.Router();

// GET /api/v1/audit/:userId
router.get(
  "/:userId",
  authMiddleware,
  roleMiddleware(["admin", "cliente"]),
  listUserAudit
);

router.use(errorHandler);
export default router;
