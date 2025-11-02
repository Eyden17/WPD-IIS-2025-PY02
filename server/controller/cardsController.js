import { supabase } from "../config/supabase.js";
import { successResponse } from "../utils/responseHandler.js";
import { encryptData, decryptData } from "../utils/cryptoUtils.js";
import bcrypt from "bcryptjs";

/**
 * POST /api/v1/cards
 * Crea una tarjeta (cvv & pin cifrados).
 * Usa sp_cards_create.
 */
export const createCard = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado." });

    const {
      tipo,
      numero_enmascarado,
      fecha_expiracion,
      cvv,
      pin,
      moneda,
      limite_credito = 0,
      saldo_actual = 0,
    } = req.body;

    if (!tipo || !numero_enmascarado || !fecha_expiracion || !cvv || !pin || !moneda) {
      return res.status(400).json({ message: "Faltan campos requeridos." });
    }

    const cvvEncrypted = encryptData(cvv);
    const pinEncrypted = encryptData(pin);

    const { data, error } = await supabase.rpc("sp_cards_create", {
      p_usuario_id: userId,
      p_tipo: tipo,
      p_numero_enmascarado: numero_enmascarado,
      p_fecha_expiracion: fecha_expiracion,
      p_cvv_hash: cvvEncrypted,
      p_pin_hash: pinEncrypted,
      p_moneda: moneda,
      p_limite_credito: limite_credito,
      p_saldo_actual: saldo_actual,
    });

    if (error) {
      console.error("Error al crear tarjeta:", error);
      return res.status(500).json({ message: "Error al crear tarjeta", details: error.message });
    }

    return successResponse(req, res, data, "Tarjeta creada correctamente (datos cifrados).");
  } catch (err) {
    console.error("createCard error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * GET /api/v1/cards
 * Lista tarjetas del usuario autenticado (o admin puede ver todo).
 * Usa sp_cards_get.
 */
export const listCards = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Usuario no autenticado." });

    const { data, error } = await supabase.rpc("sp_cards_get", {
      p_owner_id: userId,
      p_card_id: null,
    });

    if (error) {
      console.error("Error al listar tarjetas:", error);
      return res.status(500).json({
        message: "Error al listar tarjetas",
        details: error.message,
      });
    }

    if (!data || data.length === 0) {
      return successResponse(req, res, [], "No se encontraron tarjetas registradas");
    }
    const formattedCards = data.map((card) => ({
      id: card.id,
      numero_enmascarado: card.numero_enmascarado,
      fecha_expiracion: card.fecha_expiracion,
      limite_credito: card.limite_credito,
      saldo_actual: card.saldo_actual,
      tipo_tarjeta: {
        id: card.tipo_id,
        nombre: card.tipo_nombre,
      },
      moneda: {
        id: card.moneda_id,
        nombre: card.moneda_nombre,
      },
      fecha_creacion: card.fecha_creacion,
      fecha_actualizacion: card.fecha_actualizacion,
    }));

    return successResponse(req, res, formattedCards, "Tarjetas obtenidas correctamente");
  } catch (err) {
    console.error("listCards error:", err);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: err.message,
    });
  }
};

/**
 * GET /api/v1/cards/:cardId
 * Devuelve el detalle completo de una tarjeta, incluyendo tipo y moneda.
 */
export const getCard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }
    if (!cardId) {
      return res.status(400).json({ message: "cardId requerido." });
    }

    const { data, error } = await supabase.rpc("sp_cards_get", {
      p_owner_id: userId,
      p_card_id: cardId,
    });

    if (error) {
      console.error("Error al obtener tarjeta:", error);
      return res.status(500).json({
        message: "Error al obtener tarjeta",
        details: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Tarjeta no encontrada." });
    }

    const card = Array.isArray(data) ? data[0] : data;

    const response = {
      id: card.id,
      numero_enmascarado: card.numero_enmascarado,
      fecha_expiracion: card.fecha_expiracion,
      limite_credito: card.limite_credito,
      saldo_actual: card.saldo_actual,
      tipo_tarjeta: {
        id: card.tipo_id,
        nombre: card.tipo_nombre,
      },
      moneda: {
        id: card.moneda_id,
        nombre: card.moneda_nombre,
      },
      fecha_creacion: card.fecha_creacion,
      fecha_actualizacion: card.fecha_actualizacion,
    };

    return successResponse(req, res, response, "Tarjeta obtenida correctamente");
  } catch (err) {
    console.error("getCard error:", err);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: err.message,
    });
  }
};

/**
 * GET /api/v1/cards/:cardId/movements
 * Devuelve los movimientos de la tarjeta con filtros y paginación.
 */
