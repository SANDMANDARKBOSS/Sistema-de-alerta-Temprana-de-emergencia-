'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import medixLogo from '../../Assets/LOGO MEDIX.jpeg';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,#0F172A_0%,#111B32_100%)] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-24 h-24 rounded-[28px] overflow-hidden mx-auto mb-6 border border-white/10 shadow-[0_20px_50px_rgba(37,99,235,0.25)]">
          <Image src={medixLogo} alt="Logo Medix" className="w-full h-full object-cover" priority />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Medix</h1>
        <p className="text-slate-300 text-sm uppercase tracking-[0.22em]">Alertas que salvan vidas</p>
        
        <div className="mt-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </motion.div>
    </div>
  );
}
