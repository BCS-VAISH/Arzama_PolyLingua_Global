"use client";
import Footer from "@/components/Footer";
import { motion } from "motion/react";
import Image from "next/image";

export default function FounderStatement() {
  return (
    <section id="founder" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-100">
      
      <div className="container mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-10">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex-1 bg-gradient-to-br from-white via-purple-50 to-indigo-100 p-8 rounded-3xl shadow-xl"
        >
          <h2 className="text-3xl font-extrabold mb-4 text-indigo-800">About ARZAMA&apos;s PolyLingua Global</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            We help people speak languages with confidence.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            <span className="font-bold text-purple-800">ARZAMA&apos;s PolyLingua Global</span> is built around immersive, practical learning designed for real-world communication.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Our approach focuses on fluency, confidence, and meaningful interaction-not memorization. Through a combination of structured lessons, real-life content, and community-based practice, learners develop the ability to understand, speak, and think naturally in a new language.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            <span className="font-semibold text-indigo-700">We are building a global learning environment where language is not just studied but lived.</span>
          </p>
          <div className="text-right mt-6">
            <p className="font-bold text-indigo-800">Arao Zau Macaia</p>
            <p className="text-sm text-purple-700">Multilingual Language Instructor · Founder of ARZAMA&apos;s PolyLingua Global</p>
          </div>
        </motion.div>
        
        

        {/* Founder Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex-1 flex justify-center"
        >
          <div className="relative w-72 h-72 rounded-full overflow-hidden shadow-lg bg-gradient-to-tr from-purple-500 via-indigo-400 to-pink-400 p-1">
            <div className="w-full h-full rounded-full overflow-hidden">
              <Image
                src="/Founder.jpg" 
                alt="Founder of PolyLingua Global"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </section>
    
  );
}
