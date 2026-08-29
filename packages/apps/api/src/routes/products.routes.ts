import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../handlers/products.handler';
import { createReview, getReviews } from '../handlers/reviews.handler';

export const productsRouter = Router();

productsRouter.post('/', createProduct);
productsRouter.get('/', getProducts);
productsRouter.get('/:id', getProduct);
productsRouter.patch('/:id', updateProduct);
productsRouter.delete('/:id', deleteProduct);

productsRouter.post('/:productId/reviews', createReview);
productsRouter.get('/:productId/reviews', getReviews);
