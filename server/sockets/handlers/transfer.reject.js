import { supabase } from "../../config/supabase.js";


export async function handleReject(socket, data) {
  const { id, reason } = data;

  // Llama al SP para marcar el movimiento como rechazado
  await supabase.rpc("sp_transfer_reject", {
    p_movimiento_id: id,
    p_reason: reason
  });

  const response = {
    type: "transfer.reject.result",
    data: {
      id,
      ok: true,
      reason
    }
  };

  socket.send(JSON.stringify(response));
}
