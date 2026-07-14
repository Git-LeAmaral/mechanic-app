'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useMechanic } from '@/context/MechanicContext';
import { formatDate, formatCurrency, formatPlate } from '@/utils/formatters';
import { 
  ArrowLeft, 
  Car, 
  User, 
  FileText, 
  Clock, 
  Play, 
  CheckCircle2, 
  XCircle,
  Eye,
  Info
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetails({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { vehicles, customers, orders, isLoading } = useMechanic();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Find vehicle
  const vehicle = vehicles.find(v => v.id === id);
  if (!vehicle) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Veículo não encontrado</h3>
        <p className="text-zinc-500">O veículo solicitado não existe no banco de dados.</p>
        <button
          onClick={() => router.push('/vehicles')}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Veículos</span>
        </button>
      </div>
    );
  }

  // Find Owner
  const owner = customers.find(c => c.id === vehicle.customerId);

  // Get OS History for this vehicle
  const vehicleOrders = orders.filter(o => o.vehicleId === id);

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

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/vehicles')}
          className="rounded-xl border border-zinc-200 p-2.5 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            {vehicle.brand} {vehicle.model}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Placa: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{formatPlate(vehicle.plate)}</strong></p>
        </div>
      </div>

      {/* Grid: Specs + Owner */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Vehicle Spec Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Car className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-zinc-950 dark:text-white">Especificações do Veículo</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-zinc-400">Marca</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{vehicle.brand}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-zinc-400">Modelo</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{vehicle.model}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-zinc-400">Placa</span>
              <p className="font-bold font-mono text-zinc-800 dark:text-zinc-200 uppercase">{formatPlate(vehicle.plate)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-zinc-400">Ano Modelo</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{vehicle.year}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-zinc-400">Cor</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{vehicle.color || 'Não informada'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-zinc-400">Quilometragem</span>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{vehicle.mileage.toLocaleString()} km</p>
            </div>
          </div>
        </div>

        {/* Owner Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4 md:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <User className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-zinc-950 dark:text-white">Proprietário</h3>
          </div>

          {owner ? (
            <div className="space-y-3.5 text-sm">
              <div>
                <p className="font-extrabold text-zinc-900 dark:text-white text-base leading-tight">{owner.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Doc: {owner.document}</p>
              </div>

              <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <div>Fone: <span className="font-bold text-zinc-700 dark:text-zinc-300">{owner.phone}</span></div>
                {owner.whatsapp && <div>WhatsApp: <span className="font-bold text-emerald-600 dark:text-emerald-500">{owner.whatsapp}</span></div>}
              </div>

              <button
                onClick={() => router.push(`/customers/${owner.id}`)}
                className="w-full rounded-xl border border-zinc-200 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 text-center transition-all cursor-pointer"
              >
                Ver ficha do cliente
              </button>
            </div>
          ) : (
            <div className="text-sm font-semibold text-rose-500 flex items-center gap-1.5 py-4">
              <Info className="h-4 w-4" />
              <span>Dono não encontrado</span>
            </div>
          )}
        </div>
      </div>

      {/* Service Order History List */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <FileText className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-zinc-950 dark:text-white">Serviços Executados neste Veículo</h3>
        </div>

        {vehicleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
            <p className="text-sm font-semibold">Nenhum serviço registrado para este carro.</p>
            <button
              onClick={() => router.push(`/orders?action=new&vehicleId=${id}&customerId=${vehicle.customerId}`)}
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
                  <th className="py-3 px-4">OS</th>
                  <th className="py-3 px-4">Km entrada</th>
                  <th className="py-3 px-4">Data Entrada</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {vehicleOrders.map((os) => (
                  <tr key={os.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                    <td className="py-3.5 px-4 font-bold text-zinc-950 dark:text-white">{os.osNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {os.mileage.toLocaleString()} km
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
                        <Eye className="h-3.5 w-3.5" />
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
    </div>
  );
}
