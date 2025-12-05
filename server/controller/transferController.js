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
    const { from_iban, to_iban, amount, currency, description } = req.body;

    if (!userId) {
      const err = new Error("Usuario no autenticado");
      err.statusCode = 401;
      throw err;
    }

    if (!from_iban || !to_iban || !amount || !currency) {
      const err = new Error(
        "Faltan campos requeridos (from_iban, to_iban, amount, currency)"
      );
      err.statusCode = 400;
      throw err;
    }

    if (from_iban === to_iban) {
      const err = new Error("La cuenta origen y destino no pueden ser la misma");
      err.statusCode = 400;
      throw err;
    }

    const monto = parseFloat(amount);
    if (isNaN(monto) || monto <= 0) {
      const err = new Error("Monto inválido. Debe ser mayor a 0.");
      err.statusCode = 400;
      throw err;
    }

    // ============================
    // 1) Validar cuenta origen
    // ============================
    const { data: fromAcc, error: fromErr } = await supabase
      .from("cuenta")
      .select("id, usuario_id, saldo, moneda, iban")
      .eq("iban", from_iban)
      .single();

    if (fromErr || !fromAcc) {
      const err = new Error("Cuenta origen no encontrada");
      err.statusCode = 404;
      throw err;
    }

    // Permisos: la cuenta origen debe ser del usuario (o admin)
    if (fromAcc.usuario_id !== userId && req.user.role !== "admin") {
      const err = new Error(
        "No tienes permiso para transferir desde esta cuenta"
      );
      err.statusCode = 403;
      throw err;
    }

    // Saldo suficiente
    if (parseFloat(fromAcc.saldo) < monto) {
      const err = new Error("Saldo insuficiente en la cuenta origen");
      err.statusCode = 400;
      throw err;
    }

    // ============================
    // 2) Ejecutar SP de transferencia
    // ============================
    const { data, error } = await supabase.rpc("sp_transfer_create", {
      p_from_iban: from_iban,
      p_to_iban: to_iban,
      p_amount: monto,
      p_currency_iso: currency, // "CRC", "USD", etc.
      p_description: description || null,
    });

    if (error) {
      console.error("Error en sp_transfer_create:", error);
      const err = new Error(
        "Error al ejecutar transferencia interna: " + error.message
      );
      err.statusCode = 500;
      throw err;
    }

    // data viene como { transfer_id, receipt_number, status }
    const result = Array.isArray(data) ? data[0] : data;

    if (!result || !result.status) {
      const err = new Error("Respuesta inválida del procedimiento de transferencia");
      err.statusCode = 500;
      throw err;
    }

    // Solo internas permitidas en este endpoint
    if (result.status !== "INTERNAL_OK") {
      const err = new Error(
        "Este endpoint solo permite transferencias internas (ambas cuentas deben existir en el banco)."
      );
      err.statusCode = 400;
      throw err;
    }

    return successResponse(
      req,
      res,
      result,
      "Transferencia interna realizada correctamente"
    );
  } catch (err) {
    next(err);
  }
};


// POST /api/v1/transfers/external
export const externalTransfer = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { from_account_id, to_iban, amount, currency, description } = req.body;

    if (!userId) {
      const err = new Error("Usuario no autenticado");
      err.statusCode = 401;
      throw err;
    }

    if (!from_account_id || !to_iban || !amount || !currency) {
      const err = new Error(
        "Faltan campos requeridos (from_account_id, to_iban, amount, currency)"
      );
      err.statusCode = 400;
      throw err;
    }

    // Valida cuenta origen
    const { data: fromAcc, error: fromErr } = await supabase
      .from("cuenta")
      .select("id, usuario_id, moneda, saldo, iban")   // <-- IBAN 
      .eq("id", from_account_id)
      .single();

    if (fromErr || !fromAcc) {
      const err = new Error("Cuenta origen no encontrada");
      err.statusCode = 404;
      throw err;
    }

    if (fromAcc.usuario_id !== userId && req.user.role !== "admin") {
      const err = new Error("No tienes permiso para transferir desde esta cuenta");
      err.statusCode = 403;
      throw err;
    }

    if (fromAcc.moneda !== currency) {
      const err = new Error("La cuenta origen debe tener la moneda especificada");
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

    // Crear transferencia externa
    const { data, error } = await supabase.rpc("sp_transfer_create", {
      p_from_iban: fromAcc.iban,             
      p_to_iban: to_iban,
      p_amount: monto,
      p_currency_iso: currency,
      p_description: description || null
    });

    if (error) {
      console.error("Error al crear transferencia externa:", error);
      const err = new Error("Error al crear transferencia externa: " + error.message);
      err.statusCode = 500;
      throw err;
    }

    return successResponse(
      req,
      res,
      data,
      "Transferencia externa creada correctamente (pendiente de Banco Central)"
    );

  } catch (err) {
    next(err);
  }
};
