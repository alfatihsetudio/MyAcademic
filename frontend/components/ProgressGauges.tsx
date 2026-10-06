'use client';

import React from 'react';
import { Plus, Upload, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface ProgressGaugesProps {
  stats: DashboardStats;
}

export default function ProgressGauges({ stats }: ProgressGaugesProps) {
  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Statistik Progres Akademik
          </h3>
          <p className="text-[11px] text-slate-500">
            Performa ketuntasan tugas dan ketercapaian belajar
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
            <Upload className="w-3 h-3" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
            <CalendarIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2 Big Semi-Circular Donut Gauges */}
      <div className="grid grid-cols-2 gap-4 my-auto pt-2">
        {/* Gauge 1: Executed (Blue) */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-24 flex items-end justify-center">
            {/* SVG Arc Gauge */}
            <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Active Blue Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="14"
                strokeDasharray="125"
                strokeDashoffset="35"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Top Indicator Number */}
            <div className="absolute top-0 text-sm font-extrabold text-slate-800">
              {stats.executed_count || 5}
            </div>

            {/* Bottom Inner Label inside semi-circle */}
            <div className="absolute bottom-1 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
              Executed
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-2">
            Tuntas Dinilai
          </span>
        </div>

        {/* Gauge 2: Active (Coral/Rose) */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-24 flex items-end justify-center">
            {/* SVG Arc Gauge */}
            <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Active Coral Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#fb7185"
                strokeWidth="14"
                strokeDasharray="125"
                strokeDashoffset="25"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Top Indicator Number */}
            <div className="absolute top-0 text-sm font-extrabold text-slate-800">
              {stats.active_count || 7}
            </div>

            {/* Bottom Inner Label inside semi-circle */}
            <div className="absolute bottom-1 px-3 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
              Active
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-2">
            Sedang Dikerjakan
          </span>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kehadiran: <strong>{stats.attendance_rate}%</strong></span>
        </div>
        <span className="text-slate-400">Total: {stats.total_assignments} Tugas Terdaftar</span>
      </div>
    </div>
  );
}
