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
    <section id='pricing' className='py-24 bg-black relative overflow-hidden'>
      <div
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'
        ref={ref}>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}>
          <h2 className='text-4xl sm:text-5xl font-bold text-white mb-4'>
            Simple, Transparent Pricing
          </h2>
          <p className='text-xl text-gray-400 max-w-2xl mx-auto'>
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative ${plan.popular ? "md:-mt-4" : ""}`}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -10 }}>
              {plan.popular && (
                <motion.div
                  className='absolute -top-5 left-0 right-0 text-center'
                  initial={{ opacity: 0, y: -10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.5 }}>
                  <span className='bg-white text-black px-4 py-1 rounded-full text-sm font-semibold'>
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div
                className={`relative p-8 rounded-2xl backdrop-blur-sm overflow-hidden ${
                  plan.popular
                    ? "bg-white/10 border-2 border-white"
                    : "bg-white/5 border border-white/10"
                }`}>
                {/* Background Animation */}
                {plan.popular && (
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent'
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}

                <div className='relative z-10'>
                  <h3 className='text-2xl font-bold text-white mb-2'>
                    {plan.name}
                  </h3>
                  <div className='mb-6'>
                    <span className='text-5xl font-bold text-white'>
                      {plan.price}
                    </span>
                    <span className='text-gray-400 ml-2'>/ {plan.period}</span>
                  </div>

                  <ul className='space-y-4 mb-8'>
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className='flex items-start text-gray-300'
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          delay: index * 0.2 + i * 0.1,
                          duration: 0.5,
                        }}>
                        <svg
                          className='w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0'
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
                    className={`w-full py-3 rounded-full font-semibold transition-colors ${
                      plan.popular
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
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
