'use client';

import React, { useState, useEffect, useRef } from 'react';
import { subscribeToLogs, getLogs, clearLogs, AutomationLog, logAutomation } from '@/lib/email';
import { useStore } from './StoreContext';
import { Terminal, Shield, Mail, Smartphone, RefreshCw, X, Trash2 } from 'lucide-react';

export default function AutomationLogger() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const { preOrderMode, togglePreOrderMode } = useStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Load existing logs and subscribe
  useEffect(() => {
    setLogs(getLogs());

    const unsubscribe = subscribeToLogs((newLog) => {
      setLogs((prev) => [...prev, newLog]);
    });

    // Seed initial message if empty
    if (getLogs().length === 0) {
      logAutomation('SYSTEM', '🛡️ VORTX Automation Engine initialized successfully. Running in sandbox demo mode.');
    }

    return () => unsubscribe();
  }, []);

  // Auto Scroll to bottom on new log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearLogs();
    setLogs([]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Logger Drawer */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-96 md:w-[450px] h-96 bg-vortx-dark border border-vortx-white/20 rounded shadow-2xl flex flex-col mb-3 glassmorphism overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-vortx-gray-dark border-b border-vortx-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-vortx-white animate-pulse" />
              <span className="font-syne text-xs font-bold tracking-wider text-vortx-white">VORTX LIVE AUTOMATION HUB</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClear}
                title="Clear Logs"
                className="p-1 hover:bg-vortx-white/10 rounded transition text-vortx-gray hover:text-vortx-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-vortx-white/10 rounded transition text-vortx-gray hover:text-vortx-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Settings Controller */}
          <div className="p-3 bg-vortx-white/5 border-b border-vortx-white/10 flex items-center justify-between gap-2 text-xs">
            <span className="text-vortx-gray font-medium">Demo Store Catalog Mode:</span>
            <button
              onClick={togglePreOrderMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-syne text-[10px] font-bold tracking-wider transition ${
                preOrderMode 
                  ? 'bg-vortx-white text-vortx-black' 
                  : 'bg-vortx-white/10 text-vortx-white hover:bg-vortx-white/20'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${preOrderMode ? 'animate-spin' : ''}`} />
              {preOrderMode ? 'PRE-ORDERS ONLY' : 'STANDARD IN-STOCK'}
            </button>
          </div>

          {/* Console Area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-3 bg-vortx-black/80">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`p-2 border rounded ${
                  log.type === 'EMAIL' 
                    ? 'border-vortx-white/10 bg-vortx-white/5 text-vortx-white' 
                    : log.type === 'WHATSAPP' 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                    : 'border-vortx-gray/10 bg-vortx-white/5 text-vortx-gray'
                }`}
              >
                <div className="flex items-center justify-between mb-1 opacity-60 text-[8px]">
                  <span className="flex items-center gap-1 font-bold">
                    {log.type === 'EMAIL' && <Mail className="w-2.5 h-2.5" />}
                    {log.type === 'WHATSAPP' && <Smartphone className="w-2.5 h-2.5" />}
                    {log.type === 'SYSTEM' && <Shield className="w-2.5 h-2.5" />}
                    {log.type}
                  </span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="break-words font-medium">{log.message}</div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center sm:justify-start gap-2 w-14 h-14 sm:w-auto sm:h-auto sm:px-4 sm:py-3 bg-vortx-white text-vortx-black hover:bg-vortx-white/95 active:scale-95 border border-vortx-white rounded-full shadow-2xl transition duration-300 font-syne text-xs font-bold tracking-widest relative overflow-hidden"
      >
        {/* Subtle scanline animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent pointer-events-none animate-scanline" />
        <Terminal className="w-4 h-4 text-vortx-black" />
        <span className="hidden sm:inline">AUTOMATION LOGS</span>
        {logs.length > 0 && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vortx-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-vortx-black"></span>
          </span>
        )}
      </button>
    </div>
  );
}
