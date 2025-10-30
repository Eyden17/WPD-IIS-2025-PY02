import { supabase } from "../config/supabase.js";
import bcrypt from "bcryptjs";

/**
 * create OTP
 * POST /api/v1/otp/create
 */

export const createOtp = async (req, res) => {
  try {
    const { proposito, expires_in_seconds = 300 } = req.body;
    const userId = req.user?.id; // viene del token

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    // 1. generamos  un OTP aleatorio (ej:6 dígitos) ayuda de chatgpt
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hashear el OTP antes de guardarlo
    const codigoHash = await bcrypt.hash(codigo, 12);

    // 3. Llamar al stored procedure
    const { data, error } = await supabase.rpc("sp_otp_create", {
      p_codigo_hash: codigoHash,
      p_expires_in_seconds: expires_in_seconds,
      p_proposito: proposito,
      p_user_id: userId,
    });

    if (error) {
      console.error("Error al crear OTP:", error);
      return res.status(500).json({ message: "Error al crear OTP", details: error.message });
    }

    // 4. Devuelve el código OTP plano (para enviar por correo o mostrar en consola temporalmente)
    return res.status(201).json({
      message: "OTP creado correctamente",
      otp: codigo, // solo para pruebas, no en producción
      expires_in_seconds,
      data,
    });

  } catch (err) {
    console.error("Error en createOtp:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


/**
 * Consume o valida un codigo OTP
 * POST /api/v1/otp/consume
 */
export const consumeOtp = async (req, res) => {
  try {
    const usuarioUUID = req.user?.id;
    if (!usuarioUUID) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    const { codigo, proposito } = req.body;

    if (!codigo || !proposito) {
      return res.status(400).json({ message: "Faltan campos requeridos (codigo, proposito)." });
    }

    // 1. Busca el OTP activo más reciente para ese usuario y propósito
    const { data: otpData, error: otpError } = await supabase
      .from("otps")
      .select("id, codigo_hash, fecha_expiracion, fecha_consumido")
      .eq("usuario_id", usuarioUUID)
      .eq("proposito", proposito)
      .order("fecha_creacion", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) {
      console.error("Error al buscar OTP:", otpError);
      return res.status(404).json({ message: "No se encontró un OTP activo para este usuario." });
    }

    const { id: otpId, codigo_hash, fecha_expiracion, fecha_consumido } = otpData;

    // 2. Verifica expiración
    const ahora = new Date();
    if (new Date(fecha_expiracion) < ahora) {
      return res.status(400).json({ message: "El OTP ha expirado." });
    }

    // 3. Verificar si ya fue consumido
    if (fecha_consumido) {
      return res.status(400).json({ message: "El OTP ya fue consumido." });
    }

    // 4. Compara el código plano con el hash
    const valido = await bcrypt.compare(codigo, codigo_hash);
    if (!valido) {
      return res.status(400).json({ message: "Código OTP inválido." });
    }

    // 5. Llamamos al stored procedure para marcarlo como consumido
    const { data, error } = await supabase.rpc("sp_otp_consume", {
      p_codigo_hash: codigo_hash,
      p_proposito: proposito,
      p_user_id: usuarioUUID,
    });

    if (error) {
      console.error("Error al consumir OTP:", error);
      return res.status(500).json({
        message: "Error al consumir OTP",
        details: error.message,
      });
    }

    return res.status(200).json({
      message: "Código OTP validado correctamente.",
      data,
    });
  } catch (err) {
    console.error("Error en consumeOtp:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};