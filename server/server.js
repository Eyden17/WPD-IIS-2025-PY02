import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Prefijo base versionado
app.use("/api/v1/auth", authRoutes);   // login, register
app.use("/api/v1/users", userRoutes);  // rutas de usuario (delete, update, get, etc.)
app.use("/api/v1/accounts", accountRoutes); // rutas de cuenta (create, get by id, etc.)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`);
});

export default app;
