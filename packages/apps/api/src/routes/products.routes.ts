import { Router } from 'express';
import { createProduct } from '../handlers/products.handler';

export const productsRouter = Router();

productsRouter.post('/', createProduct);
