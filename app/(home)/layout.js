import './globals.css'
import { Quicksand } from 'next/font/google'
import UNavbar from '@/components/UNavbar'
import Footer from '@/components/Footer'
import DisclaimerModal from '@/components/DisclaimerModal'
import { twMerge } from 'tailwind-merge'
import { Analytics } from '@vercel/analytics/react';

const inter = Quicksand({ subsets: ['latin'], weight: ['400'] })

export const metadata = {
  title: 'UniPD Fast Booker',
  description: 'Unofficial library booking tool for educational purposes - Not affiliated with Affluences',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={twMerge(inter.className, 'bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col min-h-screen')}>
        <DisclaimerModal />
        <UNavbar/>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics/>
        </body>
    </html>
  )
}
