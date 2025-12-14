'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Show sticky CTA when scrolled past 100px
    setIsVisible(latest > 100);
  });

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 md:bottom-auto md:right-6 md:top-24 z-50"
    >
      <Link href="/services/add" className="relative group block">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200" />
        <div className="relative flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-primary/25 min-h-[48px]">
          <span>Track Free</span>
          <ArrowRight size={16} />
        </div>
      </Link>
    </motion.div>
  );
}

