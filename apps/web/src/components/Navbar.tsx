import React from 'react';
import { useStudioStore, StudioScreen } from '../stores/useStudioStore.js';
import {
  Sparkles,
  Layers,
  BrainCircuit,
  Film,
  AlertTriangle,
  GraduationCap,
  FileText,
  ScanEye,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentScreen,
    setScreen,
    spaceTitle,
    loadDemoBenchmark,
    isLoading,
    twin,
    providerMode,
    setProviderMode
  } = useStudioStore();

  const navItems: { screen: StudioScreen; label: string; icon: React.ReactNode; badge?: string }[] = [
    { screen: 'knowledge_graph', label: 'Knowledge Graph', icon: <BrainCircuit className="w-4 h-4" /> },
    { screen: 'learning_twin', label: 'Learning Twin', icon: <GraduationCap className="w-4 h-4" />, badge: twin ? `${Math.round(twin.overallMastery * 100)}%` : undefined },
    { screen: 'misconception_center', label: 'Misconception Engine', icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
    { screen: 'lesson_editor', label: 'Elah Visual Studio', icon: <Film className="w-4 h-4 text-cyan-400" /> },
    { screen: 'gap_map', label: 'Learning Gaps', icon: <Layers className="w-4 h-4" /> },
    { screen: 'conflict_viewer', label: 'Source Conflicts', icon: <Flame className="w-4 h-4 text-rose-400" /> },
    { screen: 'import', label: 'Sources', icon: <FileText className="w-4 h-4" /> },
    { screen: 'gemma_analysis', label: 'Gemma 4 Vision', icon: <ScanEye className="w-4 h-4 text-violet-400" /> },
    { screen: 'exam_mode', label: 'Exam Mode', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      {/* Top Banner: Hackathon Track Mapping */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-950/60 border-b border-slate-800/60 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Hack Day Tracks:</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono text-[11px]">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Track 2: Gemma 4 Multimodal
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
              <BrainCircuit className="w-3 h-3 text-cyan-400" />
              Track 1: Open-Source AI Reasoning
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
              <Film className="w-3 h-3 text-amber-400" />
              Track 3: Build on elah
            </span>
          </div>
        </div>

        {/* Quick Demo CTA */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">Current Provider:</span>
          <select
            value={providerMode}
            onChange={(e) => setProviderMode(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="hybrid">⚡ Hybrid: Gemma 4 + Ollama DeepSeek-R1</option>
            <option value="gemma">Google Gemma 4 (Live API)</option>
            <option value="openweight">Open-Source Ollama (deepseek-r1:1.5b)</option>
            <option value="demo">Demo Benchmark (Instant Offline)</option>
          </select>
          <button
            onClick={() => loadDemoBenchmark()}
            disabled={isLoading}
            className="px-3 py-1 rounded bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-semibold text-xs transition-all shadow-glow-cyan flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            1-Click DBMS Demo
          </button>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo and Space Selector */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('landing')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-[1px] shadow-glow-cyan">
              <div className="w-full h-full bg-[#090d16] rounded-[7px] flex items-center justify-center">
                <ScanEye className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                LEARN<span className="text-cyan-400">LENS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono">STUDIO</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium line-clamp-1 max-w-[220px]">
                {spaceTitle || 'Adaptive Learning Twin'}
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => setScreen(item.screen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('settings')}
            className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors ${
              currentScreen === 'settings' ? 'bg-slate-800 text-cyan-400' : ''
            }`}
            title="AI Provider Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
