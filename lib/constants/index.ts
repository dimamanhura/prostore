export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Prostore';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION
  || 'A modern ecommerce platform built with Next.js';
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhots:3000';
export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;
export const SIGN_IN_DEFAULT_VALUES = {
  email: '',
  password: '',
};

export const SIGN_UP_DEFAULT_VALUES = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
};

export const SHIPPING_ADDRESS_DEFAULT_VALUES = {
  fullName: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  country: '',
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(', ')
  : ['PayPal', 'Stripe', 'CashOnDelivery'];

export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || 'PayPal';

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10;

export const PRODUCT_DEFAULT_VALUES = {
  name: '',
  slug: '',
  category: '',
  brand: '',
  description: '',
  stock: 0,
  rating: '0',
  numReviews: '0',
  images: [],
  isFeatured: false,
  banner: null,
  price: '0',
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(', ')
  : ['user', 'admin'];

export const REVIEW_FORM_DEFAULT_VALUES = {
  title: '',
  description: '',
  rating: 0,
};
