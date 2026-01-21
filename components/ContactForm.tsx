'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import emailjs from '@emailjs/browser';

export default function ContactForm() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullname || !email || !message) {
      setError(["All fields are required."]);
      setSuccess(false);
      return;
    }

    const templateParams = {
      name: fullname,
      email: email,
      message,
    };

    try {
      const res = await emailjs.send(
        "service_d9sk2jj",
        "template_ndrh7th",
        templateParams,
        "Z8CyUSeV9zmY19KFb"
      );

      console.log("SUCCESS:", res.status, res.text);
      setSuccess(true);
      setError([]);
      setFullname("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("FAILED:", err);
      setError(["Failed to send message. Try again later."]);
      setSuccess(false);
    }
  };

  return (
    <section className="py-10 sm:py-16 px-4 bg-white dark:bg-gray-900">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-8 text-blue-700 dark:text-white"
      >
        Registration Form
      </motion.h2>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-xl mx-auto flex flex-col gap-5"
      >
        <div>
          <label htmlFor="fullname" className="block mb-1 font-semibold text-blue-800 dark:text-white">
            Full Name
          </label>
          <input
            onChange={(e) => setFullname(e.target.value)}
            value={fullname}
            type="text"
            id="fullname"
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-semibold text-blue-800 dark:text-white">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            id="email"
            placeholder="john@gmail.com"
            className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
          />
        </div>

        <div>
          <label htmlFor="message" className="block mb-1 font-semibold text-blue-800 dark:text-white">
            Languages of Interest
          </label>
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            id="message"
            placeholder="Type your courses here..."
            className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition h-32 resize-none"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold shadow hover:bg-blue-700 transition"
        >
          Send ✉️
        </motion.button>
      </motion.form>

      <div className="mt-4 max-w-xl mx-auto text-center">
        {error.length > 0 &&
          error.map((e, idx) => (
            <p key={idx} className="text-red-600 dark:text-red-400 px-4 py-2">{e}</p>
          ))}
        {success && (
          <p className="text-green-600 dark:text-green-400 px-4 py-2">
            Message sent successfully! ✅
          </p>
        )}
      </div>
    </section>
  );
}
