'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMechanic } from '@/context/MechanicContext';
import { 
  formatDate, 
  formatCurrency, 
  formatDocument, 
  formatPhone, 
  formatPlate 
} from '@/utils/formatters';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  FileText, 
  Plus, 
  X, 
  Trash2,
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetails({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const { 
    customers, 
    vehicles, 
    orders, 
    addVehicle, 
    deleteVehicle, 
    isLoading 
  } = useMechanic();

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  
  // New Vehicle Form State
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Find customer
  const customer = customers.find(c => c.id === id);
  if (!customer) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Cliente não encontrado</h3>
        <p className="text-zinc-500">O cliente solicitado não existe no banco de dados.</p>
        <button
          onClick={() => router.push('/customers')}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Clientes</span>
        </button>
      </div>
    );
  }

  // Get customer vehicles
  const customerVehicles = vehicles.filter(v => v.customerId === id);

  // Get customer service orders
  const customerOrders = orders.filter(o => o.customerId === id);

  // Mask Plate Input
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const formatted = formatPlate(val);
    setPlate(formatted);
  };

  // Submit Vehicle
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !brand || !model || !year || !mileage) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    addVehicle({
      customerId: id,
      plate,
      brand,
      model,
      year: parseInt(year),
      color,
      mileage: parseInt(mileage),
    });

    // Reset Form
    setPlate('');
    setBrand('');
    setModel('');
    setYear('');
    setColor('');
    setMileage('');
    setIsVehicleModalOpen(false);
  };

  const handleDeleteVehicle = (vehicleId: string, vehicleName: string) => {
    if (confirm(`Tem certeza que deseja remover o veículo "${vehicleName}"? Todas as OS atreladas a este veículo também serão removidas!`)) {
      deleteVehicle(vehicleId);
    }
  };

  // Status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'budget':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Clock className="h-2.5 w-2.5" />
            Orçamento
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Aprovado
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-500">
            <Play className="h-2.5 w-2.5 fill-current" />
            Em Execução
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-500">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Finalizado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-500">
            <XCircle className="h-2.5 w-2.5" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const getVehicleNameById = (vehicleId: string) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    return v ? `${v.brand} ${v.model}` : 'Veículo não cadastrado';
  };

  // WhatsApp share link helper
  const getWhatsAppShareLink = () => {
    const text = encodeURIComponent(`Olá ${customer.name}, tudo bem? Aqui é da oficina. Seu cadastro já está pronto no nosso sistema!`);
    return `https://wa.me/55${customer.whatsapp.replace(/\D/g, '')}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Back Button and Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/customers')}
            className="rounded-xl border border-zinc-200 p-2.5 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{customer.name}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Cliente cadastrado em {new Date(customer.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <a
          href={getWhatsAppShareLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-md shadow-emerald-600/10 self-start sm:self-auto"
        >
          <MessageSquare className="h-4 w-4 fill-current" />
          <span>Falar no WhatsApp</span>
        </a>
      </div>

      {/* Grid: Details (Left) + Vehicles (Right) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Data Column */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <User className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-zinc-950 dark:text-white">Dados de Contato</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400">Documento (CPF/CNPJ)</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{customer.document}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400">Telefone</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                {customer.phone}
              </p>
            </div>

            {customer.whatsapp && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-400">WhatsApp</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-500">
                  {customer.whatsapp}
                </p>
              </div>
            )}

            {customer.email && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-400">E-mail</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  {customer.email}
                </p>
              </div>
            )}

            {customer.address && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-400">Endereço</span>
                <p className="font-medium text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{customer.address}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicles Column */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-zinc-950 dark:text-white">Veículos Vinculados</h3>
            </div>
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-500"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Carro</span>
            </button>
          </div>

          {customerVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-semibold text-zinc-400">Nenhum veículo cadastrado para este cliente.</p>
              <button
                onClick={() => setIsVehicleModalOpen(true)}
                className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-500"
              >
                Cadastrar agora &rarr;
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {customerVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 p-4 hover:border-orange-500 dark:border-zinc-800 dark:hover:border-orange-500 transition-all bg-zinc-50/30 dark:bg-zinc-950/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-zinc-200/80 px-2 py-0.5 text-xs font-extrabold tracking-wider text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-mono">
                        {formatPlate(vehicle.plate)}
                      </span>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                        className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                        title="Remover veículo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-extrabold text-zinc-900 dark:text-white pt-1">{vehicle.brand} {vehicle.model}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 pt-1">
                      <div>Ano: <span className="font-bold text-zinc-700 dark:text-zinc-300">{vehicle.year}</span></div>
                      <div>Cor: <span className="font-bold text-zinc-700 dark:text-zinc-300">{vehicle.color || '-'}</span></div>
                      <div className="col-span-2">Km atual: <span className="font-bold text-zinc-700 dark:text-zinc-300">{vehicle.mileage.toLocaleString()} km</span></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 flex justify-between items-center">
                    <button
                      onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-500 flex items-center gap-0.5"
                    >
                      <span>Ver histórico do veículo</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Order History List */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <FileText className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-zinc-950 dark:text-white">Histórico de Ordens de Serviço</h3>
        </div>

        {customerOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
            <p className="text-sm font-semibold">Nenhuma ordem de serviço registrada para este cliente.</p>
            <button
              onClick={() => router.push(`/orders?action=new&customerId=${id}`)}
              className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-500"
            >
              Criar OS agora &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:border-zinc-800 py-3">
                  <th className="py-3 px-4">Número</th>
                  <th className="py-3 px-4">Veículo</th>
                  <th className="py-3 px-4">Data Entrada</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {customerOrders.map((os) => (
                  <tr key={os.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                    <td className="py-3.5 px-4 font-bold text-zinc-950 dark:text-white">{os.osNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {getVehicleNameById(os.vehicleId)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-medium">
                      {formatDate(os.entryDate)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(os.status)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-zinc-950 dark:text-white">
                      {formatCurrency(os.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-center no-print">
                      <button
                        onClick={() => router.push(`/orders/${os.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Ver OS</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal Drawer */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Cadastrar Veículo</h3>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleVehicleSubmit} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Plate */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Placa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC-1234 ou ABC1D23"
                    value={plate}
                    onChange={handlePlateChange}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm font-semibold uppercase outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chevrolet"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Model */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Onix 1.0 LT"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Ano Fabricação *
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 2}
                    placeholder="Ex: 2021"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Color */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Cor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Prata Metalizado"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>

                {/* Mileage */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Quilometragem Atual *
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
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-md shadow-orange-600/10"
                >
                  Cadastrar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
