import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../config/supabase.js";

const SECRET = process.env.JWT_SECRET;

// Controlador de login
export const login = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ message: "Missing user or password" });
  }

  try {
    // Llama al stored procedure de Supabase
    const { data, error } = await supabase.rpc(
      "sp_auth_user_get_by_username_or_email",
      { p_username_or_email: user }
    );

    console.log(" Datos devueltos por Supabase:", data);

    if (error) {
      console.error("Error en SP:", error);
      return res.status(500).json({ message: "Database error" });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ message: "Invalid user or password" });
    }

    const userData = Array.isArray(data) ? data[0] : data;

    if (!userData.contrasena_hash) {
      console.error("El campo contrasena_hash no existe o viene nulo:", userData);
      return res.status(500).json({
        message: "User record incomplete (missing contrasena_hash)",
      });
    }

    // 🔑 Verifica la contraseña
    const cleanHash = userData.contrasena_hash.trim();
    const passwordMatch = await bcrypt.compare(password, cleanHash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid user or password" });
    }

    // 🪪 Crea el payload con ID, username y rol
    const payload = {
      id: userData.user_id,
      username: userData.usuario || user,
      role: userData.rol || "unknown", // rol 
    };

    // token (expira en 1 hora)
    const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });

    //  Respuesta exitosa
    return res.status(200).json({
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
