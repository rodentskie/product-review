import { Request, Response } from 'express';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function createProduct(req: Request, res: Response) {
  const { name, description, price, image } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'name and price are required' });
  }

  const product = await prisma.product.create({
    data: { name, description, price, image },
  });

  return res.status(201).json(product);
}
