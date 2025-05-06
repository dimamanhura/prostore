'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.action";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";

export async function createOrder() {
  try {
    const session = await auth();

    if (!session) {
      throw new Error('User is ot authenticated')
    }

    const cart = await getMyCart();

    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('User not found');
    }

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        redirectTo: '/cart',
        message: 'Your cart is empty',
      }; 
    }

    if (!user.address) {
      return {
        success: false,
        redirectTo: '/shipping-address',
        message: 'No shipping address',
      }; 
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        redirectTo: '/payment-method',
        message: 'No payment method',
      }; 
    }

    const order = insertOrderSchema.parse({
      userId,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });

      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            orderId: insertedOrder.id, 
          },
        });
      }

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) {
      throw new Error('Order not created');
    }

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/orders/${insertedOrderId}`,
    };
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }
  
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      }, 
    },
  });
  return convertToPlainObject(data);
};
