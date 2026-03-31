'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { motion } from 'motion/react';
import { FaLinkedin, FaGithub, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { MapPin, Phone, Clock } from 'lucide-react';

const socials = [
  { icon: FaLinkedin, href: 'https://www.linkedin.com/in/baskaran-vaishnavan-ab764522a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', label: 'LinkedIn', color: '#0a66c2', glow: 'rgba(10,102,194,0.5)' },
  { icon: FaGithub, href: 'https://github.com/BCS-VAISH', label: 'GitHub', color: '#e6edf3', glow: 'rgba(230,237,243,0.3)' },
  { icon: FaTwitter, href: 'https://twitter.com/Bcsvaish14', label: 'Twitter', color: '#1d9bf0', glow: 'rgba(29,155,240,0.5)' },
  { icon: FaWhatsapp, href: 'https://wa.me/+94773668707', label: 'WhatsApp', color: '#25d366', glow: 'rgba(37,211,102,0.5)' },
  { icon: FaInstagram, href: 'https://www.instagram.com/bcs_vaish?igsh=MWlucXh3bXg3NWNqeg%3D%3D&utm_source=qr', label: 'Instagram', color: '#e1306c', glow: 'rgba(225,48,108,0.5)' },
  { icon: MdEmail, href: 'mailto:bcsvaish0000@gmail.com', label: 'Email', color: '#ea4335', glow: 'rgba(234,67,53,0.5)' },
];

const info = [
  { icon: MdEmail, label: 'Email Us', value: 'bcsvaish0000@gmail.com', href: 'mailto:bcsvaish0000@gmail.com' },
  { icon: Phone, label: 'WhatsApp', value: '+94 773 668 707', href: 'https://wa.me/+94773668707' },
  { icon: MapPin, label: 'Based In', value: 'Sri Lanka · Serving Worldwide', href: null },
  { icon: Clock, label: 'Response Time', value: 'Within 24 hours', href: null },
];

export default function ContactPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #050d1a 0%, #080f22 60%, #050d1a 100%)' }}
    >
      {/* Top glow line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #3b82f6, transparent)' }} />

      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-blue-300"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            Get In Touch
          </span>
          <h1
            className="text-4xl sm:text-5xl font-black mb-4"
            style={{
              background: 'linear-gradient(135deg, #93c5fd, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Contact Us
          </h1>
          <p className="text-blue-300 text-lg max-w-xl mx-auto">
            Have a question, query, or need help choosing a course? We're here for you.
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left — info panel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {/* Contact info cards */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <h2 className="text-white font-bold text-lg mb-5">Contact Information</h2>
              <div className="space-y-4">
                {info.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
                    >
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('mailto') ? undefined : '_blank'}
                          rel="noopener noreferrer"
                          className="text-white text-sm hover:text-blue-300 transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-white text-sm">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <h2 className="text-white font-bold text-lg mb-5">Follow Us</h2>
              <div className="grid grid-cols-3 gap-3">
                {socials.map(({ icon: Icon, href, label, color, glow }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = `${color}18`;
                      el.style.border = `1px solid ${color}55`;
                      el.style.boxShadow = `0 0 14px ${glow}`;
                      el.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'rgba(255,255,255,0.04)';
                      el.style.border = '1px solid rgba(255,255,255,0.07)';
                      el.style.boxShadow = 'none';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                    <span className="text-[10px] text-white/40">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 40px rgba(59,130,246,0.08)' }}
            >
              {/* Form header */}
              <div
                className="px-7 py-5 border-b"
                style={{ borderColor: 'rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.06)' }}
              >
                <h2 className="text-white font-bold text-xl">Send a Message</h2>
                <p className="text-blue-400 text-sm mt-0.5">Fill in the form and we'll respond within 24 hours</p>
              </div>

              <div className="px-7 py-7">
                <ContactForm />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
