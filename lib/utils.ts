import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from 'query-string';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
};

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatErrors = (error: any) => {
  if (error.name === 'ZodError') {
    const fieldErrors = Object
      .keys(error.errors)
      .map((field) => error.errors[field].message);
    return fieldErrors.join('. ');
  } else if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
    console.log(error.meta)
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  } else {
    return typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
  }
};

export const round2 = (value: number | string) => {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100; 
  } else {
    throw new Error('Value is not a number or string');
  }
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('eu-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
});

export const formatCurrency = (amount: string | number | null) => {
  if (typeof amount === 'number') {
    return CURRENCY_FORMATTER.format(amount);
  }

  if (typeof amount === 'string') {
    return CURRENCY_FORMATTER.format(Number(amount));
  }

  return 'NaN';
};

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export const formatNumber = (num: number) => {
  return NUMBER_FORMATTER.format(num);
};

export const formatId = (id: string) => {
  return `..${id.substring(id.length - 6)}`;
};

export const formUrlQuery = ({
  params,
  value,
  key,
}: {
  params: string;
  value: string | null;
  key: string;
}) => {
  const query = qs.parse(params);
  query[key] = value;
  return qs.stringifyUrl({ url: window.location.pathname, query }, { skipNull: true });
};
