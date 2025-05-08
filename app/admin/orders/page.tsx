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

const AdminOrdersPage = async (props: { searchParams: Promise<{ query: string, page: string }> }) => {
  await requiredAdmin();

  const { query, page } = await props.searchParams;
  const orders = await getAllOrders({
    query: query || '',
    page: Number(page) || 1,
  });

  return (
    <div className="space-y-2 ">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Orders</h1>
        {query && (
          <div>
            Filtered by <i>&quot;{query}&quot;</i>{' '}
            <Link href={'/admin//orders'}>
              <Button variant={'outline'} size={'sm'}>Remove Filter</Button>
            </Link>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>BAYER</TableHead>
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
                  {order.user.name}
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
