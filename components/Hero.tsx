'use client';

import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="bg-blue-600 text-white py-24 text-center">
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Learn{' '}
          <motion.span
            className="text-white"
            animate={{
              color: ['#ffffff', '#a0c4ff', '#ffffff'],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              repeatType: 'reverse',
            }}
          >
            Languages
          </motion.span>
          .{' '}
          <motion.span
            className="text-blue-200"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Connect the World.
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Your Gateway to Global Communication
        </motion.p>

        <motion.a
          href="#courses"
          className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-100"
          whileHover={{ scale: 1.05 }}
        >
          Start Learning Now
        </motion.a>
      </div>
    </section>
  );
}
