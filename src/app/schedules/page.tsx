'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMechanic } from '@/context/MechanicContext';
import { formatDate, formatCurrency, formatPlate } from '@/utils/formatters';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  FileText,
  Calendar
} from 'lucide-react';

type FilterType = 'day' | 'week' | 'month';

export default function Schedules() {
  const { orders, customers, vehicles, isLoading } = useMechanic();
  const [filterMode, setFilterMode] = useState<FilterType>('day');
  
  // Set current date reference as '2026-06-23' (Tuesday)
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-06-23T12:00:00'));

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Formatting date keys in YYYY-MM-DD
  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Date navigation helpers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (filterMode === 'day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (filterMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (filterMode === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (filterMode === 'day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (filterMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (filterMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-06-23T12:00:00'));
  };

  // Week range helper (Monday to Sunday)
  const getWeekRange = (date: Date) => {
    const currentDay = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() + distanceToMonday);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { startOfWeek, endOfWeek };
  };

  // Label for current selection range
  const getRangeLabel = (): string => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    if (filterMode === 'day') {
      const day = currentDate.getDate();
      const month = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();
      const dayOfWeekNames = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'
      ];
      const dayOfWeek = dayOfWeekNames[currentDate.getDay()];
      return `${day} de ${month} de ${year} (${dayOfWeek})`;
    } else if (filterMode === 'week') {
      const { startOfWeek, endOfWeek } = getWeekRange(currentDate);
      const startStr = `${String(startOfWeek.getDate()).padStart(2, '0')}/${String(startOfWeek.getMonth() + 1).padStart(2, '0')}`;
      const endStr = `${String(endOfWeek.getDate()).padStart(2, '0')}/${String(endOfWeek.getMonth() + 1).padStart(2, '0')}/${endOfWeek.getFullYear()}`;
      return `${startStr} a ${endStr}`;
    } else {
      const month = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();
      return `${month} de ${year}`;
    }
  };

  // Filtering orders
  const getFilteredOrders = () => {
    if (filterMode === 'day') {
      const targetStr = formatDateKey(currentDate);
      return orders.filter(o => o.entryDate === targetStr || o.expectedDate === targetStr);
    } else if (filterMode === 'week') {
      const { startOfWeek, endOfWeek } = getWeekRange(currentDate);
      const startKey = formatDateKey(startOfWeek);
      const endKey = formatDateKey(endOfWeek);
      
      return orders.filter(o => {
        // Entry or expected date within the week
        return (o.entryDate >= startKey && o.entryDate <= endKey) || 
               (o.expectedDate >= startKey && o.expectedDate <= endKey);
      });
    } else {
      // Month
      const year = currentDate.getFullYear();
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      const targetMonthPrefix = `${year}-${monthStr}`;
      
      return orders.filter(o => {
        return o.entryDate.startsWith(targetMonthPrefix) || 
               o.expectedDate.startsWith(targetMonthPrefix);
      });
    }
  };

  const filteredOrders = getFilteredOrders();

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

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white md:text-3xl">Agendamentos</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Gerencie a entrada e previsão de saída dos veículos da oficina.</p>
        </div>
        
        {/* Toggle Mode buttons */}
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 self-start sm:self-auto">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setFilterMode(mode);
                // Reset to default reference date when switching just for clarity
                setCurrentDate(new Date('2026-06-23T12:00:00'));
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                filterMode === mode
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleToday}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Hoje
          </button>
          
          <button
            onClick={handleNext}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-extrabold text-zinc-950 dark:text-white">{getRangeLabel()}</span>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Encontrado: <strong>{filteredOrders.length}</strong> agendamento(s)
        </div>
      </div>

      {/* Schedules List */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 dark:bg-zinc-900/50">
              <CalendarDays className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-950 dark:text-white">Nenhum agendamento encontrado</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Nenhuma ordem de serviço ativa com entrada ou previsão de entrega para este período.</p>
            <Link
              href="/orders?action=new"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              <span>Abrir Nova OS</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <th className="px-6 py-4">OS</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4">Entrada</th>
                  <th className="px-6 py-4">Previsão</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 no-print text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {filteredOrders.map((os) => (
                  <tr key={os.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{os.osNumber}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{getCustomerName(os.customerId)}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium">{getVehicleInfo(os.vehicleId)}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{formatDate(os.entryDate)}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-semibold">{formatDate(os.expectedDate)}</td>
                    <td className="px-6 py-4">{getStatusBadge(os.status)}</td>
                    <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-white">{formatCurrency(os.totalAmount)}</td>
                    <td className="px-6 py-4 text-center no-print">
                      <Link
                        href={`/orders/${os.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Abrir</span>
                      </Link>
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
