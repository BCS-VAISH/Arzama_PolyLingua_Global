'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now redirects to the Portuguese course page
// Enrollment is handled directly via the QR payment modal on the course page
export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/PortugueseCourse');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white">
      <p>Redirecting...</p>
    </div>
  );
}
