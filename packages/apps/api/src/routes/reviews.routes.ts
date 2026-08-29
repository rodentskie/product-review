import { Router } from 'express';
import { deleteReview, getReview, updateReview } from '../handlers/reviews.handler';

export const reviewsRouter = Router();

reviewsRouter.get('/:id', getReview);
reviewsRouter.patch('/:id', updateReview);
reviewsRouter.delete('/:id', deleteReview);
