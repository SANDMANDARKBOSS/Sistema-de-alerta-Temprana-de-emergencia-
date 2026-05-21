'use client';

import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#111827] mb-6 text-center">Iniciar Sesión</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1565C0]"
              placeholder="admin@hospital.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1565C0]"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#1565C0] text-white font-bold py-2 rounded-lg hover:bg-[#0D47A1] transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
