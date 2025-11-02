import { supabase } from "../config/supabase.js";
import { successResponse } from "../utils/responseHandler.js";

/**
 * POST /api/v1/transfers/internal
 * Transferencia entre cuentas del mismo banco.
 * Valida saldo y moneda antes de ejecutar el SP.
 * Usa sp_transfer_create_internal.
 */
export const internalTransfer = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { from_account_id, to_account_id, amount, currency, description } = req.body;

    if (!userId) {
      const err = new Error("Usuario no autenticado");
      err.statusCode = 401;
      throw err;
    }

    if (!from_account_id || !to_account_id || !amount || !currency) {
      const err = new Error("Faltan campos requeridos (from_account_id, to_account_id, amount, currency)");
      err.statusCode = 400;
      throw err;
    }

    // Verificar que las cuentas existen
    const { data: fromAcc, error: fromErr } = await supabase
      .from("cuenta")
      .select("id, usuario_id, moneda, saldo")
      .eq("id", from_account_id)
      .single();

    const { data: toAcc, error: toErr } = await supabase
      .from("cuenta")
      .select("id, usuario_id, moneda, saldo")
      .eq("id", to_account_id)
      .single();

    // Validaciones
    if (fromErr || !fromAcc) {
      const err = new Error("Cuenta origen no encontrada");
      err.statusCode = 404;
      throw err;
    }
    if (toErr || !toAcc) {
      const err = new Error("Cuenta destino no encontrada");
      err.statusCode = 404;
      throw err;
    }

    if (fromAcc.usuario_id !== userId && req.user.role !== "admin") {
      const err = new Error("No tienes permiso para transferir desde esta cuenta");
      err.statusCode = 403;
      throw err;
    }

    if (fromAcc.moneda !== currency || toAcc.moneda !== currency) {
      const err = new Error("Las cuentas deben tener la misma moneda");
      err.statusCode = 400;
      throw err;
    }

    const monto = parseFloat(amount);
    if (isNaN(monto) || monto <= 0) {
      const err = new Error("Monto inválido");
      err.statusCode = 400;
      throw err;
    }
    if (parseFloat(fromAcc.saldo) < monto) {
      const err = new Error("Saldo insuficiente en la cuenta origen");
      err.statusCode = 400;
      throw err;
    }

    const { data, error } = await supabase.rpc("sp_transfer_create_internal", {
      p_from_account_id: from_account_id,
      p_to_account_id: to_account_id,
      p_amount: monto,
      p_currency: currency,
      p_description: description || null,
      p_user_id: userId
    });

    if (error) {
      console.error("Error en transferencia interna:", error);
      const err = new Error("Error al ejecutar transferencia interna: " + error.message);
      err.statusCode = 500;
      throw err;
    }

    return successResponse(req, res, data, "Transferencia interna realizada correctamente");
  } catch (err) {
    next(err);
  }
};
