import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectBancoCentral } from "../bancoCentralSocket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Conexión de clientes a tu servidor vía Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Evento ejemplo desde cliente
  socket.on("transfer", (data) => {
    console.log("Transfer request from client:", data);
    // Aquí podrías validar y enviar al Banco Central
  });
});

// Conectar al Banco Central (ws)
connectBancoCentral(io); // pasamos io para poder emitir eventos a clientes

// Levantar servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
