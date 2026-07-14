'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMechanic } from '@/context/MechanicContext';
import { formatCurrency, formatDate, formatPlate } from '@/utils/formatters';
import { 
  FileText, 
  Search, 
  Plus, 
  Clock, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  X,
  User,
  Car,
  Wrench,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ServiceItem, PartItem, OSStatus } from '@/types';

export default function Orders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, customers, vehicles, addOS, deleteOS, isLoading } = useMechanic();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [entryDate, setEntryDate] = useState('2026-06-23'); // Default to current mock date
  const [expectedDate, setExpectedDate] = useState('2026-06-24');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [discount, setDiscount] = useState('0');

  // Input states for adding new service/part to list
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceQty, setNewServiceQty] = useState('1');

  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartNo, setNewPartNo] = useState('');
  const [newPartPrice, setNewPartPrice] = useState('');
  const [newPartQty, setNewPartQty] = useState('1');

  // Listen to search query params
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsCreating(true);
      
      const paramCustId = searchParams.get('customerId') || '';
      const paramVehId = searchParams.get('vehicleId') || '';
      
      if (paramCustId) {
        setCustomerId(paramCustId);
      } else {
        setCustomerId(customers[0]?.id || '');
      }
      
      setVehicleId(paramVehId);
      setEntryDate('2026-06-23');
      setExpectedDate('2026-06-24');
      setMileage('');
      setNotes('');
      setServices([]);
      setParts([]);
      setDiscount('0');
      
      // Clean query params
      router.replace('/orders');
    }
  }, [searchParams, customers]);

  // Set default vehicle when customer changes
  useEffect(() => {
    if (customerId) {
      const firstCustomerVehicle = vehicles.find(v => v.customerId === customerId);
      setVehicleId(firstCustomerVehicle?.id || '');
    } else {
      setVehicleId('');
    }
  }, [customerId, vehicles]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Helper getters
  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Cliente não encontrado';
  };

  const getVehicleInfo = (id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    if (!v) return 'Veículo não encontrado';
    return `${v.brand} ${v.model} (${formatPlate(v.plate)})`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'budget':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Clock className="h-3 w-3" />
            Orçamento
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">
            <CheckCircle2 className="h-3 w-3" />
            Aprovado
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-500">
            <Play className="h-3 w-3 fill-current" />
            Em Execução
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            Finalizado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-500">
            <XCircle className="h-3 w-3" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  // Add items dynamically
  const addServiceRow = () => {
    if (!newServiceDesc || !newServicePrice) {
      alert('Preencha a descrição e o valor do serviço.');
      return;
    }
    const newItem: ServiceItem = {
      id: `s-${Date.now()}`,
      description: newServiceDesc,
      price: parseFloat(newServicePrice),
      quantity: parseInt(newServiceQty) || 1,
    };
    setServices([...services, newItem]);
    setNewServiceDesc('');
    setNewServicePrice('');
    setNewServiceQty('1');
  };

  const removeServiceRow = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const addPartRow = () => {
    if (!newPartDesc || !newPartPrice) {
      alert('Preencha a descrição e o valor da peça.');
      return;
    }
    const newItem: PartItem = {
      id: `p-${Date.now()}`,
      description: newPartDesc,
      partNumber: newPartNo,
      price: parseFloat(newPartPrice),
      quantity: parseInt(newPartQty) || 1,
    };
    setParts([...parts, newItem]);
    setNewPartDesc('');
    setNewPartNo('');
    setNewPartPrice('');
    setNewPartQty('1');
  };

  const removePartRow = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  // Form calculations
  const servicesSubtotal = services.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const partsSubtotal = parts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const discValue = parseFloat(discount) || 0;
  const currentTotal = Math.max(0, servicesSubtotal + partsSubtotal - discValue);

  // Submit Handler
  const handleSubmitOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !vehicleId || !entryDate || !expectedDate || !mileage) {
      alert('Por favor, preencha todos os campos da OS.');
      return;
    }

    if (services.length === 0 && parts.length === 0) {
      if (!confirm('Atenção: Esta OS não possui nenhum serviço ou peça cadastrados. Deseja criar mesmo assim?')) {
        return;
      }
    }

    addOS({
      customerId,
      vehicleId,
      entryDate,
      expectedDate,
      mileage: parseInt(mileage),
      notes,
      status: 'budget', // Opens as a budget first
      services,
      parts,
      discount: discValue,
    });

    setIsCreating(false);
  };

  const handleDeleteOS = (id: string, num: string) => {
    if (confirm(`Tem certeza que deseja excluir a ordem de serviço ${num}?`)) {
      deleteOS(id);
    }
  };

  // Filtered List
  const filteredOrders = orders.filter(os => {
    const matchesSearch = 
      os.osNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(os.customerId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVehicleInfo(os.vehicleId).toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || os.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get active customer vehicles for form
  const activeCustomerVehicles = vehicles.filter(v => v.customerId === customerId);

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white md:text-3xl">
            {isCreating ? 'Abertura de Ordem de Serviço' : 'Ordens de Serviço'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            {isCreating 
              ? 'Registre um novo orçamento para o cliente e adicione os serviços/peças correspondentes.' 
              : 'Gerencie orçamentos e serviços em andamento na oficina.'
            }
          </p>
        </div>
        
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-md shadow-orange-600/10"
          >
            <Plus className="h-4 w-4" />
            <span>Abrir OS</span>
          </button>
        )}
      </div>

      {isCreating ? (
        /* ==================== CREATE OS FORM VIEW ==================== */
        <form onSubmit={handleSubmitOS} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left side: Client & Vehicle details */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4 md:col-span-1">
              <h3 className="font-extrabold text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-sm uppercase tracking-wider text-orange-500">
                <User className="h-4 w-4" />
                <span>Dados de Entrada</span>
              </h3>

              {/* Customer selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Proprietário *
                </label>
                {customers.length === 0 ? (
                  <div className="text-xs text-rose-500 font-semibold">Sem clientes cadastrados!</div>
                ) : (
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vehicle selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Veículo *
                </label>
                {activeCustomerVehicles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/20 p-3 text-xs text-rose-600 dark:border-rose-950/40 dark:bg-rose-950/10 dark:text-rose-400 font-medium">
                    <span className="block font-bold">Nenhum veículo para este cliente!</span>
                    <button
                      type="button"
                      onClick={() => router.push(`/customers/${customerId}`)}
                      className="mt-1 font-extrabold underline text-orange-600 hover:text-orange-700 dark:text-orange-500"
                    >
                      Cadastrar Veículo &rarr;
                    </button>
                  </div>
                ) : (
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  >
                    {activeCustomerVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({formatPlate(v.plate)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Entry Mileage */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Quilometragem de Entrada (km) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ex: 45000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                />
              </div>

              {/* Date Entry */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Data de Entrada *
                </label>
                <input
                  type="date"
                  required
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                />
              </div>

              {/* Expected Delivery Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Previsão de Entrega *
                </label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                />
              </div>

              {/* Observations */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Problemas Reclamados / Observações
                </label>
                <textarea
                  placeholder="Ex: Barulho ao frear, luz do óleo piscando..."
                  value={notes}
                  rows={3}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50 resize-none"
                />
              </div>
            </div>

            {/* Right side: Services, Parts list and calculations */}
            <div className="space-y-6 md:col-span-2">
              {/* Services Dynamic List */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
                <h3 className="font-extrabold text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-sm uppercase tracking-wider text-orange-500">
                  <Wrench className="h-4 w-4" />
                  <span>Serviços Requeridos</span>
                </h3>

                {/* Add Service line */}
                <div className="grid gap-3 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Descrição do Serviço</label>
                    <input
                      type="text"
                      placeholder="Ex: Troca de pastilhas dianteiras"
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quant.</label>
                    <input
                      type="number"
                      min="1"
                      value={newServiceQty}
                      onChange={(e) => setNewServiceQty(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={addServiceRow}
                      className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 py-2.5 hover:bg-zinc-800 flex justify-center text-xs font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Table list */}
                {services.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/60 font-bold text-zinc-500">
                        <tr>
                          <th className="px-4 py-2.5">Descrição</th>
                          <th className="px-4 py-2.5 text-right">Preço</th>
                          <th className="px-4 py-2.5 text-center">Quant.</th>
                          <th className="px-4 py-2.5 text-right">Subtotal</th>
                          <th className="px-4 py-2.5 text-center">Remover</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium">
                        {services.map((s) => (
                          <tr key={s.id}>
                            <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200 font-semibold">{s.description}</td>
                            <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300">{formatCurrency(s.price)}</td>
                            <td className="px-4 py-2.5 text-center text-zinc-600 dark:text-zinc-300">{s.quantity}</td>
                            <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-bold">{formatCurrency(s.price * s.quantity)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => removeServiceRow(s.id)}
                                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Parts Dynamic List */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
                <h3 className="font-extrabold text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-sm uppercase tracking-wider text-orange-500">
                  <Package className="h-4 w-4" />
                  <span>Peças e Insumos</span>
                </h3>

                {/* Add Part line */}
                <div className="grid gap-3 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Descrição da Peça</label>
                    <input
                      type="text"
                      placeholder="Ex: Óleo de Motor 5W30"
                      value={newPartDesc}
                      onChange={(e) => setNewPartDesc(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Part No. / Cód.</label>
                    <input
                      type="text"
                      placeholder="Opcional"
                      value={newPartNo}
                      onChange={(e) => setNewPartNo(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Preço Unit. (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPartPrice}
                      onChange={(e) => setNewPartPrice(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quant.</label>
                    <input
                      type="number"
                      min="1"
                      value={newPartQty}
                      onChange={(e) => setNewPartQty(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={addPartRow}
                      className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 py-2.5 hover:bg-zinc-800 flex justify-center text-xs font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Table list */}
                {parts.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/60 font-bold text-zinc-500">
                        <tr>
                          <th className="px-4 py-2.5">Descrição</th>
                          <th className="px-4 py-2.5">Cód. Peça</th>
                          <th className="px-4 py-2.5 text-right">Preço Unit.</th>
                          <th className="px-4 py-2.5 text-center">Quant.</th>
                          <th className="px-4 py-2.5 text-right">Subtotal</th>
                          <th className="px-4 py-2.5 text-center">Remover</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium">
                        {parts.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200 font-semibold">{p.description}</td>
                            <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400 font-mono">{p.partNumber || '-'}</td>
                            <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300">{formatCurrency(p.price)}</td>
                            <td className="px-4 py-2.5 text-center text-zinc-600 dark:text-zinc-300">{p.quantity}</td>
                            <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-bold">{formatCurrency(p.price * p.quantity)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => removePartRow(p.id)}
                                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Subtotals and Checkout Info */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
                <h3 className="font-extrabold text-zinc-950 dark:text-white text-sm uppercase tracking-wider text-orange-500">Resumo de Valores</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-medium text-zinc-600 dark:text-zinc-400">
                    <span>Mão de Obra / Serviços:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(servicesSubtotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-zinc-600 dark:text-zinc-400">
                    <span>Peças e Componentes:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(partsSubtotal)}</span>
                  </div>
                  
                  {/* Discount input */}
                  <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800 pt-2 pb-1">
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">Desconto em Dinheiro (R$):</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-28 rounded-xl border border-zinc-200 bg-transparent px-3 py-1.5 text-right text-xs font-bold outline-none focus:border-orange-500 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50"
                    />
                  </div>

                  <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3 text-base">
                    <span className="font-extrabold text-zinc-950 dark:text-white">Valor Total do Orçamento:</span>
                    <span className="font-extrabold text-orange-600 dark:text-orange-500 text-lg">{formatCurrency(currentTotal)}</span>
                  </div>
                </div>

                {/* Form Action buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={activeCustomerVehicles.length === 0}
                    className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-md shadow-orange-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar e Gerar Orçamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* ==================== OS LIST VIEW ==================== */
        <div className="space-y-6">
          {/* Filters Panel */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por Nº da OS, proprietário ou veículo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500"
              />
            </div>

            {/* Status Select Filter */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:inline">Filtrar por:</span>
              <div className="flex flex-wrap gap-1 bg-zinc-100/40 rounded-xl p-1 dark:bg-zinc-950/30">
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'budget', label: 'Orçamentos' },
                  { value: 'approved', label: 'Aprovadas' },
                  { value: 'in_progress', label: 'Em Execução' },
                  { value: 'completed', label: 'Finalizadas' },
                  { value: 'cancelled', label: 'Canceladas' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setStatusFilter(item.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      statusFilter === item.value
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* OS Table List */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 dark:bg-zinc-900/50">
                  <FileText className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-950 dark:text-white">Nenhuma OS encontrada</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Nenhuma ordem de serviço atende a estes critérios de pesquisa.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30">
                      <th className="px-6 py-4">OS Nº</th>
                      <th className="px-6 py-4">Cliente / Dono</th>
                      <th className="px-6 py-4">Veículo</th>
                      <th className="px-6 py-4">Data Entrada</th>
                      <th className="px-6 py-4">Previsão</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Valor Total</th>
                      <th className="px-6 py-4 text-center no-print">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                    {filteredOrders.map((os) => (
                      <tr key={os.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                        <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{os.osNumber}</td>
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {getCustomerName(os.customerId)}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium">
                          {getVehicleInfo(os.vehicleId)}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{formatDate(os.entryDate)}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-semibold">{formatDate(os.expectedDate)}</td>
                        <td className="px-6 py-4">{getStatusBadge(os.status)}</td>
                        <td className="px-6 py-4 text-right font-extrabold text-zinc-900 dark:text-white">
                          {formatCurrency(os.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-center no-print">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => router.push(`/orders/${os.id}`)}
                              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer flex items-center gap-1"
                              title="Abrir detalhes da OS"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Ver</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOS(os.id, os.osNumber)}
                              className="rounded-lg border border-zinc-200 p-1.5 text-rose-600 hover:bg-rose-50 dark:border-zinc-800 dark:hover:bg-rose-950/45 cursor-pointer"
                              title="Remover OS"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
