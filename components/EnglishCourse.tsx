'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CheckCircle, Clock, Users, Globe, Infinity, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PaymentModal from './PaymentModal';
import { toast } from './Toaster';

type CourseData = {
  courseId: string;
  title: string;
  description: string;
  level: string;
  price: number;
  finalPrice: number;
  discount: number;
};

type EnrollState = { enrolled: boolean; status: string | null };

type UserData = { id: string; email: string; name: string | null };

type CourseMeta = { emoji: string; achieves: string[]; curriculum: string[]; outcome: string };

const COURSE_META: Record<string, CourseMeta> = {
  'english-core-foundations': {
    emoji: '📘',
    achieves: [
      'Master English grammar basics',
      'Build essential everyday vocabulary',
      'Start and hold simple conversations',
      'Write clear, simple sentences',
    ],
    curriculum: [
      'Pronunciation and sound clarity',
      'Basic sentence structure',
      'Everyday vocabulary and expressions',
      'Present, past, and future in context',
      'Listening and repetition practice',
      'Speaking through mini-stories',
      'Introduction to real-life conversations',
    ],
    outcome: 'Build a strong foundation and start speaking English with clarity and confidence.',
  },
  'english-academic-university': {
    emoji: '🎓',
    achieves: [
      'Write academic essays and reports',
      'Understand university lectures clearly',
      'Prepare for IELTS / TOEFL exams',
      'Participate confidently in seminars',
    ],
    curriculum: [
      'Understanding lectures and note-taking',
      'Academic vocabulary and expressions',
      'Writing assignments and reports',
      'Asking and answering in class',
      'Explaining ideas clearly',
      'Presentation skills for academic settings',
      'Reading and understanding academic texts',
    ],
    outcome: 'Perform confidently in university environments where English is the medium of instruction.',
  },
  'english-real-life-communication': {
    emoji: '🗣️',
    achieves: [
      'Hold natural everyday conversations',
      'Understand native speakers with ease',
      'Express yourself clearly and confidently',
      'Navigate real-world social situations',
    ],
    curriculum: [
      'Natural everyday conversations',
      'Expressing opinions and ideas',
      'Storytelling and personal experiences',
      'Asking and answering questions fluently',
      'Social interactions and small talk',
      'Listening to real-life dialogues',
      'Thinking and responding in English',
    ],
    outcome: 'Speak naturally and confidently in real-life situations without overthinking.',
  },
  'english-travel-everyday': {
    emoji: '✈️',
    achieves: [
      'Travel confidently in English-speaking countries',
      'Handle hotels, airports, and restaurants',
      'Ask for directions and get help',
      'Connect with locals while traveling',
    ],
    curriculum: [
      'Airport, hotel, and transport conversations',
      'Ordering food and making reservations',
      'Asking for directions and help',
      'Handling real-world situations',
      'Social interactions while traveling',
      'Understanding different accents',
      'Practical vocabulary for travel',
    ],
    outcome: 'Travel and communicate confidently in English-speaking environments.',
  },
  'english-business-professional': {
    emoji: '💼',
    achieves: [
      'Write professional emails and reports',
      'Lead and join business meetings',
      'Negotiate and present with confidence',
      'Build a strong professional image',
    ],
    curriculum: [
      'Professional vocabulary and tone',
      'Writing emails and formal messages',
      'Job interviews and self-introduction',
      'Meetings and workplace communication',
      'Presenting ideas professionally',
      'Networking and professional conversations',
      'Workplace scenarios and role plays',
    ],
    outcome: 'Communicate professionally and confidently in work environments.',
  },
  'english-presentations-public-speaking': {
    emoji: '🎤',
    achieves: [
      'Deliver compelling presentations',
      'Overcome stage fright in English',
      'Structure speeches effectively',
      'Engage and persuade any audience',
    ],
    curriculum: [
      'Structuring a presentation',
      'Speaking clearly and confidently',
      'Organizing ideas logically',
      'Body language and delivery',
      'Engaging an audience',
      'Handling questions and feedback',
      'Reducing fear and building confidence',
    ],
    outcome: 'Deliver clear, confident, and impactful presentations in English.',
  },
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'text-green-400 bg-green-400/10 border-green-400/30',
  intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  advanced: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export default function EnglishCourse() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, EnrollState>>({});
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState<CourseData | null>(null);

  // ── Fetch English courses from DB ──────────────────────────────────────────
  useEffect(() => {
    fetch('/api/courses?category=english')
      .then(r => r.json())
      .then(data => {
        if (data.courses?.length) setCourses(data.courses);
      })
      .catch(() => {});
  }, []);

  // ── Auth + enrollment checks ───────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/auth/me', { headers, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const u: UserData = { id: data.user.id, email: data.user.email, name: data.user.name };
          setUser(u);
          localStorage.setItem('userData', JSON.stringify(u));
          checkAllEnrollments(u.id);
        } else {
          setUser(null);
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
        }
      } catch {
        const saved = localStorage.getItem('userData');
        if (saved) {
          try {
            const u = JSON.parse(saved);
            setUser(u);
            checkAllEnrollments(u.id);
          } catch {}
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const checkAllEnrollments = async (userId: string) => {
    const courseIds = Object.keys(COURSE_META);
    const results = await Promise.allSettled(
      courseIds.map(courseId =>
        fetch(`/api/enrollment/check?userId=${userId}&courseId=${courseId}`)
          .then(r => r.json())
          .then(d => ({ courseId, enrolled: d.enrolled, status: d.status }))
      )
    );
    const map: Record<string, EnrollState> = {};
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        map[r.value.courseId] = { enrolled: r.value.enrolled, status: r.value.status };
      }
    });
    setEnrollments(map);
  };

  // ── 3D background ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const positions: number[] = [];
    for (let i = 0; i < 600; i++) {
      positions.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.5, transparent: true, opacity: 0.7 });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
    camera.position.z = 5;
    const animate = () => { requestAnimationFrame(animate); particles.rotation.x += 0.0004; particles.rotation.y += 0.0004; renderer.render(scene, camera); };
    animate();
    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); renderer.dispose(); };
  }, []);

  const handleEnroll = (course: CourseData) => {
    if (!user) {
      toast.info('Please login to enroll in this course');
      router.push('/login?redirect=/EnglishCourse');
      return;
    }
    const state = enrollments[course.courseId];
    if (state?.enrolled) { toast.success('You are already enrolled in this course!'); return; }
    if (state?.status === 'PENDING') { toast.info('Your payment is pending admin review. Please wait.'); return; }
    setActivePayment(course);
  };

  const getEnrollLabel = (courseId: string) => {
    const state = enrollments[courseId];
    if (state?.enrolled) return '✅ Enrolled';
    if (state?.status === 'PENDING') return '⏳ Pending Review';
    return 'Enroll Now';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0a0f1e,#0d1b3e)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-400 border-blue-900 animate-spin mx-auto mb-3" />
        <p className="text-blue-300 text-sm">Loading courses...</p>
      </div>
    </div>
  );

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 min-h-screen text-white pt-20 pb-16 px-4">

        <div className="max-w-6xl mx-auto">

          {/* Back button */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-all"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-blue-300" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)' }}>
              🇬🇧 English Courses
            </span>
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ background: 'linear-gradient(135deg,#93c5fd,#3b82f6,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              English Mastery
            </h1>
            <p className="text-blue-300 text-lg max-w-2xl mx-auto">
              6 focused courses designed for real-world fluency — from foundations to public speaking. Choose your path and start speaking with confidence.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: Users, value: '15K+', label: 'Students' },
                { icon: Globe, value: '40+', label: 'Countries' },
                { icon: Infinity, value: 'Lifetime', label: 'Access' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2 text-blue-300 text-sm">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">{value}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── INSTRUCTOR ── */}
          <div className="rounded-2xl mb-14 p-6" style={{ background: 'rgba(15,27,60,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <h3 className="text-xl font-bold text-blue-200 mb-4">Meet Your Instructor</h3>
            <div className="flex items-center gap-4">
              <img src="/Founder.jpg" className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" style={{ border: '2px solid rgba(59,130,246,0.5)' }} alt="Instructor" />
              <div>
                <div className="text-lg font-bold text-white">Arao Zau Macaia</div>
                <div className="text-blue-300 text-sm">Multilingual Language Instructor · Founder of ARZAMA&apos;s PolyLingua Global</div>
                <p className="text-blue-200 text-sm mt-1">Specialized in practical, immersive language learning focused on real-life communication, fluency, and confidence building.</p>
              </div>
            </div>
          </div>

          {/* ── COURSE CARDS GRID ─────────────────────────────────────────── */}
          {courses.length === 0 ? (
            <div className="text-center py-20 text-blue-400">
              <p className="text-lg mb-2">Courses are being set up...</p>
              <p className="text-sm opacity-60">Please check back shortly or contact admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
              {courses.map((course) => {
                const meta = COURSE_META[course.courseId];
                const state = enrollments[course.courseId];
                const isEnrolled = state?.enrolled;
                const isPending = state?.status === 'PENDING';
                const priceStr = `₹${course.finalPrice.toLocaleString('en-IN')}`;
                const originalStr = `₹${course.price.toLocaleString('en-IN')}`;

                return (
                  <div
                    key={course.courseId}
                    className="rounded-2xl overflow-hidden flex flex-col transition-transform hover:scale-[1.01]"
                    style={{ background: 'rgba(15,27,60,0.85)', border: isEnrolled ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(59,130,246,0.25)', boxShadow: '0 0 30px rgba(59,130,246,0.08)' }}
                  >
                    {/* Top bar */}
                    <div className={`h-1 w-full ${isEnrolled ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500'}`} />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{meta?.emoji ?? '📚'}</span>
                          <div>
                            <h3 className="text-lg font-black text-white leading-tight">{course.title}</h3>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${LEVEL_COLORS[course.level] || LEVEL_COLORS.beginner}`}>
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </span>
                          </div>
                        </div>
                        {isEnrolled && (
                          <span className="flex-shrink-0 flex items-center gap-1 text-green-400 text-xs font-bold">
                            <CheckCircle className="w-4 h-4" />Enrolled
                          </span>
                        )}
                        {isPending && !isEnrolled && (
                          <span className="flex-shrink-0 flex items-center gap-1 text-yellow-400 text-xs font-bold">
                            <Clock className="w-4 h-4" />Pending
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-blue-300 text-sm mb-4 leading-relaxed">{course.description}</p>

                      {/* Curriculum */}
                      {meta?.curriculum && (
                        <ul className="space-y-1.5 mb-4 flex-1">
                          {meta.curriculum.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-blue-100 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Price + Enroll */}
                      <div className="mt-auto pt-4 border-t border-blue-500/15">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white">{priceStr}</span>
                            {course.discount > 0 && (
                              <>
                                <span className="text-blue-400 line-through text-sm">{originalStr}</span>
                                <span className="px-1.5 py-0.5 rounded text-xs font-bold text-green-300" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                                  {course.discount}% OFF
                                </span>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => handleEnroll(course)}
                            disabled={isEnrolled}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background: isEnrolled
                                ? 'rgba(34,197,94,0.25)'
                                : isPending
                                ? 'rgba(234,179,8,0.25)'
                                : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                              boxShadow: isEnrolled || isPending ? 'none' : '0 0 20px rgba(37,99,235,0.4)',
                            }}
                          >
                            {!isEnrolled && !isPending && <Lock className="w-3.5 h-3.5" />}
                            {getEnrollLabel(course.courseId)}
                          </button>
                        </div>
                        <p className="text-blue-400/60 text-xs mt-2">One-time payment · Lifetime access · Certificate included</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          

        </div>
      </div>

      {/* ── PAYMENT MODAL ─────────────────────────────────────────────────── */}
      {activePayment && (
        <PaymentModal
          courseId={activePayment.courseId}
          courseName={activePayment.title}
          coursePrice={`₹${activePayment.finalPrice.toLocaleString('en-IN')}`}
          priceAmount={activePayment.finalPrice}
          userName={user?.name || ''}
          onClose={() => setActivePayment(null)}
          onSuccess={() => {
            setEnrollments(prev => ({
              ...prev,
              [activePayment.courseId]: { enrolled: false, status: 'PENDING' },
            }));
          }}
        />
      )}
    </>
  );
}
