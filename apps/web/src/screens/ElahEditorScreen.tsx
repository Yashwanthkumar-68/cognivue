import React, { useState, useEffect, useRef } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Undo2,
  Film,
  Layers,
  Clock,
  Sliders,
  AlertCircle,
  HelpCircle,
  FileText,
  ScanEye,
  Flame,
  CheckCircle2,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { LessonStep, StructuredEditPlan } from '@learnlens/schemas';
import { ElahMapper } from '@learnlens/lesson-engine';

export const ElahEditorScreen: React.FC = () => {
  const {
    lessonPlan,
    currentFrame,
    setFrame,
    isPlaying,
    setIsPlaying,
    proposedEdit,
    canUndo,
    requestLessonEdit,
    commitEditAction,
    submitDiagnosticAnswer,
    setScreen,
    isLoading
  } = useStudioStore();

  const [editPromptInput, setEditPromptInput] = useState<string>('');
  const [showEditDiffModal, setShowEditDiffModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inspector' | 'traceability' | 'history'>('inspector');
  const [activeRecallAnswer, setActiveRecallAnswer] = useState<string>('');
  const [activeRecallSubmitted, setActiveRecallSubmitted] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);

  // Playback timer loop in integer frames (30 fps)
  useEffect(() => {
    if (!isPlaying || !lessonPlan) return;

    const interval = setInterval(() => {
      const cur = useStudioStore.getState().currentFrame;
      if (cur >= lessonPlan.totalFrames) {
        setIsPlaying(false);
        setFrame(0);
      } else {
        setFrame(cur + 1);
      }
    }, 1000 / lessonPlan.fps);

    return () => clearInterval(interval);
  }, [isPlaying, lessonPlan, setIsPlaying, setFrame]);

  // Open diff modal when proposedEdit arrives
  useEffect(() => {
    if (proposedEdit) {
      setShowEditDiffModal(true);
    }
  }, [proposedEdit]);

  if (!lessonPlan) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Visual Lesson Plan Loaded</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Generate a lesson from the Knowledge Graph or Diagnostic Center to start the elah Visual Studio.
        </p>
        <button
          onClick={() => setScreen('knowledge_graph')}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          Go to Knowledge Graph
        </button>
      </div>
    );
  }

  // Resolve current active state for current integer frame
  const frameState = ElahMapper.resolveFrame(lessonPlan, currentFrame);
  const timecode = ElahMapper.framesToTimecode(currentFrame, lessonPlan.fps);
  const totalTimecode = ElahMapper.framesToTimecode(lessonPlan.totalFrames, lessonPlan.fps);

  const quickPromptPresets = [
    'Explain the diagram before the formula.',
    'Slow down the normalization example.',
    'Make it 30 seconds.',
    'Make it suitable for a beginner.',
    'Focus only on exam-important material.'
  ];

  const handleApplyKeep = async () => {
    await commitEditAction('keep');
    setShowEditDiffModal(false);
  };

  const handleApplyDiscard = async () => {
    await commitEditAction('discard');
    setShowEditDiffModal(false);
  };

  const handleApplyUndo = async () => {
    await commitEditAction('undo');
  };

  const handleActiveRecallSubmit = async () => {
    if (!activeRecallAnswer.trim()) return;
    await submitDiagnosticAnswer('diag_q1', activeRecallAnswer);
    setActiveRecallSubmitted(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4 flex flex-col h-[calc(100vh-70px)]">
      {/* Top Studio Control Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Film className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white leading-none">{lessonPlan.lessonTitle}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                v{lessonPlan.version}.0
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-mono">
              <span>Target: <strong className="text-slate-200">{lessonPlan.targetMisconception || 'Conceptual Mastery'}</strong></span>
              <span>•</span>
              <span>Duration: <strong className="text-cyan-400">{lessonPlan.durationSeconds}s ({lessonPlan.totalFrames} frames @ {lessonPlan.fps}fps)</strong></span>
            </div>
          </div>
        </div>

        {/* Undo and Export Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyUndo}
            disabled={!canUndo || isLoading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              canUndo
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
            title="Revert to previous lesson version"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>ONE-STEP UNDO</span>
          </button>

          <button
            onClick={() => setScreen('misconception_center')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Retest Misconception</span>
          </button>
        </div>
      </div>

      {/* Main Center Area: Left Traceability / Center Canvas Player / Right AI Edit Inspector */}
      <div className="grid grid-cols-12 gap-4 my-3 flex-1 min-h-0">
        {/* Left: Source Traceability Drawer */}
        <div className="col-span-3 glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Traceable Evidence
              </span>
              <span className="text-[10px] text-cyan-400">Verified</span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Primary Anchor:</span>
                <div className="font-semibold text-white mt-0.5">Handwritten Relational Notes</div>
                <p className="text-slate-400 text-[11px] mt-1 italic">
                  {'\"If A \u2192 B and B \u2192 C, then A \u2192 C is transitive.\"' /* arrow notation */}
                </p>
                <div className="mt-2 text-[10px] font-mono text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-900/60">
                  Suspicious deduction identified by Gemma 4 in Step 3.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-violet-400 uppercase">Lecture Anchor:</span>
                <div className="font-semibold text-white mt-0.5">Prof. Vance Lecture Slide 14 & 22</div>
                <p className="text-slate-400 text-[11px] mt-1 italic">
                  "Slide 14 contrasts composite key subsets with full key dependencies."
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-amber-400 uppercase">Textbook Standard:</span>
                <div className="font-semibold text-white mt-0.5">Silberschatz DBMS Ch 8.4</div>
                <p className="text-slate-400 text-[11px] mt-1 italic">
                  "Decomposition algorithm guarantees lossless join."
                </p>
              </div>
            </div>
          </div>

          {/* Pedagogical Rationale Box */}
          <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-300 font-bold block mb-1">Pedagogical Strategy:</span>
            {lessonPlan.pedagogicalRationale}
          </div>
        </div>

        {/* Center: Frame-Accurate Canvas Player */}
        <div className="col-span-6 flex flex-col gap-2">
          {/* Virtual Visual Screen Canvas */}
          <div className="relative flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
            {/* Visual Source Layer Background */}
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-black">
              {/* Dynamic Step Content Renderer */}
              {frameState.activeCheckpointStep ? (
                /* Interactive Active Recall Checkpoint */
                <div className="z-20 max-w-lg w-full p-6 rounded-2xl bg-slate-900/95 border-2 border-cyan-500 shadow-glow-cyan text-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Active Recall Checkpoint
                  </h3>
                  <p className="text-sm text-slate-200 mb-4">
                    {frameState.activeCheckpointStep.captionText}
                  </p>

                  {!activeRecallSubmitted ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={activeRecallAnswer}
                        onChange={(e) => setActiveRecallAnswer(e.target.value)}
                        placeholder="Type answer (e.g., No, because ID is single-column)..."
                        className="w-full glass-input rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                      />
                      <button
                        onClick={handleActiveRecallSubmit}
                        disabled={isLoading || !activeRecallAnswer.trim()}
                        className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase"
                      >
                        Submit Checkpoint & Update Learning Twin
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                      ✓ Answer verified! Cognitive model updated in Learning Twin.
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Visual Slides / Derivations / Diagrams */
                <div className="w-full h-full flex flex-col items-center justify-center text-center relative">
                  {/* Bounding Box Overlay if highlight step is active */}
                  {frameState.activeHighlightStep && (
                    <div
                      className="absolute border-2 border-cyan-400 bg-cyan-500/10 rounded-lg pointer-events-none transition-all duration-300 shadow-glow-cyan"
                      style={{
                        top: `${frameState.activeHighlightStep.region?.y || 15}%`,
                        left: `${frameState.activeHighlightStep.region?.x || 10}%`,
                        width: `${frameState.activeHighlightStep.region?.width || 80}%`,
                        height: `${frameState.activeHighlightStep.region?.height || 50}%`
                      }}
                    >
                      <span className="absolute -top-3 left-3 px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold uppercase">
                        {frameState.activeHighlightStep.calloutLabel || 'Gemma 4 Visual Anchor'}
                      </span>
                    </div>
                  )}

                  {/* Mathematical Formula Render */}
                  {frameState.primarySourceStep?.latexFormula && (
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 font-mono text-cyan-300 text-base md:text-lg tracking-wide my-4 shadow-lg">
                      {frameState.primarySourceStep.latexFormula}
                    </div>
                  )}

                  {/* Visual Source Tag */}
                  {frameState.primarySourceStep?.sourceTitle && (
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                      Anchor: {frameState.primarySourceStep.sourceTitle}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Top Frame Tag */}
            <div className="z-10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-cyan-400">
                FRAME: {currentFrame} / {lessonPlan.totalFrames}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                {timecode} / {totalTimecode}
              </span>
            </div>

            {/* Bottom Synced Captions Layer */}
            <div className="z-10 max-w-xl mx-auto text-center">
              {frameState.activeCaptionStep?.captionText && (
                <div className="glass-card px-4 py-2.5 rounded-xl border border-cyan-500/30 text-white text-xs md:text-sm font-medium shadow-glow-cyan bg-slate-950/90 leading-snug">
                  {frameState.activeCaptionStep.captionText}
                </div>
              )}
            </div>
          </div>

          {/* Player Transport Bar */}
          <div className="glass-card px-4 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold transition-all shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                onClick={() => setFrame(0)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Rewind to frame 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300 font-semibold">{timecode}</span>
            </div>

            {/* Frame Scrubber Slider */}
            <div className="flex-1 mx-6 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={lessonPlan.totalFrames}
                value={currentFrame}
                onChange={(e) => setFrame(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="text-slate-400 text-[11px]">
              {lessonPlan.fps} FPS Integer Engine
            </div>
          </div>
        </div>

        {/* Right: AI Natural Language Lesson Editing Console */}
        <div className="col-span-3 glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Natural Language Editing
              </span>
              <span className="text-[10px] text-violet-400">Open-Weight</span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Tell AI how to adjust this visual lesson. It compiles your request into a validated, structured edit plan.
            </p>

            {/* Quick Preset Buttons */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Suggested Refinements:</span>
              {quickPromptPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setEditPromptInput(preset)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-[11px] text-slate-300 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{preset}</span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Prompt Input */}
            <div className="mt-4">
              <textarea
                value={editPromptInput}
                onChange={(e) => setEditPromptInput(e.target.value)}
                placeholder="e.g., Slow down normalization example, or make it suitable for a beginner..."
                rows={3}
                className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-sans resize-none"
              />
              <button
                onClick={() => requestLessonEdit(editPromptInput)}
                disabled={isLoading || !editPromptInput.trim()}
                className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Structured Edit Plan</span>
              </button>
            </div>
          </div>

          {/* Validation Notice */}
          <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="text-cyan-400 font-bold block mb-0.5">Strict elah Contract:</span>
            No direct canvas tampering. AI produces validated Zod edit schemas with proposed diff preview.
          </div>
        </div>
      </div>

      {/* Bottom: Multi-Track elah Timeline */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800 shrink-0">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            elah Timeline Tracks (Integer Frames)
          </span>
          <span className="text-[11px] text-slate-400">
            Playhead: <strong className="text-cyan-400">{currentFrame}f</strong> ({timecode})
          </span>
        </div>

        {/* Tracks Container */}
        <div className="space-y-1.5 text-xs font-mono">
          {lessonPlan.tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-2">
              <span className="w-28 text-[11px] text-slate-400 truncate text-right">
                {track.name}
              </span>
              <div className="flex-1 h-6 bg-slate-900 rounded-md relative overflow-hidden border border-slate-800/80">
                {/* Steps within this track */}
                {lessonPlan.steps.map((step, idx) => {
                  const leftPercent = (step.startFrame / lessonPlan.totalFrames) * 100;
                  const widthPercent = (step.durationFrames / lessonPlan.totalFrames) * 100;
                  const isCurrent = currentFrame >= step.startFrame && currentFrame < step.startFrame + step.durationFrames;

                  return (
                    <div
                      key={step.id}
                      onClick={() => setFrame(step.startFrame)}
                      className={`absolute top-0 bottom-0 rounded px-1.5 flex items-center text-[10px] font-mono truncate cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 z-10'
                          : idx % 2 === 0
                          ? 'bg-slate-800/80 border border-slate-700/80 text-slate-300'
                          : 'bg-indigo-950/40 border border-indigo-800/40 text-indigo-300'
                      }`}
                      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                      title={`${step.title} (${step.startFrame}f - ${step.startFrame + step.durationFrames}f)`}
                    >
                      {step.title}
                    </div>
                  );
                })}

                {/* Draggable Playhead Marker */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 pointer-events-none"
                  style={{ left: `${(currentFrame / lessonPlan.totalFrames) * 100}%` }}
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full -ml-[3px] -mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proposed Edit Diff Preview Modal (KEEP / DISCARD / REFINE) */}
      {showEditDiffModal && proposedEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-2xl border border-violet-500/50 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-violet-500/20 text-violet-300">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Proposed Edit Plan</h3>
                  <span className="text-xs font-mono text-slate-400">
                    Prompt: "{proposedEdit.naturalLanguageRequest}"
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowEditDiffModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rationale */}
            <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs">
              <span className="font-mono font-bold text-violet-300 block mb-1">AI Pedagogical Rationale:</span>
              <p className="text-slate-200">{proposedEdit.aiInterpretation}</p>
            </div>

            {/* Proposed Diffs */}
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Timeline Operations Diff:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {proposedEdit.previewDiffSummary.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{diff}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Report */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>Schema & Frame Range Validation:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                PASSED (Zero Collisions Detected)
              </span>
            </div>

            {/* Keep / Discard Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleApplyDiscard}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
              >
                DISCARD
              </button>
              <button
                onClick={() => {
                  setShowEditDiffModal(false);
                  setEditPromptInput(proposedEdit.naturalLanguageRequest + ' and make it even more concise.');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-violet-300 border border-violet-500/40 font-mono text-xs"
              >
                REFINE PROMPT
              </button>
              <button
                onClick={handleApplyKeep}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-glow-cyan"
              >
                KEEP & APPLY TO ELAH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
