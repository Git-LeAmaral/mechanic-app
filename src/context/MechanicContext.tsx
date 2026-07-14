'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Vehicle, ServiceOrder, OSStatus, ServiceItem, PartItem } from '../types';

interface MechanicContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  orders: ServiceOrder[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addOS: (order: Omit<ServiceOrder, 'id' | 'osNumber' | 'totalAmount'>) => ServiceOrder;
  updateOS: (id: string, order: Partial<ServiceOrder>) => void;
  deleteOS: (id: string) => void;
  isLoading: boolean;
}

const MechanicContext = createContext<MechanicContextType | undefined>(undefined);

// Initial Mock Data
const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'João Silva',
    document: '123.456.789-00',
    phone: '(11) 98765-4321',
    whatsapp: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    address: 'Rua das Flores, 123, São Paulo - SP',
    createdAt: '2026-05-10T14:30:00Z',
  },
  {
    id: 'cust-2',
    name: 'Maria Oliveira',
    document: '987.654.321-11',
    phone: '(21) 99888-7766',
    whatsapp: '(21) 99888-7766',
    email: 'maria.o@email.com',
    address: 'Av. Atlântica, 456, Rio de Janeiro - RJ',
    createdAt: '2026-06-01T10:15:00Z',
  },
  {
    id: 'cust-3',
    name: 'Pedro Santos (Santos Transp.)',
    document: '12.345.678/0001-99',
    phone: '(31) 97777-6655',
    whatsapp: '(31) 97777-6655',
    email: 'financeiro@santostransp.com.br',
    address: 'Av. Amazonas, 1420, Belo Horizonte - MG',
    createdAt: '2026-06-15T09:00:00Z',
  },
];

const mockVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    customerId: 'cust-1',
    plate: 'ABC-1D23',
    brand: 'Volkswagen',
    model: 'Gol 1.0 MPI',
    year: 2020,
    color: 'Cinza Platinum',
    mileage: 45200,
  },
  {
    id: 'veh-2',
    customerId: 'cust-1',
    plate: 'XYZ-4E56',
    brand: 'Chevrolet',
    model: 'Saveiro Trendline',
    year: 2022,
    color: 'Branco Summit',
    mileage: 62450,
  },
  {
    id: 'veh-3',
    customerId: 'cust-2',
    plate: 'TOR-8A90',
    brand: 'Fiat',
    model: 'Toro Freedom 1.3 Turbo',
    year: 2021,
    color: 'Preto Carbon',
    mileage: 35120,
  },
  {
    id: 'veh-4',
    customerId: 'cust-3',
    plate: 'TOY-9B12',
    brand: 'Toyota',
    model: 'Corolla XEi 2.0',
    year: 2022,
    color: 'Prata Supernova',
    mileage: 24380,
  },
];

