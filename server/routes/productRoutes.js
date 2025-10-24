// ENDPOINTS DE PRODUCTOS
import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";


import { apiKeyMiddleware } from "../middleware/apiKeyMiddleware.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();


/**
 * RUTAS DE PRODUCTOS
 * 
 * - GET (listar/detalle): protegidos con API Key.
 * - POST/PUT: protegidos con JWT y roles ("editor", "admin").
 * - DELETE: solo permitido para "admin".
 */

// Listar productos (ej: GET /products?page=1&limit=10)
// Necesita API Key en header: x-api-key
router.get("/", apiKeyMiddleware, getProducts);

// Detalle de un producto por ID (ej: GET /products/123)
router.get("/:id", apiKeyMiddleware, getProductById);

// Crea un producto nuevo (ej: POST /products)
router.post("/", authMiddleware, roleMiddleware(["editor", "admin"]), createProduct);
// Actualiza un producto existente (ej: PUT /products/123)
router.put("/:id", authMiddleware, roleMiddleware(["editor", "admin"]), updateProduct);

// Elimina un producto (ej: DELETE /products/123)

router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteProduct);

export default router;
