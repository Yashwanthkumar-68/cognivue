import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  FileText,
  AlertTriangle,
  Film,
  HelpCircle,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export const ExamModeScreen: React.FC = () => {
  const {
    spaceTitle,
    generateLessonForConcept,
    setScreen,
    isLoading
  } = useStudioStore();

  const [studyHoursAvailable, setStudyHoursAvailable] = useState<number>(12);
  const [examDate, setExamDate] = useState<string>('2026-10-15');

  const examPathSteps = [
    {
      step: 1,
      phase: 'Diagnostic Probe',
      concept: '2NF vs 3NF Dependency Types',
      marks: '10 Marks',
      evidenceSource: '2024 End-Sem Exam Q4(a)',
      status: 'action_required',
      action: 'Diagnose Misconception',
      screenTarget: 'misconception_center'
    },
    {
      step: 2,
      phase: 'Visual Remediation',
      concept: 'Transitive Dependency Elimination',
      marks: '10 Marks',
      evidenceSource: 'Silberschatz Ch 8 & Prof. Vance Slide 22',
      status: 'pending',
      action: 'Watch 45s elah Lesson',
      screenTarget: 'lesson_editor'
    },
    {
      step: 3,
      phase: 'Contradiction Clarity',
      concept: '3NF vs BCNF Dependency Preservation',
      marks: '8 Marks',
      evidenceSource: 'Exam Tip: Examiners test preservation tradeoff',
      status: 'pending',
      action: 'Review Conflict Guide',
      screenTarget: 'conflict_viewer'
    },
    {
      step: 4,
      phase: 'Algorithmic Proof',
      concept: 'Lossless-Join Intersection Theorem',
      marks: '8 Marks',
      evidenceSource: '2024 End-Sem Exam Q4(b)',
      status: 'pending',
      action: 'Study Derivation Path',
      screenTarget: 'knowledge_graph'
    },
    {
      step: 5,
      phase: 'Active Recall Sprint',
      concept: 'Decomposition Rapid Test',
      marks: 'Total 36 Marks Target',
      evidenceSource: 'Exam Simulation',
      status: 'locked',
      action: 'Final Practice Test',
      screenTarget: 'misconception_center'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            University Exam Target Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Targeted Exam Preparation Roadmap
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Grounded entirely in your uploaded university question papers and professor syllabus. No arbitrary priority claims—every recommended step cites actual exam marks.
          </p>
        </div>

        {/* Inputs for time and date */}
        <div className="flex items-center gap-3">
          <div className="glass-card p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block text-[10px] uppercase">Available Prep Time:</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={studyHoursAvailable}
                onChange={(e) => setStudyHoursAvailable(parseInt(e.target.value, 10) || 0)}
                className="w-14 bg-slate-900 border border-slate-700 text-cyan-400 font-bold px-2 py-0.5 rounded text-sm text-center"
              />
              <span className="text-slate-300">Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Exam Path */}
      <div className="space-y-4">
        {examPathSteps.map((s) => (
          <div
            key={s.step}
            className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-cyan-400 shrink-0 text-base">
                {s.step}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">{s.phase}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
                    {s.marks}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1">{s.concept}</h3>

                <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exam Citation: <strong>{s.evidenceSource}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (s.screenTarget === 'lesson_editor') {
                  generateLessonForConcept('c_3nf', s.concept);
                } else {
                  setScreen(s.screenTarget as any);
                }
              }}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase font-mono shadow-sm flex items-center gap-2 shrink-0 transition-all"
            >
              <span>{s.action}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