const mockOrders: ServiceOrder[] = [
  {
    id: 'os-1',
    osNumber: 'OS-1001',
    customerId: 'cust-1',
    vehicleId: 'veh-1',
    entryDate: '2026-06-23', // Today (matches our mock current date)
    expectedDate: '2026-06-23',
    status: 'in_progress',
    mileage: 45200,
    notes: 'Cliente relata barulho ao frear e solicita revisão de rotina.',
    services: [
      { id: 's-1', description: 'Revisão Sistemática 45k km', price: 250, quantity: 1 },
      { id: 's-2', description: 'Mão de obra troca de óleo e filtros', price: 80, quantity: 1 },
    ],
    parts: [
      { id: 'p-1', description: 'Óleo Sintético 5W40 Castrol', price: 45, quantity: 4, partNumber: 'CAS-5W40' },
      { id: 'p-2', description: 'Filtro de Óleo Gol', price: 35, quantity: 1, partNumber: 'FIL-1029' },
    ],
    discount: 20,
    totalAmount: 525, // 250 + 80 + 180 + 35 - 20
  },
  {
    id: 'os-2',
    osNumber: 'OS-1002',
    customerId: 'cust-2',
    vehicleId: 'veh-3',
    entryDate: '2026-06-22', // Yesterday
    expectedDate: '2026-06-24', // Tomorrow
    status: 'approved',
    mileage: 35120,
    notes: 'Substituição de pastilhas de freio dianteiras. Luz do freio acesa no painel.',
    services: [
      { id: 's-3', description: 'Troca de pastilhas dianteiras', price: 120, quantity: 1 },
      { id: 's-4', description: 'Sangria e troca de fluido de freio', price: 100, quantity: 1 },
    ],
    parts: [
      { id: 'p-3', description: 'Pastilha de Freio Cobreq (Par)', price: 190, quantity: 1, partNumber: 'COB-4592' },
      { id: 'p-4', description: 'Fluido de Freio DOT 4 Bosch', price: 50, quantity: 2, partNumber: 'BOS-DOT4' },
    ],
    discount: 0,
    totalAmount: 510, // 120 + 100 + 190 + 100
  },
  {
    id: 'os-3',
    osNumber: 'OS-1003',
    customerId: 'cust-3',
    vehicleId: 'veh-4',
    entryDate: '2026-06-15', // Past week
    expectedDate: '2026-06-16',
    completionDate: '2026-06-16',
    status: 'completed',
    mileage: 24100,
    notes: 'Alinhamento, balanceamento e rodízio de pneus. Troca de buchas da suspensão dianteira.',
    services: [
      { id: 's-5', description: 'Alinhamento 3D + Balanceamento', price: 150, quantity: 1 },
      { id: 's-6', description: 'Troca de buchas da bandeja', price: 140, quantity: 1 },
    ],
    parts: [
      { id: 'p-5', description: 'Bucha da Bandeja Dianteira Corolla', price: 75, quantity: 2, partNumber: 'BU-3022' },
    ],
    discount: 40,
    totalAmount: 400, // 150 + 140 + 150 - 40
  },
  {
    id: 'os-4',
    osNumber: 'OS-1004',
    customerId: 'cust-1',
    vehicleId: 'veh-2',
    entryDate: '2026-06-25', // Scheduled for later this week
    expectedDate: '2026-06-26',
    status: 'budget',
    mileage: 62450,
    notes: 'Revisão de velas de ignição e limpeza de bicos injetores. Veículo falhando na partida fria.',
    services: [
      { id: 's-7', description: 'Limpeza de Bicos Injetores', price: 180, quantity: 1 },
      { id: 's-8', description: 'Substituição de velas', price: 80, quantity: 1 },
    ],
    parts: [
      { id: 'p-6', description: 'Jogo de Velas de Ignição NGK Iridium', price: 260, quantity: 1, partNumber: 'NGK-IR' },
    ],
    discount: 0,
    totalAmount: 520, // 180 + 80 + 260
  },
];

