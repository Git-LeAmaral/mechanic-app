import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  toPrismaCustomerCreate,
  toPrismaCustomerUpdate,
  toUiCustomer,
  type CustomerWriteInput,
} from '@/lib/mappers/customer';
import type { Customer } from '@/types';

export async function listCustomers(): Promise<Customer[]> {
  const rows = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });
  return rows.map(toUiCustomer);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const row = await prisma.customer.findUnique({ where: { id } });
  return row ? toUiCustomer(row) : null;
}

export async function createCustomer(data: CustomerWriteInput): Promise<Customer> {
  const row = await prisma.customer.create({
    data: toPrismaCustomerCreate(data),
  });
  return toUiCustomer(row);
}

export async function updateCustomer(
  id: string,
  data: Partial<CustomerWriteInput>,
): Promise<Customer | null> {
  try {
    const row = await prisma.customer.update({
      where: { id },
      data: toPrismaCustomerUpdate(data),
    });
    return toUiCustomer(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // OS tem onDelete Restrict — remove ordens antes do cliente
      await tx.serviceOrder.deleteMany({ where: { customerId: id } });
      await tx.customer.delete({ where: { id } });
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
