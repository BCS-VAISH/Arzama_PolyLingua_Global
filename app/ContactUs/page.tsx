'use client';


import { FaLinkedin, FaGithub, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import Contact from "@/components/ContactForm"
import Footer from "@/components/Footer"


export default function ContactMe() {
  return (
    <main className="min-h-screen font-sans text-gray-800 dark:text-white bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      
     

      {/* Contact Form Section */}
      <div className="p-4 max-w-3xl mx-auto">
        <Contact />
      </div>
      <Footer/>
      

           

            
    </main>
  );
}
