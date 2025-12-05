import { io } from "socket.io-client";

const CENTRAL_URL = "http://137.184.36.3:6000"; 
const BANK_ID = "B07";
const BANK_NAME = "TestBank";
const TOKEN = "BANK-CENTRAL-IC8057-2025";

// Conexión con autenticación
const socket = io(CENTRAL_URL, {
  transports: ["websocket"],
  auth: {
    bankId: BANK_ID,
    bankName: BANK_NAME,
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("✅ Conectado al Banco Central");

  // --- Enviar un transfer.intent de prueba ---
  const intentMessage = {
    id: "3ef930aa-8a1f-4245-a63f-51f40b41b99e",
    from_account: "CR01B03010200098765",
    to_account: "CR01B09010200098765",
    amount: 1500.0,
    currency: "USD",
    concept: "Pago de prueba",
  };

  console.log("📤 Enviando transfer.intent al BC...");
  socket.emit("transfer.intent", intentMessage);
});

socket.on("disconnect", (reason) => {
  console.log("⚠️ Desconectado del BC:", reason);
});

socket.on("bc_event", (msg) => {
  console.log("📩 Evento recibido de servidor:", msg);
});

socket.onAny((event, data) => {
  console.log("🔹 Evento recibido:", event, data);
});
