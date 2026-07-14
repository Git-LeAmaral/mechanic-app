import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'MecaFlow - Gestão de Oficina Mecânica',
  description: 'Acompanhamento de agendamentos, ordens de serviço, clientes e veículos para oficinas mecânicas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark h-full antialiased" style={{ colorScheme: 'dark' }}>
      <body className="h-full">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
