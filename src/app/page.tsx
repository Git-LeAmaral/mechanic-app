'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMechanic } from '@/context/MechanicContext';
import { 
  formatCurrency, 
  formatDate, 
  formatPlate 
} from '@/utils/formatters';
import { 
  TrendingUp, 
  ClipboardList, 
  Clock, 
  DollarSign, 
  UserPlus, 
  Car, 
  FilePlus, 
  ChevronRight,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { orders, customers, vehicles, isLoading } = useMechanic();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Current Date logic matching local system time: 2026-06-23
  const todayStr = '2026-06-23'; 

  // Calculations
  const inProgressOrders = orders.filter(o => o.status === 'in_progress');
  
  // OS expected or entering today (Agendados do Dia)
  const todayOrders = orders.filter(o => o.entryDate === todayStr || o.expectedDate === todayStr);

  const pendingBudgets = orders.filter(o => o.status === 'budget');

  // Completed this month (June 2026)
  const completedThisMonth = orders.filter(o => {
    if (o.status !== 'completed' || !o.completionDate) return false;
    const compParts = o.completionDate.split('-');
    return compParts[0] === '2026' && compParts[1] === '06';
  });
  
  const monthlyRevenue = completedThisMonth.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Helper to find customer and vehicle info
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
        return <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Orçamento</span>;
      case 'approved':
        return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-500">Aprovado</span>;
      case 'in_progress':
        return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-500 animate-pulse-subtle">Em Execução</span>;
      case 'completed':
        return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-500">Finalizado</span>;
      case 'cancelled':
        return <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-500">Cancelado</span>;
      default:
        return null;
    }
  };

  // Recent Orders (take last 4)
  const recentOrders = [...orders].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white md:text-3xl">Painel de Controle</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Bem-vindo ao MecaFlow. Hoje é 23 de Junho de 2026.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: In Progress */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Em Execução</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-500">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {inProgressOrders.length}
            </span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Ordens ativas na oficina</p>
          </div>
        </div>

        {/* KPI 2: Scheduled Today */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Agendamentos Hoje</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-500">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {todayOrders.length}
            </span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Serviços programados para hoje</p>
          </div>
        </div>

        {/* KPI 3: Budgets */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Orçamentos Pendentes</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {pendingBudgets.length}
            </span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Aguardando aprovação</p>
          </div>
        </div>

        {/* KPI 4: Revenue */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Faturamento Mensal</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {formatCurrency(monthlyRevenue)}
            </span>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Junho 2026</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-4">Ações Rápidas</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/customers?action=new"
            className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-zinc-950 dark:text-white">Novo Cliente</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Cadastrar novo proprietário</p>
            </div>
          </Link>

          <Link
            href="/vehicles?action=new"
            className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-zinc-950 dark:text-white">Novo Veículo</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Adicionar carro à frota</p>
            </div>
          </Link>

          <button
            onClick={() => router.push('/orders?action=new')}
            className="flex items-center gap-4 text-left rounded-xl border border-zinc-200 p-4 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40 cursor-pointer"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-500">
              <FilePlus className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-zinc-950 dark:text-white">Nova OS / Orçamento</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Abrir ordem de serviço</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid for Schedule and Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule List */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Agendamentos do Dia</h3>
            <Link 
              href="/schedules" 
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 flex items-center gap-0.5"
            >
              <span>Ver todos</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          {todayOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Nenhum agendamento para hoje.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {todayOrders.map((os) => (
                <div key={os.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{os.osNumber}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">•</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        Prev: {formatDate(os.expectedDate)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{getCustomerName(os.customerId)}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{getVehicleInfo(os.vehicleId)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(os.status)}
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(os.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent OS List */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Ordens de Serviço Recentes</h3>
            <Link 
              href="/orders" 
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 flex items-center gap-0.5"
            >
              <span>Ver todas</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Nenhuma ordem de serviço cadastrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {recentOrders.map((os) => (
                <Link
                  key={os.id}
                  href={`/orders/${os.id}`}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 -mx-2 px-2 rounded-xl transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-950 dark:text-white">{os.osNumber}</span>
                      {getStatusBadge(os.status)}
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{getCustomerName(os.customerId)}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{getVehicleInfo(os.vehicleId)}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-zinc-950 dark:text-white">
                      {formatCurrency(os.totalAmount)}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Entrada: {formatDate(os.entryDate)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
