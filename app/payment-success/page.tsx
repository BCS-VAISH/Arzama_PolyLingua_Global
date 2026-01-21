'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type ReceiptData = {
  id: string;
  courseName: string;
  studentName: string;
  studentEmail: string;
  amount: string;
  currency: string;
  cardBrand: string;
  cardLast4: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  paymentDate: string;
};

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePayPalCallback = async () => {
      // Check if this is a PayPal callback
      const token = searchParams.get('token');
      const payerId = searchParams.get('PayerID');
      
      if (token) {
        // This is a PayPal callback, capture the order
        // The 'token' parameter is the PayPal order ID
        try {
          setLoading(true);
          const captureResponse = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: token }),
          });

          if (!captureResponse.ok) {
            throw new Error('Failed to capture PayPal order');
          }

          const captureData = await captureResponse.json();
          
          // Fetch receipt using the captured order ID
          if (captureData.success) {
            const receiptResponse = await fetch(`/api/receipts?sessionId=${token}`);
            if (receiptResponse.ok) {
              const receiptData = await receiptResponse.json();
              setReceipt(receiptData);
            } else {
              throw new Error('Failed to fetch receipt');
            }
          }
        } catch (err) {
          console.error('Error processing PayPal payment:', err);
          setError(err instanceof Error ? err.message : 'Failed to process payment');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Handle regular payment (UPI/other)
      const paymentId = searchParams.get('paymentId') || searchParams.get('session_id');
      if (!paymentId) {
        setError('No payment ID found');
        setLoading(false);
        return;
      }

      const fetchReceipt = async () => {
        try {
          const response = await fetch(`/api/receipts?sessionId=${paymentId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch receipt');
          }
          const data = await response.json();
          setReceipt(data);
        } catch (err) {
          console.error('Error fetching receipt:', err);
          setError(err instanceof Error ? err.message : 'Failed to load receipt');
        } finally {
          setLoading(false);
        }
      };

      fetchReceipt();
    };

    handlePayPalCallback();
  }, [searchParams]);

  const handleDownloadPDF = () => {
    if (!receipt) return;

    // Create a printable receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${receipt.courseName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1e3a8a;
              margin: 0;
            }
            .receipt-details {
              margin: 20px 0;
            }
            .receipt-details h2 {
              color: #1e3a8a;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .detail-label {
              font-weight: bold;
              color: #4b5563;
            }
            .detail-value {
              color: #111827;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #059669;
              text-align: center;
              margin: 20px 0;
              padding: 20px;
              background: #f0fdf4;
              border-radius: 8px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ARZAMA's PolyLingua Global</h1>
            <p>Payment Receipt</p>
          </div>
          
          <div class="receipt-details">
            <h2>Course Information</h2>
            <div class="detail-row">
              <span class="detail-label">Course:</span>
              <span class="detail-value">${receipt.courseName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${receipt.studentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Email:</span>
              <span class="detail-value">${receipt.studentEmail}</span>
            </div>
          </div>

          <div class="receipt-details">
            <h2>Payment Details</h2>
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">${receipt.paymentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${receipt.cardBrand} •••• ${receipt.cardLast4}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${receipt.stripePaymentIntentId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Session ID:</span>
              <span class="detail-value">${receipt.stripeSessionId}</span>
            </div>
          </div>

          <div class="amount">
            Amount Paid: ${receipt.currency} ${receipt.amount}
          </div>

          <div class="footer">
            <p>Thank you for your enrollment!</p>
            <p>This is an official receipt for your records.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait a bit then trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
        <div className="bg-white rounded-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load receipt details.'}</p>
          <Link
            href="/"
            className="inline-block bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your enrollment has been confirmed.</p>
        </div>

        {/* Receipt Details */}
        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Receipt Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-semibold text-gray-900">{receipt.courseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Student Name:</span>
              <span className="font-semibold text-gray-900">{receipt.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-900">{receipt.studentEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Date:</span>
              <span className="font-semibold text-gray-900">{receipt.paymentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">
                {receipt.cardBrand} •••• {receipt.cardLast4}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-700">{receipt.stripePaymentIntentId}</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-green-50 rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-600 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-green-700">
            {receipt.currency} {receipt.amount}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