export const listCardMovements = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }
    if (!cardId) {
      return res.status(400).json({ message: "cardId requerido." });
    }

    const { from_date, to_date, page = 1, page_size = 10, q, type } = req.query;

    const { data, error } = await supabase.rpc("sp_card_movements_list", {
      p_card_id: cardId,
      p_from_date: from_date || null,
      p_to_date: to_date || null,
      p_type: type || null,
      p_q: q || null,
      p_page: parseInt(page, 10),
      p_page_size: parseInt(page_size, 10),
    });

    if (error) {
      console.error("Error al listar movimientos tarjeta:", error);
      return res.status(500).json({
        message: "Error al obtener movimientos",
        details: error.message,
      });
    }
    const formatted = {
      movimientos: data?.items ?? [],
      total: data?.total ?? 0,
      page: data?.page ?? 1,
      page_size: data?.page_size ?? 10,
    };

    return successResponse(req, res, formatted, "Movimientos de tarjeta obtenidos correctamente");
  } catch (err) {
    console.error("listCardMovements error:", err);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: err.message,
    });
  }
};

/**
 * POST /api/v1/cards/:cardId/movements
 * Inserta un movimiento (compra o pago) validando propiedad,
 * tipo de tarjeta, límite de crédito (solo crédito) y moneda.
 */
export const addCardMovement = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;
    const { fecha = null, tipo, descripcion = null, moneda, monto } = req.body;

    if (!userId)
      return res.status(401).json({ message: "Usuario no autenticado." });
    if (!cardId || !tipo || !moneda || !monto)
      return res
        .status(400)
        .json({ message: "Faltan campos obligatorios (tipo, moneda, monto)." });

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({
        message: "Monto inválido, debe ser un número positivo.",
      });
    }

    const { data: cardData, error: cardErr } = await supabase.rpc("sp_cards_get", {
      p_owner_id: userId,
      p_card_id: cardId,
    });

    if (cardErr || !cardData || cardData.length === 0) {
      console.error("Error al obtener tarjeta:", cardErr);
      return res.status(404).json({ message: "Tarjeta no encontrada." });
    }

    const tarjeta = Array.isArray(cardData) ? cardData[0] : cardData;

    if (tarjeta.usuario_id !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso sobre esta tarjeta." });
    }

    if (tarjeta.moneda_id !== moneda) {
      return res.status(400).json({
        message: "La moneda del movimiento no coincide con la moneda de la tarjeta.",
        tarjeta_moneda: tarjeta.moneda_nombre,
      });
    }

    const tipoTarjeta = tarjeta.tipo_nombre?.toLowerCase() ?? "";
    const limiteCredito = parseFloat(tarjeta.limite_credito ?? 0);
    const saldoActual = parseFloat(tarjeta.saldo_actual ?? 0);

    if (tipoTarjeta.includes("crédito")) {
      const { data: tipoMov, error: tipoMovErr } = await supabase
        .from("tipo_movimiento_tarjeta")
        .select("nombre")
        .eq("id", tipo)
        .single();

      if (tipoMovErr || !tipoMov) {
        return res.status(400).json({
          message: "Tipo de movimiento no válido.",
        });
      }

      const nombreMovimiento = tipoMov.nombre.toLowerCase();

      if (nombreMovimiento === "compra" && saldoActual + montoNum > limiteCredito) {
        return res.status(400).json({
          message: "Límite de crédito excedido. No se puede realizar la compra.",
          detalles: {
            saldo_actual: saldoActual,
            limite_credito: limiteCredito,
            intento: saldoActual + montoNum,
          },
        });
      }
    }

    const { data, error } = await supabase.rpc("sp_card_movement_add", {
      p_card_id: cardId,
      p_fecha: fecha,
      p_tipo: tipo,
      p_descripcion: descripcion,
      p_moneda: moneda,
      p_monto: montoNum,
    });

    if (error) {
      console.error("Error al agregar movimiento tarjeta:", error);
      return res.status(500).json({
        message: "Error al agregar movimiento",
        details: error.message,
      });
    }

    const result = Array.isArray(data) ? data[0] : data;

    const response = {
      movimiento_id: result?.movement_id || null,
      nuevo_saldo: result?.nuevo_saldo_tarjeta ?? null,
      tarjeta_id: cardId,
      tipo_tarjeta: tipoTarjeta,
      descripcion,
      monto: montoNum,
      moneda: tarjeta.moneda_nombre,
    };

    return successResponse(req, res, response, "Movimiento agregado correctamente");
  } catch (err) {
    console.error("addCardMovement error:", err);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: err.message,
    });
  }
};

