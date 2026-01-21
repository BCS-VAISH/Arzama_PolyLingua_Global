'use client';

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { name: "Home", href: "#" },
    { name: "Courses", href: "#courses" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "/ContactUs" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 dark:bg-gray-900 dark:shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img src="/pic.png" alt="Language globe" className="w-12 h-12 rounded-full" />
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            ARZAMA's PolyLingua Global
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            {links.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-lg transition duration-300 hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 hover:text-white dark:hover:from-blue-500 dark:hover:to-purple-600"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-md border-t dark:border-gray-700">
          <ul className="flex flex-col space-y-2 px-4 py-4">
            {links.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="block text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition duration-300 hover:bg-blue-100 dark:hover:bg-blue-800"
                  onClick={() => setMenuOpen(false)} // close after click
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
