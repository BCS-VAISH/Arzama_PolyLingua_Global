"use client";

import { motion } from "motion/react";
import Link from "next/link";

const courses = [
  {
    flag: "🇵🇹",
    title: "Portuguese Course",
    description: "Learn Brazilian Portuguese with real-world examples and cultural immersion.",
    bg: "from-red-100 to-red-50",
    link: "/PortugueseCourse",
  },
  {
    flag: "🇬🇧",
    title: "English Course",
    description: "Master English for business, travel, or academics with a global perspective.",
    bg: "from-blue-100 to-blue-50",
    link: "/EnglishCourse",
  },
  {
    flag: "🇫🇷",
    title: "French Course",
    description: "Learn French with a focus on conversation and cultural fluency.",
    bg: "from-pink-100 to-pink-50",
    link: "/FrenchCourse",
  },
];

export default function Courses() {
  return (
    <section id="courses" className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-center mb-12 text-gray-800"
        >
          Our Popular Courses
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`bg-gradient-to-br ${course.bg} p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300`}
            >
              <div className="text-3xl mb-3">{course.flag}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h3>
              <p className="text-gray-700 mb-4">{course.description}</p>

              <Link href={course.link}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition duration-300">
                  Explore
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
