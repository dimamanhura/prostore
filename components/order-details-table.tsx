'use client';

import { Order } from "@/types";
import { formatCurrency, formatId } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import Image from "next/image";
import Link from "next/link";

interface OrderDetailsTableProps {
  order: Order;
};

const OrderDetailsTable = ({ order }: OrderDetailsTableProps) => {
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

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>

      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overflow-x-auto">
          <Card>
            <CardContent className="px-4 gap-4">
              <h2 className="text-xl pb-2">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              { isPaid ? (
                <Badge variant={'secondary'}>
                  Paid at {paidAt?.toLocaleDateString()}
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
              { isDelivered ? (
                <Badge variant={'secondary'}>
                  Delivered at {deliveredAt?.toLocaleDateString()}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
