import js2xmlparser from "js2xmlparser";

export const successResponse = (req, res, data, message = "Success") => {
  const responseData =
    Array.isArray(data) ? { products: data } : data;

  const responseObj = {
    success: true,
    message,
    data: responseData,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  const accept = req?.headers?.["accept"] || "";

  if (accept.includes("application/xml")) {
    const xml = js2xmlparser.parse("response", responseObj);
    res.set("Content-Type", "application/xml");
    return res.status(200).send(xml);
  }

  return res.json(responseObj);
};
