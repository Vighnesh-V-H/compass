"use client";

import { motion } from "framer-motion";

import { FOOTER_LINKS, SOCIAL_LINKS } from "./constants";
import { ThemeToggle } from "../theme-toggle";

export default function Footer() {
  return (
    <footer className='bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10 pt-16 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-2 md:grid-cols-6 gap-8 mb-12'>
          <div className='col-span-2'>
            <motion.div
              className='flex items-center space-x-2 mb-4'
              whileHover={{ scale: 1.05 }}>
              <svg
                className='w-8 h-8 text-gray-900 dark:text-white'
                viewBox='0 0 40 40'
                fill='none'>
                <path
                  d='M20 5L35 15V25L20 35L5 25V15L20 5Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                />
                <circle cx='20' cy='20' r='5' fill='currentColor' />
              </svg>
              <span className='text-xl font-bold text-gray-900 dark:text-white'>
                Compass
              </span>
            </motion.div>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Transform your design vision with AI-powered generation and
              moodboard inspiration.
            </p>
            <div className='flex space-x-4 items-center'>
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
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
              <ThemeToggle />
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className='text-gray-900 dark:text-white font-semibold mb-4 capitalize'>
                {category}
              </h3>
              <ul className='space-y-3'>
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='pt-8 border-t border-gray-200 dark:border-white/10'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0'>
              © {new Date().getFullYear()} Compass. All rights reserved.
            </p>
            <div className='flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400'>
              <motion.a
                href='#'
                className='hover:text-gray-900 dark:hover:text-white transition-colors'
                whileHover={{ y: -2 }}>
                Privacy Policy
              </motion.a>
              <motion.a
                href='#'
                className='hover:text-gray-900 dark:hover:text-white transition-colors'
                whileHover={{ y: -2 }}>
                Terms of Service
              </motion.a>
              <motion.a
                href='#'
                className='hover:text-gray-900 dark:hover:text-white transition-colors'
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
