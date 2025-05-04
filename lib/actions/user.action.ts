'use server';

import { signInFormSchema, signUpFormSchema } from '@/lib/validator';
import { signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatErrors } from '../utils';

export async function signInWithCredentials(prevState: unknown, formDate: FormData) {
  try {
    const user = signInFormSchema.parse({
      email: formDate.get('email'),
      password: formDate.get('password'),
    });

    await signIn('credentials', user);

    return {
      success: true,
      message: 'Signed in successfully',
    };
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    return {
      success: false,
      message: 'Invalid email or password',
    };
  }
};

export async function signOutUser() {
  await signOut();
};

export async function signUpUser(prevState: unknown, formDate: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formDate.get('name'),
      email: formDate.get('email'),
      password: formDate.get('password'),
      confirmPassword: formDate.get('confirmPassword'),
    });

    const plainPassword = user.password;

    user.password = hashSync(plainPassword, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
    });

    return {
      success: true,
      message: 'User registered successfully',
    };
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    return {
      success: false,
      message: formatErrors(err),
    };
  }
};
