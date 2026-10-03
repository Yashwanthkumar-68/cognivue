import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  FileText,
  Upload,
  Plus,
  Layers,
  Sparkles,
  ArrowRight,
  FileCheck,
  Code,
  Image as ImageIcon,
  PenTool,
  HelpCircle,
  Film
} from 'lucide-react';
import { SourceType } from '@learnlens/schemas';

export const SourceImportScreen: React.FC = () => {
  const {
    sources,
    spaceTitle,
    loadDemoBenchmark,
    setScreen,
    isLoading
  } = useStudioStore();

  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'visual' | 'code' | 'exams'>('all');

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'handwritten':
        return <PenTool className="w-4 h-4 text-rose-400" />;
      case 'diagram':
      case 'image':
      case 'screenshot':
        return <ImageIcon className="w-4 h-4 text-violet-400" />;
      case 'code':
        return <Code className="w-4 h-4 text-cyan-400" />;
      case 'question_paper':
      case 'assignment':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'pptx':
      case 'pdf':
      default:
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'handwritten':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'diagram':
        return 'bg-violet-500/10 text-violet-300 border-violet-500/30';
      case 'code':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'question_paper':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Unrestricted Multi-Source Ingestion Workspace
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {spaceTitle} — Source Repository
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            LearnLens eliminates the single-textbook assumption. Combine PDFs, lecture slide decks, student handwritten derivations, ER diagrams, SQL code, and university exam papers in one unified space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDemoBenchmark()}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase font-mono shadow-sm transition-all disabled:opacity-50"
          >
            Load 6 Pre-Configured Sources
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((src) => (
          <div
            key={src.id}
            className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono border uppercase font-bold flex items-center gap-1 ${getBadgeColor(src.type)}`}>
                  {getSourceIcon(src.type)}
                  {src.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {src.originalFilename}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-3 leading-snug">
                {src.title}
              </h3>

              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {src.summary}
              </p>

              {/* Visual regions count if extracted */}
              {src.visualRegions && src.visualRegions.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-violet-300 bg-violet-950/40 p-2 rounded-lg border border-violet-900/60">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>Gemma 4 extracted {src.visualRegions.length} visual anchor regions</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{src.pageOrSlideCount ? `${src.pageOrSlideCount} Pages/Slides` : 'Full Ingestion'}</span>
              <button
                onClick={() => setScreen('gemma_analysis')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                Inspect Vision <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Source Drag & Drop Mock Card */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center justify-center text-center text-slate-400 min-h-[220px]">
          <Upload className="w-8 h-8 text-slate-600 mb-2" />
          <div className="text-sm font-bold text-slate-300">Drop additional material here</div>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Supports PDF, PPTX, Images, Handwritten notes, Audio, Code, Web URLs
          </p>
          <button
            onClick={() => loadDemoBenchmark()}
            className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300"
          >
            + Add Source
          </button>
        </div>
      </div>

      {/* Next Step Banner */}
      <div className="mt-10 p-6 glass-panel rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-white">All sources ready for processing?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Gemma 4 will analyze visual regions, equations, and question patterns; the Open-Source AI will link concepts.
          </p>
        </div>

        <button
          onClick={() => setScreen('gemma_analysis')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase font-mono shadow-glow-cyan flex items-center gap-1.5"
        >
          <span>Run Gemma 4 Multimodal Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
