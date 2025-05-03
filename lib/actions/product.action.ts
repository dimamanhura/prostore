'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject } from '@/lib/utils';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return convertToPlainObject(data);
};

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug },
  });
  return product;
};
