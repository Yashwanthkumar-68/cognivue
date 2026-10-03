import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  SlidersHorizontal,
  BrainCircuit,
  ScanEye,
  CheckCircle2,
  Sparkles,
  Server,
  Key,
  ShieldCheck
} from 'lucide-react';
import * as api from '../services/api.js';

export const SettingsScreen: React.FC = () => {
  const { providerMode, setProviderMode } = useStudioStore();
  const [apiKey, setApiKey] = useState<string>('');
  const [ollamaBase, setOllamaBase] = useState<string>('http://localhost:11434/v1');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleProviderSelect = async (mode: 'demo' | 'gemma' | 'openweight') => {
    setProviderMode(mode);
    try {
      await api.switchAIProvider(mode);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 mb-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          System Settings & AI Provider Architecture
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          AI Provider Abstraction
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          LearnLens provides an architectural abstraction layer decoupling cognition from specific model endpoints. Choose between local open-weight inference, Google Gemma 4 multimodal, or deterministic benchmark execution.
        </p>
      </div>

      {savedNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Provider mode switched successfully!</span>
        </div>
      )}

      {/* Provider Selector Cards */}
      <div className="space-y-4">
        {/* Option 1: Demo Benchmark */}
        <div
          onClick={() => handleProviderSelect('demo')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            providerMode === 'demo'
              ? 'bg-slate-900 border-cyan-400 shadow-glow-cyan'
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Deterministic Hackathon Benchmark Provider</span>
                  {providerMode === 'demo' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      ACTIVE
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Pre-parsed DBMS benchmark with handwritten notes, lecture slides, ER diagrams & 3NF misconceptions.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-300 leading-relaxed">
            Zero latency, runs 100% offline, guaranteed reproducibility for judges and live demonstrations.
          </div>
        </div>

        {/* Option 2: Live Gemma 4 */}
        <div
          onClick={() => handleProviderSelect('gemma')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            providerMode === 'gemma'
              ? 'bg-slate-900 border-violet-400 shadow-glow-violet'
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <ScanEye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Google Gemma 4 Multimodal Provider</span>
                  {providerMode === 'gemma' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                      ACTIVE
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  google/gemma-4-31B-it • Native Multimodal Vision & Reasoning
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-300 leading-relaxed">
            Uses Google GenAI SDK to analyze visual diagrams, handwritten notes, and code snippets in real-time.
          </div>
        </div>

        {/* Option 3: Open-Weight AI (Ollama / vLLM) */}
        <div
          onClick={() => handleProviderSelect('openweight')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            providerMode === 'openweight'
              ? 'bg-slate-900 border-amber-400 shadow-sm'
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Open-Source AI Reasoning Layer (Local Ollama / vLLM)</span>
                  {providerMode === 'openweight' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                      ACTIVE
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  DeepSeek-R1 • Qwen2.5-Coder • Llama-3.3
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-300 leading-relaxed">
            Directly queries local Ollama or OpenAI-compatible endpoint at http://localhost:11434/v1 for concept linking, gap reasoning, and structured lesson plans.
          </div>
        </div>
      </div>
    </div>
  );
};
