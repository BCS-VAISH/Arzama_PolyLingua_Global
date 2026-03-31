"use client";
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
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
          <h2 className="text-3xl font-extrabold mb-4 text-indigo-800">From Our Founder</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            <span className="font-bold text-purple-800">ARZAMA’S PolyLingua Global</span> is your passport to meaningful global communication. Our platform connects learners from around the world through the power of language—teaching Portuguese, English, and French with authenticity, clarity, and cultural insight.
            Whether you're aiming for professional growth, travel confidence, or personal enrichment, our courses are designed to be practical, interactive, and flexible—available anytime, anywhere.
            <br />
            <br />
            <span className="font-semibold text-indigo-700">Join a multilingual community and start speaking with real-world confidence today.</span>
            

          </p>
          <p className="text-right font-semibold text-gray-700"> - Arao Zao Macaia</p>
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
