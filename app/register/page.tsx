'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

/* ---------------- MOTION VARIANTS ---------------- */

const pageFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

const card = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/* ---------------- COMPONENT ---------------- */

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="show"
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      {/* 🌈 ANIMATED GRADIENT BACKGROUND */}
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-[length:400%_400%] bg-gradient-to-br from-blue-800 via-blue-600 to-indigo-700"
      />

      {/* 🔵 FLOATING BLOBS */}
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-3xl"
      />

      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] bg-indigo-500/30 rounded-full blur-3xl"
      />

      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-sky-400/20 rounded-full blur-3xl"
      />

      {/* 🧾 REGISTER CARD */}
      <motion.div
        variants={card}
        initial="hidden"
        animate="show"
        className="relative z-10 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <motion.h1
          variants={item}
          initial="hidden"
          animate="show"
          className="text-3xl font-bold text-center mb-6 text-gray-900"
        >
          Create your account
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.input
            variants={item}
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-blue-600 text-white placeholder-white/70"
          />

          <motion.input
            variants={item}
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-blue-600 text-white placeholder-white/70"
          />

          <motion.input
            variants={item}
            type="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-blue-600 text-white placeholder-white/70"
          />

          <motion.button
            variants={item}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Register'}
          </motion.button>
        </motion.form>

        <motion.p
          variants={item}
          initial="hidden"
          animate="show"
          className="mt-6 text-center text-sm text-gray-700"
        >
          Already have an account?{' '}
          <Link
            href={`/login?redirect=${redirect}`}
            className="text-blue-700 underline"
          >
            Login here
          </Link>
        </motion.p>
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
    </motion.div>
  );
}
