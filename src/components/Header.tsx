'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Sun, Moon, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Initial theme set based on preference or html class
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/schedules')) return 'Agendamentos';
    if (pathname.startsWith('/orders')) return 'Ordens de Serviço';
    if (pathname.startsWith('/customers')) return 'Clientes';
    if (pathname.startsWith('/vehicles')) return 'Veículos';
    return 'MecaFlow';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 no-print sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          className="rounded-xl border border-zinc-200 p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 md:hidden"
        >
          <Menu className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        </button>

        {/* Page Title */}
        <h1 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-zinc-200 p-2.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Quick New OS Button */}
        <button
          onClick={() => router.push('/orders?action=new')}
          className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/20 active:scale-95 dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          <span>Nova OS</span>
        </button>
      </div>
    </header>
  );
}
