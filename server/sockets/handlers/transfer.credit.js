import { supabase } from "../../config/supabase.js";


export async function handleCredit(socket, data) {
  const { id, to: p_to_iban } = data;

  const { data: result, error } = await supabase
    .rpc("sp_transfer_credit", { p_movimiento_id: id, p_to_iban });

  const response = {
    type: "transfer.credit.result",
    data: {
      id,
      ok: !error && result[0].ok,
      reason: error ? error.message : result[0].reason
    }
  };

  socket.send(JSON.stringify(response));
}
