'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

import Footer from '@/components/Footer'; // ✅ correct import

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Login failed');
      }

      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🌌 THREE.JS BACKGROUND
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    for (let i = 0; i < 600; i++) {
      positions.push((Math.random() - 0.5) * 200);
      positions.push((Math.random() - 0.5) * 200);
      positions.push((Math.random() - 0.5) * 200);
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.5,
      transparent: true,
      opacity: 0.7,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.x += 0.0004;
      particles.rotation.y += 0.0004;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* 🌌 BACKGROUND CANVAS */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full" />

      {/* 🧾 CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700/80 to-blue-500/80 p-6">
        
        {/* LOGIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Login
          </h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-900"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-900"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 transition"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-700">
            Don’t have an account?{' '}
            <Link
              href={`/register?redirect=${redirect}`}
              className="text-blue-700 underline"
            >
              Register here
            </Link>
          </p>
        </motion.div>

        {/* 👣 FOOTER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 mt-12 w-full"
        >
          <Footer />
        </motion.div>
      </div>
    </>
  );
}
