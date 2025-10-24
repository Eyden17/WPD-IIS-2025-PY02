// Maneja interracion entre la respuesta y las consultas a la base de datos PRODUCTS

import * as productService from '../services/productService.js';
import { successResponse } from '../utils/responseHandler.js';

/**
 * GET /products
 * Obtiene todos los productos.
 */
export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Paginación
    const products = await productService.getAllProducts({ page, limit });
    return successResponse(req, res, products, "Products retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /products/:id
 * Obtiene un producto por su ID.
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    return successResponse(req, res, product, "Product retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /products
 * Crea un nuevo producto. Requiere autenticacion JWT y rol de editor o admin.
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    const product = await productService.createProduct(productData);
    return successResponse(req, res, product, "Product created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /products/:id
 * Actualiza un producto existente. Requiere autenticacion JWT y rol de editor o admin.
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const updatedProduct = await productService.updateProduct(id, productData);
    return successResponse(req, res, updatedProduct, "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /products/:id
 * Elimina un producto. Requiere autenticacion JWT y rol de admin.
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    return successResponse(req, res, null, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};
