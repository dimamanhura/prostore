import { Metadata } from "next";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@/auth";
import CheckoutSteps from "@/components/checkout-steps";
import PaymentMethodForm from "@/components/payment-method-form";

export const metadata: Metadata = {
  title: 'Select Payment Method',
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('No user id');
  }

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
  );
};

export default PaymentMethodPage;
