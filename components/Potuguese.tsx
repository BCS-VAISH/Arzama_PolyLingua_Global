'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Star, Send, X, MessageSquare, PlayCircle, Lock, CheckCircle, Clock, Users, Globe, Infinity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PaymentModal from './PaymentModal';
import { toast } from './Toaster';

type Review = { id: string; rating: number; comment: string; userName: string; createdAt: string; };
type Comment = { id: string; content: string; userName: string; createdAt: string; };
type UserData = { id: string; email: string; name: string | null; };

type PotuProps = {
  onEnroll?: () => void;
};

export default function Potu({ onEnroll }: PotuProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [activeSection, setActiveSection] = useState<'reviews' | 'comments'>('reviews');

  const courseId = 'portuguese';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveOriginalPrice, setLiveOriginalPrice] = useState<number | null>(null);
  const [liveDiscount, setLiveDiscount] = useState<number>(0);

  const displayPrice = livePrice ?? 3599;
  const displayOriginal = liveOriginalPrice ?? 7999;
  const priceStr = `₹${displayPrice.toLocaleString('en-IN')}`;
  const discountPct = liveDiscount;

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(data => {
        const c = (data.courses || []).find((x: any) => x.courseId === 'portuguese');
        if (c) { setLivePrice(c.finalPrice); setLiveOriginalPrice(c.price); setLiveDiscount(c.discount || 0); }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const headers: Record<string, string> = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const res = await fetch('/api/auth/me', { headers, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const u = { id: data.user.id, email: data.user.email, name: data.user.name };
          setUser(u);
          localStorage.setItem('userData', JSON.stringify(u));
          checkEnrollment(u.id);
        } else {
          setUser(null);
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
        }
      } catch {
        const saved = localStorage.getItem('userData');
        if (saved) { try { const u = JSON.parse(saved); setUser(u); checkEnrollment(u.id); } catch {} }
      }
      setLoading(false);
    };
    initAuth();
    fetchReviews();
    fetchComments();
  }, []);

  const checkEnrollment = async (userId: string) => {
    try {
      const res = await fetch(`/api/enrollment/check?userId=${userId}&courseId=${courseId}`);
      const data = await res.json();
      setEnrolled(data.enrolled);
      setEnrollmentStatus(data.status);
    } catch {}
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?courseId=${courseId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch {}
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?courseId=${courseId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {}
  };

  const handleEnroll = () => {
    if (onEnroll) { onEnroll(); return; }
    if (!user) {
      toast.info('Please login to enroll in this course');
      router.push(`/login?redirect=/PortugueseCourse`);
      return;
    }
    if (enrolled) { toast.success('You are already enrolled in this course!'); return; }
    if (enrollmentStatus === 'PENDING') { toast.info('Your payment is pending admin review. Please wait.'); return; }
    setShowPaymentModal(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to submit a review'); return; }
    if (!newReview.trim() || newRating === 0) { toast.error('Please add a rating and review text'); return; }
    setSubmittingReview(true);
    const loadingId = toast.loading('Submitting your review...');
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ courseId, rating: newRating, comment: newReview }) });
      const data = await res.json();
      toast.dismiss(loadingId);
      if (!res.ok) throw new Error(data.error);
      setNewReview(''); setNewRating(0);
      toast.success('Review submitted!');
      fetchReviews();
    } catch (err: any) { toast.dismiss(loadingId); toast.error(err.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to post a comment'); return; }
    if (!newComment.trim()) { toast.error('Please write a comment first'); return; }
    setSubmittingComment(true);
    const loadingId = toast.loading('Posting your comment...');
    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ courseId, content: newComment }) });
      const data = await res.json();
      toast.dismiss(loadingId);
      if (!res.ok) throw new Error(data.error);
      setNewComment('');
      toast.success('Comment posted!');
      fetchComments();
    } catch (err: any) { toast.dismiss(loadingId); toast.error(err.message || 'Failed to post comment'); }
    finally { setSubmittingComment(false); }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < 600; i++) {
      positions.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.5, transparent: true, opacity: 0.7 });
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    camera.position.z = 5;
    const animate = () => { requestAnimationFrame(animate); particleSystem.rotation.x += 0.0004; particleSystem.rotation.y += 0.0004; renderer.render(scene, camera); };
    animate();
    const handleResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); renderer.dispose(); };
  }, []);

  const enrollBtnLabel = enrolled ? '✅ Already Enrolled' : enrollmentStatus === 'PENDING' ? '⏳ Pending Admin Review' : `Enroll Now — ${priceStr}`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0a0f1e,#0d1b3e)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-400 border-blue-900 animate-spin mx-auto mb-3" />
        <p className="text-blue-300 text-sm">Loading course...</p>
      </div>
    </div>
  );

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 min-h-screen text-white pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">

          {/* ── HERO ── */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-blue-300" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)' }}>
              🇧🇷 Language Course
            </span>
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ background: 'linear-gradient(135deg,#93c5fd,#3b82f6,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Portuguese Mastery
            </h1>
            <p className="text-blue-300 text-lg max-w-xl mx-auto">Master Portuguese through immersive dialogues &amp; cultural exploration.</p>
          </div>

          {/* Status banners */}
          {enrollmentStatus === 'PENDING' && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl text-yellow-200 text-sm" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.35)' }}>
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              Your payment is pending admin verification. You will get access soon.
            </div>
          )}
          {enrolled && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl text-green-200 text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)' }}>
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              You are enrolled! Enjoy your Portuguese Mastery Course.
            </div>
          )}

          {/* ── COURSE HERO CARD ── */}
          <div className="rounded-2xl overflow-hidden mb-12" style={{ background: 'linear-gradient(135deg,rgba(15,27,60,0.95),rgba(20,40,90,0.95))', border: '1px solid rgba(59,130,246,0.35)', boxShadow: '0 0 60px rgba(59,130,246,0.15)' }}>
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500" />
            <div className="p-6 md:p-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">The Complete Portuguese Guide</h2>
                <p className="text-blue-300 text-sm mb-3">Ana Silva · Pedro Costa · Lingua Academy</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-blue-800'}`} />
                    ))}
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">{averageRating}</span>
                  <span className="text-blue-400 text-sm">({totalReviews} reviews)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-blue-200" style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)' }}>Bestseller</span>
                </div>
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-4xl font-black text-white">{priceStr}</span>
                  {discountPct > 0 && <span className="text-blue-400 line-through text-lg">₹{displayOriginal.toLocaleString('en-IN')}</span>}
                  {discountPct > 0 && <span className="px-2 py-1 rounded-lg text-xs font-bold text-green-300" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>{discountPct}% OFF</span>}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: Star, label: 'Avg Rating', value: '4.8★' },
                  { icon: Users, label: 'Students', value: '12K+' },
                  { icon: Globe, label: 'Countries', value: '30+' },
                  { icon: Infinity, label: 'Access', value: 'Lifetime' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Icon className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-lg font-black text-blue-200">{value}</div>
                    <div className="text-xs text-blue-400">{label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolled}
                className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ocular-glow"
                style={{ background: enrolled ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: enrolled ? 'none' : '0 0 30px rgba(37,99,235,0.5)' }}
              >
                {enrollBtnLabel}
              </button>
            </div>
          </div>

          {/* ── CONTENT GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

            <div className="rounded-2xl p-6" style={{ background: 'rgba(15,27,60,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h3 className="text-xl font-bold text-blue-200 mb-4">What You Will Achieve</h3>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {['Speak confidently in 30 days','Hold daily conversations','Travel without language barriers','Understand Portuguese culture','Communicate professionally','Master pronunciation'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-blue-100 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'rgba(15,27,60,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h3 className="text-xl font-bold text-blue-200 mb-4">Who This Course Is For</h3>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {[['👶','Beginners'],['✈️','Travelers'],['🎓','Students'],['💼','Professionals'],['🌍','Language Enthusiasts'],['📚','Exam Preparation']].map(([emoji, label]) => (
                  <div key={label} className="flex items-center gap-2 text-blue-100 text-sm rounded-lg px-3 py-2" style={{ background: 'rgba(59,130,246,0.08)' }}>
                    <span>{emoji}</span><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'rgba(15,27,60,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h3 className="text-xl font-bold text-blue-200 mb-4">Course Curriculum</h3>
              <div className="space-y-2">
                {['Module 1: Pronunciation & Greetings','Module 2: Daily Conversations','Module 3: Grammar Basics','Module 4: Travel Portuguese','Module 5: Business Portuguese','Module 6: Cultural Insights'].map((title, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.15)' }}>
                    <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-500/10 transition-colors" onClick={() => setOpenModule(openModule === idx ? null : idx)}>
                      <span className="text-blue-200 text-sm font-medium">{title}</span>
                      <span className="text-blue-400 text-lg">{openModule === idx ? '−' : '+'}</span>
                    </button>
                    {openModule === idx && (
                      <div className="px-4 pb-3 text-blue-300 text-sm" style={{ background: 'rgba(59,130,246,0.05)' }}>
                        Interactive lessons, audio practice, quizzes, and exercises.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'rgba(15,27,60,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h3 className="text-xl font-bold text-blue-200 mb-4">Meet Your Instructor</h3>
              <div className="flex items-center gap-4 mb-5">
                <img src="/founder.jpg" className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" style={{ border: '2px solid rgba(59,130,246,0.5)' }} alt="Instructor" />
                <div>
                  <div className="text-lg font-bold text-white">Arao Zao Macaia</div>
                  <div className="text-blue-300 text-sm">Native Portuguese Speaker · 10+ years</div>
                  <p className="text-blue-200 text-sm mt-1">Former trainer at Lingua Academy. Specialized in immersive learning.</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-blue-200 mb-3">Lessons</h3>
              {enrolled ? (
                <button onClick={() => setShowVideo(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
                  <PlayCircle className="w-5 h-5" />Watch Full Lesson
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setShowVideo(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 ocular-glow" style={{ background: 'linear-gradient(135deg,#2563eb,#1e40af)' }}>
                    <PlayCircle className="w-5 h-5" />Watch Preview
                  </button>
                  <button onClick={handleEnroll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-blue-300 text-sm hover:text-white transition-all" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
                    <Lock className="w-4 h-4" />Enroll for full access
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'rgba(15,27,60,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h3 className="text-xl font-bold text-blue-200 mb-4">FAQs</h3>
              <div className="space-y-2">
                {['Is this course for beginners?','How long is the course?','Will I get lifetime access?','Is there a certificate?','What if I am not satisfied?'].map((q, i) => (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.15)' }}>
                    <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-500/10 transition-colors" onClick={() => setOpenModule(openModule === 100 + i ? null : 100 + i)}>
                      <span className="text-blue-200 text-sm font-medium">{q}</span>
                      <span className="text-blue-400 text-lg">{openModule === 100 + i ? '−' : '+'}</span>
                    </button>
                    {openModule === 100 + i && (
                      <div className="px-4 pb-3 text-blue-300 text-sm" style={{ background: 'rgba(59,130,246,0.05)' }}>
                        Yes! This course is fully beginner-friendly with lifetime access and a completion certificate.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6 text-center flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.2),rgba(29,78,216,0.3))', border: '1px solid rgba(59,130,246,0.35)', boxShadow: '0 0 30px rgba(59,130,246,0.15)' }}>
              <h3 className="text-xl font-bold text-blue-200 mb-3">Limited Time Offer</h3>
              {discountPct > 0 && <div className="text-blue-400 line-through text-lg mb-1">₹{displayOriginal.toLocaleString('en-IN')}</div>}
              <div className="text-5xl font-black text-white mb-2">{priceStr}</div>
              <div className="text-blue-300 text-sm mb-4">Lifetime access · Certificate included · All modules</div>
              <button onClick={handleEnroll} disabled={enrolled} className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 ocular-glow" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                {enrolled ? 'Already Enrolled' : 'Get Instant Access'}
              </button>
            </div>
          </div>

          {/* ── REVIEWS & COMMENTS ── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,18,45,0.9)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <div className="flex border-b border-blue-500/20">
              <button onClick={() => setActiveSection('reviews')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${activeSection === 'reviews' ? 'text-blue-200 border-b-2 border-blue-400 bg-blue-500/10' : 'text-blue-400 hover:text-blue-200'}`}>
                <Star className="w-4 h-4" />Reviews ({totalReviews})
              </button>
              <button onClick={() => setActiveSection('comments')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${activeSection === 'comments' ? 'text-blue-200 border-b-2 border-blue-400 bg-blue-500/10' : 'text-blue-400 hover:text-blue-200'}`}>
                <MessageSquare className="w-4 h-4" />Comments ({comments.length})
              </button>
            </div>

            <div className="p-6">
              {activeSection === 'reviews' && (
                <>
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="mb-6">
                      <div className="flex items-center justify-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-8 h-8 cursor-pointer transition-all ${i < newRating ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-blue-700 hover:text-blue-500'}`} onClick={() => setNewRating(i + 1)} />
                        ))}
                      </div>
                      <div className="flex gap-2 rounded-xl p-2" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <input type="text" value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="Share your experience..." className="flex-1 bg-transparent px-2 py-1 text-white placeholder-blue-400/60 outline-none text-sm" maxLength={1000} />
                        <button type="submit" disabled={submittingReview} className="px-4 py-2 rounded-lg font-semibold text-white text-sm disabled:opacity-50 hover:opacity-90" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-blue-300 text-sm text-center mb-4">
                      <button onClick={() => router.push('/login?redirect=/PortugueseCourse')} className="underline hover:text-white">Login</button> to leave a review
                    </p>
                  )}
                  <div className="max-h-64 overflow-y-auto review-scroll space-y-3">
                    {reviews.length > 0 ? reviews.map(review => (
                      <div key={review.id} className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <div className="flex items-center gap-1 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-blue-800'}`} />)}</div>
                        <p className="text-sm text-blue-100 mb-2">{review.comment}</p>
                        <p className="text-xs text-blue-400">— {review.userName} · {new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : <p className="text-center text-blue-400 py-6">No reviews yet. Be the first!</p>}
                  </div>
                </>
              )}

              {activeSection === 'comments' && (
                <>
                  {user ? (
                    <form onSubmit={handleCommentSubmit} className="mb-6">
                      <div className="flex gap-2 rounded-xl p-2" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ask a question or leave a comment..." className="flex-1 bg-transparent px-2 py-1 text-white placeholder-blue-400/60 outline-none text-sm" maxLength={1000} />
                        <button type="submit" disabled={submittingComment} className="px-4 py-2 rounded-lg font-semibold text-white text-sm disabled:opacity-50 hover:opacity-90" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-blue-300 text-sm text-center mb-4">
                      <button onClick={() => router.push('/login?redirect=/PortugueseCourse')} className="underline hover:text-white">Login</button> to post a comment
                    </p>
                  )}
                  <div className="max-h-64 overflow-y-auto review-scroll space-y-3">
                    {comments.length > 0 ? comments.map(comment => (
                      <div key={comment.id} className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <p className="text-sm text-blue-100 mb-2">{comment.content}</p>
                        <p className="text-xs text-blue-400">— {comment.userName} · {new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : <p className="text-center text-blue-400 py-6">No comments yet. Start the conversation!</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="rounded-2xl overflow-hidden max-w-3xl w-full relative" style={{ background: '#0a0f1e', border: '1px solid rgba(59,130,246,0.4)' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-blue-500/20">
              <span className="text-white font-semibold">Portuguese Mastery — Preview</span>
              <button onClick={() => setShowVideo(false)} className="text-blue-300 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" allowFullScreen className="block" />
          </div>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          courseId={courseId}
          courseName="Portuguese Mastery Course"
          coursePrice={priceStr}
          priceAmount={displayPrice}
          userName={user?.name || ''}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => setEnrollmentStatus('PENDING')}
        />
      )}

      <button onClick={handleEnroll} className="sticky-enroll ocular-glow">
        {enrolled ? '✅ Enrolled' : 'Enroll Now'}
      </button>
    </>
  );
}
