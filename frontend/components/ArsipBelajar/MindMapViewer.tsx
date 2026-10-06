'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  GitFork,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateArsipMindmap } from '@/lib/api';

interface MindmapNode {
  name: string;
  children?: MindmapNode[];
}

interface MindMapViewerProps {
  noteId: number;
  initialMindmap: MindmapNode | null;
  onUpdated?: (mindmap: MindmapNode) => void;
}

export default function MindMapViewer({
  noteId,
  initialMindmap,
  onUpdated,
}: MindMapViewerProps) {
  const [mindmap, setMindmap] = useState<MindmapNode | null>(initialMindmap);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({
    root: true,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateArsipMindmap(noteId);
      if (res.success && res.mindmap) {
        setMindmap(res.mindmap);
        // Expand top-level nodes by default
        const initExpand: Record<string, boolean> = { root: true };
        if (res.mindmap.children) {
          res.mindmap.children.forEach((_: any, idx: number) => {
            initExpand[`root-${idx}`] = true;
          });
        }
        setExpandedPaths(initExpand);
        if (onUpdated) onUpdated(res.mindmap);
        toast.success('Peta Pikiran AI berhasil dibuat!');
        if (res.ai_warning) {
          toast(res.ai_warning, { icon: 'ℹ️' });
        }
      } else {
        toast.error('Gagal membuat peta pikiran.');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memproses peta pikiran.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleNode = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = { root: true };
    const traverse = (node: MindmapNode, currentPath: string) => {
      all[currentPath] = true;
      if (node.children) {
        node.children.forEach((c, idx) => traverse(c, `${currentPath}-${idx}`));
      }
    };
    if (mindmap) traverse(mindmap, 'root');
    setExpandedPaths(all);
  };

  const collapseAll = () => {
    setExpandedPaths({ root: true });
  };

  // Recursive Tree Node Renderer
  const renderNode = (node: MindmapNode, path: string, depth: number = 0) => {
    const isExpanded = expandedPaths[path] ?? true;
    const hasChildren = node.children && node.children.length > 0;

    // Depth styles
    const depthStyles = [
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 text-sm font-bold',
      'bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold hover:bg-emerald-100',
      'bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium hover:bg-slate-100',
      'bg-white text-slate-600 border border-slate-100 text-[11px]',
    ];

    const currentStyle = depthStyles[Math.min(depth, depthStyles.length - 1)];

    return (
      <div key={path} className="relative pl-6 sm:pl-8 my-2">
        {/* Connector Lines */}
        {depth > 0 && (
          <>
            <div className="absolute left-0 top-4 w-6 sm:w-8 border-t-2 border-dashed border-emerald-300" />
            <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dashed border-emerald-300" />
          </>
        )}

        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              onClick={() => toggleNode(path)}
              className="w-5 h-5 rounded-md bg-white border border-emerald-300 text-emerald-700 flex items-center justify-center hover:bg-emerald-50 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}

          <div
            onClick={() => hasChildren && toggleNode(path)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition-all select-none ${
              hasChildren ? 'cursor-pointer' : ''
            } ${currentStyle}`}
          >
            {depth === 0 && <span className="text-base">🎯</span>}
            {depth === 1 && <span className="text-sm">📌</span>}
            {depth >= 2 && <span className="text-xs">🔹</span>}
            <span>{node.name}</span>
            {hasChildren && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 ml-1">
                {node.children?.length}
              </span>
            )}
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="pl-2 border-l-2 border-emerald-100 ml-2 mt-1 space-y-1 animate-in fade-in duration-200">
            {node.children!.map((child, idx) =>
              renderNode(child, `${path}-${idx}`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Pilar 3: Interactive Mind Map (Pohon Konsep Visual)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Petakan hierarki bab pelajaran secara visual untuk memahami gambaran besar dan kaitan antar konsep.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mindmap && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={expandAll}
                title="Buka Semua Cabang"
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" /> Buka
              </button>
              <button
                onClick={collapseAll}
                title="Tutup Semua Cabang"
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Minimize2 className="w-3 h-3" /> Tutup
              </button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Membuat Peta Pikiran...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{mindmap ? 'Regenerate Peta Pikiran' : 'Hasilkan Mind Map AI'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!mindmap ? (
        <div className="py-12 px-6 rounded-3xl bg-slate-50/80 border border-dashed border-slate-200 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Belum ada Peta Pikiran</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Biarkan AI memetakan materi catatan ini menjadi pohon konsep visual yang terstruktur dan mudah dijelajahi.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Sedang Memproses...' : 'Petakan Materi dengan AI'}</span>
          </button>
        </div>
      ) : (
        /* Visual Tree Canvas */
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="min-w-[450px]">
            {renderNode(mindmap, 'root', 0)}
          </div>
        </div>
      )}
    </div>
  );
}
