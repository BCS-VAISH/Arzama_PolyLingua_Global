// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import Script from 'next/script'

export const metadata = {
  title: "ARZAMA's PolyLingua Global",
  description: "Learn Languages. Connect the World.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const paypalMode = process.env.PAYPAL_MODE || 'sandbox';

  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`}
          strategy="lazyOnload"
          data-namespace="paypal_sdk"
        />
      </head>
      <body className="bg-[#EBF5FB] text-gray-800 font-poppins">
        {children}
      </body>
    </html>
  );
}
