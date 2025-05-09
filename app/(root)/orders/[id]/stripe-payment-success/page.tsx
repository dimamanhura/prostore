import { Button } from '@/components/ui/button';
import { getOrderById } from '@/lib/actions/order.action';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Stripe from 'stripe';

export const metadata: Metadata = {
  title: 'Strip Payment Success',
};

interface OrderDetailsPageProps {
  searchParams: Promise<{ payment_intent: string }>
  params: Promise<{ id: string }>
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const StripePaymentSuccessPage = async ({ searchParams, params }: OrderDetailsPageProps) => {
  const { id } = await params;
  const { payment_intent: paymentIntentId } = await searchParams;
  const order = await getOrderById(id);

  if (!order) {
    return notFound();
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (!paymentIntent?.metadata?.orderId || paymentIntent?.metadata?.orderId !== order.id) {
    return notFound();
  }

  const isSuccess = paymentIntent.status === 'succeeded';

  if (!isSuccess) {
    return redirect(`/orders/${order.id}`);
  }

  return (
    <div className='max-w-4xl w-full mx-auto space-y-8'>
      <div className='flex flex-col gap-6 items-center'>
        <h1 className='h1-bold'>Thanks for your purchase</h1>
        <div>We are processing your order.</div>
        <Button asChild>
          <Link href={`/orders/${order.id}`}>
            View Order
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default StripePaymentSuccessPage;
