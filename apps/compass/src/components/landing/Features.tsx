"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FEATURES } from "./constants";

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id='features' className='py-24 bg-black relative overflow-hidden'>
      <div className='absolute inset-0'>
        <motion.div
          className='absolute w-96 h-96 bg-white/5 rounded-full blur-3xl'
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ left: "20%", top: "30%" }}
        />
      </div>

      <div
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'
        ref={ref}>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}>
          <h2 className='text-4xl sm:text-5xl font-bold text-white mb-4'>
            Powerful Features
          </h2>
          <p className='text-xl text-gray-400 max-w-2xl mx-auto'>
            Everything you need to turn your creative vision into reality
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className='group relative'
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.02 }}>
              <div className='relative p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden'>
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity'
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                <div className='relative z-10'>
                  {/* Icon */}
                  <motion.div
                    className='mb-4'
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}>
                    <svg
                      className='w-12 h-12 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d={feature.icon}
                      />
                    </svg>
                  </motion.div>

                  <h3 className='text-2xl font-bold text-white mb-3'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-400'>{feature.description}</p>

                  <motion.div
                    className='mt-6 h-0.5 bg-white'
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className='mt-20'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}>
          <div className='border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm'>
            <h3 className='text-3xl font-bold text-white mb-8 text-center'>
              See It In Action
            </h3>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {["Upload Diagram", "Add Inspiration", "Generate Design"].map(
                (step, i) => (
                  <motion.div
                    key={i}
                    className='relative'
                    initial={{ opacity: 0, x: -30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1 + i * 0.2, duration: 0.6 }}>
                    <div className='bg-white/10 rounded-xl p-6 h-full'>
                      <div className='flex items-center mb-4'>
                        <motion.div
                          className='w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold'
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ delay: 1.5 + i * 0.2, duration: 0.5 }}>
                          {i + 1}
                        </motion.div>
                        <h4 className='ml-4 text-xl font-semibold text-white'>
                          {step}
                        </h4>
                      </div>
                      <div className='h-32 bg-white/5 rounded-lg flex items-center justify-center'>
                        <motion.svg
                          className='w-16 h-16 text-white/50'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                          />
                        </motion.svg>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className='hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2'>
                        <svg
                          className='w-6 h-6 text-white/30'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
