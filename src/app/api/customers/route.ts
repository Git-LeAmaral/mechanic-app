import { NextResponse } from 'next/server';
import {
  createCustomer,
  isUniqueConstraintError,
  listCustomers,
} from '@/lib/repositories/customers';

export async function GET() {
  try {
    const customers = await listCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('[GET /api/customers]', error);
    return NextResponse.json(
      { error: 'Falha ao listar clientes. Verifique se o banco está no ar.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const document = typeof body.document === 'string' ? body.document.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!name || !document || !phone) {
      return NextResponse.json(
        { error: 'Nome, documento e telefone são obrigatórios.' },
        { status: 400 },
      );
    }

    const customer = await createCustomer({
      name,
      document,
      phone,
      whatsapp: typeof body.whatsapp === 'string' ? body.whatsapp : '',
      email: typeof body.email === 'string' ? body.email : '',
      address: typeof body.address === 'string' ? body.address : '',
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este CPF/CNPJ.' },
        { status: 409 },
      );
    }
    console.error('[POST /api/customers]', error);
    return NextResponse.json({ error: 'Falha ao criar cliente.' }, { status: 500 });
  }
}
