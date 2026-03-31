'use client';

import Link from 'next/link';
import { FaLinkedin, FaGithub, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { Globe, BookOpen, Mail, Phone } from 'lucide-react';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/#courses' },
  { name: 'About Us', href: '/AboutUs' },
  { name: 'Contact', href: '/ContactUs' },
];

const courseLinks = [
  { name: 'English Mastery', href: '/EnglishCourse' },
  { name: 'French Mastery', href: '/FrenchCourse' },
  { name: 'Portuguese Mastery', href: '/PortugueseCourse' },
];

const socials = [
  {
    icon: FaLinkedin,
    href: 'https://www.linkedin.com/in/baskaran-vaishnavan-ab764522a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
    label: 'LinkedIn',
    color: '#0a66c2',
    glow: 'rgba(10,102,194,0.6)',
  },
  {
    icon: FaGithub,
    href: 'https://github.com/BCS-VAISH',
    label: 'GitHub',
    color: '#e6edf3',
    glow: 'rgba(230,237,243,0.4)',
  },
  {
    icon: FaTwitter,
    href: 'https://twitter.com/Bcsvaish14',
    label: 'Twitter',
    color: '#1d9bf0',
    glow: 'rgba(29,155,240,0.6)',
  },
  {
    icon: FaWhatsapp,
    href: 'https://wa.me/+94773668707',
    label: 'WhatsApp',
    color: '#25d366',
    glow: 'rgba(37,211,102,0.6)',
  },
  {
    icon: FaInstagram,
    href: 'https://www.instagram.com/bcs_vaish?igsh=MWlucXh3bXg3NWNqeg%3D%3D&utm_source=qr',
    label: 'Instagram',
    color: '#e1306c',
    glow: 'rgba(225,48,108,0.6)',
  },
  {
    icon: MdEmail,
    href: 'mailto:bcsvaish0000@gmail.com',
    label: 'Email',
    color: '#ea4335',
    glow: 'rgba(234,67,53,0.6)',
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #050d1a 0%, #080f22 60%, #050d1a 100%)',
        borderTop: '1px solid rgba(59,130,246,0.2)',
      }}
    >
      {/* Top glow line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #3b82f6, transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', boxShadow: '0 0 20px rgba(37,99,235,0.5)' }}
              >
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">ARZAMA&apos;s</p>
                <p className="text-blue-400 text-xs leading-tight">PolyLingua Global</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Empowering language learners worldwide with expert-led courses in English, French, and Portuguese.
            </p>
            {/* Contact info */}
            <div className="space-y-2">
              <a
                href="mailto:bcsvaish0000@gmail.com"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-blue-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                bcsvaish0000@gmail.com
              </a>
              <a
                href="https://wa.me/+94773668707"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-green-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                +94 773 668 707
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: '#60a5fa' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-blue-500 group-hover:w-3 transition-all duration-200 flex-shrink-0"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2"
              style={{ color: '#34d399' }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Our Courses
            </h4>
            <ul className="space-y-3">
              {courseLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-emerald-500 group-hover:w-3 transition-all duration-200 flex-shrink-0"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: '#a78bfa' }}
            >
              Follow Us
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 group"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${s.color}18`;
                      (e.currentTarget as HTMLElement).style.border = `1px solid ${s.color}60`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${s.glow}`;
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                    <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{s.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }} className="mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>&copy; 2025 ARZAMA&apos;s PolyLingua Global. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/AboutUs" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/ContactUs" className="hover:text-white/60 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
