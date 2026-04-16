'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Mail, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError([]);

    if (!fullname || !email || !message) {
      setError(['All fields are required.']);
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSuccess(true);
      setFullname('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setError([(err instanceof Error ? err.message : null) || 'Failed to send message. Please try again later.']);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-5"
    >
      {/* Full Name */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">
          <User className="w-3.5 h-3.5" /> Full Name
        </label>
        <input
          type="text"
          value={fullname}
          onChange={e => setFullname(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 rounded-xl text-white placeholder-blue-400/50 outline-none transition-all text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,179,237,0.25)' }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,179,237,0.7)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.2)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(99,179,237,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Email */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">
          <Mail className="w-3.5 h-3.5" /> Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl text-white placeholder-blue-400/50 outline-none transition-all text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,179,237,0.25)' }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,179,237,0.7)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.2)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(99,179,237,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Query */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">
          <MessageSquare className="w-3.5 h-3.5" /> Your Query
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tell us what you'd like to know — course details, pricing, support..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-white placeholder-blue-400/50 outline-none transition-all text-sm resize-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,179,237,0.25)' }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,179,237,0.7)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.2)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(99,179,237,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {error.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error[0]}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-green-300"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Message sent! We&apos;ll get back to you soon.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={sending}
        whileHover={{ scale: sending ? 1 : 1.02 }}
        whileTap={{ scale: sending ? 1 : 0.97 }}
        className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: sending ? 'none' : '0 0 24px rgba(37,99,235,0.45)' }}
      >
        {sending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
        ) : (
          <><Send className="w-4 h-4" /> Send Message</>
        )}
      </motion.button>
    </motion.form>
  );
}