export const MechanicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load database from localStorage
  useEffect(() => {
    try {
      const storedCustomers = localStorage.getItem('mecaflow_customers');
      const storedVehicles = localStorage.getItem('mecaflow_vehicles');
      const storedOrders = localStorage.getItem('mecaflow_orders');

      if (storedCustomers && storedVehicles && storedOrders) {
        setCustomers(JSON.parse(storedCustomers));
        setVehicles(JSON.parse(storedVehicles));
        setOrders(JSON.parse(storedOrders));
      } else {
        // First execution, populate with mock data
        localStorage.setItem('mecaflow_customers', JSON.stringify(mockCustomers));
        localStorage.setItem('mecaflow_vehicles', JSON.stringify(mockVehicles));
        localStorage.setItem('mecaflow_orders', JSON.stringify(mockOrders));

        setCustomers(mockCustomers);
        setVehicles(mockVehicles);
        setOrders(mockOrders);
      }
    } catch (e) {
      console.error('Error loading localStorage data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage when state changes
  const saveState = (updatedCustomers: Customer[], updatedVehicles: Vehicle[], updatedOrders: ServiceOrder[]) => {
    try {
      localStorage.setItem('mecaflow_customers', JSON.stringify(updatedCustomers));
      localStorage.setItem('mecaflow_vehicles', JSON.stringify(updatedVehicles));
      localStorage.setItem('mecaflow_orders', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  };

  // Helper function to calculate OS total
  const calculateOSTotal = (services: ServiceItem[], parts: PartItem[], discount: number): number => {
    const servicesTotal = services.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const partsTotal = parts.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return Math.max(0, servicesTotal + partsTotal - discount);
  };

  // --- CRUD CUSTOMERS ---
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    saveState(updated, vehicles, orders);
    return newCustomer;
  };

  const updateCustomer = (id: string, updatedData: Partial<Customer>) => {
    const before = customers.find((c) => c.id === id);
    const updated = customers.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    const after = updated.find((c) => c.id === id);

    console.log('[OS WhatsApp Debug] Cliente atualizado no cadastro:', {
      customerId: id,
      antes: before ? { name: before.name, phone: before.phone, whatsapp: before.whatsapp } : null,
      dadosEnviados: updatedData,
      depois: after ? { name: after.name, phone: after.phone, whatsapp: after.whatsapp } : null,
      ordensVinculadas: orders
        .filter((o) => o.customerId === id)
        .map((o) => ({ osNumber: o.osNumber, osId: o.id })),
    });

    setCustomers(updated);
    saveState(updated, vehicles, orders);
  };

  const deleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter((c) => c.id !== id);
    const updatedVehicles = vehicles.filter((v) => v.customerId !== id);
    const updatedOrders = orders.filter((o) => o.customerId !== id);

    setCustomers(updatedCustomers);
    setVehicles(updatedVehicles);
    setOrders(updatedOrders);
    saveState(updatedCustomers, updatedVehicles, updatedOrders);
  };

  // --- CRUD VEHICLES ---
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    const updated = [...vehicles, newVehicle];
    setVehicles(updated);
    saveState(customers, updated, orders);
    return newVehicle;
  };

  const updateVehicle = (id: string, updatedData: Partial<Vehicle>) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, ...updatedData } : v));
    setVehicles(updated);
    saveState(customers, updated, orders);
  };

  const deleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter((v) => v.id !== id);
    const updatedOrders = orders.filter((o) => o.vehicleId !== id);

    setVehicles(updatedVehicles);
    setOrders(updatedOrders);
    saveState(customers, updatedVehicles, updatedOrders);
  };

  // --- CRUD OS ---
  const addOS = (osData: Omit<ServiceOrder, 'id' | 'osNumber' | 'totalAmount'>) => {
    const lastOSNumber = orders.reduce((max, os) => {
      const num = parseInt(os.osNumber.split('-')[1]);
      return num > max ? num : max;
    }, 1000);

    const newOSNumber = `OS-${lastOSNumber + 1}`;
    
    // Auto-update vehicle mileage if the OS mileage is greater
    const vehicle = vehicles.find((v) => v.id === osData.vehicleId);
    if (vehicle && osData.mileage > vehicle.mileage) {
      updateVehicle(osData.vehicleId, { mileage: osData.mileage });
    }

    const newOS: ServiceOrder = {
      ...osData,
      id: `os-${Date.now()}`,
      osNumber: newOSNumber,
      totalAmount: calculateOSTotal(osData.services, osData.parts, osData.discount),
    };

    const updated = [...orders, newOS];
    setOrders(updated);
    saveState(customers, vehicles, updated);
    return newOS;
  };

  const updateOS = (id: string, updatedData: Partial<ServiceOrder>) => {
    const updated = orders.map((o) => {
      if (o.id !== id) return o;
      
      const merged = { ...o, ...updatedData };
      
      // Auto-update vehicle mileage if OS mileage increases
      if (updatedData.mileage && updatedData.vehicleId) {
        const vehicle = vehicles.find((v) => v.id === updatedData.vehicleId);
        if (vehicle && updatedData.mileage > vehicle.mileage) {
          updateVehicle(updatedData.vehicleId, { mileage: updatedData.mileage });
        }
      }

      // Recalculate total amount
      const services = updatedData.services ?? o.services;
      const parts = updatedData.parts ?? o.parts;
      const discount = updatedData.discount !== undefined ? updatedData.discount : o.discount;
      
      const totalAmount = calculateOSTotal(services, parts, discount);

      return {
        ...merged,
        totalAmount,
      };
    });

    setOrders(updated);
    saveState(customers, vehicles, updated);
  };

  const deleteOS = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    saveState(customers, vehicles, updated);
  };

  return (
    <MechanicContext.Provider
      value={{
        customers,
        vehicles,
        orders,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addOS,
        updateOS,
        deleteOS,
        isLoading,
      }}
    >
      {children}
    </MechanicContext.Provider>
  );
};

export const useMechanic = () => {
  const context = useContext(MechanicContext);
  if (context === undefined) {
    throw new Error('useMechanic must be used within a MechanicProvider');
  }
  return context;
};
