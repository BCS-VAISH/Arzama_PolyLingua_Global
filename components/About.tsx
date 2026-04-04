'use client';

import { motion } from 'motion/react';

const features = [
  { emoji: '🌐', text: 'Multilingual Community', bg: 'bg-gradient-to-br from-blue-100 to-blue-300' },
  { emoji: '🗣️', text: 'Real-life Communication Focus', bg: 'bg-gradient-to-br from-blue-100 to-cyan-200' },
  { emoji: '🎧', text: 'Audio + Video Practice', bg: 'bg-gradient-to-br from-blue-50 to-blue-200' },
  { emoji: '📅', text: 'Flexible Learning Anytime', bg: 'bg-gradient-to-br from-sky-100 to-blue-200' },
];

export default function About() {
  return (
    <section
      id="about"
      className="py-16 px-6 sm:px-8 lg:px-20 bg-gradient-to-b from-white to-blue-50"
    >
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold mb-6 text-blue-700"
        >
          About ARZAMA's PolyLingua Global
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg"
        >
          We connect people across cultures through immersive, practical language education
          designed for real-world communication.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className={`${feature.bg} p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300`}
            >
              <div className="text-4xl mb-3">{feature.emoji}</div>
              <div className="font-semibold text-blue-800 text-lg">{feature.text}</div>
            </motion.div>
          ))}
        </div>

        <motion.a
          href="/AboutUs"
          className="mt-12 inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition duration-300"
          whileHover={{ scale: 1.05 }}
        >
          Meet Our Founder ➤
        </motion.a>
      </div>
    </section>
  );
}
