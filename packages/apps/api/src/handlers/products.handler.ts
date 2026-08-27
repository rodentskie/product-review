import { Request, Response } from 'express';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number({ error: 'Price is required and must be a number' }).positive({ message: 'Price must be greater than 0' }),
  image: z.string().optional(),
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

  const existingProduct = await prisma.product.findFirst({ where: { name } });

  if (existingProduct) {
    return res.status(409).json({ message: 'Product already exists' });
  }

  const product = await prisma.product.create({
    data: { name, description, price, image },
  });

  return res.status(201).json(product);
}
