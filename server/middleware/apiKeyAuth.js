// server/middleware/apiKeyAuth.js
import dotenv from "dotenv";
dotenv.config();

export const apiKeyAuth = (req, res, next) => {
  const clientKey = req.headers["x-api-key"];

  if (!clientKey) {
    return res.status(401).json({ error: "Acceso denegado. API Key ausente." });
  }

  if (clientKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Acceso denegado. API Key inválida." });
  }

  next();
};
