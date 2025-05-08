'use server';

import { z } from 'zod';
import { paymentMethodSchema, shippingAddressSchema, signInFormSchema, signUpFormSchema, updateUserSchema } from '@/lib/validator';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatErrors } from '../utils';
import { ShippingAddress } from '@/types';
import { PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

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

export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function updateProfile(user: { name: string, email: string }) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: user.name },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function getAllUsers({ 
  query,
  limit = PAGE_SIZE,
  page,
}: {
  query: string;
  limit?: number;
  page: number;
}) {
  const queryFilter: Prisma.UserWhereInput = query && query !== 'all' ? {
    name: {
      contains: query,
      mode: 'insensitive' 
    }
  }: {};

  const data = await prisma.user.findMany({
    where: { ...queryFilter },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count({
    where: { ...queryFilter },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  }
};

export async function deleteUser(userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    const existedUser = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!existedUser) {
      throw new Error('User not found');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};
