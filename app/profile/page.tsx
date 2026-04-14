'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as THREE from 'three';
import {
  Star, MessageSquare, LogOut,
  BookOpen, PlayCircle, Clock, CheckCircle, XCircle,
  ArrowLeft, TrendingUp, Award, ChevronRight, Globe,
} from 'lucide-react';
import { toast } from '@/components/Toaster';

type ReviewData = {
  id: string; rating: number; comment: string;
  courseId: string; courseName: string; createdAt: string;
};
type CommentData = {
  id: string; content: string;
  courseId: string; courseName: string; createdAt: string;
};
type EnrollmentData = {
  id: string; courseId: string; courseName: string;
  courseLink: string; coursePrice: string; status: string; createdAt: string;
};

const LANG_FLAG: Record<string, string> = {
  english: '🇬🇧', french: '🇫🇷', portuguese: '🇵🇹',
};

function getLangFromId(courseId: string) {
  if (courseId?.includes('english')) return 'english';
  if (courseId?.includes('french')) return 'french';
  if (courseId?.includes('portuguese')) return 'portuguese';
  return '';
}

function getInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : 'U';
}

export default function ProfilePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [user, setUser] = useState<{ id: string; email: string; name?: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'reviews' | 'comments'>('courses');
  const [dataFetched, setDataFetched] = useState<Record<string, boolean>>({});

  // 3D background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const positions: number[] = [];
    for (let i = 0; i < 500; i++) positions.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.5, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
    camera.position.z = 5;
    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.x += 0.0003;
      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };
    animate();
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); renderer.dispose(); };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (user && !dataFetched[activeTab]) fetchTabData(activeTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/auth/me', { headers, credentials: 'include' });
      if (!res.ok) { router.push('/login?redirect=/profile'); return; }
      const data = await res.json();
      if (data.user?.role === 'admin') { router.push('/admin'); return; }
      setUser(data.user);
    } catch { router.push('/login?redirect=/profile'); }
    finally { setLoading(false); }
  };

  const fetchTabData = async (tab: string) => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (tab === 'courses') {
        const r = await fetch('/api/user/enrollments', { headers, credentials: 'include' });
        if (r.ok) { const d = await r.json(); setEnrollments(d.enrollments || []); }
      } else if (tab === 'reviews') {
        const r = await fetch('/api/user/reviews', { headers, credentials: 'include' });
        if (r.ok) { const d = await r.json(); setReviews(d.reviews || []); }
      } else {
        const r = await fetch('/api/user/comments', { headers, credentials: 'include' });
        if (r.ok) { const d = await r.json(); setComments(d.comments || []); }
      }
      setDataFetched(prev => ({ ...prev, [tab]: true }));
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally { setLoadingData(false); }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      toast.success('Logged out successfully');
      router.push('/');
    } catch { toast.error('Logout failed'); }
  };

  const isActive = (status: string) => status === 'PAID' || status === 'ADMIN_GRANTED';

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    PAID: { label: 'Active', color: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    ADMIN_GRANTED: { label: 'Access Granted', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', icon: <Award className="w-3.5 h-3.5" /> },
    PENDING: { label: 'Pending Review', color: '#facc15', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', icon: <Clock className="w-3.5 h-3.5" /> },
    REJECTED: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: <XCircle className="w-3.5 h-3.5" /> },
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#060c1e,#0d1b3e)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-400 border-blue-900 animate-spin mx-auto mb-3" />
        <p className="text-blue-300 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const activeCount = enrollments.filter(e => isActive(e.status)).length;
  const pendingCount = enrollments.filter(e => e.status === 'PENDING').length;

  const STATS = [
    { label: 'Enrolled', value: enrollments.length, icon: BookOpen, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
    { label: 'Active', value: activeCount, icon: TrendingUp, color: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: '#facc15', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)' },
    { label: 'Reviews', value: reviews.length, icon: Star, color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)' },
  ];

  const TABS = [
    { key: 'courses', label: 'My Courses', icon: BookOpen },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'comments', label: 'Comments', icon: MessageSquare },
  ] as const;

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 min-h-screen pb-16 pt-6 px-4" style={{ background: 'rgba(4,8,20,0.55)' }}>
        <div className="max-w-5xl mx-auto">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-all hover:bg-white/8"
              style={{ border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Profile hero */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(13,24,56,0.9)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-black text-white"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
                {getInitials(user.name, user.email)}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-black text-white mb-1">{user.name || 'Learner'}</h1>
                <p className="text-blue-300 text-sm mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-200"
                    style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.35)' }}>
                    🎓 Student
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-purple-200"
                    style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)' }}>
                    <Globe className="w-3 h-3 inline mr-1" />ARZAMA&apos;s PolyLingua
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {STATS.map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className="rounded-xl p-4 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color }} />
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs font-semibold" style={{ color }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs + Content */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,24,56,0.9)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>

            {/* Tab bar */}
            <div className="flex gap-1 p-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={active
                      ? { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', boxShadow: '0 0 16px rgba(37,99,235,0.4)' }
                      : { color: 'rgba(147,197,253,0.7)' }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-5">
              {loadingData ? (
                <div className="flex justify-center items-center py-16">
                  <div className="w-10 h-10 rounded-full border-4 border-t-blue-400 border-blue-900/40 animate-spin" />
                </div>
              ) : (
                <>
                  {/* MY COURSES */}
                  {activeTab === 'courses' && (
                    <div className="space-y-3">
                      {enrollments.length === 0 ? (
                        <div className="text-center py-16">
                          <BookOpen className="w-14 h-14 mx-auto mb-4 text-blue-500/30" />
                          <p className="text-blue-300 text-base font-semibold mb-1">No courses yet</p>
                          <p className="text-blue-400/60 text-sm mb-5">Start your language journey today</p>
                          <Link href="/#courses"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
                            Browse Courses <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ) : (
                        enrollments.map((enr) => {
                          const cfg = STATUS_CONFIG[enr.status] || STATUS_CONFIG['PENDING'];
                          const lang = getLangFromId(enr.courseId);
                          const flag = LANG_FLAG[lang] || '📚';
                          return (
                            <div key={enr.id} className="rounded-xl p-4 transition-all hover:scale-[1.005]"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <span className="text-2xl flex-shrink-0 mt-0.5">{flag}</span>
                                  <div className="min-w-0">
                                    <h3 className="text-base font-bold text-white leading-snug mb-1 truncate">{enr.courseName}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                                        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                        {cfg.icon}{cfg.label}
                                      </span>
                                      <span className="text-blue-400/60 text-xs">
                                        {new Date(enr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                    {enr.status === 'PENDING' && (
                                      <p className="text-yellow-400/80 text-xs mt-1">⏳ Under admin review — access granted within 24 hrs</p>
                                    )}
                                    {enr.status === 'REJECTED' && (
                                      <p className="text-red-400/80 text-xs mt-1">❌ Payment rejected. Please re-enroll or contact support.</p>
                                    )}
                                  </div>
                                </div>
                                <Link href={enr.courseLink}
                                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                                  style={isActive(enr.status)
                                    ? { background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 0 14px rgba(22,163,74,0.35)' }
                                    : { background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
                                  {isActive(enr.status) ? <><PlayCircle className="w-3.5 h-3.5" />Watch</> : <><BookOpen className="w-3.5 h-3.5" />View</>}
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* MY REVIEWS */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-3">
                      {reviews.length === 0 ? (
                        <div className="text-center py-16">
                          <Star className="w-14 h-14 mx-auto mb-4 text-blue-500/30" />
                          <p className="text-blue-300 text-base font-semibold mb-1">No reviews yet</p>
                          <p className="text-blue-400/60 text-sm">Complete a course and share your experience</p>
                        </div>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev.id} className="rounded-xl p-4"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-blue-300">{rev.courseName}</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed mb-2">{rev.comment}</p>
                            <p className="text-blue-400/50 text-xs">{new Date(rev.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* MY COMMENTS */}
                  {activeTab === 'comments' && (
                    <div className="space-y-3">
                      {comments.length === 0 ? (
                        <div className="text-center py-16">
                          <MessageSquare className="w-14 h-14 mx-auto mb-4 text-blue-500/30" />
                          <p className="text-blue-300 text-base font-semibold mb-1">No comments yet</p>
                          <p className="text-blue-400/60 text-sm">Join the discussion in your courses</p>
                        </div>
                      ) : (
                        comments.map((cmt) => (
                          <div key={cmt.id} className="rounded-xl p-4"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <span className="text-sm font-bold text-blue-300 block mb-2">{cmt.courseName}</span>
                            <p className="text-white/80 text-sm leading-relaxed mb-2">{cmt.content}</p>
                            <p className="text-blue-400/50 text-xs">{new Date(cmt.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
