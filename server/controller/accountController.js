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
      p_owner_id: userId,
    });

    if (error) {
      console.error("Error al obtener cuenta:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener cuenta", details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    // =============================
    // Respuesta exitosa
    // =============================
    return res.status(200).json({
      message: accountId
        ? "Cuenta obtenida exitosamente"
        : "Cuentas del usuario",
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
      moneda, // viene como texto ("Colones", "Dolares")
      tipo_cuenta, // viene como texto ("Ahorros", "Corriente")
    } = req.body;

    // ============================================
    // 1.Usuario autenticado -> se obtiene del token y no se pasa por body
    // ============================================
    const usuarioUUID = req.user?.id;
    if (!usuarioUUID) {
      return res.status(200).json({ message: "Usuario no autenticado." });
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
      return res.status(200).json({
        status: 200,
        message:
          "Estado de cuenta no válido. Valores permitidos: 'Activa', 'Bloqueada', etc.",
      });
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
      return res.status(200).json({
        status: 200,
        message: "Moneda no válida. Valores permitidos: 'Colones', 'Dolares'.",
      });
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
      return res.status(200).json({
        status: 200,
        message:
          "Tipo de cuenta no válido. Valores permitidos: 'Ahorros', 'Corriente'.",
      });
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

    const missingFields = [];
    if (!alias) missingFields.push("alias");
    if (!iban) missingFields.push("iban");
    if (!saldo_inicial && saldo_inicial !== 0)
      missingFields.push("saldo_inicial");
    if (!estado_cuenta) missingFields.push("estado_cuenta");
    if (!moneda) missingFields.push("moneda");
    if (!tipo_cuenta) missingFields.push("tipo_cuenta");

    if (missingFields.length > 0) {
      return res.status(200).json({
        status: 200,
        message: `Faltan los siguientes parámetros: ${missingFields.join(
          ", "
        )}`,
      });
    }
    if (isNaN(saldo_inicial) || Number(saldo_inicial) < 0) {
      return res.status(200).json({
        status: 200,
        message:
          "Saldo inicial inválido. Debe ser un número mayor o igual a 0.",
      });
    }

    if (error) {
      console.error("Error al crear cuenta:", error);
      return res
        .status(500)
        .json({ message: "Error al crear cuenta", details: error.message });
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
export const updateAccountStatus = async (req, res) => {
  try {
    const { iban, nuevo_estado } = req.body;

    // ================================
    // 1. Validación de parámetros
    // ================================
    const missingFields = [];
    if (!iban) missingFields.push("iban");
    if (!nuevo_estado) missingFields.push("nuevo_estado");

    if (missingFields.length > 0) {
      return res.status(200).json({
        status: 200,
        message: `Faltan los siguientes parámetros: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // ================================
    // 2. Usuario autenticado
    // ================================
    const usuarioUUID = req.user?.id;
    if (!usuarioUUID) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    // ================================
    // 3. Buscar cuenta por IBAN
    // ================================
    const { data: cuentaData, error: cuentaError } = await supabase
      .from("cuenta")
      .select("id, iban")
      .ilike("iban", iban)
      .limit(1)
      .maybeSingle(); // evita error si no existe

    if (cuentaError) {
      console.error("Error al buscar cuenta:", cuentaError.message);
      return res.status(500).json({
        status: 500,
        message: "Error al consultar la cuenta.",
        details: cuentaError.message,
      });
    }

    if (!cuentaData) {
      return res.status(200).json({
        status: 200,
        message: "No se encontró ninguna cuenta con el IBAN proporcionado.",
      });
    }

    const cuentaUUID = cuentaData.id;

    // ================================
    // 4. Buscar UUID del nuevo estado
    // ================================
    const { data: estadoData, error: estadoError } = await supabase
      .from("estado_cuenta")
      .select("id, nombre")
      .ilike("nombre", nuevo_estado)
      .limit(1)
      .maybeSingle(); // evita error si no existe

    if (estadoError) {
      console.error("Error al buscar estado_cuenta:", estadoError.message);
      return res.status(500).json({
        status: 500,
        message: "Error al buscar estado de cuenta.",
        details: estadoError.message,
      });
    }

    if (!estadoData) {
      return res.status(200).json({
        status: 200,
        message: `Estado de cuenta no válido. Valores permitidos: "Activa", "Bloqueada", etc.`,
      });
    }

    const nuevoEstadoUUID = estadoData.id;

    // ================================
    // 5. Llamar al procedimiento almacenado
    // ================================
    const { data, error } = await supabase.rpc("sp_accounts_set_status", {
      p_account_id: cuentaUUID,
      p_nuevo_estado: nuevoEstadoUUID,
    });

    if (error) {
      console.error("Error al actualizar estado:", error.message);
      return res.status(500).json({
        status: 500,
        message: "Error al actualizar el estado de la cuenta.",
        details: error.message,
      });
    }

    // ================================
    // 6. Validación del resultado
    // ================================
    if (data && data.updated === false) {
      return res.status(200).json({
        status: 200,
        message:
          "No se pudo actualizar el estado de la cuenta (cuenta inexistente o sin cambios).",
        data,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Estado de la cuenta actualizado correctamente.",
      data,
    });
  } catch (err) {
    console.error("Error en updateAccountStatus:", err);
    return res.status(500).json({
      status: 500,
      message: "Error interno del servidor.",
      details: err.message,
    });
  }
};

/**
 * Lista los movimientos de una cuenta
 * GET /api/v1/accounts/:iban/movements
 */
export const getAccountMovements = async (req, res) => {
  try {
    const { iban } = req.params;
    const { from_date, to_date, page = 1, page_size = 10, q, type } = req.query;

    // 1.Usuario autenticado (obligatorio)
    const usuarioUUID = req.user?.id;
    if (!usuarioUUID) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    // 2.Busca el ID de la cuenta a partir del IBAN
    const { data: cuentaData, error: cuentaError } = await supabase
      .from("cuenta")
      .select("id, usuario_id")
      .ilike("iban", iban)
      .limit(1)
      .single();

    if (cuentaError || !cuentaData) {
      return res
        .status(404)
        .json({ message: "Cuenta no encontrada con el IBAN proporcionado." });
    }

    // Valida que la cuenta pertenezca al usuario autenticado
    if (cuentaData.usuario_id !== usuarioUUID) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para acceder a esta cuenta." });
    }

    const cuentaUUID = cuentaData.id;

    // 3.Llama al Stored Procedure
    const { data, error } = await supabase.rpc("sp_account_movements_list", {
      p_account_id: cuentaUUID,
      p_from_date: from_date || null,
      p_to_date: to_date || null,
      p_page: parseInt(page),
      p_page_size: parseInt(page_size),
      p_q: q || null,
      p_type: type || null,
    });

    if (error) {
      console.error("Error al obtener movimientos:", error);
      return res.status(500).json({
        message: "Error al obtener movimientos de la cuenta",
        details: error.message,
      });
    }

    // 4.Respuesta exitosa
    return res.status(200).json({
      message: "Movimientos obtenidos correctamente",
      data,
    });
  } catch (err) {
    console.error("Error en getAccountMovements:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
