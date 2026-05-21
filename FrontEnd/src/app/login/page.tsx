'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-[#3B82F6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(59,130,246,0.5)]">
          <div className="w-10 h-10 border-2 border-white relative rounded-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-white absolute"></div>
              <div className="h-6 w-0.5 bg-white absolute"></div>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Alertas Salud</h1>
        <p className="text-slate-400 text-sm">Sistema de Alerta Temprana</p>
        
        <div className="mt-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </motion.div>
    </div>
  );
}
