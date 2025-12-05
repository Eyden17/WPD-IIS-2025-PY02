import { supabase } from "../../config/supabase.js";


export async function handleRollback(data) {
  const { id, reason } = data;

  await supabase.rpc("sp_transfer_rollback", {
    p_movimiento_id: id,
    p_reason: reason
  });

  // No responde al BC, solo registra la reversión
}
