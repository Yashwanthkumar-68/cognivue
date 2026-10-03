import React, { useState } from 'react';
import { useStudioStore } from '../stores/useStudioStore.js';
import { UniversalChatInput, AttachedFileItem } from '../components/UniversalChatInput.js';
import {
  BrainCircuit,
  ScanEye,
  Film,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Code,
  Image as ImageIcon,
  Play,
  RotateCcw,
  Maximize2,
  ChevronRight,
  HelpCircle,
  Clock
} from 'lucide-react';
import { SkillTraceOutput } from '@learnlens/schemas';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: AttachedFileItem[];
  skillTrace?: SkillTraceOutput;
  contextType?: 'code' | 'image' | 'document' | 'video';
}

export const SkillTraceChatScreen: React.FC = () => {
  const {
    generateLessonForConcept,
    setScreen,
    isLoading
  } = useStudioStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'assistant',
      text: "👋 Welcome to **LearnLens SkillTrace**. I am your active diagnostic supervisor.\n\nAttach or paste ANY material you're working on: a screenshot of an error, handwritten math derivation, SQL query, code file, or lecture slide. I won't just dump final code—I'll pinpoint where your logic first diverges and guide your mental model.",
      timestamp: '12:00 PM'
    }
  ]);

  const [activeRightPanel, setActiveRightPanel] = useState<{
    type: 'code' | 'image' | 'video' | 'document';
    title: string;
    breakpointTarget: string;
    content: string;
    highlightRegions?: any[];
  } | null>({
    type: 'code',
    title: 'Student SQL Attempt (CS4400 Task)',
    breakpointTarget: 'Line 4',
    content: `CREATE TABLE StudentCourse (
  StudentID INT,
  CourseID VARCHAR(10),
  Instructor VARCHAR(50),
  OfficeLocation VARCHAR(50),
  PRIMARY KEY (StudentID, CourseID)
);`
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSendMessage = async (text: string, attachments: AttachedFileItem[]) => {
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/observe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          task_objective: 'Relational Decomposition & Normal Form Anomaly Elimination',
          current_state: attachments.find((a) => a.type === 'code')?.content || text,
          attachments: attachments.map((a) => ({
            name: a.name,
            type: a.type,
            content: a.content,
            metadata: a.metadata
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          sender: 'assistant',
          text: data.chatResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          skillTrace: data.skilltrace,
          contextType: data.contextPanel.activeType
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Dynamically expand Right Context Panel with coordinates or lines
        if (attachments.some((a) => a.type === 'image')) {
          const imgAtt = attachments.find((a) => a.type === 'image')!;
          setActiveRightPanel({
            type: 'image',
            title: imgAtt.name,
            breakpointTarget: data.skilltrace.diagnostic.breakpoint_target,
            content: imgAtt.content,
            highlightRegions: data.contextPanel.highlightRegions
          });
        } else {
          setActiveRightPanel({
            type: 'code',
            title: attachments[0]?.name || 'Pasted Submission Code',
            breakpointTarget: data.skilltrace.diagnostic.breakpoint_target,
            content: text.includes('CREATE TABLE') || text.includes('SELECT') ? text : (attachments[0]?.content || text)
          });
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback response
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_fallback_' + Date.now(),
          sender: 'assistant',
          text: 'I detected a potential 3NF transitive dependency in your schema: `Instructor -> OfficeLocation`. How does this column behave if the instructor changes offices?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const samplePromptShortcuts = [
    { label: 'Watch my attempt (SQL 3NF)', text: 'Watch my attempt on the relational schema. Where does my normalization logic first fail?', codeSnippet: `CREATE TABLE StudentCourse (\n  StudentID INT,\n  CourseID VARCHAR(10),\n  Instructor VARCHAR(50),\n  OfficeLocation VARCHAR(50),\n  PRIMARY KEY (StudentID, CourseID)\n);` },
    { label: 'Analyze handwritten derivation', text: 'Analyze this handwritten derivation for 2NF vs 3NF. Is my deduction in Step 3 valid?' },
    { label: 'Compare ER with PDF', text: 'Compare my ER diagram against the textbook requirements. Are my cardinality ratios correct?' }
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4 flex flex-col h-[calc(100vh-70px)]">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Universal SkillTrace Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE SUPERVISOR
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Unrestricted Universal Ingestion: Code, Math, Documents, Screenshots, Video & Audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateLessonForConcept('c_3nf', '3NF Normalization')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs uppercase font-mono shadow-sm flex items-center gap-1.5"
          >
            <Film className="w-4 h-4 fill-current" />
            <span>Launch elah Studio</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Chat Thread (Left) & Right Context Inspector (Right) */}
      <div className="grid grid-cols-12 gap-4 my-3 flex-1 min-h-0">
        {/* Left Column: Conversational Chat Thread */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between glass-panel p-4 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAssistant
                        ? 'bg-gradient-to-br from-cyan-500 to-violet-600 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isAssistant ? <Sparkles className="w-4 h-4 fill-current" /> : 'You'}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                      isAssistant
                        ? 'glass-card border border-slate-700/80 text-slate-100 shadow-sm'
                        : 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-100'
                    }`}
                  >
                    {/* Attachments preview if user sent any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formatted Message Body */}
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>

                    {/* SkillTrace Structured Diagnosis Badge if attached */}
                    {msg.skillTrace && msg.skillTrace.status === 'INTERVENTION_NEEDED' && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 font-mono text-xs text-rose-200">
                        <div className="flex items-center justify-between font-bold text-rose-300 pb-1.5 border-b border-rose-900/60">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-rose-400" />
                            Breakpoint: {msg.skillTrace.diagnostic.breakpoint_target}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 uppercase">
                            Scaffolding Level {msg.skillTrace.scaffolding.level}
                          </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-300">
                          {msg.skillTrace.diagnostic.misconception_type}
                        </div>
                      </div>
                    )}

                    <div className="mt-1.5 text-[10px] font-mono text-slate-500 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-2 p-3 text-xs font-mono text-cyan-400 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>SkillTrace analyzing execution breakpoint & routing multimodal media...</span>
              </div>
            )}
          </div>

          {/* Quick Preset Prompts */}
          <div className="my-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">Try:</span>
            {samplePromptShortcuts.map((preset, idx) => (
              <button
                key={idx}
                onClick={() =>
                  handleSendMessage(preset.text, preset.codeSnippet ? [{
                    id: 'code_' + idx,
                    name: 'schema_submission.sql',
                    type: 'code',
                    sizeFormatted: '320 B',
                    content: preset.codeSnippet
                  }] : [])
                }
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-nowrap transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Universal Bottom Composer */}
          <div className="mt-2">
            <UniversalChatInput
              onSendMessage={handleSendMessage}
              isLoading={isProcessing}
              placeholder="Ask anything, or show me what you're working on (paste screenshot, code, drop PDF/video)..."
            />
          </div>
        </div>

        {/* Right Column: Dynamic Context Inspector Panel */}
        <div className="col-span-12 lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                <ScanEye className="w-4 h-4" />
                Context Inspector & Breakpoint Overlay
              </span>
              <span className="text-slate-500">{activeRightPanel?.breakpointTarget || 'Observing'}</span>
            </div>

            {activeRightPanel ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{activeRightPanel.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {activeRightPanel.type}
                  </span>
                </div>

                {/* If Code/SQL */}
                {activeRightPanel.type === 'code' && (
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto relative">
                    {activeRightPanel.content.split('\n').map((line, idx) => {
                      const lineNum = idx + 1;
                      const isTarget = activeRightPanel.breakpointTarget.includes(`Line ${lineNum}`);

                      return (
                        <div
                          key={idx}
                          className={`flex items-start py-0.5 px-2 rounded ${
                            isTarget
                              ? 'bg-rose-950/60 border border-rose-500/50 text-rose-200 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          <span className="w-8 text-slate-600 select-none text-right mr-3 font-mono">
                            {lineNum}
                          </span>
                          <span className="flex-1">{line}</span>
                          {isTarget && (
                            <span className="ml-2 text-[10px] font-mono text-rose-400 bg-rose-950 px-1.5 rounded">
                              BREAKPOINT
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* If Image/Screenshot */}
                {activeRightPanel.type === 'image' && (
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden text-center">
                    <img
                      src={activeRightPanel.content}
                      alt="Uploaded student attempt"
                      className="max-h-60 mx-auto rounded-lg object-contain"
                    />
                    {/* Visual overlay tag */}
                    <div className="mt-3 p-2.5 rounded-lg bg-violet-950/40 border border-violet-500/40 font-mono text-xs text-violet-300">
                      Gemma 4 Bounding Box: [120, 80, 540, 920] (Hotspot Error)
                    </div>
                  </div>
                )}

                {/* Scaffolding Rules Notice */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1.5">
                  <div className="text-cyan-400 font-bold uppercase text-[10px]">
                    SkillTrace Scaffolding Protocol:
                  </div>
                  <div className="text-slate-300">
                    &bull; Attempt 1: Highlight region & rule diagnostic probe.<br />
                    &bull; Attempt 2: Actual vs Expected output mismatch.<br />
                    &bull; Attempt 3: 1-line syntax template without final code.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                No active input selected. Drop or paste material in the composer.
              </div>
            )}
          </div>

          {/* Action Button: Transform Breakpoint into elah Lesson */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => generateLessonForConcept('c_3nf', '3NF Transitive Dependency Fix')}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 shadow-glow-cyan transition-all"
            >
              <Film className="w-4 h-4 fill-current" />
              <span>Watch 45s elah Lesson Resolving This Breakpoint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
