import { supabase } from "../../config/supabase.js";


export async function handleDebit(socket, data) {
  const { id } = data;

  const { data: result, error } = await supabase
    .rpc("sp_transfer_debit", { p_movimiento_id: id });

  const response = {
    type: "transfer.debit.result",
    data: {
      id,
      ok: !error && result[0].ok,
      reason: error ? error.message : result[0].reason
    }
  };

  socket.send(JSON.stringify(response));
}
