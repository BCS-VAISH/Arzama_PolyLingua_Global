'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, CheckCircle, KeyRound, User, RefreshCw, ShieldCheck } from 'lucide-react';
import * as THREE from 'three';
import { toast } from '@/components/Toaster';

type Step = 'email' | 'otp' | 'password';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f97316' };
  if (score <= 3) return { score, label: 'Good', color: '#eab308' };
  return { score, label: 'Strong', color: '#22c55e' };
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<Step>('email');

  // Step 1 – Email
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Step 2 – OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3 – Password
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [registering, setRegistering] = useState(false);

  const strength = getPasswordStrength(password);

  // 3D background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const positions: number[] = [];
    for (let i = 0; i < 500; i++) positions.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.5, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
    camera.position.z = 5;
    const animate = () => { requestAnimationFrame(animate); particles.rotation.x += 0.0004; particles.rotation.y += 0.0004; renderer.render(scene, camera); };
    animate();
    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); renderer.dispose(); };
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── STEP 1: Send OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setEmailError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setEmailError('Please enter a valid email address.'); return; }

    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('otp');
      setCountdown(60);
      toast.success(`OTP sent to ${trimmed}`);
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setEmailError((err instanceof Error ? err.message : null) || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setOtpError('');
    setOtp('');
    setResending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      setCountdown(60);
      toast.success('New OTP sent!');
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setOtpError((err instanceof Error ? err.message : null) || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  // OTP input box handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digits = value.slice(-1);
    const newOtp = otp.split('');
    newOtp[index] = digits;
    const joined = newOtp.join('').slice(0, 6);
    setOtp(joined.padEnd(6, ' ').trimEnd());
    if (digits && index < 5) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted);
      otpInputs.current[5]?.focus();
      e.preventDefault();
    }
  };

  // ── STEP 2: Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const trimmedOtp = otp.replace(/\s/g, '');
    if (trimmedOtp.length !== 6) { setOtpError('Please enter all 6 digits.'); return; }

    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: trimmedOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setVerifiedToken(data.verifiedToken);
      setStep('password');
      toast.success('Email verified!');
    } catch (err: unknown) {
      setOtpError((err instanceof Error ? err.message : null) || 'Verification failed. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── STEP 3: Register ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (name.trim().length > 0 && name.trim().length < 2) { setPasswordError('Name must be at least 2 characters.'); return; }
    if (name.trim().length > 50) { setPasswordError('Name must be less than 50 characters.'); return; }
    if (!password) { setPasswordError('Password is required.'); return; }
    if (password.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(password)) { setPasswordError('Password must contain at least one uppercase letter.'); return; }
    if (!/[0-9]/.test(password)) { setPasswordError('Password must contain at least one number.'); return; }
    if (password !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }

    setRegistering(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim() || undefined,
          verifiedToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);
      toast.success('Account created successfully!');
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setPasswordError((err instanceof Error ? err.message : null) || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' };
  const focusStyle = { outline: 'none', boxShadow: '0 0 0 2px rgba(59,130,246,0.5)', border: '1px solid rgba(59,130,246,0.6)' };

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4" style={{ background: 'rgba(5,10,25,0.6)' }}>
        <div className="w-full max-w-md">

          {/* Back */}
          <div className="mb-4">
            <button
              onClick={() => step === 'email' ? router.back() : step === 'otp' ? setStep('email') : setStep('otp')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-all"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 'email' ? 'Back' : 'Change email'}
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,18,40,0.97)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>

            {/* Tab toggle */}
            <div className="p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Link href={`/login?redirect=${redirect}`} className="flex-1 py-3 text-center text-sm font-semibold text-white/50 hover:text-white/80 transition-colors">
                  Login
                </Link>
                <div className="flex-1 py-3 text-center text-sm font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 16px rgba(37,99,235,0.4)' }}>
                  Sign up
                </div>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 px-6 pt-5 pb-1">
              {(['email', 'otp', 'password'] as Step[]).map((s, i) => {
                const done = (step === 'otp' && s === 'email') || (step === 'password' && (s === 'email' || s === 'otp'));
                const active = step === s;
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      done ? 'bg-green-500 text-white' : active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-white/10 text-white/30'
                    }`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block transition-all ${active ? 'text-white' : done ? 'text-green-400' : 'text-white/25'}`}>
                      {s === 'email' ? 'Email' : s === 'otp' ? 'Verify' : 'Password'}
                    </span>
                    {i < 2 && <div className={`flex-1 h-0.5 rounded ${done ? 'bg-green-500/60' : 'bg-white/10'}`} />}
                  </div>
                );
              })}
            </div>

            <div className="px-6 pb-8 pt-4 space-y-4">

              {/* ── STEP 1: EMAIL ── */}
              {step === 'email' && (
                <>
                  <div className="text-center pb-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 24px rgba(37,99,235,0.4)' }}>
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-xl">Create your account</h2>
                    <p className="text-blue-300/70 text-sm mt-1">We&apos;ll send a 6-digit code to verify your email</p>
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => router.push(`/api/auth/google?redirect=${encodeURIComponent(redirect)}`)}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg,#c0392b,#9b2226)' }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <span className="text-white/40 text-xs font-semibold tracking-widest">OR</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 text-sm transition-all"
                        style={emailError ? { ...inputStyle, border: '1px solid rgba(239,68,68,0.6)' } : inputStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        autoComplete="email"
                      />
                      {emailError && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{emailError}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={sendingOtp}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: sendingOtp ? 'none' : '0 0 24px rgba(37,99,235,0.4)' }}
                    >
                      {sendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Sending OTP...</> : <><Mail className="w-4 h-4" />Send Verification Code</>}
                    </button>
                  </form>

                  <p className="text-center text-xs text-white/40">
                    Already have an account?{' '}
                    <Link href={`/login?redirect=${redirect}`} className="text-blue-400 hover:text-blue-300 transition-colors">Login here</Link>
                  </p>
                </>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === 'otp' && (
                <>
                  <div className="text-center pb-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
                      <KeyRound className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-xl">Verify your email</h2>
                    <p className="text-blue-300/70 text-sm mt-1">Enter the 6-digit code sent to</p>
                    <p className="text-blue-300 font-semibold text-sm">{email.trim().toLowerCase()}</p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* OTP boxes */}
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <input
                          key={i}
                          ref={el => { otpInputs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[i] && otp[i] !== ' ' ? otp[i] : ''}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-12 h-14 text-center text-xl font-bold text-white rounded-xl transition-all"
                          style={{
                            background: otp[i] && otp[i] !== ' ' ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.07)',
                            border: otpError ? '1.5px solid rgba(239,68,68,0.6)' : otp[i] && otp[i] !== ' ' ? '1.5px solid rgba(59,130,246,0.7)' : '1.5px solid rgba(255,255,255,0.12)',
                            outline: 'none',
                          }}
                          onFocus={e => { e.currentTarget.style.border = '1.5px solid rgba(99,102,241,0.9)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.25)'; }}
                          onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.border = otp[i] && otp[i] !== ' ' ? '1.5px solid rgba(59,130,246,0.7)' : '1.5px solid rgba(255,255,255,0.12)'; }}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-red-400 text-xs text-center flex items-center justify-center gap-1"><span>⚠</span>{otpError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={verifyingOtp || otp.replace(/\s/g, '').length !== 6}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: verifyingOtp ? 'none' : '0 0 24px rgba(99,102,241,0.4)' }}
                    >
                      {verifyingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : <><ShieldCheck className="w-4 h-4" />Verify Code</>}
                    </button>
                  </form>

                  {/* Resend */}
                  <div className="text-center">
                    <p className="text-white/40 text-xs mb-2">Didn&apos;t receive the code?</p>
                    <button
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || resending}
                      className="flex items-center gap-1.5 mx-auto text-sm font-semibold transition-all disabled:opacity-40"
                      style={{ color: countdown > 0 ? 'rgba(147,197,253,0.4)' : '#60a5fa' }}
                    >
                      {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 3: PASSWORD ── */}
              {step === 'password' && (
                <>
                  <div className="text-center pb-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 0 24px rgba(22,163,74,0.4)' }}>
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-xl">Set your password</h2>
                    <p className="text-green-400/80 text-sm mt-1 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Email verified: <span className="text-green-300 font-semibold">{email.trim().toLowerCase()}</span>
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    {/* Name */}
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        placeholder="Full Name (optional)"
                        value={name}
                        onChange={e => { setName(e.target.value); setPasswordError(''); }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-white/30 text-sm transition-all"
                        style={inputStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        maxLength={50}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password (min 8 chars)"
                          value={password}
                          onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                          className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-white/30 text-sm transition-all"
                          style={inputStyle}
                          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                          autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {password.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1,2,3,4].map(n => (
                              <div key={n} className="flex-1 h-1 rounded-full transition-all"
                                style={{ background: n <= strength.score ? strength.color : 'rgba(255,255,255,0.1)' }} />
                            ))}
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/40">Must have: 8+ chars, 1 uppercase, 1 number</span>
                            <span className="font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                        className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-white/30 text-sm transition-all"
                        style={confirmPassword && confirmPassword !== password
                          ? { ...inputStyle, border: '1px solid rgba(239,68,68,0.6)' }
                          : confirmPassword && confirmPassword === password
                          ? { ...inputStyle, border: '1px solid rgba(34,197,94,0.6)' }
                          : inputStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {confirmPassword && (
                        <span className="absolute right-10 top-1/2 -translate-y-1/2">
                          {confirmPassword === password
                            ? <CheckCircle className="w-4 h-4 text-green-400" />
                            : <span className="text-red-400 text-xs">✗</span>}
                        </span>
                      )}
                    </div>

                    {passwordError && (
                      <p className="text-red-400 text-xs flex items-center gap-1"><span>⚠</span>{passwordError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={registering}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: registering ? 'none' : '0 0 24px rgba(22,163,74,0.4)' }}
                    >
                      {registering ? <><Loader2 className="w-4 h-4 animate-spin" />Creating Account...</> : 'Create Account'}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
