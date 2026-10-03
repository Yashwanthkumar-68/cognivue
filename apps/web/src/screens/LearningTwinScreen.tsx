import React from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Film,
  Sparkles,
  Flame,
  Clock,
  Layers
} from 'lucide-react';

export const LearningTwinScreen: React.FC = () => {
  const {
    twin,
    generateLessonForConcept,
    setScreen,
    isLoading
  } = useStudioStore();

  if (!twin) {
    return (
      <div className="p-12 text-center text-slate-400">
        <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Student Learning Twin Loaded</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Start by launching the DBMS demo or taking a diagnostic assessment.
        </p>
      </div>
    );
  }

  const conceptStates = Object.values(twin.conceptStates);
  const masteredList = conceptStates.filter(c => c.mastery >= 0.85);
  const weakList = conceptStates.filter(c => c.mastery < 0.7 && c.mastery > 0);
  const unstartedList = conceptStates.filter(c => c.mastery <= 0.2);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            Adaptive Student Model: Cognitive Digital Twin
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Alex's Learning Twin (DBMS Space)
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            LearnLens tracks your exact cognitive state across all materials: verified competencies, fragile concepts, active misconceptions, and evidence trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Last Updated: <strong className="text-slate-200">{new Date(twin.lastUpdatedAt).toLocaleTimeString()}</strong>
          </span>
        </div>
      </div>

      {/* Recommended Next Action Hero Card */}
      {twin.recommendedNextStep && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 shadow-glow-cyan mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                AI Recommended Next Pedagogical Action
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {twin.recommendedNextStep.headline}
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {twin.recommendedNextStep.reason}
              </p>
            </div>

            <button
              onClick={() =>
                generateLessonForConcept(
                  twin.recommendedNextStep.conceptId || 'c_3nf',
                  twin.recommendedNextStep.conceptName || '3NF (Third Normal Form)'
                )
              }
              disabled={isLoading}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-md transition-all disabled:opacity-50"
            >
              <Film className="w-4 h-4 fill-current" />
              <span>Launch Visual Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Mastery */}
        <div className="glass-card p-5 rounded-xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase block">Curriculum Mastery</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-cyan-400">
              {Math.round(twin.overallMastery * 100)}%
            </span>
            <span className="text-xs font-mono text-slate-500">Aggregate</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${twin.overallMastery * 100}%` }}
            />
          </div>
        </div>

        {/* Mastered Concepts */}
        <div className="glass-card p-5 rounded-xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase block">Mastered Concepts</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {masteredList.length}
            </span>
            <span className="text-xs font-mono text-slate-500">of {conceptStates.length} verified</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 font-mono">
            ER Model, 1NF, Relational Foundations
          </div>
        </div>

        {/* Fragile / Weak Areas */}
        <div className="glass-card p-5 rounded-xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase block">Fragile / Weak Areas</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-400">
              {weakList.length}
            </span>
            <span className="text-xs font-mono text-slate-500">require visual remediation</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 font-mono">
            2NF Partial Keys, 3NF Transitives
          </div>
        </div>

        {/* Active Misconceptions */}
        <div className="glass-card p-5 rounded-xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase block">Active Misconceptions</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-400">
              {twin.activeMisconceptionsCount}
            </span>
            <span className="text-xs font-mono text-slate-500">critical conflation</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 font-mono">
            Partial vs Transitive Dependency
          </div>
        </div>
      </div>

      {/* Granular Concept Mastery Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            Detailed Concept Cognitive Inventory
          </span>
          <span className="text-xs font-mono text-slate-500">Live Cognitive State</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Concept Name</th>
                <th className="pb-3 font-semibold">Mastery Score</th>
                <th className="pb-3 font-semibold">Confidence</th>
                <th className="pb-3 font-semibold">Cognitive Diagnostic Status</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {conceptStates.map((c) => {
                const isMastered = c.mastery >= 0.85;
                const isWeak = c.mastery < 0.7 && c.mastery > 0.2;
                const hasMisconception = c.misconceptions && c.misconceptions.length > 0;

                return (
                  <tr key={c.conceptId} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      {isMastered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isWeak ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{c.conceptName}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isMastered ? 'bg-emerald-400' : isWeak ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${c.mastery * 100}%` }}
                          />
                        </div>
                        <span className="text-slate-300">{Math.round(c.mastery * 100)}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">
                      {Math.round(c.confidence * 100)}%
                    </td>
                    <td className="py-3">
                      {hasMisconception ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Misconception: {c.misconceptions[0]}
                        </span>
                      ) : isMastered ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Sound Mental Model
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Partial Understanding
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => generateLessonForConcept(c.conceptId, c.conceptName)}
                        className="text-cyan-400 hover:text-cyan-300 underline font-medium flex items-center gap-1"
                      >
                        Teach Visually <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
