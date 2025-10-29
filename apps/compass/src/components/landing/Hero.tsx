"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className='relative mt-14 min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black'>
      <div className='absolute inset-0 overflow-hidden'>
        <svg className='absolute w-full h-full opacity-20'>
          <defs>
            <pattern
              id='grid'
              width='40'
              height='40'
              patternUnits='userSpaceOnUse'>
              <motion.path
                d='M 40 0 L 0 0 0 40'
                fill='none'
                stroke='currentColor'
                className='text-gray-200 dark:text-white/20'
                strokeWidth='0.5'
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#grid)' />
        </svg>
      </div>

      {/* Floating Orbs */}
      <motion.div
        className='absolute w-96 h-96 rounded-full blur-3xl bg-black/5 dark:bg-white/5'
        animate={{
          x: mousePosition.x / 50,
          y: mousePosition.y / 50,
        }}
        transition={{ type: "spring", damping: 30 }}
        style={{ left: "10%", top: "20%" }}
      />
      <motion.div
        className='absolute w-96 h-96 rounded-full blur-3xl bg-black/10 dark:bg-white/5'
        animate={{
          x: -mousePosition.x / 50,
          y: -mousePosition.y / 50,
        }}
        transition={{ type: "spring", damping: 30 }}
        style={{ right: "10%", bottom: "20%" }}
      />

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>
          <motion.h1
            className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-4'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}>
            Design with
            <motion.span
              className='block bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent'
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200%" }}>
              AI Vision
            </motion.span>
          </motion.h1>

          {/* Subtle accent underline */}
          <motion.div
            className='mx-auto mb-8 h-1 w-24 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500'
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          />

          <motion.p
            className='text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}>
            Transform raw diagrams into stunning designs. Add inspirations to
            your moodboard and let AI bring your vision to life.
          </motion.p>

          <motion.div
            className='flex flex-col sm:flex-row gap-4 justify-center items-center'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}>
            <motion.a
              href='/auth/signup'
              className='px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full font-semibold text-lg transition-colors shadow-sm hover:opacity-90'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              Get Started Free
            </motion.a>
            <motion.a
              href='#features'
              className='px-8 py-4 border border-gray-300 dark:border-white/30 text-gray-900 dark:text-white rounded-full font-semibold text-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              See How It Works
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Animated Diagram Illustration */}
        <motion.div
          className='mt-20'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}>
          <svg
            className='w-full max-w-4xl mx-auto h-64'
            viewBox='0 0 800 300'
            fill='none'>
            {/* Diagram Lines */}
            <motion.path
              d='M100 150 L300 100'
              className='stroke-gray-300 dark:stroke-white/30'
              strokeWidth='2'
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ delay: 1, duration: 1 }}
            />
            <motion.path
              d='M300 100 L500 150'
              className='stroke-gray-300 dark:stroke-white/30'
              strokeWidth='2'
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ delay: 1.2, duration: 1 }}
            />
            <motion.path
              d='M500 150 L700 100'
              className='stroke-gray-300 dark:stroke-white/30'
              strokeWidth='2'
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ delay: 1.4, duration: 1 }}
            />

            {/* Nodes */}
            {[100, 300, 500, 700].map((x, i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={i % 2 === 0 ? 150 : 100}
                r='20'
                className='fill-white dark:fill-white/10 stroke-gray-300 dark:stroke-white/20'
                strokeWidth='1'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
