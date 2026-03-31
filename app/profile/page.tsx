'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Star, MessageSquare, LogOut, Loader2, User as UserIcon,
  BookOpen, PlayCircle, Clock, CheckCircle, XCircle, ShieldCheck,
} from 'lucide-react';
import { toast } from '@/components/Toaster';

type ReviewData = {
  id: string;
  rating: number;
  comment: string;
  courseId: string;
  courseName: string;
  createdAt: string;
};

type CommentData = {
  id: string;
  content: string;
  courseId: string;
  courseName: string;
  createdAt: string;
};

type EnrollmentData = {
  id: string;
  courseId: string;
  courseName: string;
  courseLink: string;
  coursePrice: string;
  status: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'reviews' | 'comments'>('courses');

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (user) fetchUserData(); }, [user, activeTab]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) { router.push('/login'); return; }
      const data = await response.json();
      if (data.user?.role === 'admin') { router.push('/admin'); return; }
      setUser(data.user);
    } catch { router.push('/login'); }
    finally { setLoading(false); }
  };

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      if (activeTab === 'courses') {
        const r = await fetch('/api/user/enrollments');
        if (r.ok) { const d = await r.json(); setEnrollments(d.enrollments); }
      } else if (activeTab === 'reviews') {
        const r = await fetch('/api/user/reviews');
        if (r.ok) { const d = await r.json(); setReviews(d.reviews); }
      } else {
        const r = await fetch('/api/user/comments');
        if (r.ok) { const d = await r.json(); setComments(d.comments); }
      }
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

  const statusIcon = (status: string) => {
    if (status === 'PAID' || status === 'ADMIN_GRANTED') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'PENDING') return <Clock className="w-4 h-4 text-yellow-500" />;
    if (status === 'REJECTED') return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  const statusLabel = (status: string) => {
    const map: Record<string, { text: string; cls: string }> = {
      PAID: { text: 'Active', cls: 'bg-green-100 text-green-700' },
      ADMIN_GRANTED: { text: 'Access Granted', cls: 'bg-blue-100 text-blue-700' },
      PENDING: { text: 'Pending Approval', cls: 'bg-yellow-100 text-yellow-700' },
      REJECTED: { text: 'Rejected', cls: 'bg-red-100 text-red-700' },
    };
    const s = map[status] || { text: status, cls: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${s.cls}`}>{s.text}</span>;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
    </div>
  );

  if (!user) return null;

  const isActive = (status: string) => status === 'PAID' || status === 'ADMIN_GRANTED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-500 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-gray-100 transition">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{user.role}</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs + Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex gap-1 mb-6 border-b overflow-x-auto">
            <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 font-semibold transition text-sm whitespace-nowrap ${activeTab === 'courses' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-700'}`}>
              <BookOpen className="w-4 h-4 inline mr-1" />My Courses
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 font-semibold transition text-sm whitespace-nowrap ${activeTab === 'reviews' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-700'}`}>
              <Star className="w-4 h-4 inline mr-1" />My Reviews
            </button>
            <button onClick={() => setActiveTab('comments')} className={`px-4 py-2 font-semibold transition text-sm whitespace-nowrap ${activeTab === 'comments' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-700'}`}>
              <MessageSquare className="w-4 h-4 inline mr-1" />My Comments
            </button>
          </div>

          {loadingData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

              {/* MY COURSES */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  {enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
                      <Link href="/#courses" className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition text-sm">
                        Browse Courses
                      </Link>
                    </div>
                  ) : (
                    enrollments.map((enrollment, index) => (
                      <motion.div key={enrollment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                        className="border rounded-xl p-5 hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{enrollment.courseName}</h3>
                              {statusLabel(enrollment.status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              Enrolled on {new Date(enrollment.createdAt).toLocaleDateString()}
                            </p>
                            {enrollment.status === 'PENDING' && (
                              <p className="text-sm text-yellow-600 mt-1">
                                ⏳ Your payment is under review. Access will be granted after verification.
                              </p>
                            )}
                            {enrollment.status === 'REJECTED' && (
                              <p className="text-sm text-red-600 mt-1">
                                ❌ Payment was rejected. Please contact support or re-enroll.
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            {isActive(enrollment.status) ? (
                              <Link
                                href={enrollment.courseLink}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Watch Lessons
                              </Link>
                            ) : (
                              <Link
                                href={enrollment.courseLink}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                              >
                                <BookOpen className="w-4 h-4" />
                                View Course
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* MY REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">You haven&apos;t submitted any reviews yet.</p>
                  ) : (
                    reviews.map((review, index) => (
                      <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}</div>
                          <span className="text-sm font-semibold text-blue-700">{review.courseName}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleString()}</div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* MY COMMENTS */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">You haven&apos;t submitted any comments yet.</p>
                  ) : (
                    comments.map((comment, index) => (
                      <motion.div key={comment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border rounded-lg p-4 hover:shadow-md transition">
                        <span className="text-sm font-semibold text-blue-700 mb-2 block">{comment.courseName}</span>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <div className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
