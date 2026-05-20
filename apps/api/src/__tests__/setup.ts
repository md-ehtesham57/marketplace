import { vi } from "vitest";

vi.mock("../lib/prisma", () => {
  const mockFn = () => vi.fn();

  const prisma = {
    user: {
      findUnique: mockFn(),
      findMany: mockFn(),
      create: mockFn(),
      update: mockFn(),
      count: mockFn(),
    },
    seller: {
      findUnique: mockFn(),
    },
    product: {
      findUnique: mockFn(),
      findFirst: mockFn(),
      findMany: mockFn(),
      create: mockFn(),
      update: mockFn(),
      updateMany: mockFn(),
      count: mockFn(),
    },
    category: {
      findUnique: mockFn(),
    },
    cart: {
      findUnique: mockFn(),
      create: mockFn(),
    },
    cartItem: {
      findUnique: mockFn(),
      findFirst: mockFn(),
      create: mockFn(),
      update: mockFn(),
      delete: mockFn(),
      deleteMany: mockFn(),
    },
    order: {
      findUnique: mockFn(),
      findFirst: mockFn(),
      findMany: mockFn(),
      create: mockFn(),
      update: mockFn(),
      count: mockFn(),
    },
    orderItem: {
      create: mockFn(),
    },
    review: {
      findMany: mockFn(),
    },
    $transaction: vi.fn((fn: (tx: any) => any) => fn(prisma)),
  };

  return { prisma };
});
