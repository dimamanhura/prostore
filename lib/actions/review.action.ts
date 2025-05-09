'use server';

import { z } from "zod";
import { insertReviewSchema } from "../validator";
import { formatErrors } from "../utils";
import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>) {
  try {
    const session = await auth();

    if (!session) {
      throw new Error('User is not authenticated')
    }
  
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    const product = await prisma.product.findFirst({
      where: { id: review.productId }
    });

    if (!product) {
      throw new Error('Product not found')
    }

    const reviewExist = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExist) {
        await tx.review.update({
          where: { id: reviewExist.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        await tx.review.create({
          data: review,
        });
      }

      const avgRating = await tx.review.aggregate({
        _avg: {
          rating: true,
        },
        where: {
          productId: review.productId,
        },
      });

      const numReviews = await tx.review.count({
        where: {
          productId: review.productId,
        },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: avgRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      message: 'Review updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  } 
};

export async function getAllProductReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { data };
};

export async function getReviewByProductId({ productId }: { productId: string }) {
  const session = await auth();

  if (!session) {
    throw new Error('User is not authenticated')
  }

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session.user.id,
    },
  });
};
