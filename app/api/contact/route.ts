import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import nodemailer from 'nodemailer';

async function sendAdminNotification(fullname: string, email: string, message: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1b3e;color:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:24px 32px;">
        <h1 style="margin:0;font-size:22px;color:#ffffff;">📩 New Contact Query</h1>
        <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">ARZAMA PolyLingua Global — Admin Notification</p>
      </div>
      <div style="padding:28px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#93c5fd;font-size:13px;font-weight:600;width:120px;">Name</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#ffffff;font-size:14px;">${fullname}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#93c5fd;font-size:13px;font-weight:600;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#ffffff;font-size:14px;">${email}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#93c5fd;font-size:13px;font-weight:600;vertical-align:top;">Message</td>
            <td style="padding:10px 0;color:#ffffff;font-size:14px;line-height:1.6;">${message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:rgba(37,99,235,0.2);border:1px solid rgba(59,130,246,0.4);border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#bfdbfe;">
            👉 Log in to the <strong>Admin Dashboard → Queries</strong> tab to view and manage this query.
          </p>
        </div>
      </div>
      <div style="padding:16px 32px;background:rgba(0,0,0,0.3);text-align:center;">
        <p style="margin:0;font-size:12px;color:#64748b;">ARZAMA&apos;s PolyLingua Global · Automated notification</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"PolyLingua System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || 'bcsvaish0000@gmail.com',
    subject: `📩 New Query from ${fullname}`,
    html,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, message } = await req.json();

    if (!fullname?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    await Contact.create({ fullname: fullname.trim(), email: email.trim(), message: message.trim() });

    // Non-blocking email notification
    sendAdminNotification(fullname.trim(), email.trim(), message.trim()).catch(err =>
      console.error('Contact email notification failed:', err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
