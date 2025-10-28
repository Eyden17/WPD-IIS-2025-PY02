// controllers/userController.js
//Aqui se gestionara el GET/POST/DELETE/UPDATE de los usuarios
import { supabase } from "../config/supabase.js";


// ====================== CONTROLADOR GET CURRENT USER ============================================
export const getCurrentUser = async (req, res) => {
  try {
    // 1.Usuario autenticado
    const usuarioUUID = req.user?.id;
    if (!usuarioUUID) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    // 2.Llama al procedimiento almacenado con el ID del usuario
    const { data, error } = await supabase.rpc("current_usuario_id", {
      p_user_id: usuarioUUID,
    });

    if (error) {
      console.error("Error al obtener usuario actual:", error);
      return res.status(500).json({ message: "Error al obtener usuario actual" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // 3.Respuesta exitosa
    return res.status(200).json({
      message: "Usuario obtenido correctamente",
      data: data[0], // devuelves el primer (y único) registro
    });

  } catch (err) {
    console.error("Error en getCurrentUser:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ====================== CONTROLADOR DELETE USER ============================================
export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params; // viene desde la ruta /users/:user_id

    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id" });
    }

    const { data, error } = await supabase.rpc("sp_users_delete", {
      p_user_id: user_id,
    });

    if (error) {
      console.error("Error al eliminar usuario:", error);
      return res.status(500).json({ message: "Error al eliminar usuario" });
    }

    if (!data) {
      return res.status(404).json({ message: "Usuario no encontrado o no eliminado" });
    }

    console.log("Usuario eliminado:", data);
    return res.status(200).json({
      message: "Usuario eliminado exitosamente",
      data,
    });
  } catch (err) {
    console.error("Error en deleteUser:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ====================== CONTROLADOR UPDATE USER ============================================

export const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { nombre, apellido, correo, usuario, rol } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id" });
  }

  try {
    // Si se pasa un rol (nombre como 'admin' o 'cliente'), buscar su UUID
    let rolId = null;
    if (rol) {
      const { data: rolData, error: rolError } = await supabase
        .from("rol")
        .select("id, nombre")
        .ilike("nombre", rol)
        .limit(1);

      if (rolError) {
        console.error("Error al buscar rol:", rolError);
        return res.status(500).json({ message: "Error al buscar rol" });
      }

      if (!rolData || rolData.length === 0) {
        return res.status(400).json({ message: "Rol no válido" });
      }

      rolId = rolData[0].id;
    }

    // Llama al stored procedure
    const { data, error } = await supabase.rpc("sp_users_update", {
      p_user_id: user_id,
      p_nombre: nombre || null,
      p_apellido: apellido || null,
      p_correo: correo || null,
      p_usuario: usuario || null,
      p_rol: rolId || null,
    });

    if (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ message: "Error al actualizar usuario" });
    }

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      data,
    });
  } catch (err) {
    console.error("Error en updateUser:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
