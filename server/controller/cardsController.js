import { supabase } from "../config/supabase.js";
import { successResponse } from "../utils/responseHandler.js";
import { encryptData, decryptData } from "../utils/encryptionUtils.js";

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
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado." });

    const { data, error } = await supabase.rpc("sp_cards_get", {
      p_owner_id: userId,
      p_card_id: null
    });

    if (error) {
      console.error("Error al listar tarjetas:", error);
      return res.status(500).json({ message: "Error al listar tarjetas", details: error.message });
    }

    return successResponse(req, res, data, "Tarjetas obtenidas correctamente");
  } catch (err) {
    console.error("listCards error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * GET /api/v1/cards/:cardId
 * Detalle de tarjeta
 */
export const getCard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado." });
    if (!cardId) return res.status(400).json({ message: "cardId requerido." });

    const { data, error } = await supabase.rpc("sp_cards_get", {
      p_owner_id: userId,
      p_card_id: cardId
    });

    if (error) {
      console.error("Error al obtener tarjeta:", error);
      return res.status(500).json({ message: "Error al obtener tarjeta", details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Tarjeta no encontrada." });
    }

    return successResponse(req, res, data, "Tarjeta obtenida correctamente");
  } catch (err) {
    console.error("getCard error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * GET /api/v1/cards/:cardId/movements
 * Usa sp_card_movements_list con paginación y filtros.
 */
export const listCardMovements = async (req, res) => {
  
};

/**
 * POST /api/v1/cards/:cardId/movements
 * Inserta movimiento (compra/pago) usando sp_card_movement_add.
 * Valida que el usuario sea dueño de la tarjeta.
 */
export const addCardMovement = async (req, res) => {

};

/**
 * POST /api/v1/cards/:cardId/otp
 * Genera un OTP para permitir ver detalles sensibles (PIN/CVV) temporalmente.
 * Usa sp_otp_create. 
 * Devuelve el OTP plano.
 */
export const createCardOtp = async (req, res) => {
  
};

/**
 * POST /api/v1/cards/:cardId/view-details
 * Verifica el OTP (codigo) y permite ver detalles sensibles.
 * Retorna los cvv/pin descifrados si el OTP es válido. 
 */
export const viewCardDetailsWithOtp = async (req, res) => {
  
};