/**
 * POST /api/v1/cards/:cardId/otp
 * Genera un OTP para permitir ver detalles sensibles (PIN/CVV) temporalmente.
 * Usa sp_otp_create. 
 * Devuelve el OTP plano.
 */
export const createCardOtp = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;
    const { expires_in_seconds = 300 } = req.body;

    if (!userId) return res.status(401).json({ message: "Usuario no autenticado." });
    if (!cardId) return res.status(400).json({ message: "cardId requerido." });

    // Verifica propiedad de la tarjeta
    const { data: tarjetaData, error: tarjetaErr } = await supabase
      .from("tarjeta")
      .select("id, usuario_id")
      .eq("id", cardId)
      .limit(1)
      .single();

    if (tarjetaErr || !tarjetaData) {
      return res.status(404).json({ message: "Tarjeta no encontrada." });
    }
    if (tarjetaData.usuario_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso sobre esta tarjeta." });
    }

    // Generar OTP (6 dígitos)
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const codigoHash = await bcrypt.hash(codigo, 12);

    const { data, error } = await supabase.rpc("sp_otp_create", {
      p_user_id: userId,
      p_proposito: "card_details",
      p_expires_in_seconds: parseInt(expires_in_seconds, 10),
      p_codigo_hash: codigoHash
    });

    if (error) {
      console.error("Error al crear OTP para tarjeta:", error);
      return res.status(500).json({ message: "Error al crear OTP", details: error.message });
    }

    return successResponse(req, res, { otp: codigo, data }, "OTP generado exitosamente");
  } catch (err) {
    console.error("createCardOtp error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * POST /api/v1/cards/:cardId/view-details
 * Verifica el OTP (codigo) y permite ver detalles sensibles.
 * Retorna los cvv/pin descifrados si el OTP es válido. 
 */
export const viewCardDetailsWithOtp = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;
    const { codigo } = req.body;

    if (!userId)
      return res.status(401).json({ message: "Usuario no autenticado." });
    if (!cardId || !codigo)
      return res
        .status(400)
        .json({ message: "cardId y codigo son obligatorios." });

    const { data: cardData, error: cardErr } = await supabase.rpc("sp_cards_get", {
      p_owner_id: userId,
      p_card_id: cardId,
    });

    if (cardErr || !cardData || cardData.length === 0)
      return res.status(404).json({ message: "Tarjeta no encontrada." });

    const tarjeta = Array.isArray(cardData) ? cardData[0] : cardData;

    if (tarjeta.usuario_id !== userId && req.user.role !== "admin")
      return res
        .status(403)
        .json({ message: "No tienes permiso sobre esta tarjeta." });

    const { data: otpRow, error: otpErr } = await supabase
      .from("otps")
      .select("codigo_hash, fecha_expiracion, fecha_consumido")
      .eq("usuario_id", userId)
      .eq("proposito", "card_details")
      .order("fecha_creacion", { ascending: false })
      .limit(1)
      .single();

    if (otpErr || !otpRow)
      return res
        .status(404)
        .json({ message: "OTP no encontrado o expirado." });

    if (otpRow.fecha_consumido || new Date(otpRow.fecha_expiracion) < new Date())
      return res.status(400).json({ message: "OTP inválido o expirado." });

    const valido = await bcrypt.compare(codigo, otpRow.codigo_hash);
    if (!valido)
      return res.status(400).json({ message: "Código OTP inválido." });

    await supabase.rpc("sp_otp_consume", {
      p_user_id: userId,
      p_proposito: "card_details",
      p_codigo_hash: otpRow.codigo_hash,
    });

    let cvvDescifrado, pinDescifrado;
    try {
      cvvDescifrado = decryptData(tarjeta.cvv_hash);
      pinDescifrado = decryptData(tarjeta.pin_hash);
    } catch (err) {
      console.error("Error descifrando PIN/CVV:", err);
      cvvDescifrado = "(error al descifrar)";
      pinDescifrado = "(error al descifrar)";
    }

    const response = {
      numero_enmascarado: tarjeta.numero_enmascarado,
      fecha_expiracion: tarjeta.fecha_expiracion,
      tipo_tarjeta: tarjeta.tipo_nombre,
      moneda: tarjeta.moneda_nombre,
      cvv: cvvDescifrado,
      pin: pinDescifrado,
    };

    return successResponse(
      req,
      res,
      response,
      "OTP validado y detalles mostrados correctamente"
    );
  } catch (err) {
    console.error("viewCardDetailsWithOtp error:", err);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: err.message,
    });
  }
};
