"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { PRICING_PLANS } from "./constants";

export default function Pricing() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      id='pricing'
      className='py-24 bg-gray-50 dark:bg-black relative overflow-hidden'>
      <div
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'
        ref={ref}>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}>
          <h2 className='text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3'>
            Simple, Transparent Pricing
          </h2>
          <div className='mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500' />
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={index}
              className='relative h-full'
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.02 }}>
              {plan.popular && (
                <motion.div
                  className='absolute z-80 -top-5 left-0 right-0 text-center'
                  initial={{ opacity: 0, y: -10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.5 }}>
                  <span className='bg-gray-900 text-white dark:bg-white z-50 dark:text-black px-4 py-1 rounded-full text-sm font-semibold'>
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div
                className={`relative h-full flex flex-col p-8 rounded-2xl backdrop-blur-sm overflow-hidden ${
                  plan.popular
                    ? "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 ring-2 ring-teal-500/20 dark:ring-teal-400/20"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10"
                }`}>
                <div className='relative z-10 flex flex-col h-full'>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                    {plan.name}
                  </h3>
                  <div className='mb-6'>
                    <span className='text-5xl font-bold text-gray-900 dark:text-white'>
                      {plan.price}
                    </span>
                    <span className='text-gray-600 dark:text-gray-400 ml-2'>
                      / {plan.period}
                    </span>
                  </div>

                  <ul className='space-y-4 mb-8'>
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className='flex items-start text-gray-700 dark:text-gray-300'
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          delay: index * 0.2 + i * 0.1,
                          duration: 0.5,
                        }}>
                        <svg
                          className='w-5 h-5 text-teal-600 dark:text-teal-400 mr-3 mt-0.5 flex-shrink-0'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <motion.path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                            initial={{ pathLength: 0 }}
                            animate={inView ? { pathLength: 1 } : {}}
                            transition={{
                              delay: index * 0.2 + i * 0.1 + 0.3,
                              duration: 0.5,
                            }}
                          />
                        </svg>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    className={`mt-auto w-full py-3 rounded-full font-semibold transition-colors ${
                      plan.popular
                        ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                        : "border border-gray-300 dark:border-white/30 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    {plan.cta}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
