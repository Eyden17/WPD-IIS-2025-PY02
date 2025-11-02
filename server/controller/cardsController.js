import { supabase } from "../config/supabase.js";
import { successResponse } from "../utils/responseHandler.js";


/**
 * POST /api/v1/cards
 * Crea una tarjeta (cvv & pin cifrados).
 * Usa sp_cards_create.
 */
export const createCard = async (req, res) => {
  
};

/**
 * GET /api/v1/cards
 * Lista tarjetas del usuario autenticado (o admin puede ver todo).
 * Usa sp_cards_get.
 */
export const listCards = async (req, res) => {
  
};

/**
 * GET /api/v1/cards/:cardId
 * Detalle de tarjeta
 */
export const getCard = async (req, res) => {
  
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