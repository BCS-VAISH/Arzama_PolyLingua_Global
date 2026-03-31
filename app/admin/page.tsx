'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, MessageSquare, Star, Trash2, LogOut, Loader2, BookOpen,
  BarChart3, TrendingUp, ShieldCheck, CheckCircle, XCircle,
  Home, DollarSign, Activity, IndianRupee, X,
} from 'lucide-react';
import { toast } from '@/components/Toaster';

type User = { id: string; email: string; name?: string; role: string; createdAt: string; };
type Review = { id: string; rating: number; comment: string; userName: string; userEmail: string; courseId: string; courseName: string; createdAt: string; };
type Comment = { id: string; content: string; userName: string; userEmail: string; courseId: string; courseName: string; createdAt: string; };
type Course = { id: string; title: string; description: string; price: number; discount: number; category: string; thumbnail?: string; level: string; createdAt: string; };
type Enrollment = { id: string; userId: string; userName: string; userEmail: string; courseId: string; courseName: string; status: string; createdAt: string; };
type Stats = { totalUsers: number; totalCourses: number; totalReviews: number; totalComments: number; averageRating: number; totalRevenue: number; };
type PriceModal = { courseId: string; courseName: string; price: number; discount: number; };

const COURSES = ['english', 'french', 'portuguese'];
const COURSE_NAMES: Record<string, string> = {
  english: 'English Mastery',
  french: 'French Mastery',
  portuguese: 'Portuguese Mastery',
};

