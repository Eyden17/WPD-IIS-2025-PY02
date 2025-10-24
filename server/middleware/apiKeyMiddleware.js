
// Middleware para validar API Key en las solicitudes
export const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || "mi_api_key_secreta";

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ message: "Invalid or missing API Key" });
  }

  next(); // pasa al siguiente middleware o controller
};
