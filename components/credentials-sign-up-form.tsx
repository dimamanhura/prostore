'use client';

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SIGN_UP_DEFAULT_VALUES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signUpUser } from "@/lib/actions/user.action";
import { useSearchParams } from "next/navigation";

const CredentialsSignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full" variant={'default'}>
        {pending ? 'Submitting...' :  'Sign Up'}
      </Button>
    );
  };

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={SIGN_UP_DEFAULT_VALUES.name}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={SIGN_UP_DEFAULT_VALUES.email}
          />
        </div>

        <div>
          <Label htmlFor="email">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="password"
            defaultValue={SIGN_UP_DEFAULT_VALUES.password}
          />
        </div>

        <div>
          <Label htmlFor="email">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="confirmPassword"
            defaultValue={SIGN_UP_DEFAULT_VALUES.confirmPassword}
          />
        </div>

        <div>
          <SignUpButton />
        </div>

        {data && !data.success && (
          <div className="text-center text-destructive">
            {data.message}
          </div>
        )}

        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href={'/sign-in'} target="'_self" className="link">Sign In</Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignUpForm;
