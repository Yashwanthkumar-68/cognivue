import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Home,
  BrainCircuit,
  Bookmark,
  BookOpen,
  Compass,
  FileText,
  Sparkles,
  Settings,
  Upload,
  Image as ImageIcon,
  Video,
  Code2,
  Link2,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Paperclip,
  Mic,
  Send,
  AlertTriangle,
  Layers,
  ArrowRight,
  X,
  CheckCircle2,
  Clock,
  Plus,
  Activity
} from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore.js';
import { ElahMapper } from '@learnlens/lesson-engine';

export const LearnLensChatStudio: React.FC = () => {
  const {
    lessonPlan,
    currentFrame,
    isPlaying,
    setFrame,
    setIsPlaying,
    loadDemoBenchmark,
    submitDiagnosticAnswer,
    requestLessonEdit,
    commitEditAction,
    proposedEdit
  } = useStudioStore();

  // Active navigation & tab states
  const [activeNav, setActiveNav] = useState<'home' | 'twin' | 'saved' | 'notebook' | 'path'>('home');
  const [activeChatId, setActiveChatId] = useState<string>('dbms_norm');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'attempt' | 'visual' | 'concepts' | 'practice'>('attempt');
  const [chatInput, setChatInput] = useState<string>('');
  const [videoPlayTime, setVideoPlayTime] = useState<number>(67); // 01:07 in seconds
  const totalVideoDuration = 134; // 02:14 in seconds

  // Interactive attachments preview state
  const [attachments, setAttachments] = useState([
    { id: 'att_video', type: 'video', name: 'attempt_recording.mp4', duration: '02:14' },
    { id: 'att_pdf', type: 'pdf', name: 'question_paper.pdf', size: '1.2 MB' },
    { id: 'att_img', type: 'image', name: 'er_diagram.png', size: '340 KB' }
  ]);

  // Video scrubber milestone markers
  const milestones = [
    { time: 0, label: '00:00 Correct', status: 'correct' },
    { time: 30, label: '00:30 Correct', status: 'correct' },
    { time: 67, label: '01:07 First deviation', status: 'deviation' },
    { time: 95, label: '01:35 Error propagates', status: 'propagate' },
    { time: 134, label: '02:14 Completed', status: 'completed' }
  ];

  // Natural language edit input in visual mode
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [practiceAnswer, setPracticeAnswer] = useState<string>('');
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  // Playback timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setVideoPlayTime((prev) => {
          if (prev >= totalVideoDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Ensure demo benchmark is bootstrapped for elah lesson data
  useEffect(() => {
    if (!lessonPlan) {
      loadDemoBenchmark();
    }
  }, [lessonPlan, loadDemoBenchmark]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatInput('');
  };

  const handlePracticeSubmit = async () => {
    if (!practiceAnswer.trim()) return;
    const res = await submitDiagnosticAnswer('diag_q1', practiceAnswer);
    if (res && !res.hasMisconception) {
      setPracticeFeedback('🎉 Correct! You identified that a LEFT JOIN ensures all students are retained even if unassigned to a course.');
    } else {
      setPracticeFeedback('💡 Notice that INNER JOIN filters out students with NULL course_id. A LEFT JOIN preserves all student rows.');
    }
  };

  const frameState = lessonPlan ? ElahMapper.resolveFrame(lessonPlan, currentFrame) : null;
  const timecode = lessonPlan ? ElahMapper.framesToTimecode(currentFrame, lessonPlan.fps) : '00:00';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* =========================================================================
          LEFT SIDEBAR: Branding, New Chat, Nav Links, Chats History, Profile
         ========================================================================= */}
      <aside className="w-64 min-w-[16rem] h-full bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between p-3.5 select-none z-20">
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
          
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-[1.5px] shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-400 font-black text-lg">
                  ℒ
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-[15px] tracking-tight">LearnLens</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  Beta
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Your learning, understood.</p>
            </div>
          </div>

          {/* + New Chat Button */}
          <button
            onClick={() => {
              setAttachments([
                { id: 'att_video', type: 'video', name: 'attempt_recording.mp4', duration: '02:14' },
                { id: 'att_pdf', type: 'pdf', name: 'question_paper.pdf', size: '1.2 MB' },
                { id: 'att_img', type: 'image', name: 'er_diagram.png', size: '340 KB' }
              ]);
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>New Chat</span>
          </button>

          {/* Main Navigation Menu */}
          <nav className="flex flex-col gap-1 text-xs">
            <button
              onClick={() => setActiveNav('home')}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium ${
                activeNav === 'home'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveNav('twin')}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium ${
                activeNav === 'twin'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Learning Twin</span>
            </button>
            <button
              onClick={() => setActiveNav('saved')}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium ${
                activeNav === 'saved'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Lessons</span>
            </button>
            <button
              onClick={() => setActiveNav('notebook')}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium ${
                activeNav === 'notebook'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Notebook</span>
            </button>
            <button
              onClick={() => setActiveNav('path')}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium ${
                activeNav === 'path'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Learning Path</span>
            </button>
          </nav>

          {/* Categorized Chats List */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Chats</span>
              <Search className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
            </div>

            {/* Today */}
            <div className="space-y-1">
              <div className="text-[10px] font-medium text-slate-500 px-2">Today</div>
              <button
                onClick={() => setActiveChatId('dbms_norm')}
                className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeChatId === 'dbms_norm'
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">DBMS - Normalization</span>
              </button>
              <button
                onClick={() => setActiveChatId('sql_query')}
                className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeChatId === 'sql_query'
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">SQL Query Analysis</span>
              </button>
              <button
                onClick={() => setActiveChatId('os_scheduling')}
                className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeChatId === 'os_scheduling'
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">OS - Process Scheduling</span>
              </button>
            </div>

            {/* Yesterday */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-medium text-slate-500 px-2">Yesterday</div>
              <button
                onClick={() => setActiveChatId('cn_notes')}
                className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">CN Notes Explanation</span>
              </button>
              <button
                onClick={() => setActiveChatId('discrete_math')}
                className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">Discrete Maths Problem</span>
              </button>
              <button
                onClick={() => setActiveChatId('ppt_analysis')}
                className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">Upload & Analyze PPT</span>
              </button>
            </div>

            {/* This Week */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-medium text-slate-500 px-2">This Week</div>
              <button
                onClick={() => setActiveChatId('dsa_graphs')}
                className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">DSA - Graphs</span>
              </button>
              <button
                onClick={() => setActiveChatId('java_errors')}
                className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">Java Lab Errors</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Upgrade Card & User Profile */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          {/* Upgrade Card */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upgrade your learning</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Unlock advanced analysis and personalized learning paths.
            </p>
            <button className="w-full py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-[11px] border border-slate-700 transition-all">
              Learn More
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                S
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">Student</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px]">student@learnlens.com</div>
              </div>
            </div>
            <button className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/50">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          CENTER WORKSPACE: Main Chat Studio, Hero Cards, Stream, Split Player
         ========================================================================= */}
      <main className="flex-1 h-full flex flex-col justify-between overflow-hidden relative">
        
        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin space-y-6 max-w-5xl mx-auto w-full">
          
          {/* Hero Greeting */}
          <div className="text-center pt-2 pb-4 space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              What are you working on today?
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-normal">
              Drop anything — notes, PDFs, images, code, audio, video or just ask a question.
            </p>
          </div>

          {/* 5 Quick Action / Material Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {/* 1. Upload Files */}
            <div className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Upload Files</div>
                <div className="text-[10px] text-slate-500">PDF, PPT, DOC</div>
              </div>
            </div>

            {/* 2. Images */}
            <div className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Images</div>
                <div className="text-[10px] text-slate-500">Diagrams, Notes</div>
              </div>
            </div>

            {/* 3. Audio / Video */}
            <div className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Audio / Video</div>
                <div className="text-[10px] text-slate-500">Lectures, Attempts</div>
              </div>
            </div>

            {/* 4. Code */}
            <div className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Code</div>
                <div className="text-[10px] text-slate-500">Any language</div>
              </div>
            </div>

            {/* 5. Links */}
            <div className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Links</div>
                <div className="text-[10px] text-slate-500">Web pages, Docs</div>
              </div>
            </div>
          </div>

          {/* ==========================================
              CONVERSATION STREAM
             ========================================== */}
          <div className="space-y-6 pt-2">
            
            {/* 1. Student Message with Attachments */}
            <div className="flex flex-col items-end gap-2.5">
              <div className="flex items-center gap-3">
                <div className="bg-[#121829] border border-slate-800/90 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xl text-xs md:text-sm text-slate-200 shadow-md">
                  <p>Here is my attempt for this SQL problem. Analyze where I went wrong and explain it visually.</p>
                  <div className="text-right text-[10px] font-mono text-slate-500 mt-1">10:24 AM</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  S
                </div>
              </div>

              {/* Attachments Row */}
              <div className="flex flex-wrap items-center gap-2 pr-11">
                {/* Attachment 1: Video Card */}
                {attachments.some(a => a.id === 'att_video') && (
                  <div className="relative group bg-[#0e1322] border border-slate-800/90 hover:border-slate-700 rounded-xl p-1.5 flex items-center gap-2 shadow-sm">
                    <div className="relative w-24 h-14 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 to-slate-950/80" />
                      <div className="z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
                        <Play className="w-2.5 h-2.5 fill-current text-white" />
                        <span>02:14</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment('att_video')}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* Attachment 2: PDF Card */}
                {attachments.some(a => a.id === 'att_pdf') && (
                  <div className="relative group bg-[#0e1322] border border-slate-800/90 hover:border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-[9px]">
                      PDF
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-200">question_paper.pdf</div>
                      <div className="text-[10px] text-slate-500">1.2 MB</div>
                    </div>
                    <button
                      onClick={() => removeAttachment('att_pdf')}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* Attachment 3: ER Diagram PNG Card */}
                {attachments.some(a => a.id === 'att_img') && (
                  <div className="relative group bg-[#0e1322] border border-slate-800/90 hover:border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-200">er_diagram.png</div>
                      <div className="text-[10px] text-slate-500">340 KB</div>
                    </div>
                    <button
                      onClick={() => removeAttachment('att_img')}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. LearnLens AI Response Bubble & Breakpoint Cockpit */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-[1.5px] shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0 mt-1">
                <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-400 font-black text-sm">
                    ℒ
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide">LearnLens</span>
                  <span className="text-[10px] font-mono text-slate-500">10:25 AM</span>
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  I've analyzed your attempt. Here's where the first deviation occurred and an explanation with a visual walkthrough.
                </p>

                {/* Sub-tab Pill Navigation */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveAnalysisTab('attempt')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activeAnalysisTab === 'attempt'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#101524] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Attempt Analysis</span>
                  </button>

                  <button
                    onClick={() => setActiveAnalysisTab('visual')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activeAnalysisTab === 'visual'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#101524] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Visual Explanation</span>
                  </button>

                  <button
                    onClick={() => setActiveAnalysisTab('concepts')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activeAnalysisTab === 'concepts'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#101524] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Related Concepts</span>
                  </button>

                  <button
                    onClick={() => setActiveAnalysisTab('practice')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activeAnalysisTab === 'practice'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#101524] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Practice Questions</span>
                  </button>
                </div>

                {/* ==============================================================
                    MAIN INTERACTIVE CARD: Attempt Analysis & First Deviation
                   ============================================================== */}
                {activeAnalysisTab === 'attempt' && (
                  <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left 7 Columns: Code View & Video Timeline Scrubber */}
                    <div className="lg:col-span-7 p-4 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between space-y-4">
                      {/* Code Snippet */}
                      <div className="relative rounded-xl bg-[#080b13] p-4 font-mono text-xs text-slate-300 border border-slate-800/80 leading-relaxed overflow-x-auto">
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none">1</span>
                          <span><span className="text-blue-400 font-semibold">SELECT</span> s.name, c.course_name</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none">2</span>
                          <span><span className="text-blue-400 font-semibold">FROM</span> students s</span>
                        </div>
                        {/* Highlighted Line 3: Deviation */}
                        <div className="flex gap-4 bg-rose-950/40 -mx-4 px-4 py-0.5 border-l-2 border-rose-500 my-0.5">
                          <span className="text-rose-400 select-none font-bold">3</span>
                          <span>
                            <span className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              INNER JOIN
                            </span>{' '}
                            courses c
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none">4</span>
                          <span><span className="text-blue-400 font-semibold">ON</span> s.course_id = c.id</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none">5</span>
                          <span><span className="text-blue-400 font-semibold">WHERE</span> c.department = <span className="text-amber-300">'CSE'</span>;</span>
                        </div>

                        {/* Central Play Overlay Button */}
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      {/* Video Scrubber & Deviation Markers */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="text-cyan-400 font-bold">
                            {formatSeconds(videoPlayTime)} / {formatSeconds(totalVideoDuration)}
                          </span>
                          <span className="text-[10px] text-slate-500">Screen Recording Attempt</span>
                        </div>

                        {/* Progress Bar Track */}
                        <div
                          className="relative h-2 rounded-full bg-slate-800 cursor-pointer overflow-hidden"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            setVideoPlayTime(Math.floor(pos * totalVideoDuration));
                          }}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-rose-500"
                            style={{ width: `${(videoPlayTime / totalVideoDuration) * 100}%` }}
                          />
                        </div>

                        {/* Milestones Below Scrubber */}
                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                          {milestones.map((m, idx) => {
                            const isDeviation = m.status === 'deviation';
                            const isPropagate = m.status === 'propagate';
                            return (
                              <button
                                key={idx}
                                onClick={() => setVideoPlayTime(m.time)}
                                className="flex flex-col items-center hover:opacity-100 transition-opacity"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full mb-1 ${
                                    isDeviation
                                      ? 'bg-rose-500 ring-2 ring-rose-500/30'
                                      : isPropagate
                                      ? 'bg-rose-400'
                                      : 'bg-cyan-400'
                                  }`}
                                />
                                <span className={isDeviation ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                                  {m.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Columns: First Deviation Diagnostic Panel */}
                    <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4 bg-[#0a0e18]/80">
                      <div className="space-y-3.5">
                        {/* Header: First Deviation + Timestamp Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <span>First Deviation</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                            01:07
                          </span>
                        </div>

                        {/* What you did */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">What you did</div>
                          <div className="inline-block px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold">
                            Used INNER JOIN
                          </div>
                        </div>

                        {/* What was needed */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">What was needed</div>
                          <div className="inline-block px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
                            LEFT JOIN
                          </div>
                        </div>

                        {/* Why this matters */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Why this matters</div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            INNER JOIN only returns matching records, so students without a course are lost. The question requires all students, including those without a course, so a LEFT JOIN is needed.
                          </p>
                        </div>

                        {/* Underlying Concept Chip */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Underlying concept</div>
                          <button
                            onClick={() => setActiveAnalysisTab('visual')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-medium transition-all"
                          >
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            <span>Join semantics</span>
                          </button>
                        </div>
                      </div>

                      {/* Primary CTA Button: Show Visual Explanation */}
                      <button
                        onClick={() => setActiveAnalysisTab('visual')}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                      >
                        <span>Show Visual Explanation</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ==============================================================
                    TAB 2: Visual Explanation (Powered by elah Timeline Engine)
                   ============================================================== */}
                {activeAnalysisTab === 'visual' && (
                  <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                        <Play className="w-4 h-4 fill-current" />
                        <span>elah Frame-Accurate Visual Lesson: {lessonPlan?.lessonTitle || 'Relational Join Semantics & Null Preservation'}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Frame: <strong className="text-cyan-300">{currentFrame}</strong> / {lessonPlan?.totalFrames || 1350} ({timecode})
                      </span>
                    </div>

                    {/* Visual Canvas Simulator */}
                    <div className="relative aspect-video rounded-xl bg-[#070a12] border border-slate-800 overflow-hidden flex flex-col justify-between p-6">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                          {frameState?.activeSteps?.[0]?.title || 'Preserving Unmatched Records in LEFT JOIN'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">30 FPS • Integer Timeline</span>
                      </div>

                      {/* Dynamic Visual Representation */}
                      <div className="flex items-center justify-center gap-8 py-4">
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-center space-y-2">
                          <div className="text-xs font-bold text-white">Students (Left Table)</div>
                          <div className="font-mono text-[11px] text-slate-400 space-y-1">
                            <div className="p-1 rounded bg-slate-950 text-cyan-300">101: Alice</div>
                            <div className="p-1 rounded bg-slate-950 text-cyan-300">102: Bob</div>
                            <div className="p-1 rounded bg-slate-950 text-rose-400 font-bold border border-rose-500/40">103: Charlie (No Course)</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 text-cyan-400 font-mono text-xs">
                          <span>LEFT JOIN</span>
                          <ArrowRight className="w-6 h-6 animate-pulse" />
                          <span className="text-[9px] text-slate-400">Preserves Charlie!</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-center space-y-2">
                          <div className="text-xs font-bold text-white">Courses (Right Table)</div>
                          <div className="font-mono text-[11px] text-slate-400 space-y-1">
                            <div className="p-1 rounded bg-slate-950 text-indigo-300">C1: Database</div>
                            <div className="p-1 rounded bg-slate-950 text-indigo-300">C2: Algorithms</div>
                            <div className="p-1 rounded bg-slate-950 text-slate-500">NULL</div>
                          </div>
                        </div>
                      </div>

                      {/* Active Subtitle */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center text-xs text-slate-200">
                        "{frameState?.activeSteps?.[0]?.voiceoverScript || frameState?.activeSteps?.[0]?.captionText || 'A LEFT JOIN guarantees that every record from the left table is included in the output, substituting NULL for missing right-table values.'}"
                      </div>
                    </div>

                    {/* Timeline Slider */}
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={lessonPlan?.totalFrames || 1350}
                        value={currentFrame}
                        onChange={(e) => setFrame(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Frame 0</span>
                        <span>Frame {lessonPlan?.totalFrames || 1350}</span>
                      </div>
                    </div>

                    {/* Natural Language Visual Edit Bar */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder='Prompt elah: "Explain the diagram before the formula" or "Highlight Charlie with a red border"...'
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => {
                          if (editPrompt.trim()) {
                            requestLessonEdit(editPrompt);
                            setEditPrompt('');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all"
                      >
                        Apply Edit
                      </button>
                    </div>

                    {/* Proposed Edit Diff Banner */}
                    {proposedEdit && (
                      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-cyan-300 font-bold">
                          <span>Proposed Edit Diff Preview</span>
                          <span className="font-mono text-[10px]">{proposedEdit.operations?.[0]?.op?.toUpperCase() || 'EDIT'}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{proposedEdit.aiInterpretation || proposedEdit.previewDiffSummary?.join('; ')}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => commitEditAction('keep')}
                            className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[11px]"
                          >
                            KEEP
                          </button>
                          <button
                            onClick={() => commitEditAction('discard')}
                            className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                          >
                            DISCARD
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ==============================================================
                    TAB 3: Related Concepts
                   ============================================================== */}
                {activeAnalysisTab === 'concepts' && (
                  <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl p-5 space-y-3">
                    <div className="text-xs font-bold text-white">Connected Concepts & Prerequisites</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="font-bold text-cyan-300">Join Semantics (INNER vs OUTER)</div>
                        <p className="text-[11px] text-slate-400">
                          Understanding Cartesian products, filtering on match conditions, and null padding.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="font-bold text-indigo-300">Relational Normalization & 3NF</div>
                        <p className="text-[11px] text-slate-400">
                          Eliminating transitive dependencies so instructor office attributes don't live in student tables.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==============================================================
                    TAB 4: Practice Questions (Active Recall)
                   ============================================================== */}
                {activeAnalysisTab === 'practice' && (
                  <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl p-5 space-y-4">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Active Recall Challenge: Verify Your Insight</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      "Why does <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">SELECT * FROM students s INNER JOIN courses c ON s.course_id = c.id</code> fail to show newly admitted students who have not yet enrolled in any course?"
                    </p>

                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={practiceAnswer}
                        onChange={(e) => setPracticeAnswer(e.target.value)}
                        placeholder="Write your diagnostic answer here..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handlePracticeSubmit}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                        >
                          Submit Answer
                        </button>
                        {practiceFeedback && (
                          <div className="text-xs font-medium text-cyan-300">
                            {practiceFeedback}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM INPUT COMPOSER: Pill Input Bar with Quick Action Icons
           ========================================================================= */}
        <div className="p-4 bg-gradient-to-t from-[#090d16] via-[#090d16]/95 to-transparent z-10 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 bg-[#0e1322] border border-slate-800/90 rounded-2xl px-3 py-2 shadow-2xl focus-within:border-blue-500/50 transition-colors">
            
            {/* Left Attachment Icon */}
            <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything or drop your files here..."
              className="flex-1 bg-transparent border-none text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2"
            />

            {/* Right Action Icons */}
            <div className="flex items-center gap-1">
              <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                <Code2 className="w-4 h-4" />
              </button>
              <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                <Link2 className="w-4 h-4" />
              </button>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all active:scale-95 ml-1"
              >
                <Send className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          RIGHT SIDEBAR: Search, Learning Pulse, Constellation, Misconceptions, Progress
         ========================================================================= */}
      <aside className="w-80 min-w-[20rem] h-full bg-[#0b0f19] border-l border-slate-800/80 flex flex-col justify-between p-4 overflow-y-auto scrollbar-thin space-y-5 select-none z-20">
        
        {/* Top Search Bar & Bell */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#0e1322] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none flex-1"
            />
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
              Ctrl K
            </span>
          </div>
          <button className="p-2 rounded-xl bg-[#0e1322] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>

        {/* 1. Learning Pulse (Doughnut Chart) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Learning Pulse</span>
            </div>
            <button className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-4 pt-1">
            {/* Doughnut Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                />
                {/* 4 Stable (Emerald) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="40 100"
                  strokeDashoffset="0"
                />
                {/* 2 Needs Attention (Amber) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeDasharray="25 100"
                  strokeDashoffset="-40"
                />
                {/* 1 Misconception (Rose) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeDasharray="15 100"
                  strokeDashoffset="-65"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-base font-extrabold text-white">7</div>
                <div className="text-[9px] text-slate-400 font-medium">Skills</div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-[11px] font-medium">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>4 Stable</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>2 Needs attention</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>1 Misconception</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>3 Not assessed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Knowledge Constellation (Graph Visualizer) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
              <span>Knowledge Constellation</span>
            </div>
            <button className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>Explore</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Graph Node View */}
          <div className="relative h-44 rounded-xl bg-[#070a12] border border-slate-800/80 overflow-hidden flex items-center justify-center p-2">
            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800" strokeWidth="1.2">
              <line x1="50%" y1="50%" x2="22%" y2="30%" />
              <line x1="50%" y1="50%" x2="78%" y2="28%" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="18%" y2="70%" />
              <line x1="50%" y1="50%" x2="50%" y2="82%" />
              <line x1="50%" y1="50%" x2="82%" y2="72%" />
              <line x1="50%" y1="50%" x2="50%" y2="18%" />
            </svg>

            {/* Central DBMS Node */}
            <div className="z-10 px-3 py-1.5 rounded-full bg-blue-950 border border-blue-500/50 text-blue-300 font-bold text-xs shadow-glow-cyan">
              DBMS
            </div>

            {/* Satellite Connected Nodes */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ER Model</span>
            </div>

            <div className="absolute top-6 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SQL Basics</span>
            </div>

            <div className="absolute top-5 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/50 text-[10px] text-rose-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>Normalization</span>
            </div>

            <div className="absolute bottom-10 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Joins</span>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Subqueries</span>
            </div>

            <div className="absolute bottom-9 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Transactions</span>
            </div>
          </div>
        </div>

        {/* 3. Misconception Map (Hierarchy Tree) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Misconception Map</span>
            </div>
            <button className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-xl bg-[#070a12] border border-slate-800/80 p-3 space-y-3">
            {/* Top Root: Normalization */}
            <div className="flex justify-center">
              <div className="px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Normalization</span>
              </div>
            </div>

            {/* Tree Branches */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {/* Branch 1 */}
              <div className="p-2 rounded-lg bg-slate-900/90 border border-emerald-500/30 space-y-1.5 text-center">
                <div className="text-emerald-300 font-semibold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Functional Dependency</span>
                </div>
                <div className="flex items-center justify-center gap-1 pt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[9px]">Partial Dep</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 text-[9px]">2NF</span>
                </div>
              </div>

              {/* Branch 2 */}
              <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/30 space-y-1.5 text-center">
                <div className="text-amber-300 font-semibold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Transitive Dependency</span>
                </div>
                <div className="flex items-center justify-center gap-1 pt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px]">3NF</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">BCNF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Today's Progress (Activity Timeline) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Today's Progress</span>
            </div>
            <button className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>See details</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pl-2 text-xs relative border-l border-slate-800 ml-2">
            {/* Item 1 */}
            <div className="relative pl-4 space-y-0.5">
              <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0d121f]" />
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">Material analyzed</div>
                <div className="text-[10px] text-slate-500 font-mono">10:12 AM</div>
              </div>
              <div className="text-[10px] text-slate-400">4 sources (PDF, ER, Notes, Code)</div>
            </div>

            {/* Item 2 */}
            <div className="relative pl-4 space-y-0.5">
              <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0d121f]" />
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">Attempt analyzed</div>
                <div className="text-[10px] text-slate-500 font-mono">10:25 AM</div>
              </div>
              <div className="text-[10px] text-slate-400">First deviation at 01:07</div>
            </div>

            {/* Item 3 */}
            <div className="relative pl-4 space-y-0.5">
              <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-[#0d121f]" />
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">Visual lesson generated</div>
                <div className="text-[10px] text-slate-500 font-mono">10:27 AM</div>
              </div>
              <div className="text-[10px] text-slate-400">Join semantics (elah timeline)</div>
            </div>

            {/* Item 4 */}
            <div className="relative pl-4 space-y-0.5">
              <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-[#0d121f]" />
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">Next recommended</div>
                <div className="text-[10px] text-slate-500 font-mono">10:27 AM</div>
              </div>
              <div className="text-[10px] text-slate-400">Practice 3 more questions</div>
            </div>
          </div>
        </div>

      </aside>

    </div>
  );
};
