'use client';

import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you encountered any issues, please try again or contact support.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

