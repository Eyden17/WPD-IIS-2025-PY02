// Middleware para validar API Key en las solicitudes
export const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Acceso denegado. API Key inválida o ausente.'
    });
  }

  next(); // pasa al siguiente middleware o controller
};
