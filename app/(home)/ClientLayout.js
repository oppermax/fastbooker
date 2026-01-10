"use client";

import { CartProvider } from '@/lib/cartContext';
import UNavbar from '@/components/UNavbar';
import Footer from '@/components/Footer';
import DisclaimerModal from '@/components/DisclaimerModal';

export default function ClientLayout({ children }) {
  return (
    <CartProvider>
      <DisclaimerModal />
      <UNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}

