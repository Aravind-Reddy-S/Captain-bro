import { 
  getProductsDb, 
  getProductByIdDb, 
  createProductDb, 
  updateProductDb, 
  deleteProductDb 
} from '../firebase/database';

export const getProducts = async () => {
  return await getProductsDb();
};

export const getProductById = async (id) => {
  return await getProductByIdDb(id);
};

export const createProduct = async (productData) => {
  return await createProductDb(productData);
};

export const updateProduct = async (id, updatedData) => {
  return await updateProductDb(id, updatedData);
};

export const deleteProduct = async (id) => {
  return await deleteProductDb(id);
};
