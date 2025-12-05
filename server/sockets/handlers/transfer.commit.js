import { supabase } from "../../config/supabase.js";


export async function handleCommit(data) {
  const { id } = data;

  await supabase.rpc("sp_transfer_commit", { p_movimiento_id: id });

  // No responde al BC, solo marca la transacción como finalizada
}
