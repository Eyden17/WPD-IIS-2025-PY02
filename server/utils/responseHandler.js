import js2xmlparser from "js2xmlparser";

/**
 * Devuelve respuestas consistentes en JSON o XML según el header Accept.
 * Detecta automáticamente el tipo de recurso (cards, users, accounts, etc.)
 * y ajusta la clave del arreglo para especificidad.
 */
export const successResponse = (req, res, data, message = "Success") => {
  const path = req.originalUrl || "";
  let key = "items";

  if (path.includes("/cards")) key = "cards";
  else if (path.includes("/users")) key = "users";
  else if (path.includes("/accounts")) key = "accounts";
  else if (path.includes("/movements")) key = "movements";
  else if (path.includes("/otp")) key = "otps";
  else if (path.includes("/roles")) key = "roles";
  else if (path.includes("/moneda")) key = "monedas";

  const responseData = Array.isArray(data)
    ? { [key]: data }
    : typeof data === "object" && data !== null
    ? data
    : { value: data };

  const responseObj = {
    success: true,
    message,
    data: responseData,
    path,
    timestamp: new Date().toISOString(),
  };

  const accept = req.headers?.["accept"] || "";
  if (accept.includes("application/xml")) {
    const xml = js2xmlparser.parse("response", responseObj);
    res.set("Content-Type", "application/xml");
    return res.status(200).send(xml);
  }

  return res.status(200).json(responseObj);
};