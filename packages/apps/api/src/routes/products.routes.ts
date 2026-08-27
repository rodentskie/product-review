import { Router } from 'express';
import { createProduct, getProducts } from '../handlers/products.handler';

export const productsRouter = Router();

productsRouter.post('/', createProduct);
productsRouter.get('/', getProducts);
