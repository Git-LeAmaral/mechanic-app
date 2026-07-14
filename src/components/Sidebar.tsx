'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  Users, 
  Car, 
  Wrench,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Agendamentos', href: '/schedules', icon: CalendarDays },
    { name: 'Ordens de Serviço', href: '/orders', icon: FileText },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Veículos', href: '/vehicles', icon: Car },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white px-5 py-6 transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between pb-8">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-600/30 dark:bg-orange-500">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Meca<span className="text-orange-500">Flow</span></span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Oficina Mecânica MVP</p>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-500' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100'
                }`}
              >
                <ActiveIcon className={`h-5 w-5 ${active ? 'text-orange-600 dark:text-orange-500' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Version Footer */}
        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-900">
          <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-900/50">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Modo Híbrido</p>
            <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">Clientes no Postgres · resto local</p>
          </div>
        </div>
      </aside>
    </>
  );
}
