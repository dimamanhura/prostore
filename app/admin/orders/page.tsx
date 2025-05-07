import Pagination from "@/components/pagination";
import DeleteDialog from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.action";
import { requiredAdmin } from "@/lib/auth-guard";
import { formatCurrency, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Admin Orders',
};

const AdminOrdersPage = async (props: { searchParams: Promise<{ page: string }> }) => {
  await requiredAdmin();

  const { page } = await props.searchParams;
  const orders = await getAllOrders({ page: Number(page) || 1 });

  return (
    <div className="space-y-2 ">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map(order => (
              <TableRow key={order.id}>
                <TableCell>
                  {formatId(order.id)}
                </TableCell>

                <TableCell>
                  {order.createdAt.toISOString()}
                </TableCell>

                <TableCell>
                  {formatCurrency(order.totalPrice)}
                </TableCell>

                <TableCell>
                  {order.isPaid && order.paidAt ? order.paidAt.toISOString() : 'Not paid'}
                </TableCell>

                <TableCell>
                  {order.isDelivered && order.deliveredAt ? order.deliveredAt.toISOString() : 'Not delivered'}
                </TableCell>

                <TableCell>
                  <Button asChild variant={'outline'} size={'sm'}>
                    <Link href={`/orders/${order.id}`}>
                      Details
                    </Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {
          orders.totalPages > 1 && (
            <Pagination page={Number(page) || 1} totalPages={orders.totalPages} />
          )
        }
      </div>
    </div>
  );
};

export default AdminOrdersPage;
