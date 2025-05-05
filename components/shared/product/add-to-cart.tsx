'use client';

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Cart, CartItem } from "@/types";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";

interface AddToCartProps {
  cart?: Cart;
  item: CartItem;
};

const AddToCart = ({ item, cart }: AddToCartProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCard = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (res.success) {
        toast.success(res.message, {
          action: {
            label: 'Go To Cart',
            onClick: () => router.push('/cart'),
          },
        })
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleRemoveFromCard = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message);
      }
    });
  };

  const existItem = cart && cart.items.find(x => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button type="button" variant={'outline'} onClick={handleRemoveFromCard}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" variant={'outline'} onClick={handleAddToCard}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCard}>
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Add To Card
    </Button>
  );
};

export default AddToCart;
