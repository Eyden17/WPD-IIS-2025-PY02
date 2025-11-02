import { supabase } from "../config/supabase.js";
import { successResponse } from "../utils/responseHandler.js";

/**
 * POST /api/v1/bank/validate-account
 * Verifica si una cuenta IBAN pertenece al banco.
 * Usa sp_bank_validate_account.
 */
export const validateBankAccount = async (req, res, next) => {
  try {
    const { iban } = req.body;

    if (!iban) {
      const err = new Error("Falta el campo 'iban'");
      err.statusCode = 400;
      throw err;
    }

    const { data, error } = await supabase.rpc("sp_bank_validate_account", {
      p_iban: iban,
    });

    if (error) {
      console.error("Error al validar cuenta IBAN:", error);
      const err = new Error("Error en la validación de cuenta: " + error.message);
      err.statusCode = 500;
      throw err;
    }

    if (!data) {
      return successResponse(req, res, { exists: false }, "Cuenta no encontrada en el banco");
    }

    const result = {
      exists: data.exist || false,
      owner_name: data.owner_name || null,
      owner_id: data.owner_id || null,
    };

    const msg = result.exists
      ? "Cuenta IBAN válida. Pertenece al banco."
      : "Cuenta IBAN no encontrada en el banco.";

    return successResponse(req, res, result, msg);
  } catch (err) {
    next(err);
  }
};
