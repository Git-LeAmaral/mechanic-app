'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useMechanic } from '@/context/MechanicContext';
import { formatCurrency, formatDate, formatPhone, formatPlate } from '@/utils/formatters';
import { 
  ArrowLeft, 
  Printer, 
  Check, 
  X, 
  Clock, 
  Play, 
  CheckCircle2, 
  XCircle,
  Wrench,
  Package,
  FileText,
  User,
  Car,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { OSStatus } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetails({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const { orders, customers, vehicles, updateOS, isLoading } = useMechanic();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Find order
  const order = orders.find(o => o.id === id);
  if (!order) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Ordem de Serviço não encontrada</h3>
        <p className="text-zinc-500">A OS solicitada não existe no banco de dados.</p>
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Ordens</span>
        </button>
      </div>
    );
  }

  // Find customer and vehicle
  const customer = customers.find(c => c.id === order.customerId);
  const vehicle = vehicles.find(v => v.id === order.vehicleId);

  // Status handlers
  const handleUpdateStatus = (newStatus: OSStatus) => {
    const updateData: Partial<typeof order> = { status: newStatus };
    if (newStatus === 'completed') {
      updateData.completionDate = new Date().toISOString().split('T')[0];
    }
    updateOS(order.id, updateData);
  };

  // Printing trigger
  const handlePrint = () => {
    window.print();
  };

  // Status styling helpers
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'budget': return 'Orçamento';
      case 'approved': return 'Aprovada';
      case 'in_progress': return 'Em Execução';
      case 'completed': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return '';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'budget': return 'Aguardando aprovação do cliente para iniciar o serviço.';
      case 'approved': return 'Orçamento aprovado. Aguardando fila de execução do mecânico.';
      case 'in_progress': return 'Veículo na rampa. Reparos e manutenções sendo executados.';
      case 'completed': return 'Serviço finalizado com sucesso! Veículo liberado para retirada.';
      case 'cancelled': return 'A Ordem de Serviço foi cancelada e arquivada.';
      default: return '';
    }
  };

  // WhatsApp invoice message builder
  const handleSendBudgetWhatsApp = () => {
    if (!customer) return;
    const servicesText = order.services.map(s => `- ${s.description}: ${formatCurrency(s.price * s.quantity)}`).join('\n');
    const partsText = order.parts.map(p => `- ${p.description}: ${formatCurrency(p.price * p.quantity)}`).join('\n');
    
    let text = `Olá ${customer.name}! Segue o orçamento para o veículo ${vehicle?.brand} ${vehicle?.model} (${vehicle?.plate}):\n\n`;
    if (order.services.length > 0) {
      text += `*SERVIÇOS MÃO DE OBRA:*\n${servicesText}\n\n`;
    }
    if (order.parts.length > 0) {
      text += `*PEÇAS E COMPONENTES:*\n${partsText}\n\n`;
    }
    if (order.discount > 0) {
      text += `Desconto: ${formatCurrency(order.discount)}\n`;
    }
    text += `*VALOR TOTAL: ${formatCurrency(order.totalAmount)}*\n\n`;
    text += `Aguardamos sua aprovação para iniciarmos os serviços!`;

    const link = `https://wa.me/55${customer.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(link, '_blank');
  };

  // Subtotals
  const servicesSubtotal = order.services.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const partsSubtotal = order.parts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Header Bar - Back & Action buttons (hidden on print) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/orders')}
            className="rounded-xl border border-zinc-200 p-2.5 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {order.osNumber}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Entrada: {formatDate(order.entryDate)} | Previsão: {formatDate(order.expectedDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp share */}
          {customer && order.status === 'budget' && (
            <button
              onClick={handleSendBudgetWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 fill-current" />
              <span>Enviar Orçamento</span>
            </button>
          )}

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir OS</span>
          </button>
        </div>
      </div>

      {/* Visual Status Progress (hidden on print) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6 no-print">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status Atual:</span>
              <strong className="text-sm font-extrabold text-orange-600 dark:text-orange-500">{getStatusLabel(order.status)}</strong>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{getStatusDescription(order.status)}</p>
          </div>

          {/* State changes control */}
          <div className="flex flex-wrap gap-2">
            {order.status === 'budget' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-900/20 dark:border-rose-900/40 cursor-pointer"
                >
                  Rejeitar / Cancelar
                </button>
                <button
                  onClick={() => handleUpdateStatus('approved')}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  Aprovar Orçamento
                </button>
              </>
            )}

            {order.status === 'approved' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-900/20 dark:border-rose-900/40 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateStatus('in_progress')}
                  className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer flex items-center gap-1"
                >
                  <Play className="h-3 w-3 fill-current" />
                  Iniciar Execução
                </button>
              </>
            )}

            {order.status === 'in_progress' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-900/20 dark:border-rose-900/40 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Finalizar Serviço
                </button>
              </>
            )}

            {order.status === 'cancelled' && (
              <span className="text-xs font-bold text-rose-500 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/10 px-3 py-1.5 rounded-lg">
                <XCircle className="h-4 w-4" />
                OS Cancelada
              </span>
            )}

            {order.status === 'completed' && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/10 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                OS Finalizada em {order.completionDate ? formatDate(order.completionDate) : '-'}
              </span>
            )}
          </div>
        </div>

        {/* Visual Dots Timeline */}
        {order.status !== 'cancelled' && (
          <div className="relative pt-4 pb-2 px-1 max-w-2xl mx-auto">
            {/* Background line */}
            <div className="absolute top-[27px] left-3 right-3 h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
            
            {/* Fill progress line */}
            <div 
              className="absolute top-[27px] left-3 h-0.5 bg-orange-500 z-0 transition-all duration-300"
              style={{
                width: 
                  order.status === 'budget' ? '0%' :
                  order.status === 'approved' ? '33.3%' :
                  order.status === 'in_progress' ? '66.6%' : '100%'
              }}
            />

            <div className="relative z-10 flex justify-between">
              {[
                { status: 'budget', label: 'Orçamento' },
                { status: 'approved', label: 'Aprovada' },
                { status: 'in_progress', label: 'Executando' },
                { status: 'completed', label: 'Finalizada' }
              ].map((step, idx) => {
                const stepOrder = ['budget', 'approved', 'in_progress', 'completed'];
                const currentIdx = stepOrder.indexOf(order.status);
                const stepIdx = stepOrder.indexOf(step.status);
                
                const isDone = stepIdx < currentIdx || order.status === 'completed';
                const isActive = stepIdx === currentIdx;

                return (
                  <div key={step.status} className="flex flex-col items-center gap-1.5">
                    <div 
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all ${
                        isDone 
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : isActive 
                            ? 'bg-white border-orange-500 text-orange-600 dark:bg-zinc-900'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800'
                      }`}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <span 
                      className={`text-[10px] font-bold ${
                        isActive ? 'text-orange-500' : isDone ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ==================== PRINTABLE OS CONTENT ==================== */}
      <div className="print-container rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
        
        {/* Printable Header (Only displays during print) */}
        <div className="hidden print-only border-b-2 border-zinc-900 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-black">MecaFlow Oficina</h2>
              <p className="text-[9px] text-zinc-600">Rua da Oficina, 100 - Bairro Centro - São Paulo/SP</p>
              <p className="text-[9px] text-zinc-600">Telefone: (11) 5555-4321 | WhatsApp: (11) 98765-4321</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-black">{order.osNumber}</h3>
              <p className="text-xs font-bold text-zinc-800">Status: {getStatusLabel(order.status).toUpperCase()}</p>
              <p className="text-[10px] text-zinc-600 mt-1">Data Emissão: {formatDate(order.entryDate)}</p>
            </div>
          </div>
        </div>

        {/* Regular Header representation on screen */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-zinc-950 dark:text-white">Ordem de Serviço</h3>
          </div>
          <span className="text-sm font-extrabold text-zinc-600 dark:text-zinc-400">
            {order.osNumber}
          </span>
        </div>

        {/* Grid Customer details + Vehicle specs */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Customer */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 border-b border-zinc-100 dark:border-zinc-800/80 pb-1.5">
              Cliente Proprietário
            </h4>
            
            {customer ? (
              <div className="text-sm space-y-1">
                <p className="font-extrabold text-zinc-900 dark:text-white print:text-black">{customer.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-700">Documento: {customer.document}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-700">Telefone: {formatPhone(customer.phone)}</p>
                {customer.email && <p className="text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-700">E-mail: {customer.email}</p>}
                {customer.address && <p className="text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-700 leading-tight">Endereço: {customer.address}</p>}
              </div>
            ) : (
              <p className="text-xs text-rose-500 font-bold">Cliente excluído ou inválido.</p>
            )}
          </div>

          {/* Vehicle */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 border-b border-zinc-100 dark:border-zinc-800/80 pb-1.5">
              Veículo
            </h4>

            {vehicle ? (
              <div className="text-sm space-y-1">
                <p className="font-extrabold text-zinc-900 dark:text-white print:text-black">{vehicle.brand} {vehicle.model}</p>
                <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-700">
                  <div>Placa: <strong className="font-mono text-zinc-700 dark:text-zinc-200 print:text-black uppercase">{formatPlate(vehicle.plate)}</strong></div>
                  <div>Ano: <span className="font-bold text-zinc-700 dark:text-zinc-200 print:text-black">{vehicle.year}</span></div>
                  <div>Cor: <span className="font-bold text-zinc-700 dark:text-zinc-200 print:text-black">{vehicle.color || '-'}</span></div>
                  <div>Km Entrada: <span className="font-bold text-zinc-700 dark:text-zinc-200 print:text-black">{order.mileage.toLocaleString()} km</span></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-500 font-bold">Veículo excluído ou inválido.</p>
            )}
          </div>
        </div>

        {/* Dynamic Items tables */}
        <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          
          {/* Services list */}
          {order.services.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5 text-zinc-400 print:hidden" />
                <span>Mão de Obra e Serviços executados</span>
              </h4>
              <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 print:border-zinc-400">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/60 font-bold text-zinc-500 print:bg-zinc-100 print:text-black">
                    <tr>
                      <th className="px-4 py-2">Descrição do Serviço</th>
                      <th className="px-4 py-2 text-right w-24">Valor Unit.</th>
                      <th className="px-4 py-2 text-center w-16">Quant.</th>
                      <th className="px-4 py-2 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium print:divide-zinc-300">
                    {order.services.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-200 print:text-black font-semibold">{s.description}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300 print:text-black">{formatCurrency(s.price)}</td>
                        <td className="px-4 py-2.5 text-center text-zinc-600 dark:text-zinc-300 print:text-black">{s.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 print:text-black font-bold">{formatCurrency(s.price * s.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parts list */}
          {order.parts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-zinc-400 print:hidden" />
                <span>Peças e Componentes aplicados</span>
              </h4>
              <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 print:border-zinc-400">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/60 font-bold text-zinc-500 print:bg-zinc-100 print:text-black">
                    <tr>
                      <th className="px-4 py-2">Descrição da Peça</th>
                      <th className="px-4 py-2 w-28">Part Number</th>
                      <th className="px-4 py-2 text-right w-24">Valor Unit.</th>
                      <th className="px-4 py-2 text-center w-16">Quant.</th>
                      <th className="px-4 py-2 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium print:divide-zinc-300">
                    {order.parts.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-200 print:text-black font-semibold">{p.description}</td>
                        <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400 print:text-zinc-700 font-mono">{p.partNumber || '-'}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300 print:text-black">{formatCurrency(p.price)}</td>
                        <td className="px-4 py-2.5 text-center text-zinc-600 dark:text-zinc-300 print:text-black">{p.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 print:text-black font-bold">{formatCurrency(p.price * p.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Notes (if any) */}
        {order.notes && (
          <div className="space-y-1.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Observações Gerais</h4>
            <div className="rounded-xl bg-zinc-50/50 p-4 border border-zinc-100 dark:bg-zinc-900/80 dark:border-zinc-800 print:bg-white print:border-zinc-300 print:text-black text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
              {order.notes}
            </div>
          </div>
        )}

        {/* Invoice Summary and signature */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 flex flex-col md:flex-row md:justify-between items-end gap-6">
          {/* Printable signature fields (Only shows when printing) */}
          <div className="hidden print-only flex-1 w-full pt-8 grid grid-cols-2 gap-8 text-center text-[10px] text-zinc-700">
            <div className="space-y-1">
              <div className="border-t border-zinc-400 w-44 mx-auto pt-1" />
              <p>Assinatura do Técnico / Responsável</p>
            </div>
            <div className="space-y-1">
              <div className="border-t border-zinc-400 w-44 mx-auto pt-1" />
              <p>Assinatura do Cliente / Aprovação</p>
            </div>
          </div>

          {/* Subtotals card box */}
          <div className="w-full md:w-80 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 p-4 border border-zinc-100 dark:border-zinc-800 space-y-2 text-sm ml-auto print:bg-white print:border-zinc-400 print:text-black">
            <div className="flex justify-between text-zinc-500 print:text-zinc-700">
              <span>Mão de Obra (Serviços):</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 print:text-black">{formatCurrency(servicesSubtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 print:text-zinc-700">
              <span>Peças e Materiais:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 print:text-black">{formatCurrency(partsSubtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-semibold print:text-black">
                <span>Desconto concedido:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-400 pt-2 text-base">
              <span className="font-extrabold text-zinc-950 dark:text-white print:text-black">Total Geral:</span>
              <span className="font-extrabold text-orange-600 dark:text-orange-500 text-lg print:text-black">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
