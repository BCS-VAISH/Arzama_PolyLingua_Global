'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Info, ArrowLeft } from 'lucide-react';
import * as THREE from 'three';
import { toast } from '@/components/Toaster';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Login failed');
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);
      toast.success('Welcome back!');
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4" style={{ background: 'rgba(5,10,25,0.6)' }}>
        <div className="w-full max-w-md">

          {/* Back button */}
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-all"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,18,40,0.97)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>

            {/* Tab toggle */}
            <div className="p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="flex-1 py-3 text-center text-sm font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#e05a1a,#c2440e)' }}>
                  Login
                </div>
                <Link href={`/register?redirect=${redirect}`} className="flex-1 py-3 text-center text-sm font-semibold text-white/50 hover:text-white/80 transition-colors">
                  Sign up
                </Link>
              </div>
            </div>

            <div className="px-6 pb-8 pt-5 space-y-4">

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl text-red-300 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />{error}
                </div>
              )}

              {/* Social buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => router.push(`/api/auth/google?redirect=${encodeURIComponent(redirect)}`)}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#c0392b,#9b2226)' }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <span className="text-white/40 text-xs font-semibold tracking-widest">OR</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Important note */}
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(120,60,0,0.35)', border: '1px solid rgba(234,179,8,0.3)' }}>
                <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 text-sm font-semibold mb-1">Important Note:</p>
                  <ul className="space-y-1">
                    <li className="text-yellow-300 text-xs flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-yellow-400 flex-shrink-0" />Email should always be in lowercase</li>
                    <li className="text-yellow-300 text-xs flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-yellow-400 flex-shrink-0" />Password is case sensitive</li>
                  </ul>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                </button>
              </form>

              {/* Forgot password */}
              <p className="text-center text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                Forgot your password?
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
