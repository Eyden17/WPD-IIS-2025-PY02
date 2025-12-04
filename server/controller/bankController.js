import { supabase } from "../config/supabase.js";
import { successResponse } from "../utils/responseHandler.js";

/**
 * POST /api/v1/bank/validate-account
 * Verifica si una cuenta IBAN pertenece al banco.
 * Usa sp_bank_validate_account.
 */
export const validateBankAccount = async (req, res, next) => {
  try {
    const token = req.header("X-API-TOKEN");

    // 1) Validar token del Banco Central
    if (!token) {
      const err = new Error("Missing X-API-TOKEN");
      err.statusCode = 401;
      throw err;
    }

    if (token !== "BANK-CENTRAL-IC8057-2025") {
      const err = new Error("Invalid API token");
      err.statusCode = 401;
      throw err;
    }

    // 2) Leer body
    const { iban } = req.body;
    if (!iban) {
      const err = new Error("El campo 'iban' es obligatorio");
      err.statusCode = 400;
      throw err;
    }

    // 3) Normalizar IBAN: sin espacios y en mayúsculas
    const normalizedIban = iban.replace(/\s+/g, "").toUpperCase();

    // 4) Validar patrón CR01B03 + 12 dígitos
    const ibanRegex = /^CR01B03[0-9]{12}$/;

    if (!ibanRegex.test(normalizedIban)) {
      const payload = {
        exists: false,
        info: null,
      };

      return successResponse(
        req,
        res,
        payload,
        "IBAN no válido para Banco Astralis (formato incorrecto)."
      );
    }

    // 5) Llamar al SP SOLO si el formato es correcto
    const { data, error } = await supabase.rpc("sp_bank_validate_account", {
      p_iban: normalizedIban,
    });

    if (error) {
      console.error("Error al validar cuenta IBAN:", error);
      const err = new Error("Error en la validación de cuenta: " + error.message);
      err.statusCode = 500;
      throw err;
    }

    // 6) Mapear al contrato estándar
    const exists = !!data?.p_exists;

    const info = exists
      ? {
          name: data.p_name,
          identification: data.p_identification,
          currency: data.p_currency_iso, // "CRC" o "USD"
          debit: data.p_debit,
          credit: data.p_credit,
        }
      : null;

    const payload = { exists, info };

    return successResponse(req, res, payload, "Validación de cuenta completada");
  } catch (err) {
    next(err);
  }
};
