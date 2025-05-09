import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order.action";
import { Metadata } from "next";
import OrderDetailsTable from "@/components/order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: 'Order Details',
};

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
};

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const { id } = await params;
  const order = await getOrderById(id);
  
  if (!order) {
    return notFound();
  }

  const session = await auth();

  let stripeClientSecret = null;

  if (order.paymentMethod == 'Stripe' && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: 'USD',
      metadata: {
        orderId: order.id,
      },
    });
    stripeClientSecret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      stripeClientSecret={stripeClientSecret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin'}
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
    />
  );
};

export default OrderDetailsPage;
