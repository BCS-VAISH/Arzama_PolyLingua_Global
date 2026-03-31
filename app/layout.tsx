import './globals.css'
import { ReactNode } from 'react'
import Toaster from '@/components/Toaster'

export const metadata = {
  title: "ARZAMA's PolyLingua Global",
  description: "Learn Languages. Connect the World.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#EBF5FB] text-gray-800 font-poppins">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
