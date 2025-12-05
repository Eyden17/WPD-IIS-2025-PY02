import { supabase } from "../../config/supabase.js";


export async function handleIntent(socket, data) {
  const { id: movimiento_id } = data;

  const { data: result, error } = await supabase
    .rpc("sp_transfer_intent", { p_movimiento_id: movimiento_id });

  const response = {
    type: "transfer.intent.result",
    data: {
      id: movimiento_id,
      transfer_id: result && result[0]?.transfer_id,
      token: result && result[0]?.token,
      ok: !error
    }
  };

  socket.send(JSON.stringify(response));
}
