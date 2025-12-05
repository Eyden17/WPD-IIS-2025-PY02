import { supabase } from "../../config/supabase.js";


export async function handleInit(data) {
  const { id } = data;

  // Solo informativo, no responde al BC
  await supabase
    .rpc("sp_transfer_init", { p_movimiento_id: id });
}
