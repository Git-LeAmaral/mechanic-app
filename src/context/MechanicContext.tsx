'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Vehicle, ServiceOrder, ServiceItem, PartItem } from '../types';
import {
  createCustomerApi,
  deleteCustomerApi,
  fetchCustomers,
  updateCustomerApi,
} from '@/lib/api/customers';

interface MechanicContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  orders: ServiceOrder[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addOS: (order: Omit<ServiceOrder, 'id' | 'osNumber' | 'totalAmount'>) => ServiceOrder;
  updateOS: (id: string, order: Partial<ServiceOrder>) => void;
  deleteOS: (id: string) => void;
  isLoading: boolean;
}

const MechanicContext = createContext<MechanicContextType | undefined>(undefined);

// Initial Mock Data (vehicles/orders ainda no localStorage; clientes vêm da API)
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

  // Clientes: Postgres via API | Veículos/OS: localStorage (migração gradual)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const storedVehicles = localStorage.getItem('mecaflow_vehicles');
        const storedOrders = localStorage.getItem('mecaflow_orders');

        if (storedVehicles && storedOrders) {
          setVehicles(JSON.parse(storedVehicles));
          setOrders(JSON.parse(storedOrders));
        } else {
          localStorage.setItem('mecaflow_vehicles', JSON.stringify(mockVehicles));
          localStorage.setItem('mecaflow_orders', JSON.stringify(mockOrders));
          setVehicles(mockVehicles);
          setOrders(mockOrders);
        }

        const apiCustomers = await fetchCustomers();
        if (!cancelled) setCustomers(apiCustomers);
      } catch (e) {
        console.error('Erro ao carregar dados (API clientes / localStorage):', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persiste só veículos e OS no localStorage (clientes ficam no banco)
  const saveLocalState = (updatedVehicles: Vehicle[], updatedOrders: ServiceOrder[]) => {
    try {
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

  // --- CRUD CUSTOMERS (Postgres) ---
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const created = await createCustomerApi(customerData);
    setCustomers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  };

  const updateCustomer = async (id: string, updatedData: Partial<Customer>) => {
    const updated = await updateCustomerApi(id, updatedData);
    setCustomers((prev) =>
      prev
        .map((c) => (c.id === id ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  };

  const deleteCustomer = async (id: string) => {
    await deleteCustomerApi(id);
    const updatedVehicles = vehicles.filter((v) => v.customerId !== id);
    const updatedOrders = orders.filter((o) => o.customerId !== id);

    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setVehicles(updatedVehicles);
    setOrders(updatedOrders);
    saveLocalState(updatedVehicles, updatedOrders);
  };

  // --- CRUD VEHICLES ---
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    const updated = [...vehicles, newVehicle];
    setVehicles(updated);
    saveLocalState(updated, orders);
    return newVehicle;
  };

  const updateVehicle = (id: string, updatedData: Partial<Vehicle>) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, ...updatedData } : v));
    setVehicles(updated);
    saveLocalState(updated, orders);
  };

  const deleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter((v) => v.id !== id);
    const updatedOrders = orders.filter((o) => o.vehicleId !== id);

    setVehicles(updatedVehicles);
    setOrders(updatedOrders);
    saveLocalState(updatedVehicles, updatedOrders);
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
    saveLocalState(vehicles, updated);
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
    saveLocalState(vehicles, updated);
  };

  const deleteOS = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    saveLocalState(vehicles, updated);
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
