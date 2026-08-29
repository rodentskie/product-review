import { Request, Response } from 'express';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import { Prisma, PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createReviewSchema = z.object({
  rating: z.number({ error: 'Rating is required and must be a number' }).int().min(1).max(5),
  comment: z.string().optional(),
});

const updateReviewSchema = createReviewSchema.partial();

const productParamsSchema = z.object({
  productId: z.string().min(1),
});

const reviewParamsSchema = z.object({
  id: z.string().min(1),
});

const getReviewsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(5),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function createReview(req: Request, res: Response) {
  const paramsResult = productParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid product id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const bodyResult = createReviewSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      message: 'Invalid review data',
      errors: z.flattenError(bodyResult.error).fieldErrors,
    });
  }

  const { productId } = paramsResult.data;
  const { rating, comment } = bodyResult.data;

  const product = await prisma.product.findFirst({ where: { id: productId } });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const review = await prisma.review.create({
    data: { rating, comment, productId },
  });

  return res.status(201).json(review);
}

export async function getReviews(req: Request, res: Response) {
  const paramsResult = productParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid product id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const queryResult = getReviewsQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      message: 'Invalid query parameters',
      errors: z.flattenError(queryResult.error).fieldErrors,
    });
  }

  const { productId } = paramsResult.data;
  const { limit, offset } = queryResult.data;

  const product = await prisma.product.findFirst({ where: { id: productId } });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const [count, data] = await Promise.all([
    prisma.review.count({ where: { productId } }),
    prisma.review.findMany({ where: { productId }, take: limit, skip: offset }),
  ]);

  return res.status(200).json({ count, data });
}

export async function getReview(req: Request, res: Response) {
  const paramsResult = reviewParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid review id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const { id } = paramsResult.data;

  const review = await prisma.review.findFirst({ where: { id } });

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  return res.status(200).json(review);
}

export async function updateReview(req: Request, res: Response) {
  const paramsResult = reviewParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid review id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const bodyResult = updateReviewSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      message: 'Invalid review data',
      errors: z.flattenError(bodyResult.error).fieldErrors,
    });
  }

  const { id } = paramsResult.data;

  try {
    const review = await prisma.review.update({
      where: { id },
      data: bodyResult.data,
    });

    return res.status(200).json(review);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Review not found' });
    }

    throw error;
  }
}

export async function deleteReview(req: Request, res: Response) {
  const paramsResult = reviewParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid review id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const { id } = paramsResult.data;

  try {
    await prisma.review.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Review not found' });
    }

    throw error;
  }
}
