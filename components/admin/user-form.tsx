'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod"
import { updateUserSchema } from "@/lib/validator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { USER_ROLES } from "@/lib/constants";
import { updateUser } from "@/lib/actions/user.action";

interface UserFormProps {
  user: z.infer<typeof updateUserSchema>;
};

const UserForm = ({ user }: UserFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });

  const onSubmit: SubmitHandler<z.infer<typeof updateUserSchema>> = async (values) => {
    const res = await updateUser({ ...values, id: user.id });

    if (res.success) {
      router.push('/admin/users');
      toast.success(res.message);
    } else {
      toast.success(res.message);
    }
  
    return;
  };

  return (
    <Form {...form}>
      <form method="post" className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter user email"
                    className="input-field"
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter user name"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Role</FormLabel>
                <Select value={field.value.toString()} onValueChange={field.onChange}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)} 
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button type="submit" size={'lg'} className="button col-span-2 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Submitting...' : `Update User`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
