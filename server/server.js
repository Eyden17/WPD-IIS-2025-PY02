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

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "*",  // Permite todos los orígenes
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Agregué credentials
  })
);

app.use(express.json());

// Prefijo base versionado
app.use("/api/v1/auth", authRoutes);   // login, register
app.use("/api/v1/users", userRoutes);  // rutas de usuario (delete, update, get, etc.)
app.use("/api/v1/accounts", accountRoutes); // rutas de cuenta (create, get by id, etc.)
app.use("/api/v1/otp", otpRoutes); // ruta de los otp generados para password reset o create
app.use("/api/v1/transfers", transferRoutes); // rutas de transferencias (internal)
app.use("/api/v1/cards", cardsRoutes); // rutas de tarjetas (create, list, get, movements,)
app.use("/api/v1/bank", bankRoutes); // rutas bancarias (validate account)
app.use("/api/v1/audit", auditRoutes); // rutas de auditoria (list user audit)


// Manejo centralizado de errores
app.use(errorHandler);

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Servidor corriendo en puerto ${PORT}`);
  console.log(` CORS habilitado para todos los orígenes`);
});

export default app;
