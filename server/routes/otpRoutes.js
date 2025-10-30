import express from "express";
import { consumeOtp, createOtp} from "../controller/otpController.js";
import { authMiddleware, roleMiddleware} from "../middleware/authMiddleware.js";


const router = express.Router();


// POST /api/v1/otp/create
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin", "cliente"]),
  createOtp
);




// POST /api/v1/otp/consume
router.post(
    "/consume", 
    authMiddleware,
    roleMiddleware(['admin', 'cliente']), //Tanto admins como clientes podran consumir OTPS
    consumeOtp
    );

export default router;
