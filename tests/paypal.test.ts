import { generateAccessToken, paypal } from "../lib/paypal";

test('Should generate token from paypal', async () => {
  const tokenResponse = await generateAccessToken();
  expect(typeof tokenResponse).toBe('string');
  expect(tokenResponse.length).toBeGreaterThan(0);
});

test('Should create paypal order', async () => {
  const orderResponse = await paypal.createOrder(100);
  expect(orderResponse).toHaveProperty('id');
  expect(orderResponse).toHaveProperty('status');
  expect(orderResponse.status).toBe('CREATED');
});
