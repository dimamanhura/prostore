'use client';

import { Cart } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader, ArrowRight } from "lucide-react";
import { toast } from "sonner"; 
import { useTransition } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import Image from "next/image";
import { Button } from "./ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";

interface CartTableProps {
  cart?: Cart;
};

const CartTable = ({ cart }: CartTableProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <h1 className="py-2 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href={'/'}>Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map(item => (
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
                    <TableCell className="flex-center gap-2">
                      <Button
                        disabled={isPending}
                        variant={'outline'}
                        type={'button'}
                        onClick={() => startTransition(async () => {
                          const res = await removeItemFromCart(item.productId);
                          if (res.success) {
                            toast.success(res.message);
                          } else {
                            toast.error(res.message);
                          }
                        })}
                      >
                        {isPending ? (
                          <Loader className="w-4 h4 animate-spin"/>
                        ) : (
                          <Minus className="w-4 h4" />
                        )}
                      </Button>
                      <span>{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant={'outline'}
                        type={'button'}
                        onClick={() => startTransition(async () => {
                          const res = await addItemToCart(item);
                          if (res.success) {
                            toast.success(res.message);
                          } else {
                            toast.error(res.message);
                          }
                        })}
                      >
                        {isPending ? (
                          <Loader className="w-4 h4 animate-spin"/>
                        ) : (
                          <Plus className="w-4 h4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal ({ cart.items.reduce((a, i) => a + i.qty, 0) })
                <span className="font-bold">
                  {formatCurrency(cart.totalPrice)}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => startTransition(async () => {
                  router.push('/shipping-address')
                })}
              >
                {isPending ? (
                  <Loader className="w-4 h4 animate-spin"/>
                ) : (
                  <ArrowRight className="w-4 h4" />
                )} Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
