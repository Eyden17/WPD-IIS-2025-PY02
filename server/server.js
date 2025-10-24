import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

// Cargar variables de entorno
dotenv.config();

// Configuración del servidor
const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/products", productRoutes);
app.use("/auth", authRoutes);

// Middleware para manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
