import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  Flame,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Scale
} from 'lucide-react';

export const SourceConflictScreen: React.FC = () => {
  const {
    conflicts,
    generateLessonForConcept,
    setScreen,
    isLoading
  } = useStudioStore();

  const [expandedExplanation, setExpandedExplanation] = useState<boolean>(true);

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Conflicts Detected</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          All uploaded sources agree on concepts, or the knowledge graph has not yet been synthesized.
        </p>
      </div>
    );
  }

  const activeConflict = conflicts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 mb-2">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          Signature Feature: Multi-Source Contradiction & Terminology Resolver
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Source Conflict & Divergence Detector
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
          When multiple learning materials explain a topic differently, LearnLens does <strong>not</strong> silently merge or hallucinate an arbitrary answer. We surface the exact textual discrepancy and analyze whether it's a matter of <em>terminology</em>, <em>engineering context</em>, or <em>factual contradiction</em>.
        </p>
      </div>

      {/* Main Conflict Card */}
      <div className="glass-panel p-8 rounded-2xl border border-rose-500/40 shadow-glow-cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Conflict Classification: {activeConflict.conflictType.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Concept: <strong className="text-white">{activeConflict.conceptName}</strong>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">
              {activeConflict.title}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-rose-400 uppercase block">Discrepancy Severity</span>
            <span className="text-xl font-bold font-mono text-rose-400 uppercase">
              {activeConflict.severity}
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Source A: Professor Slides */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
                <span className="text-violet-400 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Source A (Classroom Lecture Deck)
                </span>
                <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Slide {activeConflict.sourceA.pageOrSlide}
                </span>
              </div>

              <div className="font-semibold text-white mt-3 text-sm">
                {activeConflict.sourceA.sourceTitle}
              </div>

              <blockquote className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 italic leading-relaxed">
                {activeConflict.sourceA.quote}
              </blockquote>

              <div className="mt-4 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] block">Claim Asserted:</span>
                <p className="text-violet-300 font-medium mt-0.5">
                  {activeConflict.sourceA.claim}
                </p>
              </div>
            </div>
          </div>

          {/* Source B: Standard Textbook */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Source B (Academic Textbook)
                </span>
                <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Page {activeConflict.sourceB.pageOrSlide}
                </span>
              </div>

              <div className="font-semibold text-white mt-3 text-sm">
                {activeConflict.sourceB.sourceTitle}
              </div>

              <blockquote className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 italic leading-relaxed">
                {activeConflict.sourceB.quote}
              </blockquote>

              <div className="mt-4 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] block">Claim Asserted:</span>
                <p className="text-cyan-300 font-medium mt-0.5">
                  {activeConflict.sourceB.claim}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Semantic Conflict Synthesis */}
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-4">
          <div>
            <span className="font-mono text-amber-400 uppercase font-bold text-[11px] block mb-1">
              Why These Sources Diverge:
            </span>
            <p className="text-slate-300 leading-relaxed text-sm">
              {activeConflict.whyDifferent}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <span className="font-mono text-cyan-400 uppercase font-bold text-[11px] block mb-1">
              Terminology vs. Contradiction Analysis:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {activeConflict.terminologyVsContradictionAnalysis}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <span className="font-mono text-emerald-400 uppercase font-bold text-[11px] block mb-1">
              Exam Resolution Guidance & Best Practice:
            </span>
            <p className="text-emerald-200 font-medium leading-relaxed">
              {activeConflict.aiResolutionGuidance}
            </p>
            {activeConflict.examTip && (
              <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-900 font-mono">
                ★ <strong>Exam Scoring Tip:</strong> {activeConflict.examTip}
              </div>
            )}
          </div>
        </div>

        {/* CTA to teach this visual distinction */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            onClick={() => generateLessonForConcept('c_3nf', '3NF vs BCNF Dependency Trade-off')}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Generate Visual Lesson Explaining This Conflict in elah</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
