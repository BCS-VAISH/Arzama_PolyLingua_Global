'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { X, Loader2, CheckCircle, CreditCard, Smartphone, ArrowRight, Upload, ImageIcon, User, BookOpen } from 'lucide-react';
import { toast } from './Toaster';

type Props = {
  courseId: string;
  courseName: string;
  coursePrice: string;
  priceAmount: number;
  userName?: string;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = 'qr' | 'form' | 'done';

export default function PaymentModal({
  courseId,
  courseName,
  coursePrice,
  priceAmount,
  userName = '',
  onClose,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<Step>('qr');
  const [submitting, setSubmitting] = useState(false);
  const [useCustomQR, setUseCustomQR] = useState(false);
  const [payerName, setPayerName] = useState(userName);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || '8293772407@ybl';
  const merchantName = 'ARZAMA PolyLingua';
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${priceAmount}&cu=INR&tn=${encodeURIComponent(courseName + ' Course')}`;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!payerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!proofFile) {
      toast.error('Please upload your payment screenshot');
      return;
    }

    setSubmitting(true);
    const loadingId = toast.loading('Submitting your access request...');
    try {
      const authToken = localStorage.getItem('authToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/enrollment/create', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          payerName: payerName.trim(),
          paymentProof: proofPreview,
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingId);

      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      setStep('done');
      toast.success('Access request submitted! Admin will review and approve shortly.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      toast.dismiss(loadingId);
      toast.error(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        className="relative max-w-md w-full rounded-2xl overflow-hidden overflow-y-auto max-h-[92vh]"
        style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2447 50%, #0d1b2a 100%)',
          border: '1px solid rgba(59,130,246,0.35)',
          boxShadow: '0 0 60px rgba(59,130,246,0.25), 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Glow top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold text-lg">
              {step === 'qr' ? 'Complete Payment' : step === 'form' ? 'Request Access' : 'Request Sent!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 px-6 pt-4 pb-2">
          {(['qr', 'form', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-blue-500 text-white shadow-lg'
                  : (step === 'form' && s === 'qr') || step === 'done'
                  ? 'bg-blue-500/40 text-blue-200'
                  : 'bg-white/10 text-white/40'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 rounded ${step === 'done' || (step === 'form' && i === 0) ? 'bg-blue-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-2">

          {/* ── STEP 1: QR CODE ── */}
          {step === 'qr' && (
            <div className="space-y-5">
              {/* Course info */}
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <p className="text-blue-300 text-sm mb-1">{courseName}</p>
                <p className="text-4xl font-black text-white">{coursePrice}</p>
                <p className="text-blue-400 text-xs mt-1">One-time payment · Lifetime access</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold">
                  <Smartphone className="w-4 h-4" />
                  Scan to Pay via UPI
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  {useCustomQR ? (
                    <img
                      src="/qr-payment.JPG"
                      alt="Payment QR Code"
                      width={180}
                      height={180}
                      className="w-[180px] h-[180px] object-contain rounded-lg"
                      onError={() => setUseCustomQR(false)}
                    />
                  ) : (
                    <div className="bg-white p-3 rounded-lg flex flex-col items-center gap-2">
                      <QRCode value={upiString} size={164} />
                      <p className="text-xs font-bold text-gray-700 tracking-wide">
                        Amount: ₹{priceAmount.toLocaleString('en-IN')} pre-filled
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-blue-400 text-xs mb-1">Or pay to UPI ID</p>
                  <p className="text-base font-bold text-blue-200 px-4 py-2 rounded-xl select-all" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    {upiId}
                  </p>
                  <p className="text-blue-400 text-xs mt-1">{merchantName}</p>
                </div>
              </div>

              {/* Instructions */}
              <ol className="text-sm text-blue-200 space-y-2 rounded-xl p-4 list-decimal list-inside" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <li>Open PhonePe, GPay, Paytm, or any UPI app</li>
                <li>Scan the QR — amount is pre-filled automatically</li>
                <li>Confirm and complete the payment</li>
                <li>Take a screenshot of the payment confirmation</li>
              </ol>

              <button
                onClick={() => setStep('form')}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 0 24px rgba(37,99,235,0.5)' }}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-blue-400/70 text-xs text-center">
                After paying, click Continue to upload your payment proof and request access
              </p>
            </div>
          )}

          {/* ── STEP 2: PROOF FORM ── */}
          {step === 'form' && (
            <div className="space-y-4">
              <p className="text-blue-300 text-sm text-center">
                Fill in your details and upload your payment screenshot to request course access.
              </p>

              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1.5">
                  <User className="w-3.5 h-3.5 inline mr-1" />Your Name
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-blue-400/60 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(59,130,246,0.3)' }}
                />
              </div>

              {/* Course field (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 inline mr-1" />Course
                </label>
                <div
                  className="w-full px-4 py-3 rounded-xl text-blue-200 text-sm"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
                >
                  {courseName} — <span className="font-bold text-white">{coursePrice}</span>
                </div>
              </div>

              {/* Payment proof upload */}
              <div>
                <label className="block text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5 inline mr-1" />Payment Screenshot
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {proofPreview ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.4)' }}>
                    <img src={proofPreview} alt="Payment proof" className="w-full max-h-52 object-contain" style={{ background: 'rgba(0,0,0,0.3)' }} />
                    <button
                      onClick={() => { setProofFile(null); setProofPreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="px-3 py-2 text-xs text-blue-300 text-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      ✓ {proofFile?.name}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 rounded-xl flex flex-col items-center gap-2 transition-all hover:opacity-80 active:scale-98 cursor-pointer"
                    style={{ background: 'rgba(59,130,246,0.06)', border: '2px dashed rgba(59,130,246,0.35)' }}
                  >
                    <Upload className="w-8 h-8 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">Click to upload payment screenshot</span>
                    <span className="text-blue-400/60 text-xs">PNG, JPG, JPEG · Max 5MB</span>
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('qr')}
                  className="px-4 py-3 rounded-xl text-blue-300 text-sm font-medium hover:text-white transition-all flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !payerName.trim() || !proofFile}
                  className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: submitting ? 'none' : '0 0 24px rgba(37,99,235,0.4)' }}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                  ) : (
                    <>Request Access from Admin</>
                  )}
                </button>
              </div>

              <p className="text-blue-400/60 text-xs text-center">
                Admin will verify your payment and grant access within 24 hours
              </p>
            </div>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white mb-2">Request Submitted!</p>
                <p className="text-blue-300 text-sm max-w-xs">
                  Your payment proof has been sent to admin. You will receive access to <strong>{courseName}</strong> within 24 hours.
                </p>
              </div>
              <div className="rounded-xl px-4 py-3 text-blue-200 text-sm w-full" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                ⏳ Status: <span className="font-semibold text-yellow-300">Pending Admin Review</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
