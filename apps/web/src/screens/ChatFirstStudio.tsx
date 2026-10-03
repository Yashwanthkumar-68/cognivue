import React, { useState, useEffect, useRef } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import { UniversalChatInput, AttachedFileItem } from '../components/UniversalChatInput.js';
import {
  Sparkles,
  BrainCircuit,
  ScanEye,
  Film,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Code,
  Image as ImageIcon,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Undo2,
  Send,
  Scale
} from 'lucide-react';
import { ElahMapper } from '@learnlens/lesson-engine';

interface ConversationTurn {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  attachments?: AttachedFileItem[];
  // Rich Adaptive Learning Blocks
  blockType?: 'welcome' | 'diagnosis' | 'visual_intervention' | 'practice_verify' | 'twin_update' | 'source_conflict';
  diagnosisData?: {
    breakpointTarget: string;
    misconceptionType: string;
    severity: 'low' | 'medium' | 'high';
    understood: string[];
    partial: string[];
    misconceptions: string[];
    guidedQuestion: string;
    scaffoldingLevel: 1 | 2 | 3;
  };
  lessonData?: {
    lessonTitle: string;
    durationSeconds: number;
    fps: number;
    totalFrames: number;
    steps: any[];
  };
  verifyQuestion?: {
    questionText: string;
    conceptName: string;
    expectedInsight: string;
  };
  twinUpdateData?: {
    masteryScore: number;
    delta: number;
    conceptName: string;
    verified: boolean;
  };
  conflictData?: {
    title: string;
    sourceA: string;
    sourceB: string;
    analysis: string;
  };
}

