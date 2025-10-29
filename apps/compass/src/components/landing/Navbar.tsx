"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAVBAR_LINKS } from "./constants";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{
        y: isScrolled ? 8 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed left-0  right-0 z-50 transition-all duration-300 ${
        isScrolled ? "top-2" : "top-0"
      }`}>
      <div
        className={`mx-auto transition-all duration-300 ${
          isScrolled
            ? "max-w-6xl px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-white/5"
            : "max-w-7xl px-4 sm:px-6 lg:px-8 bg-transparent"
        }`}>
        <div
          className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? "h-14" : "h-16"
          }`}>
          <motion.a
            href='/'
            className='flex items-center space-x-2'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            <svg
              className='w-8 h-8 text-gray-900 dark:text-white'
              viewBox='0 0 40 40'
              fill='none'>
              <motion.path
                d='M20 5L35 15V25L20 35L5 25V15L20 5Z'
                stroke='currentColor'
                strokeWidth='2'
                fill='none'
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.circle
                cx='20'
                cy='20'
                r='5'
                fill='currentColor'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </svg>
            <span className='text-xl font-bold text-gray-900 dark:text-white'>
              Compass
            </span>
          </motion.a>

          <div className='hidden md:flex items-center space-x-8'>
            {NAVBAR_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className='text-gray-900 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group'>
                {link.name}
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 dark:bg-white transition-all group-hover:w-full' />
              </a>
            ))}
          </div>

          <div className='hidden md:flex items-center space-x-4'>
            {isLoggedIn ? (
              <motion.a
                href='/projects'
                className='px-6 py-2 rounded-full font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                Projects
              </motion.a>
            ) : (
              <>
                <motion.a
                  href='/auth/signin'
                  className='text-gray-900 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  Sign In
                </motion.a>
                <motion.a
                  href='/auth/signup'
                  className='px-6 py-2 rounded-full font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-90 transition-colors'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  Sign Up
                </motion.a>
              </>
            )}
          </div>

          <button
            className='md:hidden text-gray-900 dark:text-white'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-white/10'>
            <div className='px-4 py-4 space-y-4'>
              {NAVBAR_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className='block text-gray-900 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </a>
              ))}
              <div className='pt-4 space-y-2'>
                {isLoggedIn ? (
                  <a
                    href='/projects'
                    className='block px-6 py-2 bg-gray-900 text-white dark:bg-white dark:text-black rounded-full text-center font-medium'>
                    Projects
                  </a>
                ) : (
                  <>
                    <a
                      href='/auth/signin'
                      className='block px-6 py-2 text-center text-gray-900 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'>
                      Sign In
                    </a>
                    <a
                      href='/auth/signup'
                      className='block px-6 py-2 text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full text-center font-medium'>
                      Sign Up
                    </a>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
