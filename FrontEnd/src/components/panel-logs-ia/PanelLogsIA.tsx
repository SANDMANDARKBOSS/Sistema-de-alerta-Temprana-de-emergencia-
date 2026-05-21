'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface LogMessage {
  id: string;
  tipo: 'inicio' | 'notion' | 'ia' | 'email' | 'error' | 'success';
  mensaje: string;
  timestamp: string;
}

export const PanelLogsIA = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar a Socket.IO
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    socketRef.current.on('log', (data: Omit<LogMessage, 'id'>) => {
      setLogs((prev) => [...prev, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
      // Abrir panel si hay un nuevo log
      setIsOpen(true);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const getLogStyle = (tipo: string) => {
    switch (tipo) {
      case 'inicio': return { color: '#60A5FA', prefix: '🔵 WEBHOOK' };
      case 'notion': return { color: '#C084FC', prefix: '🟣 NOTION' };
      case 'ia': return { color: '#FBBF24', prefix: '🟡 AGENTE IA' };
      case 'email': return { color: '#4ADE80', prefix: '🟢 EMAIL' };
      case 'error': return { color: '#F87171', prefix: '🔴 ERROR' };
      case 'success': return { color: '#10B981', prefix: '✅ COMPLETADO' };
      default: return { color: '#9CA3AF', prefix: '⚪ INFO' };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0F172A] hover:bg-[#1E293B] text-white p-3 rounded-full shadow-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
      >
        <Terminal size={20} />
        {logs.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {logs.length > 99 ? '99+' : logs.length}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-[450px] bg-[#0F172A] rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col font-mono text-sm"
          >
            {/* Header */}
            <div className="bg-[#1E293B] px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2 text-slate-200">
                <Terminal size={16} className="text-blue-400" />
                <span className="font-bold">Terminal IA & Servidor</span>
                <span className="ml-2 text-xs flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLogs([])} className="text-slate-400 hover:text-white transition-colors" title="Limpiar logs">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="h-[300px] overflow-y-auto p-4 flex flex-col gap-2">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center mt-10 italic">No hay logs registrados...</div>
              ) : (
                logs.map((log) => {
                  const style = getLogStyle(log.tipo);
                  return (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-l-2 pl-3 py-1 bg-slate-800/30 rounded-r"
                      style={{ borderLeftColor: style.color }}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                        <span style={{ color: style.color }} className="font-bold">{style.prefix}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString('es-CO')}</span>
                      </div>
                      <div className="text-slate-300 whitespace-pre-wrap">{log.mensaje}</div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
