'use client';

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { updateUserPaymentMethod } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod"
import { paymentMethodSchema } from "@/lib/validator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { ArrowRight, Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface PaymentMethodFormProps {
  preferredPaymentMethod?: string | null;
};

const PaymentMethodForm = ({ preferredPaymentMethod }: PaymentMethodFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD },
  });

  const onSubmit: SubmitHandler<z.infer<typeof paymentMethodSchema>> = (values) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      router.push('/place-order');
    })
  };

  const [isPending, startTransition] = useTransition();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="h2-bold mt-4">
        Payment Method
      </h2>
      <p className="text-sm text-muted-foreground">
        Please select a payment method
      </p>
      <Form {...form}>
        <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormControl>
                    <RadioGroup
                      className="flex flex-col space-y-2"
                      onValueChange={field.onChange}
                    >
                      {PAYMENT_METHODS.map(paymentMethod => (
                        <FormItem
                          key={paymentMethod}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={paymentMethod} checked={field.value === paymentMethod} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {paymentMethod}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentMethodForm;
