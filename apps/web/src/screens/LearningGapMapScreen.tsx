import React from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  Layers,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Film,
  ArrowRight,
  Sparkles,
  FileText,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export const LearningGapMapScreen: React.FC = () => {
  const {
    gaps,
    generateLessonForConcept,
    setScreen,
    isLoading
  } = useStudioStore();

  if (!gaps) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Learning Gap Map Generated</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Synthesize the knowledge graph to detect learning gaps across your materials and exam syllabus.
        </p>
      </div>
    );
  }

  const gapList = gaps.gaps || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 mb-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Signature Feature: Multimodal Gap Synthesizer
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Curriculum & Exam Learning Gap Map
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Synthesized by comparing: (A) Your uploaded notes, (B) Final exam syllabus, (C) Previous year question papers, and (D) Diagnostic answers.
          </p>
        </div>

        {/* Gap Summary Counters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            {gaps.coveredCount} Covered
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            {gaps.weakCount} Fragile
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            {gaps.missingCount} Missing from Notes
          </span>
        </div>
      </div>

      {/* Prioritization Formula Info */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 mb-6 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-slate-200 font-bold">Composite Gap Priority Formula: </span>
          <span className="text-cyan-300">(Prereq Importance × 35%)</span> +{' '}
          <span className="text-violet-300">(Exam Relevance × 35%)</span> +{' '}
          <span className="text-rose-300">(Student Weakness × 20%)</span> +{' '}
          <span className="text-amber-300">(Source Scarcity × 10%)</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Ranked from highest risk to lowest
        </div>
      </div>

      {/* Prioritized Gaps Grid */}
      <div className="space-y-4">
        {gapList.map((gap, index) => {
          const isMissing = gap.status === 'missing';
          const isWeak = gap.status === 'weak';
          const isCovered = gap.status === 'covered';

          return (
            <div
              key={gap.id}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                index === 0
                  ? 'border-rose-500/50 shadow-glow-cyan bg-slate-900/90'
                  : isMissing
                  ? 'border-rose-500/30'
                  : isWeak
                  ? 'border-amber-500/30'
                  : 'border-slate-800 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-slate-500">#{index + 1}</span>
                    {isCovered ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Covered
                      </span>
                    ) : isWeak ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Weak Area
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1 font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        Missing in Material
                      </span>
                    )}

                    <h3 className="text-lg font-bold text-white">{gap.conceptName}</h3>
                  </div>

                  {/* Evidence & Action */}
                  <div className="mt-3 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-slate-500 uppercase text-[10px] shrink-0 mt-0.5">Evidence:</span>
                      <p className="italic text-slate-300">{gap.primaryEvidence}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400 uppercase text-[10px] shrink-0 mt-0.5">Recommendation:</span>
                      <p className="text-slate-200 font-medium">{gap.actionRecommendation}</p>
                    </div>
                  </div>

                  {/* Source citations */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Supporting Sources:</span>
                    {gap.sourceReferences.map((ref, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Column & CTA */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800 gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Priority Index</span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        gap.priorityScore >= 80 ? 'text-rose-400' : gap.priorityScore >= 50 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {gap.priorityScore} / 100
                    </span>
                  </div>

                  <button
                    onClick={() => generateLessonForConcept(gap.conceptId, gap.conceptName)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase font-mono flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Film className="w-3.5 h-3.5 fill-current" />
                    <span>Generate Lesson</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
