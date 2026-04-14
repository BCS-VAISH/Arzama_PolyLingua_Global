'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero'; // The animated section we built before
import About from '@/components/About';
import Courses from '@/components/Courses';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Courses />
      <Footer />
    </>
  );
}
