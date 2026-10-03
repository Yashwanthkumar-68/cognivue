import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  ScanEye,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Code,
  FileText,
  PenTool,
  BrainCircuit
} from 'lucide-react';

export const GemmaAnalysisScreen: React.FC = () => {
  const {
    sources,
    extractions,
    setScreen,
    isLoading
  } = useStudioStore();

  const [activeSourceId, setActiveSourceId] = useState<string>('src_notes');

  const selectedSource = sources.find(s => s.id === activeSourceId) || sources[0];
  const extraction = extractions[activeSourceId] || {
    sourceTitle: selectedSource?.title || 'Handwritten Notes',
    model: 'google/gemma-4-31B-it',
    summary: 'Gemma 4 parsed the handwritten relational derivation and identified a critical cognitive misconception in Step 3.',
    concepts: [],
    visualRegions: [],
    diagrams: [],
    equations: [],
    codeSnippets: [],
    questionPatterns: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-mono text-violet-300 mb-2">
            <ScanEye className="w-3.5 h-3.5 text-violet-400" />
            Track 2: Gemma 4 Multimodal Visual Understanding
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Gemma 4 Multimodal Vision Inspector
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Gemma 4 natively interprets complex visuals without degrading them to plain OCR: extracting entity-relationship cardinalities, mathematical derivation steps, code structures, and suspicious deductive errors.
          </p>
        </div>

        {/* Model Tag */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Multimodal Engine</span>
          <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 px-3 py-1 rounded border border-violet-800/80">
            {extraction.model || 'google/gemma-4-31B-it'}
          </span>
        </div>
      </div>

      {/* Source Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        {sources.map((src) => (
          <button
            key={src.id}
            onClick={() => setActiveSourceId(src.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
              activeSourceId === src.id
                ? 'bg-violet-600/20 border border-violet-500/40 text-violet-200 font-bold shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {src.type === 'handwritten' && <PenTool className="w-3.5 h-3.5 text-rose-400" />}
            {src.type === 'diagram' && <ScanEye className="w-3.5 h-3.5 text-violet-400" />}
            {src.type === 'code' && <Code className="w-3.5 h-3.5 text-cyan-400" />}
            {(src.type === 'pdf' || src.type === 'pptx') && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="truncate max-w-[180px]">{src.title}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Visual Evidence & Hotspot Regions */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3 font-bold">
              Visual Regions & Detected Anomalies
            </span>

            {/* Bounding Box Visualizer Container */}
            <div className="aspect-[4/3] w-full bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden p-6 flex flex-col justify-between">
              {/* Simulated Source Document Preview */}
              <div className="border border-slate-800/80 rounded-lg p-4 bg-slate-900/60 font-mono text-xs text-slate-300">
                <div className="text-[11px] text-slate-500 pb-2 border-b border-slate-800">
                  {selectedSource?.originalFilename}
                </div>
                <div className="mt-3 text-sm text-slate-200">
                  R(A, B, C) with F = &#123; A &rarr; B, B &rarr; C &#125;
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Candidate Key = &#123;A&#125;
                </div>
                <div className="mt-3 text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/80">
                  &bull; Step 3: Partial = Transitive? (Student Confusion Region)
                </div>
              </div>

              {/* Bounding Box Callouts */}
              <div className="space-y-2 mt-4">
                {extraction.visualRegions && extraction.visualRegions.map((reg: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-violet-500/30 text-xs font-mono text-violet-300 flex items-start gap-2.5"
                  >
                    <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">{reg.label}</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{reg.interpretation}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Box2D: [{reg.box2d.join(', ')}] • Confidence: {Math.round(reg.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Extracted Equations, Code & Schema Entities */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Mathematical Derivations */}
          {extraction.equations && extraction.equations.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-3 font-bold">
                Mathematical Equation Derivation Steps
              </span>

              {extraction.equations.map((eq: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-cyan-300 text-sm">
                    {eq.latex}
                  </div>
                  <p className="text-xs text-slate-300">{eq.explanation}</p>

                  <div className="space-y-2 mt-3">
                    {eq.derivationSteps?.map((step: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-lg border text-xs font-mono ${
                          step.isQuestionable
                            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                            : 'bg-slate-900/40 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Step {step.stepIndex}: {step.formula}</span>
                          {step.isQuestionable && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              QUESTIONABLE DEDUCTION
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">{step.description}</p>
                        {step.errorAnnotation && (
                          <div className="mt-2 text-rose-400 text-[11px] font-semibold">
                            ⚠️ Gemma Diagnosis: {step.errorAnnotation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ER Diagram Entities */}
          {extraction.diagrams && extraction.diagrams.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <span className="text-xs font-mono text-violet-400 uppercase tracking-wider block mb-3 font-bold">
                Extracted Schema Entities & Cardinality
              </span>

              {extraction.diagrams.map((diag: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-sm font-bold text-white">{diag.title}</h4>
                  <p className="text-xs text-slate-300">{diag.explanation}</p>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {diag.entities?.map((ent: any) => (
                      <div key={ent.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                        <div className="flex items-center justify-between text-violet-300 font-bold">
                          <span>{ent.name}</span>
                          <span className="text-[10px] uppercase text-slate-500">{ent.type}</span>
                        </div>
                        {ent.cardinality && (
                          <div className="text-[10px] text-cyan-400 mt-1">Cardinality: {ent.cardinality}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          {ent.attributes?.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Code Snippets */}
          {extraction.codeSnippets && extraction.codeSnippets.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-3 font-bold">
                Extracted Code Snippet Analysis
              </span>

              {extraction.codeSnippets.map((cs: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {cs.codeSnippet}
                  </pre>
                  <p className="text-xs text-slate-300">{cs.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action to proceed to Knowledge Graph */}
          <button
            onClick={() => setScreen('knowledge_graph')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 shadow-glow-cyan"
          >
            <BrainCircuit className="w-4 h-4 fill-current" />
            <span>Feed Visual Extracted Models to Open-Source AI Reasoning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
