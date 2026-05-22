'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Database, Mail, Wifi, WifiOff, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function DiagnosticoPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDiagnostico = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/diagnostico`, { cache: 'no-store' });
      const result = await res.json();
      setData(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiagnostico();
  }, []);

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
      ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {label}
    </span>
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Diagnóstico del Sistema</h1>
            <p className="text-[#6B7280] text-sm mt-1">Verifica el estado de conexión con todos los servicios externos.</p>
          </div>
          <button
            onClick={() => fetchDiagnostico(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Verificando...' : 'Re-verificar'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1565C0] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notion Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Database size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">Notion API</h2>
                    <p className="text-xs text-[#6B7280]">Base de datos principal</p>
                  </div>
                </div>
                <StatusBadge ok={data?.notion?.success} label={data?.notion?.success ? 'Conectado' : 'Error'} />
              </div>
              {data?.notion?.success ? (
                <div className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-100">
                  <p className="text-sm font-medium">Bot conectado: <strong>{data.notion.bot}</strong></p>
                  <p className="text-xs text-green-600 mt-1">Bases de datos de asegurados, pólizas y alertas accesibles.</p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100">
                  <p className="text-sm font-medium">Error: {data?.notion?.reason}</p>
                  <p className="text-xs text-red-600 mt-1">Verifica que NOTION_TOKEN sea correcto en el archivo .env</p>
                </div>
              )}
            </motion.div>

            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">Servicio de Email</h2>
                    <p className="text-xs text-[#6B7280]">Notificaciones SMTP</p>
                  </div>
                </div>
                <StatusBadge ok={data?.email?.configurado} label={data?.email?.configurado ? 'Configurado' : 'Fallback'} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 font-medium">Estado SMTP</span>
                  {data?.email?.configurado ? (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">SMTP Real</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Ethereal (Demo)</span>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 font-medium">Destino Hospital</span>
                  <span className="text-xs font-bold text-[#111827]">{data?.email?.destinoHospital}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 font-medium">Destino Gestor</span>
                  <span className="text-xs font-bold text-[#111827]">{data?.email?.destinoGestor}</span>
                </div>
              </div>
              {data?.email?.fallbackEthereal && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-700">Modo Demo</span>
                  </div>
                  <p className="text-xs text-amber-600">
                    Servidor Ethereal activo. Los links de correo aparecerán en la consola del backend.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Backend Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Wifi size={24} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">Conectividad del Backend</h2>
                  <p className="text-xs text-[#6B7280]">Estado del servidor Express + Socket.IO</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-green-800">API REST</p>
                  <p className="text-[10px] text-green-600">Operativo</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-green-800">Socket.IO</p>
                  <p className="text-[10px] text-green-600">Tiempo Real</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-green-800">Agente IA</p>
                  <p className="text-[10px] text-green-600">Groq API</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
