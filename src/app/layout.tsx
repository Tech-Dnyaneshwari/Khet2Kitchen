import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Khet2Kitchen | Direct B2B Farm-to-Business Agricultural Marketplace',
  description:
    'Fresh from Farms. Direct to Kitchens. Connecting verified Indian farmers directly with restaurants, hotels, hostels, messes, and canteens with 0% broker commission.',
  keywords: [
    'B2B agriculture',
    'farm to kitchen',
    'wholesale vegetables Pune',
    'direct farmer supply',
    'restaurant procurement',
    'hotel vegetable supplier',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  // Get cart items count for current buyer
  let cartCount = 0;
  if (session?.userId && session.role === 'BUYER') {
    try {
      const cart = await prisma.cart.findUnique({
        where: { buyerId: session.userId },
        include: { items: true },
      });
      cartCount = cart?.items.length ?? 0;
    } catch (e) {
      cartCount = 0;
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar currentUser={session} cartCount={cartCount} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
