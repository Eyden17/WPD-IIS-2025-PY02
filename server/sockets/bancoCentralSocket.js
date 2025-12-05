// server/sockets/bancoCentralSocket.js
import { io as ioClient } from "socket.io-client";
import { handleIntent } from "./handlers/transfer.intent.js";
import { handleReject } from "./handlers/transfer.reject.js";
import { handleReserve } from "./handlers/transfer.reserve.js";
import { handleInit } from "./handlers/transfer.init.js";
import { handleCredit } from "./handlers/transfer.credit.js";
import { handleDebit } from "./handlers/transfer.debit.js";
import { handleRollback } from "./handlers/transfer.rollback.js";
import { handleCommit } from "./handlers/transfer.commit.js";

const CENTRAL_URL = process.env.BC_SOCKET_URL || "http://137.184.36.3:6000";
const BANK_ID = process.env.BC_BANK_ID || "B07";
const BANK_NAME = process.env.BC_BANK_NAME || "TestBank";
const TOKEN = process.env.BC_TOKEN || "BANK-CENTRAL-IC8057-2025";

export function connectBancoCentral(io) {
  console.log("Conectando al Banco Central...");

  const socket = ioClient(CENTRAL_URL, {
    transports: ["websocket"],
    auth: {
      bankId: BANK_ID,
      bankName: BANK_NAME,
      token: TOKEN,
    },
  });

  socket.on("connect", () => {
    console.log(" Conectado al Banco Central");
  });

  socket.on("connect_error", (err) => {
    console.error(" Error de conexión con Banco Central:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log(` Desconectado del Banco Central. Razón: ${reason}`);
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  // --- Eventos del Banco Central ---
  socket.on("transfer.intent", async (data) => {
    console.log(" Evento recibido: transfer.intent");
    io.emit("bc_event", { type: "transfer.intent", data });
    await handleIntent(socket, data);
  });

  socket.on("transfer.reject", async (data) => {
    console.log(" Evento recibido: transfer.reject");
    io.emit("bc_event", { type: "transfer.reject", data });
    await handleReject(socket, data);
  });

  socket.on("transfer.reserve", async (data) => {
    console.log(" Evento recibido: transfer.reserve");
    io.emit("bc_event", { type: "transfer.reserve", data });
    await handleReserve(socket, data);
  });

  socket.on("transfer.init", async (data) => {
    console.log(" Evento recibido: transfer.init");
    io.emit("bc_event", { type: "transfer.init", data });
    await handleInit(socket, data);
  });

  socket.on("transfer.credit", async (data) => {
    console.log(" Evento recibido: transfer.credit");
    io.emit("bc_event", { type: "transfer.credit", data });
    await handleCredit(socket, data);
  });

  socket.on("transfer.debit", async (data) => {
    console.log(" Evento recibido: transfer.debit");
    io.emit("bc_event", { type: "transfer.debit", data });
    await handleDebit(socket, data);
  });

  socket.on("transfer.rollback", async (data) => {
    console.log(" Evento recibido: transfer.rollback");
    io.emit("bc_event", { type: "transfer.rollback", data });
    await handleRollback(socket, data);
  });

  socket.on("transfer.commit", async (data) => {
    console.log(" Evento recibido: transfer.commit");
    io.emit("bc_event", { type: "transfer.commit", data });
    await handleCommit(socket, data);
  });

  // --- Manejar eventos desconocidos ---
  socket.onAny((eventName, data) => {
    const knownEvents = [
      "connect",
      "disconnect",
      "connect_error",
      "transfer.intent",
      "transfer.reject",
      "transfer.reserve",
      "transfer.init",
      "transfer.credit",
      "transfer.debit",
      "transfer.rollback",
      "transfer.commit",
    ];

    if (!knownEvents.includes(eventName)) {
      console.warn(" Evento desconocido del BC:", eventName, data);
    }
  });

  
  return socket;
}
