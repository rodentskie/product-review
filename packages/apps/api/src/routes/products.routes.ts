import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../handlers/products.handler';

export const productsRouter = Router();

productsRouter.post('/', createProduct);
productsRouter.get('/', getProducts);
productsRouter.get('/:id', getProduct);
productsRouter.patch('/:id', updateProduct);
productsRouter.delete('/:id', deleteProduct);
