'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.action";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem, OrderItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

export async function createOrder() {
  try {
    const session = await auth();

    if (!session) {
      throw new Error('User is not authenticated')
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

export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new Error('Order not found')
    }

    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          email_address: '',
          status: '',
          pricePaid: 0,
        },
      }
    });

    return {
      success: true,
      message: 'Item order created successfully',
      data: paypalOrder.id,
    };
  } catch (err) {  
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function approvePaypalOrder(orderId: string, data: { orderID: string }) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new Error('Order not found')
    }

    const captureData = await paypal.capturePayment(data.orderID);

    if (!captureData || captureData.id !== (order.paymentResult as PaymentResult) ?.id || captureData.status !== 'COMPLETED') {
      throw new Error('Error in PayPal payment')
    }

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    })

    revalidatePath(`/orders/${order.id}`);

    return {
      success: true,
      message: 'Your order has been paid',
    };
  } catch (err) {  
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult: PaymentResult;
}) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.isPaid) {
    throw new Error('Order is already paid');
  } 

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems as OrderItem[]) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  const updatedOrder = await prisma.order.findFirst({
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

  if (!updatedOrder) {
    throw new Error('Order not found')
  }

  return updatedOrder;
};

export async function getMyOrders({
  limit = PAGE_SIZE,
  page = 1,
}: {
  limit?: number,
  page: number,
}) {
  const session = await auth();

  if (!session) {
    throw new Error('User is not authenticated')
  }

  const data = await prisma.order.findMany({
    where: {
      userId: session.user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: {
      userId: session.user?.id,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  }
};

type SalesDataType = {
  totalSales: number;
  month: string;
}[];

export async function getOrderSummary() {
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  const salesDataRaw = await prisma.$queryRaw<Array<{
    totalSales: Prisma.Decimal;
    month: string;
  }>>`
    SELECT
      to_char("createdAt", 'MM/YY') as "month",
      sum("totalPrice") as "totalSales"
    FROM "Order"
    GROUP BY to_char("createdAt", 'MM/YY')
  `;

  const salesData: SalesDataType = salesDataRaw.map(entry => ({
    totalSales: Number(entry.totalSales),
    month: entry.month,
  }));

  const latestSales = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      }
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
};
