import Pagination from "@/components/pagination";
import DeleteDialog from "@/components/shared/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteUser, getAllUsers } from "@/lib/actions/user.action";
import { requiredAdmin } from "@/lib/auth-guard";
import { formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Admin Users',
};

const AdminUsersPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>
}) => {
  await requiredAdmin();

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  const users = await getAllUsers({
    page,
  });

  return (
    <div className="space-y-2">
      <h1 className="h2-bold">Users</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  {formatId(user.id)}
                </TableCell>

                <TableCell>
                  {user.name}
                </TableCell>

                <TableCell>
                  {user.email}
                </TableCell>

                <TableCell>
                  {user.role === 'admin' ? (
                    <Badge variant={'default'}>{user.role}</Badge>
                  ) : (
                    <Badge variant={'secondary'}>{user.role}</Badge>
                  )}
                  
                </TableCell>
              

                <TableCell className="flex gap-1">
                  <Button asChild variant={'outline'} size={'sm'}>
                    <Link href={`/admin/users/${user.id}`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {
          users.totalPages > 1 && (
            <Pagination page={Number(page) || 1} totalPages={users.totalPages} />
          )
        }
      </div>
    </div>
  );
};

export default AdminUsersPage;
