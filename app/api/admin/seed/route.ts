import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { getCurrentUser } from '@/lib/auth';

const ALL_COURSES = [
  // ── ENGLISH ─────────────────────────────────────────────────────────────
  {
    courseId: 'english-core-foundations',
    title: 'Core English Foundations',
    description: 'Build a strong base in English grammar, vocabulary, and everyday communication from scratch.',
    price: 1999, discount: 0, category: 'english', level: 'beginner' as const, duration: '6 weeks',
  },
  {
    courseId: 'english-academic-university',
    title: 'English for Academic & University Success',
    description: 'Excel in academic writing, lectures, seminars, and university-level English communication.',
    price: 3499, discount: 0, category: 'english', level: 'intermediate' as const, duration: '8 weeks',
  },
  {
    courseId: 'english-real-life-communication',
    title: 'English for Real-Life Communication',
    description: 'Communicate naturally in real-world situations — conversations, social settings, and everyday life.',
    price: 2499, discount: 0, category: 'english', level: 'beginner' as const, duration: '6 weeks',
  },
  {
    courseId: 'english-travel-everyday',
    title: 'English for Travel & Everyday Communication',
    description: 'Navigate travel scenarios, local interactions, and everyday situations with ease in English.',
    price: 1999, discount: 0, category: 'english', level: 'beginner' as const, duration: '4 weeks',
  },
  {
    courseId: 'english-business-professional',
    title: 'English for Business & Professional Communication',
    description: 'Master professional English for meetings, emails, negotiations, and workplace communication.',
    price: 3999, discount: 0, category: 'english', level: 'intermediate' as const, duration: '8 weeks',
  },
  {
    courseId: 'english-presentations-public-speaking',
    title: 'English for Presentations & Public Speaking',
    description: 'Deliver powerful presentations and speak confidently in front of any audience in English.',
    price: 4499, discount: 0, category: 'english', level: 'advanced' as const, duration: '6 weeks',
  },

  // ── FRENCH ──────────────────────────────────────────────────────────────
  {
    courseId: 'french-real-life-communication',
    title: 'French for Real-Life Communication',
    description: 'Speak French naturally in everyday situations — at home, at work, and in social settings.',
    price: 2499, discount: 0, category: 'french', level: 'beginner' as const, duration: '6 weeks',
  },
  {
    courseId: 'french-travel-cultural',
    title: 'French for Travel & Cultural Interaction',
    description: 'Navigate France and French-speaking countries with confidence — language and culture combined.',
    price: 1999, discount: 0, category: 'french', level: 'beginner' as const, duration: '4 weeks',
  },
  {
    courseId: 'french-academic',
    title: 'French for Academic Purposes',
    description: 'Master academic French for university studies, research, and professional academic communication.',
    price: 3499, discount: 0, category: 'french', level: 'intermediate' as const, duration: '8 weeks',
  },
  {
    courseId: 'french-conversational-mastery',
    title: 'Conversational French Mastery',
    description: 'Speak French fluently and spontaneously — move beyond textbook French into real conversations.',
    price: 2999, discount: 0, category: 'french', level: 'intermediate' as const, duration: '6 weeks',
  },

  // ── PORTUGUESE ──────────────────────────────────────────────────────────
  {
    courseId: 'portuguese-real-life-communication',
    title: 'Portuguese for Real-Life Communication',
    description: 'Speak Portuguese confidently in everyday life — conversations, routines, and social situations.',
    price: 2499, discount: 0, category: 'portuguese', level: 'beginner' as const, duration: '6 weeks',
  },
  {
    courseId: 'portuguese-travel-cultural',
    title: 'Portuguese for Travel & Cultural Integration',
    description: 'Explore Brazil and Portugal with the language and cultural insight to connect like a local.',
    price: 1999, discount: 0, category: 'portuguese', level: 'beginner' as const, duration: '4 weeks',
  },
  {
    courseId: 'portuguese-business-professional',
    title: 'Portuguese for Business & Professional Use',
    description: 'Communicate professionally in Portuguese — meetings, emails, negotiations, and networking.',
    price: 3999, discount: 0, category: 'portuguese', level: 'intermediate' as const, duration: '8 weeks',
  },
  {
    courseId: 'portuguese-conversational-mastery',
    title: 'Conversational Portuguese Mastery',
    description: 'Achieve fluent, natural Portuguese conversation — think and speak like a native.',
    price: 2999, discount: 0, category: 'portuguese', level: 'intermediate' as const, duration: '6 weeks',
  },
];

// POST /api/admin/seed — upserts all courses into MongoDB
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category'); // optional filter e.g. ?category=french

  await connectDB();

  const toSeed = category ? ALL_COURSES.filter(c => c.category === category) : ALL_COURSES;

  const results = [];
  for (const course of toSeed) {
    const doc = await Course.findOneAndUpdate(
      { courseId: course.courseId },
      { $set: course },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push({ courseId: doc.courseId, title: doc.title, price: doc.price });
  }

  return NextResponse.json({
    success: true,
    message: `${results.length} courses seeded successfully`,
    courses: results,
  });
}

// GET /api/admin/seed — check which courses are in DB
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  await connectDB();

  const existing = await Course.find({}).select('courseId title price category').lean();
  const seeded = ALL_COURSES.map(c => ({
    courseId: c.courseId,
    title: c.title,
    category: c.category,
    inDB: existing.some((e: any) => e.courseId === c.courseId),
  }));

  return NextResponse.json({ seeded, totalInDB: existing.length });
}
