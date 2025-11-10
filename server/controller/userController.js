// controllers/userController.js
//Aqui se gestionara el GET/POST/DELETE/UPDATE de los usuarios
import { supabase } from "../config/supabase.js";


// ====================== CONTROLADOR usuario por identificación ============================================

export const getUserByIdentificacion = async (req, res) => {
  try {
    const { identificacion } = req.params;
    const userRole = req.user.role;
    const userIdentificacion = req.user.identificacion;

    // Validamos parámetros vacíos o formato incorrecto
    if (!identificacion || identificacion.trim() === '') {
      return res.status(200).json({
        status: 200,
        message: 'Debe proporcionar una identificación válida.',
      });
    }

    // Si es cliente, solo puede consultar su propio registro
    if (userRole === 'cliente' && userIdentificacion !== identificacion) {
      return res.status(200).json({
        status: 200,
        message: 'No tienes permiso para consultar los datos de otro usuario.',
      });
    }

    // Consulta los datos del usuario en la tabla 'usuarios'
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre, apellido, correo, telefono, usuario, identificacion')
      .eq('identificacion', identificacion)
      .maybeSingle();

    // No se encontró el usuario
    if (!data) {
      return res.status(200).json({
        status: 200,
        message: 'No se encontró ningún usuario con esa identificación.',
      });
    }

    // Si todo va bien, devolver datos con éxito
    return res.status(200).json({
      status: 200,
      message: 'Usuario encontrado exitosamente.',
      data,
    });
  } catch (err) {
    console.error('Error interno del servidor:', err);
    return res.status(500).json({
      status: 500,
      message: 'Error inesperado en el servidor.',
      details: err.message,
    });
  }
};
// ====================== CONTROLADOR DELETE USER ============================================

export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params; // viene desde la ruta /users/:user_id

    if (!user_id) {
      return res.status(400).json({ message: "Falta el parámetro user_id." });
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

     if (data.deleted === false) {
      return res.status(200).json({
        message: "El usuario ya había sido eliminado previamente o no existe.",
        data,
      });
    }

     // Si realmente fue eliminado
    if (data.deleted === true) {
      return res.status(200).json({
        message: "Usuario eliminado exitosamente.",
        data,
      });
    }

   // Caso inesperado (por si el procedimiento devuelve otro formato)
    return res.status(200).json({
      message: "Respuesta inesperada del procedimiento al eliminar usuario.",
      data,
    });
  } catch (err) {
    console.error("Error interno en deleteUser:", err);
    return res.status(500).json({
      message: "Error interno del servidor.",
      details: err.message,
    });
  }
};

// ====================== CONTROLADOR UPDATE USER ============================================

export const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { nombre, apellido, correo, usuario, rol } = req.body;

  if (!user_id) {
      return res.status(200).json({
        status: 200,
        message: "Debe proporcionar el parámetro user_id.",
      });
    }

     // Validación de parámetros en el body
    const missingFields = [];
    if (!nombre) missingFields.push("nombre");
    if (!apellido) missingFields.push("apellido");
    if (!correo) missingFields.push("correo");
    if (!usuario) missingFields.push("usuario");
    if (!rol) missingFields.push("rol");

    if (missingFields.length > 0) {
      return res.status(200).json({
        status: 200,
        message: `Faltan los siguientes parámetros: ${missingFields.join(
          ", "
        )}`,
      });
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
        return res.status(200).json({ message: "Error al buscar rol" });
      }

      if (!rolData || rolData.length === 0) {
        return res.status(200).json({ message: "Rol no válido" });
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

     // Usuario no existe
    if (data && data.updated === false) {
      return res.status(200).json({
        status: 200,
        message: "No se encontró ningún usuario con el ID proporcionado.",
        data,
      });
    }

    // Usuario actualizado exitosamente
    if (data && data.updated === true) {
      return res.status(200).json({
        status: 200,
        message: "Usuario actualizado exitosamente.",
        data,
      });
    }

    // Respuesta inesperada
    return res.status(200).json({
      status: 200,
      message: "Respuesta inesperada del procedimiento.",
      data,
    });
  } catch (err) {
    console.error("Error interno en updateUser:", err);
    return res.status(500).json({
      status: 500,
      message: "Error interno del servidor.",
      details: err.message,
    });
  }
};
