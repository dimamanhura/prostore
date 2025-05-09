'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject, formatErrors } from '@/lib/utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { insertProductSchema, updateProductSchema } from '../validator';
import { Prisma } from '@prisma/client';

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

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id },
  });
  return convertToPlainObject(product);
};

export async function getAllProducts({ 
  price,
  rating,
  category,
  sort,
  query,
  limit = PAGE_SIZE,
  page,
}: {
  price?: string;
  rating?: string;
  category?: string;
  sort?: string;
  query: string;
  limit?: number;
  page: number;
}) {
  const queryFilter: Prisma.ProductWhereInput = query && query !== 'all' ? {
    name: {
      contains: query,
      mode: 'insensitive' 
    }
  }: {};

  const categoryFilter: Prisma.ProductWhereInput = category && category !== 'all' ? { category }: {};

  const priseFilter: Prisma.ProductWhereInput = price && price !== 'all' ? {
    price: {
      gte: Number(price.split('-')[0]),
      lte: Number(price.split('-')[1]),
    }
  } : {};

  const ratingFilter: Prisma.ProductWhereInput = rating && rating !== 'all' ? {
    rating: {
      gte: Number(rating),
    }
  } : {};


  const data = await prisma.product.findMany({
    where: { ...queryFilter, ...categoryFilter, ...priseFilter, ...ratingFilter },
    orderBy: sort === 'lowest'
      ? { price: 'asc' }
      : sort === 'highest'
        ? { price: 'desc' }
        : sort === 'rating'
          ? { rating: 'desc' }
          : { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.product.count({
    where: { ...queryFilter, ...categoryFilter, ...priseFilter, ...ratingFilter },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  }
};

export async function deleteProduct(id: string) {
  try {
    const existedProduct = await prisma.product.findFirst({
      where: {
        id,
      }
    });

    if (!existedProduct) {
      throw new Error('Product not found');
    }
  
    await prisma.product.delete({ where: { id } });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const existedProduct = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!existedProduct) {
      throw new Error('Product not found');
    }

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
  });

  return data;
};

export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 4,
  });

  return convertToPlainObject(data);
};
