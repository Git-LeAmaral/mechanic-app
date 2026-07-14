import { PrismaClient, ServiceOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.serviceOrderPart.deleteMany();
  await prisma.serviceOrderService.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();

  const joao = await prisma.customer.create({
    data: {
      id: 'cust-1',
      name: 'João Silva',
      document: '123.456.789-00',
      phone: '(11) 98765-4321',
      whatsapp: '(11) 98765-4321',
      email: 'joao.silva@email.com',
      address: 'Rua das Flores, 123, São Paulo - SP',
      createdAt: new Date('2026-05-10T14:30:00Z'),
    },
  });

  const maria = await prisma.customer.create({
    data: {
      id: 'cust-2',
      name: 'Maria Oliveira',
      document: '987.654.321-11',
      phone: '(21) 99888-7766',
      whatsapp: '(21) 99888-7766',
      email: 'maria.o@email.com',
      address: 'Av. Atlântica, 456, Rio de Janeiro - RJ',
      createdAt: new Date('2026-06-01T10:15:00Z'),
    },
  });

  const pedro = await prisma.customer.create({
    data: {
      id: 'cust-3',
      name: 'Pedro Santos (Santos Transp.)',
      document: '12.345.678/0001-99',
      phone: '(31) 97777-6655',
      whatsapp: '(31) 97777-6655',
      email: 'financeiro@santostransp.com.br',
      address: 'Av. Amazonas, 1420, Belo Horizonte - MG',
      createdAt: new Date('2026-06-15T09:00:00Z'),
    },
  });

  const veh1 = await prisma.vehicle.create({
    data: {
      id: 'veh-1',
      customerId: joao.id,
      plate: 'ABC1D23',
      brand: 'Volkswagen',
      model: 'Gol 1.0 MPI',
      year: 2020,
      color: 'Cinza Platinum',
      mileage: 45200,
    },
  });

  const veh2 = await prisma.vehicle.create({
    data: {
      id: 'veh-2',
      customerId: joao.id,
      plate: 'XYZ4E56',
      brand: 'Chevrolet',
      model: 'Saveiro Trendline',
      year: 2022,
      color: 'Branco Summit',
      mileage: 62450,
    },
  });

  const veh3 = await prisma.vehicle.create({
    data: {
      id: 'veh-3',
      customerId: maria.id,
      plate: 'TOR8A90',
      brand: 'Fiat',
      model: 'Toro Freedom 1.3 Turbo',
      year: 2021,
      color: 'Preto Carbon',
      mileage: 35120,
    },
  });

  const veh4 = await prisma.vehicle.create({
    data: {
      id: 'veh-4',
      customerId: pedro.id,
      plate: 'TOY9B12',
      brand: 'Toyota',
      model: 'Corolla XEi 2.0',
      year: 2022,
      color: 'Prata Supernova',
      mileage: 24380,
    },
  });

  await prisma.serviceOrder.create({
    data: {
      id: 'os-1',
      osNumber: 'OS-1001',
      customerId: joao.id,
      vehicleId: veh1.id,
      status: ServiceOrderStatus.IN_PROGRESS,
      entryDate: new Date('2026-06-23'),
      expectedDate: new Date('2026-06-23'),
      mileage: 45200,
      notes: 'Cliente relata barulho ao frear e solicita revisão de rotina.',
      discount: 20,
      totalAmount: 525,
      services: {
        create: [
          { id: 's-1', description: 'Revisão Sistemática 45k km', unitPrice: 250, quantity: 1, sortOrder: 0 },
          { id: 's-2', description: 'Mão de obra troca de óleo e filtros', unitPrice: 80, quantity: 1, sortOrder: 1 },
        ],
      },
      parts: {
        create: [
          { id: 'p-1', description: 'Óleo Sintético 5W40 Castrol', unitPrice: 45, quantity: 4, partNumber: 'CAS-5W40', sortOrder: 0 },
          { id: 'p-2', description: 'Filtro de Óleo Gol', unitPrice: 35, quantity: 1, partNumber: 'FIL-1029', sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.serviceOrder.create({
    data: {
      id: 'os-2',
      osNumber: 'OS-1002',
      customerId: maria.id,
      vehicleId: veh3.id,
      status: ServiceOrderStatus.APPROVED,
      entryDate: new Date('2026-06-22'),
      expectedDate: new Date('2026-06-24'),
      mileage: 35120,
      notes: 'Substituição de pastilhas de freio dianteiras. Luz do freio acesa no painel.',
      discount: 0,
      totalAmount: 510,
      services: {
        create: [
          { id: 's-3', description: 'Troca de pastilhas dianteiras', unitPrice: 120, quantity: 1 },
          { id: 's-4', description: 'Sangria e troca de fluido de freio', unitPrice: 100, quantity: 1, sortOrder: 1 },
        ],
      },
      parts: {
        create: [
          { id: 'p-3', description: 'Pastilha de Freio Cobreq (Par)', unitPrice: 190, quantity: 1, partNumber: 'COB-4592' },
          { id: 'p-4', description: 'Fluido de Freio DOT 4 Bosch', unitPrice: 50, quantity: 2, partNumber: 'BOS-DOT4', sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.serviceOrder.create({
    data: {
      id: 'os-3',
      osNumber: 'OS-1003',
      customerId: pedro.id,
      vehicleId: veh4.id,
      status: ServiceOrderStatus.COMPLETED,
      entryDate: new Date('2026-06-15'),
      expectedDate: new Date('2026-06-16'),
      completionDate: new Date('2026-06-16'),
      mileage: 24100,
      notes: 'Alinhamento, balanceamento e rodízio de pneus. Troca de buchas da suspensão dianteira.',
      discount: 40,
      totalAmount: 400,
      services: {
        create: [
          { id: 's-5', description: 'Alinhamento 3D + Balanceamento', unitPrice: 150, quantity: 1 },
          { id: 's-6', description: 'Troca de buchas da bandeja', unitPrice: 140, quantity: 1, sortOrder: 1 },
        ],
      },
      parts: {
        create: [
          { id: 'p-5', description: 'Bucha da Bandeja Dianteira Corolla', unitPrice: 75, quantity: 2, partNumber: 'BU-3022' },
        ],
      },
    },
  });

  const os4 = await prisma.serviceOrder.create({
    data: {
      id: 'os-4',
      osNumber: 'OS-1004',
      customerId: joao.id,
      vehicleId: veh2.id,
      status: ServiceOrderStatus.BUDGET,
      entryDate: new Date('2026-06-25'),
      expectedDate: new Date('2026-06-26'),
      mileage: 62450,
      notes: 'Revisão de velas de ignição e limpeza de bicos injetores. Veículo falhando na partida fria.',
      discount: 0,
      totalAmount: 520,
      services: {
        create: [
          { id: 's-7', description: 'Limpeza de Bicos Injetores', unitPrice: 180, quantity: 1 },
          { id: 's-8', description: 'Substituição de velas', unitPrice: 80, quantity: 1, sortOrder: 1 },
        ],
      },
      parts: {
        create: [
          { id: 'p-6', description: 'Jogo de Velas de Ignição NGK Iridium', unitPrice: 260, quantity: 1, partNumber: 'NGK-IR' },
        ],
      },
    },
  });

  // Agendamentos explícitos (antes só existiam via filtro de OS)
  await prisma.appointment.createMany({
    data: [
      {
        customerId: joao.id,
        vehicleId: veh1.id,
        serviceOrderId: 'os-1',
        startsAt: new Date('2026-06-23T09:00:00'),
        endsAt: new Date('2026-06-23T12:00:00'),
        title: 'Revisão 45k — Gol',
        notes: 'Vinculado à OS-1001',
        status: 'IN_PROGRESS',
      },
      {
        customerId: maria.id,
        vehicleId: veh3.id,
        serviceOrderId: 'os-2',
        startsAt: new Date('2026-06-24T14:00:00'),
        endsAt: new Date('2026-06-24T16:00:00'),
        title: 'Freios — Toro',
        notes: 'Vinculado à OS-1002',
        status: 'CONFIRMED',
      },
      {
        customerId: joao.id,
        vehicleId: veh2.id,
        serviceOrderId: os4.id,
        startsAt: new Date('2026-06-25T10:00:00'),
        endsAt: new Date('2026-06-25T12:00:00'),
        title: 'Orçamento bicos/velas — Saveiro',
        status: 'SCHEDULED',
      },
      {
        customerId: pedro.id,
        vehicleId: veh4.id,
        startsAt: new Date('2026-06-27T08:30:00'),
        endsAt: new Date('2026-06-27T09:30:00'),
        title: 'Avaliação — Corolla',
        notes: 'Ainda sem OS',
        status: 'SCHEDULED',
      },
    ],
  });

  console.log('Seed concluído: clientes, veículos, OS e agendamentos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