const TAB_CONFIG = [
  { key: 'dashboard',   label: 'Dashboard',   icon: BarChart3,    gradient: 'from-violet-500 to-purple-600',   glow: 'rgba(139,92,246,0.5)',  bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  text: 'text-violet-300' },
  { key: 'courses',     label: 'Courses',      icon: BookOpen,     gradient: 'from-blue-500 to-cyan-500',       glow: 'rgba(59,130,246,0.5)',   bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-300' },
  { key: 'users',       label: 'Users',        icon: Users,        gradient: 'from-cyan-500 to-teal-500',       glow: 'rgba(6,182,212,0.5)',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    text: 'text-cyan-300' },
  { key: 'enrollments', label: 'Enrollments',  icon: ShieldCheck,  gradient: 'from-emerald-500 to-green-500',   glow: 'rgba(16,185,129,0.5)',   bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  { key: 'reviews',     label: 'Reviews',      icon: Star,         gradient: 'from-amber-500 to-orange-500',    glow: 'rgba(245,158,11,0.5)',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-300' },
  { key: 'comments',    label: 'Comments',     icon: MessageSquare,gradient: 'from-pink-500 to-rose-500',       glow: 'rgba(236,72,153,0.5)',   bg: 'bg-pink-500/10',    border: 'border-pink-500/30',    text: 'text-pink-300' },
] as const;

type TabKey = typeof TAB_CONFIG[number]['key'];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grantModal, setGrantModal] = useState<{ userId: string; userName: string } | null>(null);
  const [grantCourseId, setGrantCourseId] = useState('english');
  const [granting, setGranting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Price edit modal
  const [priceModal, setPriceModal] = useState<PriceModal | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => {
    if (user && user.role === 'admin') {
      if (activeTab === 'dashboard') fetchStats();
      else fetchData();
    }
  }, [user, activeTab]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) { router.push('/admin/login'); return; }
      const data = await response.json();
      if (data.user.role !== 'admin') { router.push('/'); return; }
      setUser(data.user);
    } catch { router.push('/admin/login'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    setLoadingData(true); setError(null);
    try {
      const r = await fetch('/api/admin/stats');
      if (!r.ok) throw new Error('Failed to fetch stats');
      const data = await r.json();
      setStats(data.stats);
    } catch { setError('Failed to load statistics'); }
    finally { setLoadingData(false); }
  };

  const fetchData = async () => {
    setLoadingData(true); setError(null);
    try {
      if (activeTab === 'courses') {
        const r = await fetch('/api/courses'); const d = await r.json();
        const dbCourses: any[] = d.courses || [];
        const merged = COURSES.map(slug => {
          const found = dbCourses.find((c: any) => c.courseId === slug);
          return {
            id: slug,
            courseId: slug,
            title: found?.title || COURSE_NAMES[slug],
            description: '',
            price: found?.price ?? 0,
            discount: found?.discount ?? 0,
            category: 'Language',
            thumbnail: undefined,
            level: 'beginner',
            createdAt: new Date().toISOString(),
          };
        });
        setCourses(merged);
      } else if (activeTab === 'users') {
        const r = await fetch('/api/admin/users'); const d = await r.json(); setUsers(d.users);
      } else if (activeTab === 'reviews') {
        const r = await fetch('/api/admin/reviews'); const d = await r.json(); setReviews(d.reviews);
      } else if (activeTab === 'comments') {
        const r = await fetch('/api/admin/comments'); const d = await r.json(); setComments(d.comments);
      } else if (activeTab === 'enrollments') {
        const r = await fetch('/api/admin/enrollments'); const d = await r.json(); setEnrollments(d.enrollments);
      }
    } catch { setError('Failed to load data. Please try again.'); }
    finally { setLoadingData(false); }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This will also remove their enrollments, reviews, and comments.`)) return;
    const id = toast.loading('Deleting user...');
    try {
      const r = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const d = await r.json(); toast.dismiss(id);
      if (!r.ok) throw new Error(d.error);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (err: any) { toast.dismiss(id); toast.error(err.message || 'Failed to delete user'); }
  };

  const handleGrantAccess = async () => {
    if (!grantModal) return;
    setGranting(true);
    const id = toast.loading('Granting access...');
    try {
      const r = await fetch('/api/admin/enrollments', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: grantModal.userId, courseId: grantCourseId }),
      });
      const d = await r.json(); toast.dismiss(id);
      if (!r.ok) throw new Error(d.error);
      toast.success(`Access granted to ${grantModal.userName} for ${COURSE_NAMES[grantCourseId]}`);
      setGrantModal(null);
      if (activeTab === 'enrollments') fetchData();
    } catch (err: any) { toast.dismiss(id); toast.error(err.message || 'Failed to grant access'); }
    finally { setGranting(false); }
  };

  const handleUpdateEnrollment = async (enrollmentId: string, status: string) => {
    const id = toast.loading('Updating enrollment...');
    try {
      const r = await fetch('/api/admin/enrollments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, status }),
      });
      const d = await r.json(); toast.dismiss(id);
      if (!r.ok) throw new Error(d.error);
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status } : e));
      toast.success(`Enrollment ${status === 'PAID' ? 'approved' : status === 'REJECTED' ? 'rejected' : 'updated'}`);
      // Refresh stats revenue if on dashboard
      if (activeTab === 'dashboard') fetchStats();
    } catch (err: any) { toast.dismiss(id); toast.error(err.message || 'Failed to update enrollment'); }
  };

  const openPriceModal = (course: Course) => {
    setPriceModal({ courseId: course.id, courseName: course.title, price: course.price, discount: course.discount });
    setNewPrice(String(course.price));
    setNewDiscount(String(course.discount));
  };

  const handleSavePrice = async () => {
    if (!priceModal) return;
    const price = Number(newPrice);
    const discount = Number(newDiscount);
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price'); return; }
    if (isNaN(discount) || discount < 0 || discount > 100) { toast.error('Discount must be 0–100'); return; }
    setSavingPrice(true);
    const id = toast.loading('Updating price...');
    try {
      const r = await fetch(`/api/admin/courses/${priceModal.courseId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, discount }),
      });
      const d = await r.json(); toast.dismiss(id);
      if (!r.ok) throw new Error(d.error);
      setCourses(prev => prev.map(c => c.id === priceModal.courseId ? { ...c, price, discount } : c));
      toast.success(`Price updated for ${priceModal.courseName}`);
      setPriceModal(null);
    } catch (err: any) { toast.dismiss(id); toast.error(err.message || 'Failed to update price'); }
    finally { setSavingPrice(false); }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    const id = toast.loading('Deleting review...');
    try {
      const r = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed to delete review');
      toast.dismiss(id);
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success('Review deleted');
    } catch (err: any) { toast.dismiss(id); toast.error(err.message || 'Failed to delete review'); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    const id = toast.loading('Deleting comment...');
    try {
      const r = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed to delete comment');
      toast.dismiss(id);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err: any) { toast.dismiss(id); toast.error(err.message || 'Failed to delete comment'); }
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); } catch {}
  };

  const activeTabConfig = TAB_CONFIG.find(t => t.key === activeTab)!;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      ADMIN_GRANTED: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      PENDING: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      REJECTED: 'bg-red-500/20 text-red-300 border border-red-500/40',
    };
    return map[status] || 'bg-gray-500/20 text-gray-300 border border-gray-500/40';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0a0b1e,#0d1117)' }}>
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/30" />
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
        </div>
        <p className="text-white/60 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Users',    value: stats?.totalUsers ?? '—',                         icon: Users,         gradient: 'from-violet-500 to-purple-700', shadow: '0 0 30px rgba(139,92,246,0.4)' },
    { label: 'Total Courses',  value: stats?.totalCourses ?? '—',                        icon: BookOpen,      gradient: 'from-blue-500 to-cyan-600',      shadow: '0 0 30px rgba(59,130,246,0.4)' },
    { label: 'Total Reviews',  value: stats?.totalReviews ?? '—',                        icon: Star,          gradient: 'from-amber-500 to-orange-600',   shadow: '0 0 30px rgba(245,158,11,0.4)' },
    { label: 'Avg Rating',     value: stats ? `${stats.averageRating}★` : '—',           icon: TrendingUp,    gradient: 'from-emerald-500 to-teal-600',   shadow: '0 0 30px rgba(16,185,129,0.4)' },
    { label: 'Total Comments', value: stats?.totalComments ?? '—',                       icon: MessageSquare, gradient: 'from-pink-500 to-rose-600',      shadow: '0 0 30px rgba(236,72,153,0.4)' },
    { label: 'Revenue',        value: stats ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '—', icon: IndianRupee, gradient: 'from-lime-500 to-green-600', shadow: '0 0 30px rgba(132,204,22,0.4)' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#0a0b1e 0%,#0d1117 60%,#0a0b1e 100%)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="dashboard-orb orb-1" /><div className="dashboard-orb orb-2" />
        <div className="dashboard-orb orb-3" /><div className="dashboard-orb orb-4" />
      </div>

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative z-10 flex-shrink-0 flex flex-col h-screen sticky top-0"
        style={{ background: 'rgba(10,11,30,0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}>
            <Activity className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                <p className="text-white font-bold text-sm">PolyLingua</p>
                <p className="text-white/40 text-xs">Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive ? `${tab.bg} ${tab.border} border` : 'hover:bg-white/5 border border-transparent'}`}
                style={isActive ? { boxShadow: `0 0 20px ${tab.glow}` } : {}}>
                {isActive && <motion.div layoutId="activePill" className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-10 rounded-xl`} />}
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? `bg-gradient-to-br ${tab.gradient} shadow-lg` : 'bg-white/5 group-hover:bg-white/10'}`}
                  style={isActive ? { boxShadow: `0 0 12px ${tab.glow}` } : {}}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} />
                </div>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                      className={`relative text-sm font-medium ${isActive ? tab.text : 'text-white/50 group-hover:text-white/80'}`}>
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-white/5 space-y-1">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 border border-transparent transition-all group">
            <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center flex-shrink-0 transition-all">
              <Home className="w-4 h-4 text-white/50 group-hover:text-white/80" />
            </div>
            <AnimatePresence>{sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-white/50 group-hover:text-white/80">Home</motion.span>}</AnimatePresence>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 transition-all">
              <LogOut className="w-4 h-4 text-white/50 group-hover:text-red-400" />
            </div>
            <AnimatePresence>{sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-white/50 group-hover:text-red-400">Logout</motion.span>}</AnimatePresence>
          </button>
        </div>

        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-violet-600 border border-violet-400 flex items-center justify-center shadow-lg hover:bg-violet-500 transition-colors z-20"
          style={{ boxShadow: '0 0 12px rgba(139,92,246,0.6)' }}>
          <span className="text-white text-xs">{sidebarOpen ? '‹' : '›'}</span>
        </button>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative z-10 min-h-screen overflow-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
          style={{ background: 'rgba(10,11,30,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className={`text-xl font-bold bg-gradient-to-r ${activeTabConfig.gradient} bg-clip-text text-transparent`}>{activeTabConfig.label}</h1>
            <p className="text-white/40 text-xs mt-0.5">Welcome back, {user?.name || user?.email}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">Admin</div>
        </div>

        <div className="p-6">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</motion.div>
          )}

          {loadingData ? (
            <div className="flex justify-center items-center py-24">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin border-r-transparent border-b-transparent border-l-transparent" />
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>

                {/* ── DASHBOARD ── */}
                {activeTab === 'dashboard' && stats && (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {statCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="relative overflow-hidden rounded-2xl p-6 cursor-default"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: card.shadow }}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 rounded-2xl`} />
                            <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-20 blur-xl`} />
                            <div className="relative flex items-start justify-between">
                              <div>
                                <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-2">{card.label}</p>
                                <p className="text-3xl font-black text-white">{card.value}</p>
                              </div>
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: card.shadow }}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TAB_CONFIG.filter(t => t.key !== 'dashboard').map((tab, i) => {
                        const Icon = tab.icon;
                        return (
                          <motion.button key={tab.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${tab.bg} ${tab.border} border rounded-xl p-4 text-left flex items-center gap-3`}>
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tab.gradient} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className={`text-sm font-semibold ${tab.text}`}>Manage {tab.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── COURSES — Price edit only ── */}
                {activeTab === 'courses' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-white">Course Pricing</h2>
                        <p className="text-white/40 text-xs mt-0.5">Click "Edit Price" to update a course's price. Changes reflect immediately on course pages.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course, index) => {
                        const finalPrice = course.discount > 0
                          ? Math.round(course.price * (1 - course.discount / 100))
                          : course.price;
                        return (
                          <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -4 }} className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {course.thumbnail && (
                              <div className="relative h-36 overflow-hidden">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              </div>
                            )}
                            <div className="p-4">
                              <h3 className="font-bold text-white mb-1">{course.title}</h3>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg border border-blue-500/30">{course.category}</span>
                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg border border-purple-500/30">{course.level}</span>
                              </div>

                              {/* Price display */}
                              <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white/40 text-xs mb-0.5">Current Price</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-2xl font-black text-cyan-400">₹{finalPrice.toLocaleString('en-IN')}</span>
                                      {course.discount > 0 && (
                                        <span className="text-sm text-white/30 line-through">₹{course.price.toLocaleString('en-IN')}</span>
                                      )}
                                    </div>
                                  </div>
                                  {course.discount > 0 && (
                                    <span className="px-2 py-1 rounded-lg text-xs font-bold text-green-300" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                                      {course.discount}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => openPriceModal(course)}
                                className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 16px rgba(37,99,235,0.3)' }}
                              >
                                <IndianRupee className="w-4 h-4" />Edit Price
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── USERS ── */}
                {activeTab === 'users' && (
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="px-5 py-4 border-b border-white/5">
                      <h2 className="text-white font-semibold">All Users <span className="text-white/40 text-sm font-normal ml-2">{users.length} total</span></h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            {['Name','Email','Role','Joined','Actions'].map(h => (
                              <th key={h} className="text-left px-5 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, i) => (
                            <motion.tr key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3 font-medium text-white">{u.name || '—'}</td>
                              <td className="px-5 py-3 text-white/50">{u.email}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>{u.role}</span>
                              </td>
                              <td className="px-5 py-3 text-white/40">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="px-5 py-3">
                                {u.role !== 'admin' && (
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => { setGrantModal({ userId: u.id, userName: u.name || u.email }); setGrantCourseId('english'); }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all">
                                      <ShieldCheck className="w-3 h-3" />Grant
                                    </button>
                                    <button onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── ENROLLMENTS ── */}
                {activeTab === 'enrollments' && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                      <h2 className="text-white font-semibold text-lg">Enrollment Management</h2>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'PENDING = awaiting approval', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                          { label: 'PAID = approved', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                          { label: 'ADMIN_GRANTED = manual', style: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                        ].map(b => <span key={b.label} className={`px-2 py-1 rounded-lg text-xs border ${b.style}`}>{b.label}</span>)}
                      </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/5">
                              {['User','Course','Status','Date','Actions'].map(h => (
                                <th key={h} className="text-left px-5 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {enrollments.length === 0 ? (
                              <tr><td colSpan={5} className="px-5 py-12 text-center text-white/30">No enrollments yet</td></tr>
                            ) : enrollments.map((e, i) => (
                              <motion.tr key={e.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-3">
                                  <div className="font-medium text-white">{e.userName}</div>
                                  <div className="text-white/40 text-xs">{e.userEmail}</div>
                                </td>
                                <td className="px-5 py-3 text-white/70">{e.courseName}</td>
                                <td className="px-5 py-3">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusBadge(e.status)}`}>{e.status}</span>
                                </td>
                                <td className="px-5 py-3 text-white/40">{new Date(e.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    {e.status === 'PENDING' && (
                                      <>
                                        <button onClick={() => handleUpdateEnrollment(e.id, 'PAID')}
                                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all">
                                          <CheckCircle className="w-3 h-3" />Approve
                                        </button>
                                        <button onClick={() => handleUpdateEnrollment(e.id, 'REJECTED')}
                                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                                          <XCircle className="w-3 h-3" />Reject
                                        </button>
                                      </>
                                    )}
                                    {(e.status === 'PAID' || e.status === 'ADMIN_GRANTED') && (
                                      <button onClick={() => handleUpdateEnrollment(e.id, 'REJECTED')}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                                        <XCircle className="w-3 h-3" />Revoke
                                      </button>
                                    )}
                                    {e.status === 'REJECTED' && (
                                      <button onClick={() => handleUpdateEnrollment(e.id, 'ADMIN_GRANTED')}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                                        <ShieldCheck className="w-3 h-3" />Grant
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── REVIEWS ── */}
                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    {reviews.length === 0 && <div className="text-center py-16 text-white/30">No reviews yet.</div>}
                    {reviews.map((review, i) => (
                      <motion.div key={review.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="rounded-2xl p-5 flex justify-between items-start gap-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />)}</div>
                            <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">{review.courseName}</span>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{review.comment}</p>
                          <div className="text-xs text-white/40"><span className="font-semibold text-white/60">{review.userName}</span> · {review.userEmail} · {new Date(review.createdAt).toLocaleString()}</div>
                        </div>
                        <button onClick={() => handleDeleteReview(review.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* ── COMMENTS ── */}
                {activeTab === 'comments' && (
                  <div className="space-y-3">
                    {comments.length === 0 && <div className="text-center py-16 text-white/30">No comments yet.</div>}
                    {comments.map((comment, i) => (
                      <motion.div key={comment.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="rounded-2xl p-5 flex justify-between items-start gap-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex-1">
                          <span className="text-xs px-2 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-2 inline-block">{comment.courseName}</span>
                          <p className="text-white/70 text-sm mb-2">{comment.content}</p>
                          <div className="text-xs text-white/40"><span className="font-semibold text-white/60">{comment.userName}</span> · {comment.userEmail} · {new Date(comment.createdAt).toLocaleString()}</div>
                        </div>
                        <button onClick={() => handleDeleteComment(comment.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── PRICE EDIT MODAL ── */}
      {priceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-sm w-full rounded-2xl overflow-hidden"
            style={{ background: 'rgba(13,20,50,0.98)', border: '1px solid rgba(59,130,246,0.4)', boxShadow: '0 0 40px rgba(59,130,246,0.25)' }}>
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-bold text-lg">Edit Price</h3>
                <button onClick={() => setPriceModal(null)} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-blue-300 text-sm mb-5">{priceModal.courseName}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Original Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm">₹</span>
                    <input
                      type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                      min="0" step="1" placeholder="e.g. 3599"
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(59,130,246,0.3)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Discount (%)</label>
                  <input
                    type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)}
                    min="0" max="100" step="1" placeholder="0 = no discount"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(59,130,246,0.3)' }}
                  />
                </div>

                {/* Live preview */}
                {newPrice && (
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                    <p className="text-white/50 text-xs mb-1">Students will see</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl font-black text-cyan-400">
                        ₹{Number(newDiscount) > 0
                          ? Math.round(Number(newPrice) * (1 - Number(newDiscount) / 100)).toLocaleString('en-IN')
                          : Number(newPrice).toLocaleString('en-IN')}
                      </span>
                      {Number(newDiscount) > 0 && (
                        <span className="text-white/40 line-through text-sm">₹{Number(newPrice).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setPriceModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-white/60 hover:text-white text-sm transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                  <button onClick={handleSavePrice} disabled={savingPrice}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
                    {savingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
                    Save Price
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── GRANT ACCESS MODAL ── */}
      {grantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-sm w-full rounded-2xl p-6"
            style={{ background: 'rgba(15,16,40,0.95)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
            <h3 className="text-lg font-bold text-white mb-1">Grant Course Access</h3>
            <p className="text-white/50 text-sm mb-5">Granting access to <strong className="text-violet-300">{grantModal.userName}</strong></p>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Select Course</label>
            <select value={grantCourseId} onChange={e => setGrantCourseId(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-white text-sm mb-5 outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {COURSES.map(c => <option key={c} value={c} style={{ background: '#0f1028' }}>{COURSE_NAMES[c]}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setGrantModal(null)}
                className="flex-1 py-2.5 rounded-xl text-white/60 hover:text-white text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={handleGrantAccess} disabled={granting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>
                {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Grant Access
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
