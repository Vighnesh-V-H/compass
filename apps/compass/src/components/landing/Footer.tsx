"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FOOTER_LINKS, SOCIAL_LINKS } from "./constants";

export default function Footer() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <footer className='bg-black border-t border-white/10 pt-16 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-2 md:grid-cols-6 gap-8 mb-12'>
          <div className='col-span-2'>
            <motion.div
              className='flex items-center space-x-2 mb-4'
              whileHover={{ scale: 1.05 }}>
              <svg className='w-8 h-8' viewBox='0 0 40 40' fill='none'>
                <path
                  d='M20 5L35 15V25L20 35L5 25V15L20 5Z'
                  stroke='white'
                  strokeWidth='2'
                  fill='none'
                />
                <circle cx='20' cy='20' r='5' fill='white' />
              </svg>
              <span className='text-xl font-bold text-white'>Compass</span>
            </motion.div>
            <p className='text-gray-400 mb-4'>
              Transform your design vision with AI-powered generation and
              moodboard inspiration.
            </p>
            <div className='flex space-x-4 items-center'>
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className='text-gray-400 hover:text-white transition-colors'
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}>
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d={social.icon}
                    />
                  </svg>
                </motion.a>
              ))}
              <motion.button
                onClick={toggleTheme}
                className='text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5'
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label='Toggle theme'>
                {theme === "dark" ? (
                  <Sun className='w-6 h-6' />
                ) : (
                  <Moon className='w-6 h-6' />
                )}
              </motion.button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className='text-white font-semibold mb-4 capitalize'>
                {category}
              </h3>
              <ul className='space-y-3'>
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-gray-400 hover:text-white transition-colors'>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-white/10'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-sm mb-4 md:mb-0'>
              © {new Date().getFullYear()} Compass. All rights reserved.
            </p>
            <div className='flex items-center space-x-6 text-sm text-gray-400'>
              <motion.a
                href='#'
                className='hover:text-white transition-colors'
                whileHover={{ y: -2 }}>
                Privacy Policy
              </motion.a>
              <motion.a
                href='#'
                className='hover:text-white transition-colors'
                whileHover={{ y: -2 }}>
                Terms of Service
              </motion.a>
              <motion.a
                href='#'
                className='hover:text-white transition-colors'
                whileHover={{ y: -2 }}>
                Cookie Policy
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
