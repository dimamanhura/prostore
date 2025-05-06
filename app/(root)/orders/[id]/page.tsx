import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order.action";
import { Metadata } from "next";
import OrderDetailsTable from "@/components/order-details-table";
import { ShippingAddress } from "@/types";

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

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
    />
  );
};

export default OrderDetailsPage;
