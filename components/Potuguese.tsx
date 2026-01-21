'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
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

export default function App() {
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

  const courseId = 'portuguese';
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

  // Fetch reviews on mount and when user changes
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
            // Redirect to success page after a short delay
            setTimeout(() => {
              window.location.href = `/payment-success?paymentId=${paymentId}`;
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }, 300000);
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

  // Three.js background animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const particles = new THREE.Group();
    scene.add(particles);

    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        // Positions
        positions.push((Math.random() - 0.5) * 200);
        positions.push((Math.random() - 0.5) * 200);
        positions.push((Math.random() - 0.5) * 200);

        // Colors
        color.setHSL(Math.random(), 0.5, 0.5);
        colors.push(color.r, color.g, color.b);
    }
    
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particles.add(particleSystem);
    
    camera.position.z = 5;
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.0005;
        renderer.render(scene, camera);
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full"></canvas>
      <div className="relative z-10 flex flex-col items-center min-h-screen text-white bg-gray-400 bg-opacity-70 pt-20 pb-10 px-6">
        {/* Main Content Section */}
        <main className="text-center w-full max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 animate-fade-in">Portuguese Mastery Course</h1>
          <p className="max-w-xl mx-auto mb-8 text-lg sm:text-xl text-white/90 font-semibold animate-fade-in">
            Master the richness of the Portuguese language through immersive dialogues, cultural exploration, and real-life conversation practice.
          </p>

          {user && (
            <p className="text-sm font-mono bg-white/10 px-3 py-1 rounded-full mb-4">
              Logged in as: {user.email}
            </p>
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

          {/* Course Details Box with new design */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-10 w-full max-w-md mx-auto text-left">
            <img 
              src="https://placehold.co/600x300/1e3a8a/ffffff?text=Course+Image" 
              alt="Portuguese Course Banner" 
              className="w-full h-auto object-cover"
            />
            <div className="p-4 space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                The Complete Portuguese Guide: Learn & Master
              </h2>
              <p className="text-gray-500 text-sm">
                Ana Silva, Pedro Costa, Lingua Academy
              </p>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-yellow-500 font-bold mr-2">{averageRating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-500">({totalReviews})</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹3,599
              </p>
              <div className="bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full w-max text-xs">
                Bestseller
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handlePayment}
                disabled={paymentLoading || enrolled}
                className="bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? 'Processing...' : enrolled ? 'Enrolled ✅' : 'Pay & Enroll Now'}
              </button>
            </div>
          </div>
        </main>
        
        {/* Reviews Section at the bottom */}
        <section className="mt-10 w-full max-w-4xl">
          <div className="bg-blue-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-blue-600">
            <h2 className="text-2xl font-bold mb-4 text-white">Student Reviews</h2>
            
            {/* Review Submission Form */}
            <form onSubmit={handleReviewSubmit} className="mb-6">
              <div className="flex items-center justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                      i < newRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                    }`}
                    onClick={() => setNewRating(i + 1)}
                  />
                ))}
              </div>
              <div className="flex rounded-full bg-blue-700/50 p-2">
                <input
                  type="text"
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Leave a review..."
                  className="flex-grow p-2 bg-transparent focus:outline-none text-white placeholder-gray-300"
                />
                <button
                  type="submit"
                  className="bg-white text-blue-700 rounded-full p-2 hover:bg-gray-200 transition"
                  aria-label="Submit review"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {submissionStatus && (
                <div
                  className={`mt-2 text-center text-sm ${
                    submissionStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {submissionStatus.message}
                </div>
              )}
            </form>

            {/* Displaying Reviews */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-blue-700/50 rounded-lg p-4 mb-3 last:mb-0">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-white">{review.comment}</p>
                    <p className="text-xs text-blue-300 mt-2">
                      - {review.userName}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-blue-300">No reviews yet. Be the first to leave one!</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
