'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMechanic } from '@/context/MechanicContext';
import { formatPlate } from '@/utils/formatters';
import { 
  Car, 
  Search, 
  Plus, 
  Edit2, 
  Eye, 
  Trash2, 
  X, 
  User, 
  FileText
} from 'lucide-react';

export default function Vehicles() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { vehicles, customers, addVehicle, updateVehicle, deleteVehicle, orders, isLoading } = useMechanic();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null); // null for new, vehicle object for edit

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');

  // Check if '?action=new' is set in query
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      router.replace('/vehicles');
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Handle open actions
  const handleOpenCreate = () => {
    setSelectedVehicle(null);
    setCustomerId(customers[0]?.id || '');
    setPlate('');
    setBrand('');
    setModel('');
    setYear('');
    setColor('');
    setMileage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setCustomerId(vehicle.customerId);
    setPlate(vehicle.plate);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(String(vehicle.year));
    setColor(vehicle.color || '');
    setMileage(String(vehicle.mileage));
    setIsModalOpen(true);
  };

  // Mask plate input
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const formatted = formatPlate(val);
    setPlate(formatted);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !plate || !brand || !model || !year || !mileage) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const data = {
      customerId,
      plate,
      brand,
      model,
      year: parseInt(year),
      color,
      mileage: parseInt(mileage),
    };

    if (selectedVehicle) {
      updateVehicle(selectedVehicle.id, data);
    } else {
      addVehicle(data);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o veículo "${name}"? Todas as Ordens de Serviço vinculadas a este veículo também serão removidas!`)) {
      deleteVehicle(id);
    }
  };

  // Helper getters
  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Cliente não encontrado';
  };

  const getVehicleOSCount = (id: string) => {
    return orders.filter(o => o.vehicleId === id).length;
  };

  // Filtered list
  const filteredVehicles = vehicles.filter(v => {
    const query = searchQuery.toLowerCase();
    const ownerName = getCustomerName(v.customerId).toLowerCase();
    return v.plate.toLowerCase().includes(query) ||
           v.model.toLowerCase().includes(query) ||
           v.brand.toLowerCase().includes(query) ||
           ownerName.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white md:text-3xl">Veículos</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Gerencie a frota de veículos dos seus clientes.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-md shadow-orange-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por placa, modelo, marca ou proprietário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-800 dark:focus:border-orange-500"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 dark:bg-zinc-900/50">
              <Car className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-950 dark:text-white">Nenhum veículo encontrado</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Tente buscar por outro termo ou cadastre um novo veículo.</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 hover:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-orange-500 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">
                    {formatPlate(vehicle.plate)}
                  </span>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-all no-print">
                    <button
                      onClick={() => handleOpenEdit(vehicle)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                      title="Editar veículo"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Excluir veículo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-zinc-950 dark:text-white text-base">
                    {vehicle.brand} {vehicle.model}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{getCustomerName(vehicle.customerId)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 border-t border-zinc-50 dark:border-zinc-800 pt-3">
                  <div>Ano: <span className="text-zinc-800 dark:text-zinc-200">{vehicle.year}</span></div>
                  <div>Cor: <span className="text-zinc-800 dark:text-zinc-200">{vehicle.color || '-'}</span></div>
                  <div className="col-span-2">Quilometragem: <span className="text-zinc-800 dark:text-zinc-200">{vehicle.mileage.toLocaleString()} km</span></div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-500">
                  <FileText className="h-3 w-3" />
                  {getVehicleOSCount(vehicle.id)} OS
                </span>
                
                <button
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-500 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Histórico</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                {selectedVehicle ? 'Editar Veículo' : 'Cadastrar Veículo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Customer Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Proprietário *
                </label>
                {customers.length === 0 ? (
                  <div className="text-sm font-semibold text-rose-500">
                    Nenhum cliente cadastrado! Cadastre um cliente antes de adicionar um veículo.
                  </div>
                ) : (
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.document})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Plate */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Placa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC-1234"
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
                    placeholder="Ex: Ford"
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
                    placeholder="Ex: Fiesta 1.6 Rocam"
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
                    placeholder="Ex: 2012"
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
                    placeholder="Ex: Preto"
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
                    placeholder="Ex: 112000"
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
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={customers.length === 0}
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-md shadow-orange-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedVehicle ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
