import express from "express";
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config(); 
const app = express();
app.use(express.json());



// Prefijo base versionado
app.use('/api/v1/auth', authRoutes); // Ruta de autenticacion
app.use('/api/v1/users', userRoutes); //Ruta protegida de usuarios
app.use('/api/v1/auth/register', userRoutes); //  ruta para registro de usuarios

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`);
});

export default app;
