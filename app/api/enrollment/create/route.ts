import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import { getCurrentUser } from '@/lib/auth';
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

const COURSE_LABELS: Record<string, string> = {
  english: 'English Mastery Course',
  french: 'French Mastery Course',
  portuguese: 'Portuguese Mastery Course',
  'english-core-foundations': 'Core English Foundations',
  'english-academic-university': 'English for Academic & University Success',
  'english-real-life-communication': 'English for Real-Life Communication',
  'english-travel-everyday': 'English for Travel & Everyday Communication',
  'english-business-professional': 'English for Business & Professional Communication',
  'english-presentations-public-speaking': 'English for Presentations & Public Speaking',
  'french-real-life-communication': 'French for Real-Life Communication',
  'french-travel-cultural': 'French for Travel & Cultural Interaction',
  'french-academic': 'French for Academic Purposes',
  'french-conversational-mastery': 'Conversational French Mastery',
  'portuguese-real-life-communication': 'Portuguese for Real-Life Communication',
  'portuguese-travel-cultural': 'Portuguese for Travel & Cultural Integration',
  'portuguese-business-professional': 'Portuguese for Business & Professional Use',
  'portuguese-conversational-mastery': 'Conversational Portuguese Mastery',
};

async function sendAdminEmail(opts: {
  payerName: string;
  userEmail: string;
  courseId: string;
  paymentProof: string | null;
}) {
  const { payerName, userEmail, courseId, paymentProof } = opts;
  const courseName = COURSE_LABELS[courseId] || courseId;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Build attachments array only when proof image exists
  const attachments: nodemailer.SendMailOptions['attachments'] = [];
  if (paymentProof && paymentProof.startsWith('data:image/')) {
    const matches = paymentProof.match(/^data:(image\/\w+);base64,(.+)$/);
    if (matches) {
      attachments.push({
        filename: `payment-proof-${Date.now()}.${matches[1].split('/')[1]}`,
        content: matches[2],
        encoding: 'base64',
        contentType: matches[1],
      });
    }
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1b3e;color:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:24px 32px;">
        <h1 style="margin:0;font-size:22px;color:#ffffff;">📚 New Course Access Request</h1>
        <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">ARZAMA PolyLingua Global — Admin Notification</p>
      </div>
      <div style="padding:28px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#93c5fd;font-size:13px;font-weight:600;width:140px;">Student Name</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#ffffff;font-size:14px;">${payerName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#93c5fd;font-size:13px;font-weight:600;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#ffffff;font-size:14px;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#93c5fd;font-size:13px;font-weight:600;">Course</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#ffffff;font-size:14px;">${courseName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#93c5fd;font-size:13px;font-weight:600;">Payment Proof</td>
            <td style="padding:10px 0;color:#ffffff;font-size:14px;">${attachments.length > 0 ? '✅ Attached below' : '❌ Not uploaded'}</td>
          </tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:rgba(37,99,235,0.2);border:1px solid rgba(59,130,246,0.4);border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#bfdbfe;">
            👉 Please log in to the <strong>Admin Dashboard</strong> to approve or reject this enrollment request.
          </p>
        </div>
      </div>
      <div style="padding:16px 32px;background:rgba(0,0,0,0.3);text-align:center;">
        <p style="margin:0;font-size:12px;color:#64748b;">ARZAMA's PolyLingua Global · Automated notification</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"PolyLingua System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || 'bcsvaish0000@gmail.com',
    subject: `📬 Access Request: ${courseName} — ${payerName}`,
    html,
    attachments,
  });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
  }

  const { courseId, paymentProof, payerName } = await req.json();

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
  }

  // Check for existing enrollment
  const existing = await Enrollment.findOne({ userId: user._id, courseId });

  if (existing) {
    if (existing.status === 'PAID' || existing.status === 'ADMIN_GRANTED') {
      return NextResponse.json({ error: 'You are already enrolled in this course' }, { status: 400 });
    }
    if (existing.status === 'PENDING') {
      return NextResponse.json({ error: 'Your payment is already submitted and pending admin review' }, { status: 400 });
    }
  }

  await Enrollment.create({
    userId: user._id,
    courseId,
    paymentProof: paymentProof || null,
    payerName: payerName || null,
    status: 'PENDING',
  });

  // Send email to admin (non-blocking — don't fail the request if email fails)
  try {
    await sendAdminEmail({
      payerName: payerName || user.name || user.email,
      userEmail: user.email,
      courseId,
      paymentProof: paymentProof || null,
    });
  } catch (emailErr) {
    console.error('Admin email notification failed:', emailErr);
  }

  return NextResponse.json({
    success: true,
    message: 'Access request submitted. Admin will review and grant access shortly.',
  });
}
