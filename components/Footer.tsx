import { FaLinkedin, FaGithub, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-blue-300">Home</a></li>
            <li><a href="/" className="hover:text-blue-300">Courses</a></li>

          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Contact</h3>
          <ul className="space-y-2">
            <li><a href="/AboutUs" className="hover:text-blue-300">About Us</a></li>
            <li><a href="/ContactUs" className="hover:text-blue-300">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Social Us</h3>
          <div className="flex space-x-4">
             <a href="https://www.linkedin.com/in/baskaran-vaishnavan-ab764522a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                            <FaLinkedin />
                          </a>
                          <a href="https://github.com/BCS-VAISH" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gray-800 dark:hover:text-white">
                            <FaGithub />
                          </a>
                          <a href="https://twitter.com/Bcsvaish14" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
                            <FaTwitter />
                          </a>
                          <a href="https://wa.me/+94773668707" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-500">
                            <FaWhatsapp />
                          </a>
                          <a href="mailto:bcsvaish0000@gmail.com" className="flex items-center gap-2 hover:text-red-500">
                            <MdEmail />
                          </a>
                        
                          <a href="https://www.instagram.com/bcs_vaish?igsh=MWlucXh3bXg3NWNqeg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-600">
                            <FaInstagram />
                          </a>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400 mt-8">&copy; 2025 ARZAMA'S PolyLingua Global. All rights reserved.</div>
    </footer>
  );
}
