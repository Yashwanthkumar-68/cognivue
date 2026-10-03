import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  BrainCircuit,
  Film,
  AlertTriangle,
  FileText,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  HelpCircle
} from 'lucide-react';

export const KnowledgeGraphScreen: React.FC = () => {
  const {
    knowledgeGraph,
    selectedConceptId,
    setSelectedConcept,
    generateLessonForConcept,
    setScreen,
    isLoading
  } = useStudioStore();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  if (!knowledgeGraph) {
    return (
      <div className="p-12 text-center text-slate-400">
        <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-white mb-2">No Knowledge Graph Loaded</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Load the DBMS benchmark demo or upload your own multi-format sources to synthesize the knowledge model.
        </p>
      </div>
    );
  }

  const nodes = knowledgeGraph.nodes || [];
  const edges = knowledgeGraph.edges || [];

  const categories = ['all', ...Array.from(new Set(nodes.map(n => n.category)))];

  const filteredNodes = activeCategoryFilter === 'all'
    ? nodes
    : nodes.filter(n => n.category === activeCategoryFilter);

  const selectedConcept = nodes.find(n => n.id === selectedConceptId) || nodes[0];

  const getStatusBadge = (status: string, mastery: number) => {
    switch (status) {
      case 'mastered':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Mastered ({Math.round(mastery * 100)}%)</span>;
      case 'weak':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400">Weak Area ({Math.round(mastery * 100)}%)</span>;
      case 'learning':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400">In Progress ({Math.round(mastery * 100)}%)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">Not Started</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">{knowledgeGraph.spaceTitle}</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono">
              {nodes.length} Concepts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Synthesized by: <span className="text-cyan-300">{knowledgeGraph.reasoningModel}</span>
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Interactive Graph Grid + Concept Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Concept Nodes Matrix & Graph Visualizer */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                Relational Knowledge Topology & Dependencies
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Click any concept node to inspect</span>
            </div>

            {/* Concept Nodes Interactive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredNodes.map(node => {
                const isSelected = selectedConcept?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedConcept(node.id)}
                    className={`text-left p-4 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 shadow-glow-cyan'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {/* Conflict Badge */}
                    {node.hasConflict && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300" title="Source Conflict Detected">
                        <Flame className="w-3 h-3 text-rose-400" />
                        Conflict
                      </span>
                    )}

                    <div className="text-xs font-mono text-cyan-400 mb-1">{node.category}</div>
                    <div className="font-bold text-sm text-white line-clamp-1">{node.name}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">{node.shortSummary}</div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                      {getStatusBadge(node.learningStatus, node.masteryScore)}
                      <span className="text-[10px] font-mono text-slate-500">
                        {node.sourceReferences.length} Sources
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Graph Prerequisite Flow Diagram */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 block">
              Prerequisite Flow Sequence (DAG)
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Relational Model</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Functional Dependency</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">1NF (Atomicity)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">2NF (Partial FD)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">3NF (Transitive FD)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">BCNF (Superkeys)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Lossless Join</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Concept Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedConcept && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 sticky top-24">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400">{selectedConcept.category}</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedConcept.name}</h3>
                </div>
                {getStatusBadge(selectedConcept.learningStatus, selectedConcept.masteryScore)}
              </div>

              {/* Conflict Alert Box if present */}
              {selectedConcept.hasConflict && (
                <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-rose-200">Source Conflict Identified!</span>
                    <p className="text-rose-300/80 mt-0.5">
                      Professor lecture slides disagree with Textbook regarding 3NF vs BCNF priority.
                    </p>
                    <button
                      onClick={() => setScreen('conflict_viewer')}
                      className="mt-1.5 text-cyan-400 hover:text-cyan-300 font-mono font-medium underline flex items-center gap-1"
                    >
                      Compare Sources in Conflict Viewer <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Full Explanation */}
              <div className="mt-4">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Concept Explanation</span>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  {selectedConcept.fullExplanation}
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Exam Importance:</span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {Math.round(selectedConcept.examWeight * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Confidence Score:</span>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {Math.round(selectedConcept.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Source-to-Lesson Traceability References */}
              <div className="mt-5">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Source Traceability References</span>
                  <span className="text-[10px] text-cyan-400 font-normal">No Hallucinations</span>
                </span>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {selectedConcept.sourceReferences.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span className="truncate max-w-[220px]">{ref.sourceTitle}</span>
                        {ref.pageOrSlide && (
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                            Page / Slide {ref.pageOrSlide}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 italic">
                        "{ref.excerptOrRegion}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => generateLessonForConcept(selectedConcept.id, selectedConcept.name)}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
                >
                  <Film className="w-4 h-4 fill-current" />
                  <span>Generate elah Visual Lesson</span>
                </button>

                <button
                  onClick={() => setScreen('misconception_center')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Take Diagnostic Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
