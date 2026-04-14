'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id?: string; email?: string; name?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('userData');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('userData', JSON.stringify(data.user));
        } else {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      setUser(null);
      setMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/#courses" },
    { name: "About Us", href: "/AboutUs" },
    { name: "Contact", href: "/ContactUs" },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'linear-gradient(135deg, rgba(10,20,60,0.97) 0%, rgba(15,30,90,0.97) 50%, rgba(10,20,60,0.97) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,179,237,0.2)',
        boxShadow: '0 4px 30px rgba(0,0,80,0.4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Image
              src="/pic.png"
              alt="ARZAMA"
              width={44}
              height={44}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full"
              style={{ boxShadow: '0 0 12px rgba(99,179,237,0.5)' }}
            />
            <span
              className="font-bold text-white hidden sm:block"
              style={{
                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ARZAMA&apos;s PolyLingua Global
            </span>
            <span
              className="font-bold text-white sm:hidden"
              style={{
                fontSize: '0.9rem',
                background: 'linear-gradient(90deg, #93c5fd, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ARZAMA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: 'rgba(219,234,254,0.9)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,179,237,0.15)';
                  (e.currentTarget as HTMLElement).style.color = '#93c5fd';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(219,234,254,0.9)';
                }}
              >
                {link.name}
              </Link>
            ))}

            {!loading && (
              <div className="flex items-center gap-2 ml-3">
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: '#fff',
                        boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(99,102,241,0.7)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(99,102,241,0.4)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: '#fca5a5' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: 'rgba(219,234,254,0.9)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(99,179,237,0.15)';
                        (e.currentTarget as HTMLElement).style.color = '#93c5fd';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(219,234,254,0.9)';
                      }}
                    >
                      <User className="w-4 h-4" />
                      {user.name || user.email?.split('@')[0]}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: '#fca5a5' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: 'rgba(219,234,254,0.9)', border: '1px solid rgba(99,179,237,0.3)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(99,179,237,0.15)';
                        (e.currentTarget as HTMLElement).style.color = '#93c5fd';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(219,234,254,0.9)';
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(37,99,235,0.4)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(37,99,235,0.7)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(37,99,235,0.4)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-all duration-200"
            style={{ color: '#93c5fd' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(10,20,60,0.98) 0%, rgba(15,30,90,0.98) 100%)',
            borderTop: '1px solid rgba(99,179,237,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,80,0.5)',
          }}
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: 'rgba(219,234,254,0.9)' }}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,179,237,0.12)';
                  (e.currentTarget as HTMLElement).style.color = '#93c5fd';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(219,234,254,0.9)';
                }}
              >
                {link.name}
              </Link>
            ))}

            {!loading && (
              <div className="mt-2 pt-2 flex flex-col gap-1" style={{ borderTop: '1px solid rgba(99,179,237,0.15)' }}>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: '#fff',
                        boxShadow: '0 0 16px rgba(99,102,241,0.3)',
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: '#fca5a5' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: 'rgba(219,234,254,0.9)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {user.name || user.email?.split('@')[0]}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: '#fca5a5' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ color: 'rgba(219,234,254,0.9)', border: '1px solid rgba(99,179,237,0.2)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-3 rounded-lg text-sm font-semibold text-center transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(37,99,235,0.3)',
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
