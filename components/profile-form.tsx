'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/actions/user.action";
import { toast } from "sonner";
import { z } from "zod"
import { updateProfileSchema } from "@/lib/validator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useSession } from "next-auth/react";

const ProfileForm = () => {
  const { data: session, update } = useSession();

  console.log('session', session)

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof updateProfileSchema>> = async (values) => {
    const res = await updateProfile(values);
  
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: values.name,
      }
    };

    await update(newSession);

    toast.success(res.message);

    return;
  };

  return (
    <Form {...form}>
      <form method="post" className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter" className="input-field" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" className="input-field" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size={'lg'} className="button col-span-2 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
