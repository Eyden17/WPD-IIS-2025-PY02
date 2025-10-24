// Función middleware para manejar errores
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
};