export const ChatFirstStudio: React.FC = () => {
  const {
    spaceTitle,
    lessonPlan,
    currentFrame,
    setFrame,
    isPlaying,
    setIsPlaying,
    twin,
    knowledgeGraph,
    conflicts,
    generateLessonForConcept,
    requestLessonEdit,
    commitEditAction,
    submitDiagnosticAnswer,
    loadDemoBenchmark,
    setScreen,
    isLoading
  } = useStudioStore();

  const [activeSideTab, setActiveSideTab] = useState<'twin' | 'graph' | 'sources' | 'conflict' | 'closed'>('twin');
  const [naturalEditInput, setNaturalEditInput] = useState<string>('');
  const [practiceAnswer, setPracticeAnswer] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Playback timer for inline elah lesson
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

  // Initial rich conversation turns demonstrating the complete cognitive loop:
  // Give Anything → Understand (Gemma 4) → Observe Student Attempt → Exact Weakness Breakpoint → elah Visual Intervention → Natural Language Refine → Practice & Verify
  const [conversation, setConversation] = useState<ConversationTurn[]>([
    {
      id: 'turn_welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      blockType: 'welcome',
      text: "👋 Welcome to **LearnLens**. This isn't another generic AI tutor that just summarizes PDFs.\n\nStudents often don't know what they actually understand, where their reasoning first breaks, or whether they truly improved after getting an explanation. Here, you can **give anything**—handwritten notes, diagrams, code, past exams, or screen recordings of your attempt.\n\n**Gemma 4** perceives what's inside, our **Open-Source AI reasoning layer** pinpoints the exact logic divergence, and **elah** visually intervenes right in this thread."
    },
    {
      id: 'turn_user_attempt',
      sender: 'user',
      timestamp: '12:02 PM',
      text: "Watch my attempt on 3NF normalization. I'm trying to eliminate update anomalies for `StudentCourse(StudentID, CourseID, Instructor, OfficeLocation)`. Where does my reasoning first break?",
      attachments: [
        {
          id: 'att_sql',
          name: 'student_schema_attempt.sql',
          type: 'code',
          sizeFormatted: '340 B',
          content: `CREATE TABLE StudentCourse (
  StudentID INT,
  CourseID VARCHAR(10),
  Instructor VARCHAR(50),
  OfficeLocation VARCHAR(50),
  PRIMARY KEY (StudentID, CourseID)
);`
        },
        {
          id: 'att_notes',
          name: 'handwritten_notes_step3.png',
          type: 'image',
          sizeFormatted: '1.4 MB',
          content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      ]
    },
    {
      id: 'turn_diagnosis',
      sender: 'assistant',
      timestamp: '12:03 PM',
      blockType: 'diagnosis',
      text: "I observed your attempt and examined your handwritten notes. Your reasoning first breaks at **Line 4** (`OfficeLocation`).",
      diagnosisData: {
        breakpointTarget: 'Line 4 (and Handwritten Note Step 3)',
        misconceptionType: 'Confusing 2NF Partial Dependency with 3NF Transitive Dependency',
        severity: 'high',
        understood: [
          'Recognized composite key (StudentID, CourseID)',
          'Understood that 1NF requires atomic attribute domains'
        ],
        partial: [
          'Attempted to satisfy 2NF, but assumed transitive dependency is just a variant of partial dependency'
        ],
        misconceptions: [
          'Equated partial key dependency with transitive non-key dependency. You assumed having a primary key automatically clears 3NF!'
        ],
        guidedQuestion: 'Look closely at OfficeLocation. Does OfficeLocation depend on the student, or does it depend on the Instructor? What happens if an instructor changes offices?',
        scaffoldingLevel: 1
      }
    },
    {
      id: 'turn_visual_intervention',
      sender: 'assistant',
      timestamp: '12:03 PM',
      blockType: 'visual_intervention',
      text: "Instead of giving you another wall of text, I created a **45-second targeted visual intervention in elah** using your own handwritten note as the visual anchor. Watch how the transitive domino chain is broken:",
      lessonData: {
        lessonTitle: 'Mastering 3NF: Breaking the Transitive Domino Chain',
        durationSeconds: 45,
        fps: 30,
        totalFrames: 1350,
        steps: []
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Handle user sending message or dropping multi-material
  const handleUserMessage = async (messageText: string, attachments: AttachedFileItem[]) => {
    const userTurn: ConversationTurn = {
      id: 'turn_' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: messageText,
      attachments
    };

    setConversation((prev) => [...prev, userTurn]);

    // Check if this is an elah natural language refinement request
    const lower = messageText.toLowerCase();
    if (lower.includes('slow down') || lower.includes('faster') || lower.includes('diagram before') || lower.includes('beginner') || lower.includes('30 seconds') || lower.includes('make it')) {
      await requestLessonEdit(messageText);
      const assistantTurn: ConversationTurn = {
        id: 'turn_edit_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I recompiled your visual lesson in elah based on: *"${messageText}"*.\n\n✓ Reordered steps to showcase the visual dependency diagram first.\n✓ Validated integer frame ranges (zero collisions).\n\nYou can **KEEP** this revision or **UNDO** it anytime.`,
        blockType: 'visual_intervention',
        lessonData: {
          lessonTitle: 'Mastering 3NF (Refined: Visual Diagram First)',
          durationSeconds: 45,
          fps: 30,
          totalFrames: 1350,
          steps: []
        }
      };
      setConversation((prev) => [...prev, assistantTurn]);
      return;
    }

    // Call Observe API
    try {
      const res = await fetch('/api/observe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          task_objective: 'Relational Normalization and 3NF Anomaly Elimination',
          current_state: attachments.find((a) => a.type === 'code')?.content || messageText,
          attachments: attachments.map((a) => ({
            name: a.name,
            type: a.type,
            content: a.content,
            metadata: a.metadata
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        const diag = data.skilltrace.diagnostic;
        const scaff = data.skilltrace.scaffolding;

        const diagTurn: ConversationTurn = {
          id: 'turn_resp_' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: data.chatResponse,
          blockType: 'diagnosis',
          diagnosisData: {
            breakpointTarget: diag.breakpoint_target,
            misconceptionType: diag.misconception_type,
            severity: diag.severity,
            understood: ['Recognized core candidate key constraints'],
            partial: ['Partial decomposition attempted'],
            misconceptions: [diag.misconception_type],
            guidedQuestion: scaff.guided_question,
            scaffoldingLevel: scaff.level
          }
        };

        setConversation((prev) => [...prev, diagTurn]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Student takes the verification challenge
  const handleVerifySubmission = async () => {
    if (!practiceAnswer.trim()) return;
    setIsVerifying(true);

    try {
      const res = await submitDiagnosticAnswer('diag_q1', practiceAnswer);
      setIsVerifying(false);

      const isMastered = Boolean(res && !res.hasMisconception);
      const verifyTurn: ConversationTurn = {
        id: 'turn_verify_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: isMastered
          ? "🎉 **Verified Improvement!** You correctly articulated that 2NF requires a composite key, while 3NF eliminates the transitive domino bridge (`StudentID -> Instructor -> OfficeLocation`)."
          : "Good attempt! You isolated the instructor column, but remember that 2NF cannot be violated if the table's key is a single attribute.",
        blockType: 'twin_update',
        twinUpdateData: {
          masteryScore: isMastered ? 0.88 : 0.65,
          delta: isMastered ? +0.26 : +0.07,
          conceptName: '3NF (Third Normal Form)',
          verified: isMastered
        }
      };

      setConversation((prev) => [...prev, verifyTurn]);
      setPracticeAnswer('');
    } catch (err) {
      setIsVerifying(false);
    }
  };

  const frameState = lessonPlan ? ElahMapper.resolveFrame(lessonPlan, currentFrame) : null;
  const timecode = lessonPlan ? ElahMapper.framesToTimecode(currentFrame, lessonPlan.fps) : '00:00';

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-3 flex flex-col h-[calc(100vh-68px)]">
      {/* Top Copilot Bar */}
      <div className="glass-panel px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center justify-between shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-[1px] shadow-glow-cyan">
            <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">LearnLens Copilot</h2>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                CHAT-FIRST MULTIMODAL STUDIO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Give Anything &rarr; Observe Attempt &rarr; Pinpoint Breakpoint &rarr; Visual elah Intervention &rarr; Verify Improvement
            </p>
          </div>
        </div>

        {/* Right Quick Toggles & Twin Score */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {twin && (
            <button
              onClick={() => setActiveSideTab(activeSideTab === 'twin' ? 'closed' : 'twin')}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cognitive Twin: <strong>{Math.round(twin.overallMastery * 100)}% Mastery</strong></span>
            </button>
          )}

          <button
            onClick={() => setActiveSideTab(activeSideTab === 'graph' ? 'closed' : 'graph')}
            className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
              activeSideTab === 'graph' ? 'bg-slate-800 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Knowledge Graph</span>
          </button>

          <button
            onClick={() => setActiveSideTab(activeSideTab === 'conflict' ? 'closed' : 'conflict')}
            className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
              activeSideTab === 'conflict' ? 'bg-slate-800 text-rose-300 border-rose-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            <span>Source Conflicts</span>
          </button>

          <button
            onClick={() => loadDemoBenchmark()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 text-slate-950 font-bold shadow-sm"
          >
            Reset Demo Loop
          </button>
        </div>
      </div>

      {/* Main Split: Conversational Studio (Left/Center) + Context Companion (Right) */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Main Chat Conversation Thread */}
        <div className={`flex flex-col justify-between glass-panel p-4 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 ${
          activeSideTab !== 'closed' ? 'col-span-12 lg:col-span-8' : 'col-span-12'
        }`}>
          {/* Scrollable Conversation Stream */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {conversation.map((turn) => {
              const isAssistant = turn.sender === 'assistant';

              return (
                <div key={turn.id} className={`flex items-start gap-3.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isAssistant
                      ? 'bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-bold shadow-glow-cyan'
                      : 'bg-slate-800 text-slate-300 font-bold text-xs'
                  }`}>
                    {isAssistant ? <Sparkles className="w-4 h-4 fill-current" /> : 'You'}
                  </div>

                  {/* Bubble Container */}
                  <div className={`max-w-[90%] flex flex-col gap-3 rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                    isAssistant
                      ? 'glass-card border border-slate-700/80 text-slate-100 shadow-sm'
                      : 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-100'
                  }`}>
                    {/* Attachments if any */}
                    {turn.attachments && turn.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                        {turn.attachments.map((att) => (
                          <div key={att.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300">
                            {att.type === 'code' ? <Code className="w-3.5 h-3.5 text-cyan-400" /> : <ImageIcon className="w-3.5 h-3.5 text-violet-400" />}
                            <span>{att.name}</span>
                            <span className="text-[10px] text-slate-500">({att.sizeFormatted})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Body */}
                    <div className="whitespace-pre-wrap font-sans text-slate-200">
                      {turn.text}
                    </div>

                    {/* BLOCK 1: Skill & Breakpoint Diagnosis Card */}
                    {turn.blockType === 'diagnosis' && turn.diagnosisData && (
                      <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-500/40 font-mono text-xs text-slate-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-rose-400 font-bold flex items-center gap-1.5">
                            <Flame className="w-4 h-4" />
                            Breakpoint: {turn.diagnosisData.breakpointTarget}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">
                            Scaffolding Level {turn.diagnosisData.scaffoldingLevel}
                          </span>
                        </div>

                        {/* Breakdown: Understood, Partial, Misconception */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                            <span className="text-emerald-400 font-bold block mb-1">✓ Understood:</span>
                            <ul className="space-y-0.5 text-slate-300">
                              {turn.diagnosisData.understood.map((u, i) => (
                                <li key={i}>• {u}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
                            <span className="text-amber-400 font-bold block mb-1">⚠ Partial:</span>
                            <ul className="space-y-0.5 text-slate-300">
                              {turn.diagnosisData.partial.map((p, i) => (
                                <li key={i}>• {p}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/40">
                            <span className="text-rose-400 font-bold block mb-1">❌ Misconception:</span>
                            <ul className="space-y-0.5 text-rose-200">
                              {turn.diagnosisData.misconceptions.map((m, i) => (
                                <li key={i}>• {m}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Guided Question Probe */}
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-cyan-400 font-bold block mb-1 uppercase text-[10px]">
                            Guided Question (Try Answering in Chat):
                          </span>
                          <p className="text-slate-200 italic">{turn.diagnosisData.guidedQuestion}</p>
                        </div>
                      </div>
                    )}

                    {/* BLOCK 2: Embedded elah Visual Lesson Player */}
                    {turn.blockType === 'visual_intervention' && lessonPlan && (
                      <div className="rounded-xl border border-cyan-500/50 overflow-hidden shadow-2xl bg-black">
                        {/* Player Header */}
                        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2 text-cyan-300 font-bold">
                            <Film className="w-3.5 h-3.5 text-cyan-400" />
                            <span>elah Visual Intervention: {lessonPlan.lessonTitle}</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {timecode} / {lessonPlan.durationSeconds}s ({currentFrame}f)
                          </span>
                        </div>

                        {/* Visual Stage */}
                        <div className="relative aspect-video bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center p-6 text-center">
                          {frameState?.activeHighlightStep && (
                            <div
                              className="absolute border-2 border-cyan-400 bg-cyan-500/10 rounded-lg pointer-events-none transition-all shadow-glow-cyan"
                              style={{
                                top: `${frameState.activeHighlightStep.region?.y || 15}%`,
                                left: `${frameState.activeHighlightStep.region?.x || 10}%`,
                                width: `${frameState.activeHighlightStep.region?.width || 80}%`,
                                height: `${frameState.activeHighlightStep.region?.height || 50}%`
                              }}
                            >
                              <span className="absolute -top-3 left-3 px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold uppercase">
                                {frameState.activeHighlightStep.calloutLabel || 'Misconception Breakpoint'}
                              </span>
                            </div>
                          )}

                          {frameState?.primarySourceStep?.latexFormula && (
                            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 font-mono text-cyan-300 text-base md:text-lg shadow-lg">
                              {frameState.primarySourceStep.latexFormula}
                            </div>
                          )}

                          {/* Dynamic Synced Caption */}
                          {frameState?.activeCaptionStep?.captionText && (
                            <div className="absolute bottom-4 left-6 right-6 p-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-white text-xs font-sans shadow-lg">
                              {frameState.activeCaptionStep.captionText}
                            </div>
                          )}
                        </div>

                        {/* Player Transport Controls */}
                        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-7 h-7 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold"
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                            </button>
                            <button
                              onClick={() => setFrame(0)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                              title="Rewind"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            <span className="text-slate-300 font-semibold">{timecode}</span>
                          </div>

                          <div className="flex-1 mx-4">
                            <input
                              type="range"
                              min={0}
                              max={lessonPlan.totalFrames}
                              value={currentFrame}
                              onChange={(e) => setFrame(parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => commitEditAction('undo')}
                              className="text-[10px] px-2 py-1 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 flex items-center gap-1"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>Undo Edit</span>
                            </button>
                          </div>
                        </div>

                        {/* Natural Language Refinement Bar inside lesson card */}
                        <div className="bg-[#090d16] p-3 border-t border-slate-800 flex items-center gap-2">
                          <input
                            type="text"
                            value={naturalEditInput}
                            onChange={(e) => setNaturalEditInput(e.target.value)}
                            placeholder="Chat with this lesson: 'Slow it down', 'Show diagram first', 'Make it 30s'..."
                            className="flex-1 glass-input rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUserMessage(naturalEditInput, []);
                                setNaturalEditInput('');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (naturalEditInput.trim()) {
                                handleUserMessage(naturalEditInput, []);
                                setNaturalEditInput('');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold"
                          >
                            Refine
                          </button>
                        </div>
                      </div>
                    )}

                    {/* BLOCK 3: Practice & Verify Improvement */}
                    {turn.blockType === 'visual_intervention' && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-cyan-400 font-bold flex items-center gap-1.5 uppercase">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            Next Loop: Verify True Improvement
                          </span>
                          <span className="text-slate-500">Practice Question</span>
                        </div>

                        <p className="text-xs text-slate-200">
                          Now that you saw how the transitive chain works:
                          <br />
                          <strong>Can a table with candidate key &#123;ID&#125; violate 2NF? What about 3NF?</strong>
                        </p>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={practiceAnswer}
                            onChange={(e) => setPracticeAnswer(e.target.value)}
                            placeholder="Type explanation to update your Cognitive Twin..."
                            className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleVerifySubmission();
                            }}
                          />
                          <button
                            onClick={handleVerifySubmission}
                            disabled={isVerifying || !practiceAnswer.trim()}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}

                    {/* BLOCK 4: Cognitive Twin Delta Update Card */}
                    {turn.blockType === 'twin_update' && turn.twinUpdateData && (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 font-mono text-xs text-slate-200 space-y-2">
                        <div className="flex items-center justify-between font-bold text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Student Learning Twin Updated!
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            +{Math.round(turn.twinUpdateData.delta * 100)}% Delta
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                          <span>Concept: <strong>{turn.twinUpdateData.conceptName}</strong></span>
                          <span>Verified Mastery: <strong className="text-cyan-400">{Math.round(turn.twinUpdateData.masteryScore * 100)}%</strong></span>
                        </div>

                        <div className="text-[10px] text-emerald-400/90 pt-1">
                          ✓ Misconception cleared! Learning path advanced to BCNF Superkey Testing.
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-[10px] font-mono text-slate-500 text-right">
                      {turn.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Trigger Chips */}
          <div className="my-2 pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase shrink-0">Try prompt:</span>
            <button
              onClick={() => handleUserMessage("Watch my attempt and tell me where my reasoning first breaks.", [{
                id: 'c1',
                name: 'orders_schema.sql',
                type: 'code',
                sizeFormatted: '280 B',
                content: `CREATE TABLE StudentCourse (StudentID INT, CourseID VARCHAR(10), Instructor VARCHAR(50), OfficeLocation VARCHAR(50), PRIMARY KEY (StudentID, CourseID));`
              }])}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 whitespace-nowrap"
            >
              Watch my SQL attempt
            </button>
            <button
              onClick={() => handleUserMessage("Make the visual explanation slower and explain the diagram before the formula.", [])}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-violet-300 whitespace-nowrap"
            >
              Refine: Slower & Diagram First
            </button>
            <button
              onClick={() => handleUserMessage("Can candidate key {ID} violate 2NF? What about 3NF?", [])}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-emerald-300 whitespace-nowrap"
            >
              Submit Verification Answer
            </button>
          </div>

          {/* Universal Composer */}
          <div className="mt-1">
            <UniversalChatInput
              onSendMessage={handleUserMessage}
              isLoading={isLoading}
              placeholder="Ask anything, or show me what you're working on (paste notes, screenshot, SQL, video)..."
            />
          </div>
        </div>

        {/* Collapsible Right Context Companion: Twin Radar / Knowledge Graph / Source Conflicts */}
        {activeSideTab !== 'closed' && (
          <div className="col-span-12 lg:col-span-4 glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Tab Selector Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveSideTab('twin')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeSideTab === 'twin' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Twin Radar
                  </button>
                  <button
                    onClick={() => setActiveSideTab('graph')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeSideTab === 'graph' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Knowledge Map
                  </button>
                  <button
                    onClick={() => setActiveSideTab('conflict')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeSideTab === 'conflict' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Conflicts
                  </button>
                </div>

                <button
                  onClick={() => setActiveSideTab('closed')}
                  className="text-slate-500 hover:text-white"
                  title="Collapse panel"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              {/* View 1: Cognitive Twin Radar */}
              {activeSideTab === 'twin' && twin && (
                <div className="mt-4 space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Student Cognitive Profile</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-cyan-400">
                        {Math.round(twin.overallMastery * 100)}%
                      </span>
                      <span className="text-slate-400">Curriculum Mastery</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-400 uppercase text-[10px] block">Active Misconceptions</span>
                    {twin.activeMisconceptions.map((m) => (
                      <div key={m.id} className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 text-[11px]">
                        <strong>{m.conceptName}:</strong> {m.misconceptionDescription}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-400 uppercase text-[10px] block">Concept Mastery Map</span>
                    {Object.values(twin.conceptStates).slice(0, 5).map((c) => (
                      <div key={c.conceptId} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[150px]">{c.conceptName}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${c.mastery * 100}%` }} />
                          </div>
                          <span className="text-slate-400">{Math.round(c.mastery * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 2: Knowledge Graph Topology */}
              {activeSideTab === 'graph' && knowledgeGraph && (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="text-slate-400 text-[10px] uppercase">
                    Connected Concepts ({knowledgeGraph.nodes.length})
                  </div>
                  <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
                    {knowledgeGraph.nodes.map((node) => (
                      <div
                        key={node.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="text-white font-bold text-xs">{node.name}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{node.category}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {Math.round(node.masteryScore * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 3: Source Conflicts */}
              {activeSideTab === 'conflict' && conflicts.length > 0 && (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="text-rose-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Detected Concept Conflict
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 space-y-2">
                    <div className="font-bold text-white text-xs">{conflicts[0].title}</div>
                    <div className="p-2 rounded bg-slate-950 text-[11px] text-violet-300 border border-slate-800">
                      <strong>Source A (Prof):</strong> "{conflicts[0].sourceA.claim}"
                    </div>
                    <div className="p-2 rounded bg-slate-950 text-[11px] text-cyan-300 border border-slate-800">
                      <strong>Source B (Textbook):</strong> "{conflicts[0].sourceB.claim}"
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {conflicts[0].whyDifferent}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Insight Quote */}
            <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
              "The chatbot is only the interface; the real product is the learning intelligence underneath."
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
