'use client';

import { CheckCircle, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Submitted!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been received and is under review. The admin will verify and grant course access shortly (usually within 24 hours).
        </p>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
          You can check your enrollment status anytime in <strong>My Dashboard → My Courses</strong>.
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition font-medium"
          >
            <BookOpen className="w-5 h-5" />
            Go to My Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
