import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Construction Ledger',
  description: 'Manage construction material deliveries and ledger',
};

// Sidebar Component
function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Ledger Co.</h1>
      <nav>
        <ul>
          <li className="mb-3">
            <Link href="/" className="hover:text-indigo-300">Dashboard</Link>
          </li>
          <li className="mb-3">
            <Link href="/deliveries" className="hover:text-indigo-300">Deliveries</Link>
          </li>
          <li className="mb-3">
            <Link href="/clients" className="hover:text-indigo-300">Clients</Link>
          </li>
          <li className="mb-3">
            <Link href="/products" className="hover:text-indigo-300">Products</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
