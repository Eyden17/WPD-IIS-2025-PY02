import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../config/supabase.js";

const SECRET = process.env.JWT_SECRET;

// ====================== CONTROLADOR CREATE_USER ============================================

export const register = async (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    usuario,
    password,
    identificacion,
    tipo_identificacion, // viene como texto (ej: "cedula")
    rol // viene como texto (ej: "admin")
  } = req.body;

  if (!nombre || !apellido || !correo || !usuario || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    // 1.Buscar el UUID del tipo de identificación
   // Buscar el UUID del tipo_identificacion
const { data: tipoData, error: tipoError } = await supabase
  .from("tipo_identificacion")
  .select("id")
  .eq("nombre", tipo_identificacion)
  .limit(1);

if (tipoError) {
  console.error("Error al buscar tipo_identificacion:", tipoError);
  return res.status(500).json({ message: "Error al buscar tipo_identificacion" });
}

if (!tipoData || tipoData.length === 0) {
  return res.status(400).json({ message: "Tipo de identificación no válido" });
}

    // 2.Busca el UUID del rol
  const { data: rolData, error: rolError } = await supabase
  .from("rol") 
  .select("id, nombre")
  .ilike("nombre", rol);

console.log("Resultado búsqueda rol:", rol, "=>", rolData, rolError);
    if (rolError || !rolData || rolData.length === 0) {
  return res.status(400).json({ message: "Rol no válido" });
}


    // 3. Llama al SP con los UUIDs correctos
  const { data, error } = await supabase.rpc("sp_users_create", {
  p_tipo_identificacion: tipoData[0].id, //Supabase devuelve los resultados de una consulta .select() siempre como un arreglo de objetos
  p_identificacion: identificacion || null,
  p_nombre: nombre,
  p_apellido: apellido,
  p_correo: correo,
  p_usuario: usuario,
  p_contrasena_hash: hash,
  p_rol: rolData[0].id, //UUID del rol encontrado
  
});
    if (error) {
      console.error("Error al crear usuario:", error);
      return res.status(500).json({ message: "Error al crear usuario" });
    }

    return res.status(201).json({
      message: "Usuario creado exitosamente",
      data,
    });
  } catch (err) {
    console.error("Error en register:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// ====================== CONTROLADOR LOGIN ============================================



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
