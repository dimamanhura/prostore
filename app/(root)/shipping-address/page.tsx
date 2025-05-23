import { Metadata } from "next";
import { getMyCart } from "@/lib/actions/cart.action";
import { getUserById } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ShippingAddressForm from "@/components/shipping-address-form";
import { ShippingAddress } from "@/types";
import CheckoutSteps from "@/components/checkout-steps";

export const metadata: Metadata = {
  title: 'Shipping Address',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) {
    return redirect('/cart');
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('No user id');
  }

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
