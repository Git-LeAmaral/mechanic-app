'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMechanic } from '@/context/MechanicContext';
import { formatDocument, formatPhone } from '@/utils/formatters';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit2, 
  Eye, 
  Trash2, 
  X, 
  Phone, 
  FileText,
  Mail,
  MapPin
} from 'lucide-react';

export default function Customers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders, isLoading } = useMechanic();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null); // null for new, customer object for edit
  
  // Form State
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(false);

  // Check if '?action=new' is set in query
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      // Remove query param without refresh
      router.replace('/customers');
    }
  }, [searchParams]);

  // Sync whatsapp when checkbox is ticked
  useEffect(() => {
    if (whatsappSameAsPhone) {
      setWhatsapp(phone);
    }
  }, [phone, whatsappSameAsPhone]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Handle open actions
  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setName('');
    setDocument('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setWhatsappSameAsPhone(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setName(customer.name);
    setDocument(customer.document);
    setPhone(customer.phone);
    setWhatsapp(customer.whatsapp);
    setEmail(customer.email);
    setAddress(customer.address);
    setWhatsappSameAsPhone(customer.phone === customer.whatsapp);
    setIsModalOpen(true);
  };

  // Mask inputs
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const formatted = formatPhone(val);
    setPhone(formatted);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const formatted = formatPhone(val);
    setWhatsapp(formatted);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const formatted = formatDocument(val);
    setDocument(formatted);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !document || !phone) {
      alert('Por favor, preencha pelo menos Nome, CPF/CNPJ e Telefone.');
      return;
    }

    const data = {
      name,
      document,
      phone,
      whatsapp: whatsappSameAsPhone ? phone : whatsapp,
      email,
      address,
    };

    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, data);
      } else {
        await addCustomer(data);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar cliente.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${name}"? Todos os veículos e OS associados também serão excluídos!`)) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir cliente.');
      }
    }
  };

  // Filtered List
  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(query) || 
           c.document.replace(/\D/g, '').includes(query) ||
           c.document.toLowerCase().includes(query);
  });

  // Calculate OS counts per customer
  const getCustomerOSCount = (id: string) => {
    return orders.filter(o => o.customerId === id).length;
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white md:text-3xl">Clientes</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Gerencie a carteira de clientes da sua oficina.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-md shadow-orange-600/10"
        >
          <UserPlus className="h-4 w-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou CNPJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-800 dark:focus:border-orange-500"
          />
        </div>
      </div>

      {/* Customers Table/Grid */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 dark:bg-zinc-900/50">
              <Users className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-950 dark:text-white">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Tente buscar por outro termo ou cadastre um novo cliente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">CPF / CNPJ</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Ordens de Serviço</th>
                  <th className="px-6 py-4 text-center no-print">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-950 dark:text-white">{customer.name}</div>
                      {customer.email && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 font-medium">
                      {customer.document}
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <div className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-1">
                        <Phone className="h-3 w-3 text-zinc-400" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.whatsapp && customer.whatsapp !== customer.phone && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">
                          WhatsApp: {customer.whatsapp}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-500">
                        <FileText className="h-3 w-3" />
                        {getCustomerOSCount(customer.id)} OS
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center no-print">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/customers/${customer.id}`)}
                          className="rounded-lg border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          title="Ver perfil completo"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(customer)}
                          className="rounded-lg border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          title="Editar cadastro"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="rounded-lg border border-zinc-200 p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-zinc-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                          title="Excluir cliente"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                {selectedCustomer ? 'Editar Cliente' : 'Cadastrar Cliente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                />
              </div>

              {/* Document (CPF/CNPJ) */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  CPF / CNPJ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 000.000.000-00"
                  value={document}
                  onChange={handleDocumentChange}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                />
              </div>

              {/* Contacts Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Telefone Fixo/Celular *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: (11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      WhatsApp
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={whatsappSameAsPhone}
                        onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                        className="rounded accent-orange-500"
                      />
                      <span>Mesmo nº</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: (11) 99999-9999"
                    disabled={whatsappSameAsPhone}
                    value={whatsappSameAsPhone ? phone : whatsapp}
                    onChange={handleWhatsappChange}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="Ex: cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Endereço Completo
                </label>
                <textarea
                  placeholder="Rua, número, bairro, cidade, CEP..."
                  value={address}
                  rows={2}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:focus:border-orange-500 text-zinc-950 dark:text-zinc-50 resize-none"
                />
              </div>

              {/* Modal Buttons */}
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
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-md shadow-orange-600/10"
                >
                  {selectedCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
