import { supabase } from "../config/supabase.js";
import { successResponse } from "../utils/responseHandler.js";

/**
 * GET /api/v1/audit/:userId
 * Devuelve el historial de acciones del usuario.
 */
export const listUserAudit = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      const err = new Error("userId requerido");
      err.statusCode = 400;
      throw err;
    }

    const { data, error } = await supabase.rpc("sp_audit_list_by_user", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error al listar auditoría:", error);
      const err = new Error("Error al obtener auditoría: " + error.message);
      err.statusCode = 500;
      throw err;
    }

    return successResponse(req, res, data, "Historial de auditoría obtenido correctamente");
  } catch (err) {
    next(err);
  }
};
