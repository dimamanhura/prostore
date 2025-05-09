'use client';

import { Order } from "@/types";
import { formatCurrency, formatId } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import Image from "next/image";
import Link from "next/link";
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { approvePaypalOrder, createPayPalOrder, updateOrderToPaidCOD, deliverOrder } from "@/lib/actions/order.action";
import { toast } from "sonner";
import { useTransition } from "react";
import { Button } from "./ui/button";
import StripePayment from "./stripe-payment";

interface OrderDetailsTableProps {
  stripeClientSecret: string | null;
  paypalClientId: string;
  isAdmin: boolean;
  order: Omit<Order, 'paymentResult'>;
};

const OrderDetailsTable = ({ order, isAdmin, paypalClientId, stripeClientSecret }: OrderDetailsTableProps) => {
  const {
    id,
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = '';

    if (isPending) {
      status = 'Loading...';
    } else if (isRejected) {
      status = 'Error Loading PayPal';
    }

    return status;
  };

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (res.success) {
      return res.data;
    } else {
      toast.error(res.message);
    }
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePaypalOrder(order.id, data);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const MarkAsPaidButton = () => {
    const [pending, startTransition] = useTransition();
    return (
      <Button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => {
          const res = await updateOrderToPaidCOD(id);

          if (res.success) {
            toast.success(res.message);
          } else {
            toast.error(res.message);
          }
        })}
      >
        {pending ? 'Processing...' : 'Mark As Paid'}
      </Button>
    );
  };

  const MarkAsDeliveredButton = () => {
    const [pending, startTransition] = useTransition();
    return (
      <Button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => {
          const res = await deliverOrder(id);

          if (res.success) {
            toast.success(res.message);
          } else {
            toast.error(res.message);
          }
        })}
      >
        {pending ? 'Processing...' : 'Mark As Delivered'}
      </Button>
    );
  };

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>

      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overflow-x-auto">
          <Card>
            <CardContent className="px-4 gap-4">
              <h2 className="text-xl pb-2">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              { isPaid && paidAt ? (
                <Badge variant={'secondary'}>
                  Paid at {new Date(paidAt)?.toISOString()}
                </Badge>
              ) : (
                <Badge variant={'destructive'}>
                  Not paid
                </Badge>
              ) }
            </CardContent>
          </Card>

          <Card className="my-2">
            <CardContent className="px-4 gap-4">
              <h2 className="text-xl pb-2">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.streetAddress}, {shippingAddress.city}</p>
              <p className="mb-2">{shippingAddress.postalCode}, {shippingAddress.country}</p>
              { isDelivered && deliveredAt ? (
                <Badge variant={'secondary'}>
                  Delivered at {new Date(deliveredAt)?.toISOString()}
                </Badge>
              ) : (
                <Badge variant={'destructive'}>
                  Not delivered
                </Badge>
              ) }
            </CardContent>
          </Card>

          <Card className="my-2">
            <CardContent className="px-4 gap-4">
              <h2 className="text-xl pb-2">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map(item => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link href={`/products/${item.slug}`} className="flex items-center">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="px-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/* PayPal Payment */}
              {!isPaid && paymentMethod === 'PayPal' && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Stripe Payment */}
              {!isPaid && paymentMethod === 'Stripe' && stripeClientSecret && (
                <StripePayment
                  priceInCents={Number(order.totalPrice) * 100}
                  orderId={order.id}
                  clientSecret={stripeClientSecret}
                />
              )}

              {/* Cash On Delivery */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton />
              )}

              {/* Cash On Delivery */}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
