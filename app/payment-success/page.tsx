'use client';

import { CheckCircle, ArrowLeft, BookOpen, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg,#060c1e,#0d1b3e)' }}>
      <div className="w-full max-w-md">

        {/* Back */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-all"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(13,18,40,0.97)', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>
          {/* Icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="text-2xl font-black text-white mb-2">Payment Submitted!</h1>
          <p className="text-blue-300 text-sm leading-relaxed mb-5">
            Your payment has been received and is under review. The admin will verify and grant course access shortly — usually within 24 hours.
          </p>

          <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-blue-300">Check your enrollment status anytime in</p>
            <p className="text-blue-200 font-semibold mt-0.5">My Dashboard → My Courses</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}
            >
              <BookOpen className="w-4 h-4" />
              Go to My Dashboard
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
