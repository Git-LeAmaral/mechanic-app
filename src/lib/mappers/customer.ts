import type { Customer as PrismaCustomer, Prisma } from '@prisma/client';
import type { Customer } from '@/types';

export type CustomerWriteInput = {
  name: string;
  document: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
};

/** Converte registro Prisma → formato usado no front. */
export function toUiCustomer(row: PrismaCustomer): Customer {
  return {
    id: row.id,
    name: row.name,
    document: row.document,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    address: row.address,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toPrismaCustomerCreate(data: CustomerWriteInput): Prisma.CustomerCreateInput {
  return {
    name: data.name.trim(),
    document: data.document.trim(),
    phone: data.phone.trim(),
    whatsapp: (data.whatsapp ?? '').trim(),
    email: (data.email ?? '').trim(),
    address: (data.address ?? '').trim(),
  };
}

export function toPrismaCustomerUpdate(data: Partial<CustomerWriteInput>): Prisma.CustomerUpdateInput {
  const update: Prisma.CustomerUpdateInput = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.document !== undefined) update.document = data.document.trim();
  if (data.phone !== undefined) update.phone = data.phone.trim();
  if (data.whatsapp !== undefined) update.whatsapp = data.whatsapp.trim();
  if (data.email !== undefined) update.email = data.email.trim();
  if (data.address !== undefined) update.address = data.address.trim();
  return update;
}
