import WebSocket from "ws";
import { handleIntent } from "./handlers/transfer.intent.js";
import { handleReject } from "./handlers/transfer.reject.js";
import { handleReserve } from "./handlers/transfer.reserve.js";
import { handleInit } from "./handlers/transfer.init.js";
import { handleCredit } from "./handlers/transfer.credit.js";
import { handleDebit } from "./handlers/transfer.debit.js";
import { handleRollback } from "./handlers/transfer.rollback.js";
import { handleCommit } from "./handlers/transfer.commit.js";

const BC_URL = "ws://137.184.36.3:6000";  // Banco Central

export function connectBancoCentral() {
  console.log("Conectando al Banco Central...");

  const socket = new WebSocket(BC_URL, {
  headers: {
    "bankid": process.env.BC_BANK_ID,
    "bankname": process.env.BC_BANK_NAME,
    "token": process.env.BC_TOKEN
  }
});

  socket.on("open", () => {
    console.log("Conectado al Banco Central");
  });

  socket.on("error", (err) => {
    console.error("Error con Banco Central:", err.message);
  });

  socket.on("close", () => {
    console.log("Conexión cerrada. Reintentando en 3s...");
    setTimeout(connectBancoCentral, 3000);
  });

  socket.on("message", async (msg) => {
    try {
      const parsed = JSON.parse(msg);
      const { type, data } = parsed;

      console.log("Evento recibido:", type);

      switch (type) {
        case "transfer.intent":
          return handleIntent(socket, data);

        case "transfer.reject":
          return handleReject(socket, data);

        case "transfer.reserve":
          return handleReserve(socket, data);

        case "transfer.init":
          return handleInit(data);

        case "transfer.credit":
          return handleCredit(socket, data);

        case "transfer.debit":
          return handleDebit(socket, data);

        case "transfer.rollback":
          return handleRollback(socket, data);

        case "transfer.commit":
          return handleCommit(socket, data);

        default:
          console.warn("Evento desconocido:", type);
      }
    } catch (e) {
      console.error("Error procesando mensaje:", e);
    }
  });
}
