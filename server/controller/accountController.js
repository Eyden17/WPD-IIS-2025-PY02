// controllers/accountController.js
import { supabase } from "../config/supabase.js";


/**
 * Obtiene una cuenta (por id) o todas las cuentas del usuario autenticado
 * GET /api/v1/accounts/:id?   (id opcional)
 */
export const getAccount = async (req, res) => {
  try {
    // Usuario autenticado (viene del JWT)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    // Parámetro opcional de la ruta
    const { id } = req.params; // puede venir undefined
    const accountId = id || null;

    // =============================
    // Llamada al stored procedure
    // =============================
    const { data, error } = await supabase.rpc("sp_accounts_get", {
      p_account_id: accountId,
      p_owner_id: userId
    });

    if (error) {
      console.error("Error al obtener cuenta:", error);
      return res.status(500).json({ message: "Error al obtener cuenta", details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    // =============================
    // Respuesta exitosa
    // =============================
    return res.status(200).json({
      message: accountId ? "Cuenta obtenida exitosamente" : "Cuentas del usuario",
      data,
    });

  } catch (err) {
    console.error("Error en getAccount:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};



/**
 * Crea una cuenta nueva (POST /api/v1/accounts)
 */
export const createAccount = async (req, res) => {
  try {
    const {
      alias,
      iban,
      saldo_inicial,
      estado_cuenta, // viene como texto ("Activa", "Bloqueada")
      moneda,        // viene como texto ("Colones", "Dolares")
      tipo_cuenta,   // viene como texto ("Ahorros", "Corriente")
    } = req.body;

    // ============================================
    // 1.Usuario autenticado -> se obtiene del token y no se pasa por body
    // ============================================
    const usuarioUUID = req.user?.id;
    if (!usuarioUUID) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    // ============================================
    // 2.Busca el ID del estado de cuenta, asi encuentra el UUID correspondiente
    // ============================================
    const { data: estadoData, error: estadoError } = await supabase
      .from("estado_cuenta")
      .select("id, nombre")
      .ilike("nombre", estado_cuenta)
      .limit(1);

    if (estadoError) {
      console.error("Error al buscar estado_cuenta:", estadoError);
      return res.status(500).json({ message: "Error al buscar estado_cuenta" });
    }

    if (!estadoData || estadoData.length === 0) {
      return res.status(400).json({ message: "Estado de cuenta no válido" });
    }

    const estadoUUID = estadoData[0].id;

    // ============================================
    // 3.Busca el ID de la moneda, asi encuentra el UUID correspondiente
    // ============================================
    const { data: monedaData, error: monedaError } = await supabase
      .from("moneda")
      .select("id, nombre")
      .ilike("nombre", moneda)
      .limit(1);

    if (monedaError) {
      console.error("Error al buscar moneda:", monedaError);
      return res.status(500).json({ message: "Error al buscar moneda" });
    }

    if (!monedaData || monedaData.length === 0) {
      return res.status(400).json({ message: "Moneda no válida" });
    }

    const monedaUUID = monedaData[0].id;

    // ============================================
    // 4.Busca 3l ID del tipo de cuenta, asi encuentra el UUID correspondiente
    // ============================================
    const { data: tipoData, error: tipoError } = await supabase
      .from("tipo_cuenta")
      .select("id, nombre")
      .ilike("nombre", tipo_cuenta)
      .limit(1);

    if (tipoError) {
      console.error("Error al buscar tipo_cuenta:", tipoError);
      return res.status(500).json({ message: "Error al buscar tipo_cuenta" });
    }

    if (!tipoData || tipoData.length === 0) {
      return res.status(400).json({ message: "Tipo de cuenta no válido" });
    }

    const tipoUUID = tipoData[0].id;

    // ============================================
    // 5.Llama al procedimiento almacenado
    // ============================================
    const { data, error } = await supabase.rpc("sp_accounts_create", {
      p_alias: alias,
      p_estado: estadoUUID,
      p_iban: iban,
      p_moneda: monedaUUID,
      p_saldo_inicial: saldo_inicial,
      p_tipo: tipoUUID,
      p_usuario_id: usuarioUUID,
    });

    if (error) {
      console.error("Error al crear cuenta:", error);
      return res.status(500).json({ message: "Error al crear cuenta", details: error.message });
    }

    res.status(201).json({
      message: "Cuenta creada exitosamente",
      data,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


/**
 * Actualiza el estado de una cuenta
 * PUT /api/v1/accounts/status
 */
export const updateAccountStatus = async (req, res) => {
  try {
    const { iban, nuevo_estado } = req.body; // Se pasa el IBAN en el body

    // Validaciones
    if (!iban) {
      return res.status(400).json({ message: "Se requiere el IBAN de la cuenta." });
    }
    if (!nuevo_estado) {
      return res.status(400).json({ message: "Se requiere el nuevo estado." });
    }

    // ================================
    // 1.Usuario autenticado -> se obtiene del token y no se pasa por body
    // ================================
    const usuarioUUID = req.user?.id;
    if (!usuarioUUID) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    // ================================
    // 2.Busca el ID de la cuenta a partir del IBAN
    // ================================
    const { data: cuentaData, error: cuentaError } = await supabase
      .from("cuenta")
      .select("id, iban")
      .ilike("iban", iban)
      .limit(1)
      .single();

    if (cuentaError || !cuentaData) {
      console.error("Error al buscar cuenta:", cuentaError);
      return res.status(404).json({ message: "Cuenta no encontrada con el IBAN proporcionado." });
    }

    const cuentaUUID = cuentaData.id;

    // ================================
    // 3.Busca el UUID del nuevo estado, asi encuentra el UUID correspondiente
    // ================================
    const { data: estadoData, error: estadoError } = await supabase
      .from("estado_cuenta")
      .select("id, nombre")
      .ilike("nombre", nuevo_estado)
      .limit(1)
      .single();

    if (estadoError) {
      console.error("Error al buscar estado_cuenta:", estadoError);
      return res.status(500).json({ message: "Error al buscar estado_cuenta" });
    }

    if (!estadoData) {
      return res.status(400).json({ message: "Estado de cuenta no válido." });
    }

    const nuevoEstadoUUID = estadoData.id;

    // ================================
    // 4.Llama al Stored Procedure
    // ================================
    const { data, error } = await supabase.rpc("sp_accounts_set_status", {
      p_account_id: cuentaUUID,
      p_nuevo_estado: nuevoEstadoUUID,
    });

    if (error) {
      console.error("Error al actualizar estado:", error);
      return res.status(500).json({
        message: "Error al actualizar el estado de la cuenta",
        details: error.message,
      });
    }

    // ================================
    // 5.Respuesta exitosa
    // ================================
    return res.status(200).json({
      message: "Estado de la cuenta actualizado correctamente",
      data,
    });
  } catch (err) {
    console.error("Error en updateAccountStatus:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
