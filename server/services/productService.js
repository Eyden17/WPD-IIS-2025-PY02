import fs from "fs/promises";
import path from "path";
const dbPath = path.resolve("db/products.json");

// Helper: leer todo el array crudo
async function readAll() {
  const data = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(data); // array de productos
}

// Funcion para leer todos los productos
export const getAllProducts = async ({ page = 1, limit = 10 }) => {
  try {
    const products = await readAll();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedProducts = products.slice(startIndex, endIndex);

    const totalPages = Math.ceil(products.length / limitNum);

    return {
      products: paginatedProducts,
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalItems: products.length,
    };
  } catch (err) {
    throw { statusCode: 500, message: "Error reading database" };
  }
};

// Funcion para obtener un producto por su ID
export const getProductById = async (id) => {
  const products = await readAll();
  const product = products.find((p) => String(p.id) === String(id));
  if (!product) {
    throw { statusCode: 404, message: `Product with ID ${id} not found` };
  }
  return product;
};

// Funcion para crear un nuevo producto
export const createProduct = async (productData) => {
  const products = await readAll();

  // Validaciones de datos
  if (!productData || typeof productData !== "object") {
    throw { statusCode: 400, message: "Invalid product data" };
  }

  if (!productData.name || typeof productData.name !== "string") {
    throw { statusCode: 422, message: "Product name is required" };
  }

  if (!productData.sku || typeof productData.sku !== "string") {
    throw { statusCode: 422, message: "Product SKU is required" };
  }

  if (typeof productData.price !== "number" || productData.price <= 0) {
    throw { statusCode: 422, message: "Price must be a positive number" };
  }

  if (typeof productData.stock !== "number" || productData.stock < 0) {
    throw { statusCode: 422, message: "Stock must be a number greater than or equal to 0" };
  }

  if (products.find(p => p.sku === productData.sku)) {
    throw { statusCode: 409, message: "SKU already exists" };
  }

  // Crear el nuevo producto
  const newProduct = { id: String(Date.now()), ...productData };
  products.push(newProduct);

  // Guardar en el JSON
  try {
    await fs.writeFile(dbPath, JSON.stringify(products, null, 2));
  } catch (err) {
    throw { statusCode: 500, message: "Error saving to database" };
  }

  return newProduct;
};

// Funcion para actualizar un producto existente
export const updateProduct = async (id, productData) => {
  if (!id) {
    throw { statusCode: 400, message: "Product ID is required" };
  }

  const products = await readAll();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    throw { statusCode: 404, message: "Product not found" };
  }

  if (productData.sku && products.some(p => p.sku === productData.sku && p.id !== id)) {
    throw { statusCode: 409, message: "SKU already exists in another product" };
  }

  if (productData.price !== undefined && (typeof productData.price !== "number" || productData.price <= 0)) {
    throw { statusCode: 422, message: "Price must be a positive number" };
  }

  if (productData.stock !== undefined && (typeof productData.stock !== "number" || productData.stock < 0)) {
    throw { statusCode: 422, message: "Stock must be a number greater than or equal to 0" };
  }

  // Mezclamos el producto existente con los nuevos datos
  products[index] = { ...products[index], ...productData };

  try {
    await fs.writeFile(dbPath, JSON.stringify(products, null, 2));
  } catch (err) {
    throw { statusCode: 500, message: "Error updating database" };
  }

  return products[index];
};

// Eliminar producto
export const deleteProduct = async (id) => {
  if (!id) {
    throw { statusCode: 400, message: "Product ID is required" };
  }

  const products = await readAll();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    throw { statusCode: 404, message: "Product not found" };
  }

  products.splice(index, 1);

  try {
    await fs.writeFile(dbPath, JSON.stringify(products, null, 2));
  } catch (err) {
    throw { statusCode: 500, message: "Error deleting from database" };
  }

  return true;
};
