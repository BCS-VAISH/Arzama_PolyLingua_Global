'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, Send, X, CheckCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'react-qr-code';

type Review = {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
};

type UserData = {
  id: string;
  email: string;
  name: string | null;
};

type PaymentData = {
  paymentId: string;
  qrCode?: string;
  amount: string;
  currency: string;
  courseName: string;
  enrollmentId: string;
  orderId?: string;
  approvalUrl?: string;
};

type PaymentMethod = 'upi' | 'paypal';

export default function EnglishCourse() {
  const [enrolled, setEnrolled] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'paid'>('pending');
  const [registrationData, setRegistrationData] = useState({ email: '', name: '' });

  const courseId = 'english';
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user data', e);
      }
    }
    setLoading(false);
  }, []);

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Poll payment status
  const pollPaymentStatus = async (paymentId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status?paymentId=${paymentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'PAID') {
            setPaymentStatus('paid');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            setTimeout(() => {
              window.location.href = `/payment-success?paymentId=${paymentId}`;
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000);

    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }, 300000);
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setSubmissionStatus({
        message: error instanceof Error ? error.message : 'Failed to fetch reviews. Please check your database connection.',
        type: 'error',
      });
      setTimeout(() => setSubmissionStatus(null), 5000);
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationData.email.trim()) {
      setSubmissionStatus({ message: 'Please enter your email.', type: 'error' });
      setTimeout(() => setSubmissionStatus(null), 3000);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registrationData.email,
          name: registrationData.name || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      setShowRegistration(false);
      setRegistrationData({ email: '', name: '' });
      setSubmissionStatus({ message: 'Registration successful!', type: 'success' });
      setTimeout(() => setSubmissionStatus(null), 3000);
    } catch (error) {
      console.error('Error registering:', error);
      setSubmissionStatus({
        message: error instanceof Error ? error.message : 'Registration failed. Please try again.',
        type: 'error',
      });
      setTimeout(() => setSubmissionStatus(null), 3000);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newReview.trim() || newRating === 0) {
      setSubmissionStatus({ message: 'Please provide a rating and a review.', type: 'error' });
      setTimeout(() => setSubmissionStatus(null), 3000);
      return;
    }

    if (!user) {
      setShowRegistration(true);
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId: user.id,
          rating: newRating,
          comment: newReview,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      setNewReview('');
      setNewRating(0);
      setSubmissionStatus({ message: 'Review submitted successfully!', type: 'success' });
      setTimeout(() => setSubmissionStatus(null), 3000);
      
      // Refresh reviews
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmissionStatus({
        message: error instanceof Error ? error.message : 'Failed to submit review. Please try again.',
        type: 'error',
      });
      setTimeout(() => setSubmissionStatus(null), 3000);
    }
  };

  // Handle payment method selection
  const handlePayment = async (method?: PaymentMethod) => {
    if (!user) {
      setShowRegistration(true);
      return;
    }

    if (!method) {
      setShowPaymentMethod(true);
      return;
    }

    setSelectedPaymentMethod(method);
    setPaymentLoading(true);

    try {
      if (method === 'paypal') {
        // Create PayPal order
        const response = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            userEmail: user.email,
            userName: user.name,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create PayPal order');
        }

        const data = await response.json();
        
        // Redirect to PayPal approval URL
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          throw new Error('PayPal approval URL not received');
        }
      } else {
        // UPI payment flow
        const response = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            userEmail: user.email,
            userName: user.name,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create payment session');
        }

        const data = await response.json();
        setPaymentData(data);
        setShowQRCode(true);
        setShowPaymentMethod(false);
        setPaymentStatus('pending');
        setPaymentLoading(false);
        
        // Start polling for payment status
        pollPaymentStatus(data.paymentId);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setSubmissionStatus({
        message: error instanceof Error ? error.message : 'Payment failed. Please try again.',
        type: 'error',
      });
      setTimeout(() => setSubmissionStatus(null), 3000);
      setPaymentLoading(false);
    }
  };

  // Manual payment confirmation (for testing)
  const handleManualConfirm = async () => {
    if (!paymentData) return;
    
    setPaymentStatus('checking');
    try {
      const response = await fetch('/api/payment/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentData.paymentId }),
      });

      if (response.ok) {
        setPaymentStatus('paid');
        setTimeout(() => {
          window.location.href = `/payment-success?paymentId=${paymentData.paymentId}`;
        }, 1500);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setPaymentStatus('pending');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-500 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4 text-white">English Fluency Program</h1>
      <p className="max-w-xl mb-8 text-lg text-white/90">
        Gain confidence in English speaking, writing, and comprehension. Perfect for professional growth and everyday communication.
      </p>

      {user && (
        <p className="text-sm font-mono bg-white/10 px-3 py-1 rounded-full mb-4">
          Logged in as: {user.email}
        </p>
      )}

      {/* QR Code Payment Modal */}
      {showQRCode && paymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => {
                setShowQRCode(false);
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                }
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code to Pay</h2>
            <p className="text-gray-600 mb-4">Amount: {paymentData.currency} {paymentData.amount}</p>
            
            <div className="flex justify-center mb-4 bg-white p-4 rounded-lg">
              <QRCodeSVG value={paymentData.qrCode} size={256} />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with any UPI app (PhonePe, Google Pay, Paytm, etc.)
            </p>
            
            {paymentStatus === 'pending' && (
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Waiting for payment...</span>
              </div>
            )}
            
            {paymentStatus === 'checking' && (
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying payment...</span>
              </div>
            )}
            
            {paymentStatus === 'paid' && (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span>Payment confirmed! Redirecting...</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handleManualConfirm}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                I've Paid (Confirm)
              </button>
              <button
                onClick={() => {
                  setShowQRCode(false);
                  if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      {showPaymentMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Payment Method</h2>
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('upi')}
                disabled={paymentLoading}
                className="w-full px-6 py-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">UPI (QR Code)</div>
                  <div className="text-sm text-gray-600">Pay using PhonePe, Google Pay, Paytm, etc.</div>
                </div>
                <div className="text-green-600 font-bold">₹3,599</div>
              </button>
              
              <button
                onClick={() => handlePayment('paypal')}
                disabled={paymentLoading}
                className="w-full px-6 py-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">PayPal</div>
                  <div className="text-sm text-gray-600">Pay using PayPal account or card</div>
                </div>
                <div className="text-blue-600 font-bold">~$43</div>
              </button>
            </div>
            
            <button
              onClick={() => setShowPaymentMethod(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Register to Continue</h2>
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegistration(false);
                    setRegistrationData({ email: '', name: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={paymentLoading || enrolled}
        className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-full mb-10 shadow hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paymentLoading ? 'Processing...' : enrolled ? 'Enrolled ✅' : 'Pay & Enroll Now'}
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-blue-700">Payment Section</h2>
        <p className="text-gray-600 mb-4">Choose your preferred payment method</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handlePayment('upi')}
            disabled={paymentLoading || enrolled}
            className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paymentLoading && selectedPaymentMethod === 'upi' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with UPI (QR Code)'
            )}
          </button>
          <button
            onClick={() => handlePayment('paypal')}
            disabled={paymentLoading || enrolled}
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paymentLoading && selectedPaymentMethod === 'paypal' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with PayPal'
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">Reviews</h2>
        <div className="flex items-center justify-center mb-2">
          <span className="text-yellow-500 font-bold mr-2">{averageRating}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-gray-600">({totalReviews} reviews)</span>
        </div>

        {/* Review Submission Form */}
        <form onSubmit={handleReviewSubmit} className="mt-4 mb-4">
          <div className="flex items-center justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
                  i < newRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
                onClick={() => setNewRating(i + 1)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Leave a review..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white rounded-lg px-4 py-2 hover:bg-blue-800 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {submissionStatus && (
            <div
              className={`mt-2 text-center text-sm ${
                submissionStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {submissionStatus.message}
            </div>
          )}
        </form>

        {/* Display Reviews */}
        <div className="max-h-48 overflow-y-auto space-y-3">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-1">- {review.userName}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No reviews yet. Be the first to leave one!</p>
          )}
        </div>
      </div>
    </main>
  );
}
