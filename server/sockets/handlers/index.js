import 'dotenv/config';
import { connectBancoCentral } from '../bancoCentralSocket.js';

console.log("Iniciando aplicación...");

// Conectar al Banco Central
connectBancoCentral();