import { NextResponse } from 'next/server';
import {
  deleteCustomer,
  getCustomerById,
  isUniqueConstraintError,
  updateCustomer,
} from '@/lib/repositories/customers';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const customer = await getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    console.error('[GET /api/customers/:id]', error);
    return NextResponse.json({ error: 'Falha ao buscar cliente.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const customer = await updateCustomer(id, {
      name: typeof body.name === 'string' ? body.name : undefined,
      document: typeof body.document === 'string' ? body.document : undefined,
      phone: typeof body.phone === 'string' ? body.phone : undefined,
      whatsapp: typeof body.whatsapp === 'string' ? body.whatsapp : undefined,
      email: typeof body.email === 'string' ? body.email : undefined,
      address: typeof body.address === 'string' ? body.address : undefined,
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este CPF/CNPJ.' },
        { status: 409 },
      );
    }
    console.error('[PATCH /api/customers/:id]', error);
    return NextResponse.json({ error: 'Falha ao atualizar cliente.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteCustomer(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/customers/:id]', error);
    return NextResponse.json(
      {
        error:
          'Não foi possível excluir. Verifique se o cliente possui ordens de serviço vinculadas no banco.',
      },
      { status: 409 },
    );
  }
}
