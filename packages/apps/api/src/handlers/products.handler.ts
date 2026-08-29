import { Request, Response } from 'express';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import { Prisma, PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number({ error: 'Price is required and must be a number' }).positive({ message: 'Price must be greater than 0' }),
  image: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

const productParamsSchema = z.object({
  id: z.string().min(1),
});

const getProductsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(5),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function createProduct(req: Request, res: Response) {
  const result = createProductSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid product data',
      errors: z.flattenError(result.error).fieldErrors,
    });
  }

  const { name, description, price, image } = result.data;

  const existingProduct = await prisma.product.findFirst({
    where: {
      name: {
        contains: name,
        mode: 'insensitive'
      }
    }
  });

  if (existingProduct) {
    return res.status(409).json({ message: 'Product already exists' });
  }

  const product = await prisma.product.create({
    data: { name, description, price, image },
  });

  return res.status(201).json(product);
}

export async function getProducts(req: Request, res: Response) {
  const result = getProductsQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid query parameters',
      errors: z.flattenError(result.error).fieldErrors,
    });
  }

  const { limit, offset } = result.data;

  const [count, data] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({ take: limit, skip: offset }),
  ]);

  return res.status(200).json({ count, data });
}

export async function getProduct(req: Request, res: Response) {
  const paramsResult = productParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid product id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const { id } = paramsResult.data;

  const product = await prisma.product.findFirst({
    where: { id },
    include: { reviews: true },
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const paramsResult = productParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid product id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const bodyResult = updateProductSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      message: 'Invalid product data',
      errors: z.flattenError(bodyResult.error).fieldErrors,
    });
  }

  const { id } = paramsResult.data;
  const { name } = bodyResult.data;

  const existingProduct = await prisma.product.findFirst({ where: { id } });

  if (!existingProduct) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (name) {
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        id: { not: id },
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });

    if (duplicateProduct) {
      return res.status(409).json({ message: 'Product already exists' });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: bodyResult.data,
  });

  return res.status(200).json(product);
}

export async function deleteProduct(req: Request, res: Response) {
  const paramsResult = productParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      message: 'Invalid product id',
      errors: z.flattenError(paramsResult.error).fieldErrors,
    });
  }

  const { id } = paramsResult.data;

  try {
    await prisma.product.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }

    throw error;
  }
}
