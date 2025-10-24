import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mi_clave_jwt";

// Controlador para el login
export const login = (req, res) => {
  const { username, role } = req.body;

  // Validación  de datos
  if (!username || !role) {
    return res.status(400).json({ message: "Missing username or role" });
  }

  // Crea el payload del token
  const payload = { username, role };

  // Firma el token
  const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });

  return res.json({ token });
};
