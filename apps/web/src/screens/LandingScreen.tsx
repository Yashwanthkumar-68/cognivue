import React from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Film,
  ScanEye,
  FileCheck,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Layers,
  Flame,
  ShieldCheck,
  Play
} from 'lucide-react';

export const LandingScreen: React.FC = () => {
  const { loadDemoBenchmark, setScreen, isLoading } = useStudioStore();

  const pipelineSteps = [
    { num: '01', title: 'Multimodal Sources', desc: 'PDF, PPTX, Handwritten Notes, ER Diagrams, SQL & Exam Papers', icon: <Layers className="w-5 h-5 text-cyan-400" /> },
    { num: '02', title: 'Gemma 4 Vision', desc: 'Identifies equations, ER entities, cardinality & questionable student steps', icon: <ScanEye className="w-5 h-5 text-violet-400" /> },
    { num: '03', title: 'Open-Weight Reasoning', desc: 'DeepSeek-R1 / Qwen2.5 builds connected DAG & links concept evidence', icon: <BrainCircuit className="w-5 h-5 text-cyan-300" /> },
    { num: '04', title: 'Diagnostic Assessment', desc: 'Asks targeted probing questions to evaluate conceptual distinction', icon: <HelpCircle className="w-5 h-5 text-amber-400" /> },
    { num: '05', title: 'Misconception Engine', desc: 'Separates Understood, Partially Understood, and Cognitive Conflations', icon: <Flame className="w-5 h-5 text-rose-400" /> },
    { num: '06', title: 'elah Visual Studio', desc: 'Generates structured integer-frame lesson & natural language editing', icon: <Film className="w-5 h-5 text-purple-400" /> },
    { num: '07', title: 'Active Recall Loop', desc: 'Immediate checkpoint quizzes reinforce the corrected mental model', icon: <FileCheck className="w-5 h-5 text-emerald-400" /> },
    { num: '08', title: 'Updated Learning Twin', desc: 'Cognitive state evolves with verified mastery and gap closure', icon: <TrendingUp className="w-5 h-5 text-cyan-400" /> }
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-violet-600/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-cyan-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hack Day 2026: Gemma 4 • Open-Weight AI • elah SDK</span>
        </div>

        {/* Core Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Your learning material is everywhere.<br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Your understanding shouldn't be.
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          LearnLens is a multimodal adaptive learning studio that accepts multiple forms of learning material,
          understands them using <span className="text-violet-300 font-medium">Gemma 4</span>,
          builds a connected knowledge model using an <span className="text-cyan-300 font-medium">open-source AI reasoning layer</span>,
          detects knowledge gaps and misconceptions, and converts explanations into interactive visual lessons using <span className="text-amber-300 font-medium">elah</span>.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => loadDemoBenchmark()}
            disabled={isLoading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-sm shadow-glow-cyan flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Launch DBMS Final Exam Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setScreen('knowledge_graph')}
            className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
          >
            <span>Explore Knowledge Studio</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Core Value Quote */}
        <div className="mt-8 text-xs font-mono text-slate-400 max-w-md bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2">
          "Don't just study your material. Let AI understand how you learn."
        </div>
      </section>

      {/* 3 Challenge Tracks in ONE Pipeline */}
      <section className="max-w-6xl mx-auto px-6 py-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">Integrated Hack Day Challenge Architecture</h2>
          <p className="text-xl font-bold text-white mt-1">Three Breakthrough Technologies in One Cognitive Loop</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Track 1 */}
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-cyan-400 mb-1">Track 1: Best Open-Source AI Project</div>
              <h3 className="text-lg font-bold text-white mb-2">Open-Source AI Reasoning Layer</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Replaces trivial RAG chat with true cognitive synthesis: concept dependency DAGs, source contradiction detection,
                semantic misconception analysis, and structured visual lesson plans.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>DeepSeek-R1 • Qwen2.5</span>
              <span className="text-cyan-400">Replaceable Engine</span>
            </div>
          </div>

          {/* Track 2 */}
          <div className="glass-card p-6 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                <ScanEye className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-violet-400 mb-1">Track 2: Best Use of Gemma 4</div>
              <h3 className="text-lg font-bold text-white mb-2">Gemma 4 Multimodal Vision</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Interprets complex visual educational material: handwritten student derivations, ER entity diagrams,
                mathematical equations, code snippets, and question patterns with bounding box region anchors.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>google/gemma-4-31B-it</span>
              <span className="text-violet-400">Native Vision</span>
            </div>
          </div>

          {/* Track 3 */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Film className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-amber-400 mb-1">Track 3: Build on elah</div>
              <h3 className="text-lg font-bold text-white mb-2">elah Visual Lesson Engine</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Turns educational plans into frame-accurate multi-track visual lessons.
                Features natural language editing with schema validation, proposed diff previews, KEEP / DISCARD, and one-step UNDO.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>@elah/editor • Integer Frames</span>
              <span className="text-amber-400">Reversible Edits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Animated 8-Step Pipeline */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">End-to-End Cognitive Flow</h2>
          <p className="text-2xl font-bold text-white mt-1">The 8-Step Adaptive Learning Loop</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((step) => (
            <div
              key={step.num}
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all relative group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {step.num}
                </span>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {step.icon}
                </div>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Footer Quote */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <div>LearnLens — Not a chatbot. Not a document reader. An AI Operating System for Learning.</div>
      </footer>
    </div>
  );
};
