import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Film,
  RotateCcw,
  Zap
} from 'lucide-react';
import { SemanticEvaluation } from '@learnlens/schemas';

export const MisconceptionCenterScreen: React.FC = () => {
  const {
    diagnostics,
    submitDiagnosticAnswer,
    assessments,
    generateLessonForConcept,
    twin,
    isLoading
  } = useStudioStore();

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [studentAnswerText, setStudentAnswerText] = useState<string>('');
  const [latestEvaluation, setLatestEvaluation] = useState<SemanticEvaluation | null>(
    assessments.length > 0 ? assessments[assessments.length - 1] : null
  );

  const activeQuestion = diagnostics[selectedQuestionIndex] || {
    id: 'diag_q1',
    conceptId: 'c_3nf',
    conceptName: '3NF (Third Normal Form)',
    questionText: 'What is the precise fundamental difference between a Second Normal Form (2NF) violation and a Third Normal Form (3NF) violation?',
    contextSnippet: 'Consider relation StudentCourse(StudentID, CourseID, Instructor, OfficeRoom) where (StudentID, CourseID) is the primary key.',
    difficulty: 'medium'
  };

  const loadMisconceptionPreset = () => {
    setStudentAnswerText(
      'In both 2NF and 3NF, attributes are not fully dependent on the key. 2NF removes partial dependency, but transitive dependency is basically the same thing when a non-key determines another non-key, so partial implies transitive.'
    );
  };

  const loadMasteredPreset = () => {
    setStudentAnswerText(
      '2NF strictly eliminates partial dependencies: where a non-prime attribute depends on only a proper subset of a composite candidate key. 3NF eliminates transitive dependencies: where a non-prime attribute depends on another non-prime attribute through a non-key bridge (X -> Y and Y -> Z). 2NF requires a composite key to be violated, whereas 3NF can occur even with a single-attribute key.'
    );
  };

  const handleSubmit = async () => {
    if (!studentAnswerText.trim()) return;
    const evalResult = await submitDiagnosticAnswer(activeQuestion.id, studentAnswerText);
    if (evalResult) {
      setLatestEvaluation(evalResult);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Signature Feature: Open-Source AI Misconception Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Diagnostic Misconception Center
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            We don't use simple keyword matching or MCQ quizzes. Our open-weight reasoning layer performs deep semantic analysis of student reasoning to distinguish between partial understanding and core conceptual misconceptions.
          </p>
        </div>

        {/* Learning Twin Status Mini Card */}
        {twin && (
          <div className="glass-card p-3 rounded-xl border border-slate-800 flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">STUDENT MASTERY</span>
              <span className="text-base font-bold text-cyan-400">{Math.round(twin.overallMastery * 100)}%</span>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px]">ACTIVE MISCONCEPTIONS</span>
              <span className="text-base font-bold text-rose-400">{twin.activeMisconceptionsCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Diagnostic Question & Response Area */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Question Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {diagnostics.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestionIndex(idx);
                  setStudentAnswerText('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedQuestionIndex === idx
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Question {idx + 1}: {q.conceptName}
              </button>
            ))}
          </div>

          {/* Active Question Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-cyan-400">Concept: {activeQuestion.conceptName}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase text-[10px]">
                {activeQuestion.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white leading-snug">
              {activeQuestion.questionText}
            </h3>

            {activeQuestion.contextSnippet && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-mono text-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase">Context Scenario:</span>
                {activeQuestion.contextSnippet}
              </div>
            )}

            {/* Presets for Testing */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <span className="text-xs font-mono text-slate-400 block mb-2">
                Simulate Student Response (or type your own below):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={loadMisconceptionPreset}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Load Misconception Response
                </button>
                <button
                  onClick={loadMasteredPreset}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Load Mastered Response
                </button>
              </div>
            </div>

            {/* Textarea Input */}
            <div className="mt-4">
              <textarea
                value={studentAnswerText}
                onChange={(e) => setStudentAnswerText(e.target.value)}
                placeholder="Type your explanation here. Feel free to explain in your own words..."
                rows={5}
                className="w-full glass-input rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !studentAnswerText.trim()}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Diagnose Semantics with Open-Source AI</span>
            </button>
          </div>
        </div>

        {/* Right Column: Semantic Evaluation & Learning Twin Update */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {latestEvaluation ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/80">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Semantic Cognitive Diagnosis
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {latestEvaluation.conceptName}
                  </h3>
                </div>
                {latestEvaluation.hasMisconception ? (
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    Misconception Detected
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Concept Mastered
                  </span>
                )}
              </div>

              {/* 3 Categories: Understood, Partial, Misconception */}
              <div className="mt-5 space-y-4">
                {/* Understood */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    Understood Correctly:
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-slate-200">
                    {latestEvaluation.understood.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Partially Understood */}
                {latestEvaluation.partiallyUnderstood.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      Partially Understood:
                    </span>
                    <ul className="mt-2 space-y-1 text-xs text-slate-200">
                      {latestEvaluation.partiallyUnderstood.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Misconceptions */}
                {latestEvaluation.misconceptions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40">
                    <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                      <Flame className="w-4 h-4" />
                      Active Misconceptions Detected:
                    </span>
                    <ul className="mt-2 space-y-1 text-xs text-rose-200 font-medium">
                      {latestEvaluation.misconceptions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">❌</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Rationale & Corrective Insight */}
              <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="font-mono text-cyan-400 block mb-1 uppercase text-[10px]">
                  Pedagogical Semantic Rationale
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {latestEvaluation.semanticAnalysisRationale}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800">
                  <span className="font-mono text-amber-400 block mb-1 uppercase text-[10px]">
                    Corrective Insight
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {latestEvaluation.correctiveInsight}
                  </p>
                </div>
              </div>

              {/* Next Step Action CTA */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="text-xs font-mono text-slate-400 mb-2">
                  Recommended Pedagogical Action:
                </div>
                <button
                  onClick={() =>
                    generateLessonForConcept(
                      latestEvaluation.recommendedNextLesson.conceptId,
                      latestEvaluation.conceptName,
                      latestEvaluation.misconceptions[0]
                    )
                  }
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
                >
                  <Film className="w-4 h-4 fill-current" />
                  <span>Generate Targeted 45s elah Lesson to Fix This Misconception</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
              <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Awaiting Student Diagnostic Input</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Submit an answer on the left or use the presets to trigger the semantic misconception evaluation engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
