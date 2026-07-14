import type { Customer } from '@/types';

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // ignore
  }
  return `Erro HTTP ${res.status}`;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch('/api/customers', { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createCustomerApi(
  data: Omit<Customer, 'id' | 'createdAt'>,
): Promise<Customer> {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateCustomerApi(
  id: string,
  data: Partial<Omit<Customer, 'id' | 'createdAt'>>,
): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteCustomerApi(id: string): Promise<void> {
  const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res));
}
