import express from "express";
import cors from "cors";   
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import cardsRoutes from "./routes/cardsRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

// **Importa función del socket**
import { connectBancoCentral } from "./sockets/bancoCentralSocket.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true
  })
);

app.use(express.json());

// Prefijo base versionado
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/transfers", transferRoutes);
app.use("/api/v1/cards", cardsRoutes);
app.use("/api/v1/bank", bankRoutes);
app.use("/api/v1/audit", auditRoutes);

// Manejo centralizado de errores
app.use(errorHandler);

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`CORS habilitado para todos los orígenes`);

  // **Conecta al Banco Central**
  connectBancoCentral();
});

export default app;
