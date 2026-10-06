'use client';

import React from 'react';
import { Plus, Upload, Calendar as CalendarIcon, Star } from 'lucide-react';
import { KnowledgeItem } from '@/lib/types';

interface KnowledgeTableProps {
  items: KnowledgeItem[];
  onOpenItem?: (item: KnowledgeItem) => void;
}

export default function KnowledgeTable({ items, onOpenItem }: KnowledgeTableProps) {
  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Materi & Agenda Terpilih
          </h3>
          <p className="text-[11px] text-slate-500">
            Daftar kompetensi dan modul pembelajaran aktif
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

      {/* Modern Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 font-semibold text-[11px]">
              <th className="pb-1 pl-2 w-6"></th>
              <th className="pb-1">Materi / Subjek</th>
              <th className="pb-1">Status</th>
              <th className="pb-1">Tgl Mulai</th>
              <th className="pb-1">Batas Waktu</th>
              <th className="pb-1 pr-2">Pengampu</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isExecuted = item.status === 'Executed';
              const isScheduled = item.status === 'Scheduled';

              return (
                <tr
                  key={item.id}
                  onClick={() => onOpenItem && onOpenItem(item)}
                  className="bg-white/90 hover:bg-white rounded-2xl shadow-xs transition-all cursor-pointer group"
                >
                  <td className="py-2.5 pl-3 rounded-l-2xl text-slate-300 group-hover:text-amber-400">
                    <Star className="w-3.5 h-3.5" />
                  </td>
                  <td className="py-2.5 font-semibold text-slate-800">
                    <div className="truncate max-w-[180px]">{item.subject}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.nama_mapel}</div>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isExecuted
                          ? 'bg-blue-500 text-white shadow-xs'
                          : isScheduled
                          ? 'bg-rose-400 text-white shadow-xs'
                          : 'bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-500 text-[11px] font-mono">
                    {item.start_date}
                  </td>
                  <td className="py-2.5 text-slate-500 text-[11px] font-mono">
                    {item.end_date}
                  </td>
                  <td className="py-2.5 pr-3 rounded-r-2xl text-slate-700 font-medium truncate max-w-[120px]">
                    {item.assigned_user}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
