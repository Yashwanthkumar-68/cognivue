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
  Activity,
  Check,
  Cpu,
  Trash2,
  HelpCircle,
  TrendingUp,
  Share2,
  Maximize2,
  Loader2
} from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore.js';
import { ElahMapper } from '@learnlens/lesson-engine';
import { sendChatMessage } from '../services/api.js';

interface ChatSession {
  id: string;
  title: string;
  category: 'today' | 'yesterday' | 'week';
  isCustomQuery?: boolean;
  userMessage: string;
  userTime: string;
  attachments: { id: string; type: 'video' | 'pdf' | 'image' | 'code'; name: string; size?: string; duration?: string }[];
  aiMessage: string;
  aiTime: string;
  codeSnippet: {
    language: string;
    lines: { num: number; text: string; highlight?: boolean; highlightLabel?: string }[];
  };
  deviation: {
    time: string;
    whatYouDid: string;
    whatWasNeeded: string;
    whyThisMatters: string;
    underlyingConcept: string;
  };
  milestones: { time: number; label: string; status: 'correct' | 'deviation' | 'propagate' | 'completed' }[];
  totalDuration: number;
  lessonTitle: string;
  practiceQuestion: {
    question: string;
    correctKeyword: string;
    correctExplanation: string;
    incorrectExplanation: string;
  };
  concepts: { name: string; description: string }[];
}

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
    proposedEdit,
    providerMode,
    setProviderMode
  } = useStudioStore();

  // Multi-chat sessions database
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({
    dbms_norm: {
      id: 'dbms_norm',
      title: 'DBMS - Normalization',
      category: 'today',
      userMessage: 'Here is my attempt for this SQL problem. Analyze where I went wrong and explain it visually.',
      userTime: '10:24 AM',
      attachments: [
        { id: 'att_video', type: 'video', name: 'attempt_recording.mp4', duration: '02:14' },
        { id: 'att_pdf', type: 'pdf', name: 'question_paper.pdf', size: '1.2 MB' },
        { id: 'att_img', type: 'image', name: 'er_diagram.png', size: '340 KB' }
      ],
      aiMessage: "I've analyzed your attempt. Here's where the first deviation occurred and an explanation with a visual walkthrough.",
      aiTime: '10:25 AM',
      codeSnippet: {
        language: 'sql',
        lines: [
          { num: 1, text: 'SELECT s.name, c.course_name' },
          { num: 2, text: 'FROM students s' },
          { num: 3, text: 'INNER JOIN courses c', highlight: true, highlightLabel: 'INNER JOIN' },
          { num: 4, text: 'ON s.course_id = c.id' },
          { num: 5, text: "WHERE c.department = 'CSE';" }
        ]
      },
      deviation: {
        time: '01:07',
        whatYouDid: 'Used INNER JOIN',
        whatWasNeeded: 'LEFT JOIN',
        whyThisMatters: 'INNER JOIN only returns matching records, so students without a course are lost. The question requires all students, including those without a course, so a LEFT JOIN is needed.',
        underlyingConcept: 'Join semantics'
      },
      milestones: [
        { time: 0, label: '00:00 Correct', status: 'correct' },
        { time: 30, label: '00:30 Correct', status: 'correct' },
        { time: 67, label: '01:07 First deviation', status: 'deviation' },
        { time: 95, label: '01:35 Error propagates', status: 'propagate' },
        { time: 134, label: '02:14 Completed', status: 'completed' }
      ],
      totalDuration: 134,
      lessonTitle: 'Relational Join Semantics & Null Preservation',
      practiceQuestion: {
        question: 'Why does SELECT * FROM students s INNER JOIN courses c ON s.course_id = c.id fail to show newly admitted students who have not yet enrolled in any course?',
        correctKeyword: 'null',
        correctExplanation: 'Correct! INNER JOIN requires matching keys on both sides, so students with NULL or unassigned course_ids are dropped. LEFT JOIN preserves every student row.',
        incorrectExplanation: 'Notice that newly enrolled students have NULL course_id values. An INNER JOIN discards any rows where the join condition fails, whereas LEFT JOIN preserves all left-table rows.'
      },
      concepts: [
        { name: 'Join Semantics (INNER vs OUTER)', description: 'Cartesian products, join filters, and null-padded unmatched row preservation.' },
        { name: 'Relational Normalization & 3NF', description: 'Eliminating transitive dependencies (X -> Y -> Z) where non-prime attributes depend on other non-prime attributes.' }
      ]
    },
    sql_query: {
      id: 'sql_query',
      title: 'SQL Query Analysis',
      category: 'today',
      userMessage: 'I wrote a query to find employees earning above departmental average, but it returns duplicate rows.',
      userTime: '11:15 AM',
      attachments: [
        { id: 'att_sql', type: 'code', name: 'avg_salary.sql', size: '1.8 KB' },
        { id: 'att_schema', type: 'image', name: 'company_schema.png', size: '512 KB' }
      ],
      aiMessage: 'Identified unintended Cartesian cross product in your FROM clause. Here is the step-by-step breakdown.',
      aiTime: '11:16 AM',
      codeSnippet: {
        language: 'sql',
        lines: [
          { num: 1, text: 'SELECT e.emp_id, e.name, e.salary' },
          { num: 2, text: 'FROM employees e, departments d', highlight: true, highlightLabel: 'Cartesian Cross Join' },
          { num: 3, text: 'WHERE e.salary > (' },
          { num: 4, text: '  SELECT AVG(salary) FROM employees' },
          { num: 5, text: '  WHERE dept_id = e.dept_id' },
          { num: 6, text: ');' }
        ]
      },
      deviation: {
        time: '00:48',
        whatYouDid: 'Referenced departments d without join condition',
        whatWasNeeded: 'Remove departments d or add ON e.dept_id = d.id',
        whyThisMatters: 'Listing multiple tables separated by commas without an explicit join predicate calculates the full Cartesian product, multiplying each employee record by the total number of departments.',
        underlyingConcept: 'Cartesian Product & Cross Joins'
      },
      milestones: [
        { time: 0, label: '00:00 Parsed', status: 'correct' },
        { time: 24, label: '00:24 Subquery OK', status: 'correct' },
        { time: 48, label: '00:48 Cross join deviation', status: 'deviation' },
        { time: 80, label: '01:20 Duplicate rows emitted', status: 'propagate' },
        { time: 105, label: '01:45 Finished', status: 'completed' }
      ],
      totalDuration: 105,
      lessonTitle: 'Correlated Subqueries vs Accidental Cross Products',
      practiceQuestion: {
        question: 'What happens if you omit the WHERE condition in a comma-separated FROM employees e, departments d query?',
        correctKeyword: 'cartesian',
        correctExplanation: 'Exactly. It produces a Cartesian Product (size = |employees| × |departments|).',
        incorrectExplanation: 'A comma join with no condition causes every employee to pair with every department (Cartesian product).'
      },
      concepts: [
        { name: 'Correlated Subqueries', description: 'Inner queries that execute once for every row processed by the outer query.' },
        { name: 'Cartesian Elimination', description: 'Preventing explosive row multiplication in relational algebra.' }
      ]
    },
    os_scheduling: {
      id: 'os_scheduling',
      title: 'OS - Process Scheduling',
      category: 'today',
      userMessage: 'My Round Robin scheduler causes starvation when priority queues are introduced. Where is the bug?',
      userTime: '09:05 AM',
      attachments: [
        { id: 'att_rr', type: 'code', name: 'scheduler.py', size: '3.4 KB' }
      ],
      aiMessage: 'Found priority inversion and queue starvation in your queue pop rotation method.',
      aiTime: '09:06 AM',
      codeSnippet: {
        language: 'python',
        lines: [
          { num: 1, text: 'def schedule_round_robin(ready_queue, quantum):' },
          { num: 2, text: '    while not ready_queue.empty():' },
          { num: 3, text: '        proc = ready_queue.pop_highest_priority()', highlight: true, highlightLabel: 'Strict Priority' },
          { num: 4, text: '        proc.run(quantum)' },
          { num: 5, text: '        if proc.remaining_time > 0:' },
          { num: 6, text: '            ready_queue.push(proc)' }
        ]
      },
      deviation: {
        time: '01:15',
        whatYouDid: 'Called pop_highest_priority() inside Round Robin loop',
        whatWasNeeded: 'Use FIFO queue or Aging mechanism for low-priority processes',
        whyThisMatters: 'Round Robin relies on equal timeslice rotation. By constantly popping the highest priority, lower priority tasks never receive a timeslice, inducing starvation.',
        underlyingConcept: 'Process Starvation & Aging'
      },
      milestones: [
        { time: 0, label: '00:00 Initialized', status: 'correct' },
        { time: 40, label: '00:40 Timeslice OK', status: 'correct' },
        { time: 75, label: '01:15 Starvation deviation', status: 'deviation' },
        { time: 110, label: '01:50 Low priority blocked', status: 'propagate' },
        { time: 140, label: '02:20 Completed', status: 'completed' }
      ],
      totalDuration: 140,
      lessonTitle: 'Round Robin Quantum Fairness & Process Aging',
      practiceQuestion: {
        question: 'How does Aging prevent indefinite starvation in priority-based CPU scheduling?',
        correctKeyword: 'priority',
        correctExplanation: 'Spot on! Aging periodically increases the priority of waiting processes until they execute.',
        incorrectExplanation: 'Aging works by gradually boosting the priority of processes that have waited a long time in the ready queue.'
      },
      concepts: [
        { name: 'CPU Quantum Scheduling', description: 'Fair time-slicing to guarantee responsive turnaround times.' },
        { name: 'Aging Mechanism', description: 'Dynamic priority escalation to prevent starvation.' }
      ]
    },
    cn_notes: {
      id: 'cn_notes',
      title: 'CN Notes Explanation',
      category: 'yesterday',
      userMessage: 'Explain why TCP Congestion Control switches from Slow Start to Congestion Avoidance at ssthresh.',
      userTime: 'Yesterday, 4:10 PM',
      attachments: [{ id: 'att_cn', type: 'pdf', name: 'tcp_congestion.pdf', size: '2.1 MB' }],
      aiMessage: 'Here is the mathematical progression of Slow Start exponential growth vs Congestion Avoidance additive increase.',
      aiTime: 'Yesterday, 4:11 PM',
      codeSnippet: {
        language: 'text',
        lines: [
          { num: 1, text: '// Slow Start Phase' },
          { num: 2, text: 'CWND = CWND + 1 MSS (per ACK) -> Exponential Growth' },
          { num: 3, text: 'if (CWND >= ssthresh) {', highlight: true, highlightLabel: 'ssthresh threshold' },
          { num: 4, text: '  CWND = CWND + (1 / CWND) MSS -> Linear Growth' },
          { num: 5, text: '}' }
        ]
      },
      deviation: {
        time: '00:52',
        whatYouDid: 'Assumed CWND doubles after ssthresh',
        whatWasNeeded: 'Additive Increase (1 MSS per RTT)',
        whyThisMatters: 'Doubling CWND past ssthresh overwhelms router buffers, causing massive packet drops and timeout penalties.',
        underlyingConcept: 'TCP Additive Increase / Multiplicative Decrease'
      },
      milestones: [
        { time: 0, label: '00:00 Handshake', status: 'correct' },
        { time: 30, label: '00:30 Slow Start', status: 'correct' },
        { time: 52, label: '00:52 ssthresh deviation', status: 'deviation' },
        { time: 80, label: '01:20 Buffer overflow', status: 'propagate' },
        { time: 110, label: '01:50 Reno Recovery', status: 'completed' }
      ],
      totalDuration: 110,
      lessonTitle: 'TCP Slow Start vs Congestion Avoidance AIMD',
      practiceQuestion: {
        question: 'What happens to ssthresh and CWND upon detecting packet loss via 3 Duplicate ACKs in TCP Reno?',
        correctKeyword: 'half',
        correctExplanation: 'Correct! ssthresh is set to half the current CWND, and Fast Recovery begins.',
        incorrectExplanation: 'In TCP Reno, 3 duplicate ACKs trigger Fast Retransmit: ssthresh is halved (CWND / 2) and CWND drops to ssthresh + 3 MSS.'
      },
      concepts: [
        { name: 'AIMD Protocol', description: 'Additive Increase Multiplicative Decrease algorithm for network fairness.' }
      ]
    },
    discrete_math: {
      id: 'discrete_math',
      title: 'Discrete Maths Problem',
      category: 'yesterday',
      userMessage: 'Help me prove that in any group of 6 people, there are either 3 mutual friends or 3 mutual strangers.',
      userTime: 'Yesterday, 2:30 PM',
      attachments: [{ id: 'att_dm', type: 'image', name: 'ramsey_graph.png', size: '420 KB' }],
      aiMessage: 'This is Ramsey Theorem R(3, 3) = 6. Here is the Pigeonhole derivation.',
      aiTime: 'Yesterday, 2:31 PM',
      codeSnippet: {
        language: 'text',
        lines: [
          { num: 1, text: 'Let person A have 5 edges to the other 5 people.' },
          { num: 2, text: 'By Pigeonhole Principle (5 edges / 2 colors: Friend/Stranger):' },
          { num: 3, text: 'At least ceil(5/2) = 3 edges must share the same color.', highlight: true, highlightLabel: 'Pigeonhole' },
          { num: 4, text: 'Case 1: 3 edges are Friend -> forms triangle or 3 strangers.' },
          { num: 5, text: 'Case 2: 3 edges are Stranger -> symmetric.' }
        ]
      },
      deviation: {
        time: '01:00',
        whatYouDid: 'Divided 5 edges into unequal partitions without pigeonhole ceiling',
        whatWasNeeded: 'Apply Generalized Pigeonhole: ceil(5/2) = 3',
        whyThisMatters: 'Without the ceiling function, you cannot guarantee at least 3 edges in the same color class.',
        underlyingConcept: 'Ramsey Theory & Pigeonhole Principle'
      },
      milestones: [
        { time: 0, label: '00:00 Graph Setup', status: 'correct' },
        { time: 35, label: '00:35 5 Edges', status: 'correct' },
        { time: 60, label: '01:00 Ceiling deviation', status: 'deviation' },
        { time: 90, label: '01:30 Triangle Proof', status: 'propagate' },
        { time: 120, label: '02:00 Q.E.D.', status: 'completed' }
      ],
      totalDuration: 120,
      lessonTitle: 'Ramsey Theorem R(3,3) & Complete Graph K6',
      practiceQuestion: {
        question: 'Why does a group of 5 people NOT guarantee 3 mutual friends or strangers?',
        correctKeyword: 'cycle',
        correctExplanation: 'Spot on! A 5-cycle graph C5 contains no triangles (K3) and no independent sets of size 3.',
        incorrectExplanation: 'A pentagon graph (C5) has no 3 mutual friends (triangles) and no 3 mutual strangers.'
      },
      concepts: [{ name: 'Ramsey Numbers', description: 'Order in large complete graphs.' }]
    },
    dsa_graphs: {
      id: 'dsa_graphs',
      title: 'DSA - Graphs',
      category: 'week',
      userMessage: 'Why did my Dijkstra algorithm loop forever on a graph with negative edges?',
      userTime: '3 days ago',
      attachments: [{ id: 'att_dsa', type: 'code', name: 'dijkstra.cpp', size: '2.8 KB' }],
      aiMessage: 'Dijkstra assumes edge weights are non-negative. Negative cycles violate greedy optimality.',
      aiTime: '3 days ago',
      codeSnippet: {
        language: 'cpp',
        lines: [
          { num: 1, text: 'priority_queue<pair<int, int>> pq;' },
          { num: 2, text: 'pq.push({0, start_node});' },
          { num: 3, text: 'if (dist[v] > dist[u] + weight) { // weight is negative!', highlight: true, highlightLabel: 'Negative Weight' },
          { num: 4, text: '  dist[v] = dist[u] + weight;' },
          { num: 5, text: '  pq.push({-dist[v], v});' },
          { num: 6, text: '}' }
        ]
      },
      deviation: {
        time: '00:55',
        whatYouDid: 'Applied Dijkstra with negative edge weight',
        whatWasNeeded: 'Use Bellman-Ford algorithm to detect negative weight cycles',
        whyThisMatters: 'Negative cycles allow paths to decrease cost indefinitely. Dijkstra marks visited nodes as final, so it enters an infinite push loop.',
        underlyingConcept: 'Bellman-Ford vs Dijkstra Invariant'
      },
      milestones: [
        { time: 0, label: '00:00 Heap Init', status: 'correct' },
        { time: 25, label: '00:25 Greedy Step', status: 'correct' },
        { time: 55, label: '00:55 Negative cycle', status: 'deviation' },
        { time: 85, label: '01:25 Infinite relaxation', status: 'propagate' },
        { time: 115, label: '01:55 Crash', status: 'completed' }
      ],
      totalDuration: 115,
      lessonTitle: 'Why Dijkstra Fails on Negative Cycles (Use Bellman-Ford)',
      practiceQuestion: {
        question: 'How many relaxation passes does Bellman-Ford perform on a graph with V vertices?',
        correctKeyword: 'v-1',
        correctExplanation: 'Exactly: V - 1 passes, followed by a V-th pass to detect negative cycles.',
        incorrectExplanation: 'Bellman-Ford requires V - 1 full iterations because the longest simple path contains at most V - 1 edges.'
      },
      concepts: [{ name: 'Shortest Path Invariant', description: 'Greedy choice property in graphs.' }]
    },
    java_errors: {
      id: 'java_errors',
      title: 'Java Lab Errors',
      category: 'week',
      userMessage: 'Got java.util.ConcurrentModificationException while removing elements from an ArrayList in a for-each loop.',
      userTime: '4 days ago',
      attachments: [{ id: 'att_java', type: 'code', name: 'StudentList.java', size: '1.5 KB' }],
      aiMessage: 'You are modifying the underlying collection directly instead of using Iterator.remove().',
      aiTime: '4 days ago',
      codeSnippet: {
        language: 'java',
        lines: [
          { num: 1, text: 'for (Student s : studentList) {' },
          { num: 2, text: '  if (s.getGrade() < 50) {' },
          { num: 3, text: '    studentList.remove(s); // Modifies list during iteration', highlight: true, highlightLabel: 'Illegal Mutation' },
          { num: 4, text: '  }' },
          { num: 5, text: '}' }
        ]
      },
      deviation: {
        time: '00:42',
        whatYouDid: 'Called studentList.remove(s) inside enhanced for-loop',
        whatWasNeeded: 'Use iterator.remove() or studentList.removeIf(s -> ...)',
        whyThisMatters: 'Java enhanced for-loop relies on Iterator. Directly mutating the list desynchronizes modCount, throwing ConcurrentModificationException.',
        underlyingConcept: 'Fail-Fast Iterators & modCount'
      },
      milestones: [
        { time: 0, label: '00:00 Loop Enter', status: 'correct' },
        { time: 20, label: '00:20 Next Element', status: 'correct' },
        { time: 42, label: '00:42 modCount mismatch', status: 'deviation' },
        { time: 65, label: '01:05 Exception thrown', status: 'propagate' },
        { time: 90, label: '01:30 Terminated', status: 'completed' }
      ],
      totalDuration: 90,
      lessonTitle: 'Fail-Fast Iterators and Safe Collection Removal',
      practiceQuestion: {
        question: 'Which modern Java 8+ method safely removes elements matching a predicate in a single statement?',
        correctKeyword: 'removeif',
        correctExplanation: 'Spot on! collection.removeIf(predicate) is safe and concise.',
        incorrectExplanation: 'Use Collection.removeIf(filter), which manages iterator safety internally.'
      },
      concepts: [{ name: 'Fail-Fast Iterators', description: 'Internal modCount synchronization.' }]
    }
  });

  // Current active chat session ID
  const [activeChatId, setActiveChatId] = useState<string>('dbms_norm');
  const currentSession = sessions[activeChatId] || sessions['dbms_norm'];

  // Left Nav State
  const [activeNav, setActiveNav] = useState<'home' | 'twin' | 'saved' | 'notebook' | 'path'>('home');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'attempt' | 'visual' | 'concepts' | 'practice'>('attempt');
  const [chatInput, setChatInput] = useState<string>('');
  const [videoPlayTime, setVideoPlayTime] = useState<number>(67);

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Learning Pulse stats
  const [learningPulse, setLearningPulse] = useState({
    stable: 4,
    needsAttention: 2,
    misconception: 1,
    notAssessed: 3
  });

  // Today's Progress Log
  const [progressTimeline, setProgressTimeline] = useState([
    { title: 'Material analyzed', desc: '4 sources (PDF, ER, Notes, Code)', time: '10:12 AM', color: 'bg-emerald-500' },
    { title: 'Attempt analyzed', desc: 'First deviation at 01:07', time: '10:25 AM', color: 'bg-blue-500' },
    { title: 'Visual lesson generated', desc: 'Join semantics (elah timeline)', time: '10:27 AM', color: 'bg-purple-500' },
    { title: 'Next recommended', desc: 'Practice 3 more questions', time: '10:27 AM', color: 'bg-amber-500' }
  ]);

  // Search & Notification states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Deviation Diagnosed', desc: 'SQL INNER JOIN vs LEFT JOIN identified at 01:07.', time: '10:25 AM' },
    { id: 'n2', title: 'Cognitive Twin Updated', desc: 'Join Semantics marked for active remediation.', time: '10:27 AM' },
    { id: 'n3', title: 'Gemma 4 Perception Ready', desc: 'ER diagram entity mapping complete.', time: '10:12 AM' }
  ]);

  // Interactive Constellation & Misconception selection
  const [selectedConstellationNode, setSelectedConstellationNode] = useState<string | null>(null);
  const [selectedMisconceptionNode, setSelectedMisconceptionNode] = useState<string | null>(null);

  // Settings & Link modal states
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkInput, setLinkInput] = useState<string>('');

  // Practice state
  const [practiceAnswer, setPracticeAnswer] = useState<string>('');
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);
  const [practiceIsCorrect, setPracticeIsCorrect] = useState<boolean | null>(null);

  // elah prompt edit state
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isApplyingEdit, setIsApplyingEdit] = useState<boolean>(false);

  // Sync video play time when switching sessions
  useEffect(() => {
    if (currentSession) {
      setVideoPlayTime(currentSession.milestones[2]?.time || 0);
      setPracticeFeedback(null);
      setPracticeAnswer('');
      setPracticeIsCorrect(null);
      setActiveAnalysisTab('attempt');
    }
  }, [activeChatId]);

  // Video playback loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setVideoPlayTime((prev) => {
          if (prev >= currentSession.totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSession.totalDuration, setIsPlaying]);

  // Ensure demo benchmark data is loaded for elah
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

  // Remove attachment
  const removeAttachment = (id: string) => {
    setSessions((prev) => {
      const s = prev[activeChatId];
      if (!s) return prev;
      return {
        ...prev,
        [activeChatId]: {
          ...s,
          attachments: s.attachments.filter((a) => a.id !== id)
        }
      };
    });
  };

  // File Upload Handler (via Quick Action or toolbar)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = Array.from(files).map((f, idx) => {
      const isVideo = f.type.startsWith('video/') || f.name.endsWith('.mp4');
      const isImage = f.type.startsWith('image/') || f.name.endsWith('.png') || f.name.endsWith('.jpg');
      const isPdf = f.type === 'application/pdf' || f.name.endsWith('.pdf');
      const sizeStr = f.size > 1024 * 1024
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(f.size / 1024)} KB`;

      return {
        id: `att_upload_${Date.now()}_${idx}`,
        type: (isVideo ? 'video' : isImage ? 'image' : isPdf ? 'pdf' : 'code') as any,
        name: f.name,
        size: sizeStr,
        duration: isVideo ? '01:45' : undefined
      };
    });

    setSessions((prev) => {
      const s = prev[activeChatId];
      if (!s) return prev;
      return {
        ...prev,
        [activeChatId]: {
          ...s,
          attachments: [...s.attachments, ...newAttachments]
        }
      };
    });

    // Add progress event
    setProgressTimeline((prev) => [
      {
        title: `Added ${files.length} material(s)`,
        desc: Array.from(files).map(f => f.name).join(', '),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: 'bg-emerald-500'
      },
      ...prev
    ]);
  };

  // Handle URL Link addition
  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    const newAtt = {
      id: `att_link_${Date.now()}`,
      type: 'pdf' as any,
      name: linkInput.replace(/https?:\/\//, '').split('/')[0] + ' (Web Resource)',
      size: 'Web Link'
    };
    setSessions((prev) => {
      const s = prev[activeChatId];
      if (!s) return prev;
      return {
        ...prev,
        [activeChatId]: {
          ...s,
          attachments: [...s.attachments, newAtt]
        }
      };
    });
    setLinkInput('');
    setShowLinkModal(false);
  };

  // Handle + New Chat
  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Investigation',
      category: 'today',
      userMessage: 'I need help analyzing this topic and finding my misconceptions.',
      userTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: [],
      aiMessage: "Ready! Paste your code, notes, equation, or screen attempt below and I'll pinpoint the exact logical breakpoint.",
      aiTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      codeSnippet: {
        language: 'sql',
        lines: [
          { num: 1, text: '-- Paste your code or query here' },
          { num: 2, text: 'SELECT * FROM student_learning_twin;' }
        ]
      },
      deviation: {
        time: '00:00',
        whatYouDid: 'New Session Initialized',
        whatWasNeeded: 'Submit an attempt to trace',
        whyThisMatters: 'SkillTrace requires your line-by-line deduction to locate the breakpoint.',
        underlyingConcept: 'Adaptive Learning Diagnosis'
      },
      milestones: [
        { time: 0, label: '00:00 Ready', status: 'correct' },
        { time: 30, label: '00:30 Pending', status: 'correct' }
      ],
      totalDuration: 60,
      lessonTitle: 'Interactive SkillTrace Workspace',
      practiceQuestion: {
        question: 'What is the primary role of SkillTrace in LearnLens?',
        correctKeyword: 'breakpoint',
        correctExplanation: 'Correct! SkillTrace pinpoints the first deviation without giving the direct answer.',
        incorrectExplanation: 'SkillTrace pinpoints the exact breakpoint where reasoning first failed.'
      },
      concepts: [{ name: 'SkillTrace Supervisor', description: 'Active diagnostic supervisor without solution leaking.' }]
    };

    setSessions((prev) => ({ [newId]: newSession, ...prev }));
    setActiveChatId(newId);
  };

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Handle Student Message Send
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;

    const query = chatInput.trim();
    setChatInput('');
    setIsAiLoading(true);

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentAtts = currentSession?.attachments || [];

    // Optimistically update conversation
    setSessions((prev) => {
      const s = prev[activeChatId] || prev['dbms_norm'];
      return {
        ...prev,
        [activeChatId]: {
          ...s,
          userMessage: query,
          userTime: timeNow,
          aiMessage: 'Analyzing with Gemma 4 Perception & Open-Weight Reasoning Engine...',
          aiTime: timeNow,
          isCustomQuery: true
        }
      };
    });

    try {
      const res = await sendChatMessage(query, currentAtts);
      const aiText = res?.text || `Here is the comprehensive learning breakdown for **${query}**.\n\nKey Concepts & Invariants have been mapped to your Learning Twin.`;
      const isAttempt = Boolean(res?.isAttempt);
      const conceptName = res?.concept || query.slice(0, 24);

      setSessions((prev) => {
        const s = prev[activeChatId] || prev['dbms_norm'];
        return {
          ...prev,
          [activeChatId]: {
            ...s,
            userMessage: query,
            userTime: timeNow,
            aiMessage: aiText,
            aiTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCustomQuery: !isAttempt,
            deviation: isAttempt ? s.deviation : {
              time: '00:00',
              whatYouDid: `Inquiry on "${query}"`,
              whatWasNeeded: `Understanding ${conceptName}`,
              whyThisMatters: `Mastering ${conceptName} eliminates core conceptual errors.`,
              underlyingConcept: conceptName
            },
            concepts: [
              { name: conceptName, description: `Core principles and practical implementation of ${conceptName}.` },
              { name: 'Prerequisite Theory', description: 'Foundation principles required for exam & interview mastery.' }
            ],
            practiceQuestion: {
              question: `How would you define or apply ${conceptName} in a real-world scenario?`,
              correctKeyword: conceptName.split(' ')[0].toLowerCase(),
              correctExplanation: `Excellent! You grasped the fundamental role of ${conceptName}.`,
              incorrectExplanation: `Consider how ${conceptName} impacts system behavior and data flow.`
            }
          }
        };
      });

      // Update progress
      setProgressTimeline((prev) => [
        {
          title: `Analyzed: ${conceptName}`,
          desc: query.slice(0, 35) + (query.length > 35 ? '...' : ''),
          time: timeNow,
          color: 'bg-cyan-500'
        },
        ...prev
      ]);

      // Focus constellation
      setSelectedConstellationNode(`${conceptName} (Active Learning Context)`);
    } catch (err) {
      console.error(err);
      setSessions((prev) => {
        const s = prev[activeChatId];
        if (!s) return prev;
        return {
          ...prev,
          [activeChatId]: {
            ...s,
            aiMessage: `I've analyzed your question "${query}". Here are the core conceptual principles:\n\n1. **Core Definition**: Fundamental invariants governing ${query}.\n2. **Common Misconceptions**: Key pitfalls students encounter.\n3. **Active Practice**: Test your knowledge below!`,
            aiTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCustomQuery: true
          }
        };
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Practice Question Submission
  const handlePracticeSubmit = async () => {
    if (!practiceAnswer.trim()) return;
    const answer = practiceAnswer.toLowerCase();
    const isCorrect = answer.includes(currentSession.practiceQuestion.correctKeyword.toLowerCase());

    setPracticeIsCorrect(isCorrect);
    if (isCorrect) {
      setPracticeFeedback(`🎉 ${currentSession.practiceQuestion.correctExplanation}`);
      // Shift 1 misconception to stable!
      setLearningPulse((prev) => ({
        ...prev,
        stable: Math.min(7, prev.stable + 1),
        misconception: Math.max(0, prev.misconception - 1)
      }));
      // Add progress item
      setProgressTimeline((prev) => [
        {
          title: 'Active recall verified',
          desc: `${currentSession.deviation.underlyingConcept} mastered`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: 'bg-emerald-500'
        },
        ...prev
      ]);
    } else {
      setPracticeFeedback(`💡 ${currentSession.practiceQuestion.incorrectExplanation}`);
    }
  };

  // Apply natural language edit in elah timeline
  const handleApplyEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsApplyingEdit(true);
    await requestLessonEdit(editPrompt);
    setIsApplyingEdit(false);
    setEditPrompt('');
  };

  const frameState = lessonPlan ? ElahMapper.resolveFrame(lessonPlan, currentFrame) : null;
  const timecode = lessonPlan ? ElahMapper.framesToTimecode(currentFrame, lessonPlan.fps) : '00:00';

  // Filtered search items
  const searchResults = Object.values(sessions).filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviation.underlyingConcept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2.5 text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-sm md:text-base font-bold text-white pt-2 pb-1 border-b border-slate-800">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('#### ')) {
            return <h4 key={idx} className="text-xs md:text-sm font-semibold text-cyan-300 pt-1">{line.replace('#### ', '')}</h4>;
          }
          if (line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{renderInlineFormatting(line.replace('- ', ''))}</span>
              </div>
            );
          }
          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-cyan-400 font-mono font-bold">{line.slice(0, 3)}</span>
                <span>{renderInlineFormatting(line.slice(3))}</span>
              </div>
            );
          }
          if (line.trim().length === 0) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Hidden File Input for Real Multi-Format Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* =========================================================================
          LEFT SIDEBAR: Branding, + New Chat, Nav Links, Chats History, Profile
         ========================================================================= */}
      <aside className="w-64 min-w-[16rem] h-full bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between p-3.5 select-none z-20">
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
          
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-2 pt-1 cursor-pointer" onClick={() => setActiveNav('home')}>
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
            onClick={handleNewChat}
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
              <Search
                onClick={() => setShowSearchModal(true)}
                className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
              />
            </div>

            {/* Today */}
            <div className="space-y-1">
              <div className="text-[10px] font-medium text-slate-500 px-2">Today</div>
              {Object.values(sessions)
                .filter((s) => s.category === 'today')
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveChatId(s.id);
                      setActiveNav('home');
                    }}
                    className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      activeChatId === s.id && activeNav === 'home'
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
            </div>

            {/* Yesterday */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-medium text-slate-500 px-2">Yesterday</div>
              {Object.values(sessions)
                .filter((s) => s.category === 'yesterday')
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveChatId(s.id);
                      setActiveNav('home');
                    }}
                    className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      activeChatId === s.id && activeNav === 'home'
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
            </div>

            {/* This Week */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-medium text-slate-500 px-2">This Week</div>
              {Object.values(sessions)
                .filter((s) => s.category === 'week')
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveChatId(s.id);
                      setActiveNav('home');
                    }}
                    className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      activeChatId === s.id && activeNav === 'home'
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
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
            <button
              onClick={() => setActiveNav('twin')}
              className="w-full py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-[11px] border border-slate-700 transition-all"
            >
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
            <button
              onClick={() => setShowSettingsModal(true)}
              className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          CENTER WORKSPACE: Switchable Screen Views (Home, Twin, Saved, Notes, Path)
         ========================================================================= */}
      <main className="flex-1 h-full flex flex-col justify-between overflow-hidden relative">
        
        {/* =====================================================================
            VIEW 1: HOME (Chat-First Multimodal Studio matching reference image)
           ===================================================================== */}
        {activeNav === 'home' && (
          <>
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
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Upload Files</div>
                    <div className="text-[10px] text-slate-500">PDF, PPT, DOC</div>
                  </div>
                </div>

                {/* 2. Images */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Images</div>
                    <div className="text-[10px] text-slate-500">Diagrams, Notes</div>
                  </div>
                </div>

                {/* 3. Audio / Video */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Audio / Video</div>
                    <div className="text-[10px] text-slate-500">Lectures, Attempts</div>
                  </div>
                </div>

                {/* 4. Code */}
                <div
                  onClick={() => {
                    const code = prompt('Paste your code snippet or SQL query:');
                    if (code) {
                      setChatInput(code);
                    }
                  }}
                  className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Code</div>
                    <div className="text-[10px] text-slate-500">Any language</div>
                  </div>
                </div>

                {/* 5. Links */}
                <div
                  onClick={() => setShowLinkModal(true)}
                  className="group p-3 rounded-2xl bg-[#0d121f] border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Links</div>
                    <div className="text-[10px] text-slate-500">Web pages, Docs</div>
                  </div>
                </div>
              </div>

              {/* Conversation Stream */}
              <div className="space-y-6 pt-2">
                
                {/* Student Message */}
                <div className="flex flex-col items-end gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#121829] border border-slate-800/90 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xl text-xs md:text-sm text-slate-200 shadow-md">
                      <p>{currentSession.userMessage}</p>
                      <div className="text-right text-[10px] font-mono text-slate-500 mt-1">{currentSession.userTime}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                      S
                    </div>
                  </div>

                  {/* Attachments Row */}
                  {currentSession.attachments.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pr-11">
                      {currentSession.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="relative group bg-[#0e1322] border border-slate-800/90 hover:border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-sm"
                        >
                          {att.type === 'video' ? (
                            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px]">
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{att.duration || '02:14'}</span>
                            </div>
                          ) : att.type === 'pdf' ? (
                            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-[9px]">
                              PDF
                            </div>
                          ) : att.type === 'code' ? (
                            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-[9px]">
                              <Code2 className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div className="text-left">
                            <div className="text-xs font-semibold text-slate-200">{att.name}</div>
                            {att.size && <div className="text-[10px] text-slate-500">{att.size}</div>}
                          </div>

                          <button
                            onClick={() => removeAttachment(att.id)}
                            className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity ml-1"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* LearnLens AI Response Bubble */}
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
                      <span className="text-[10px] font-mono text-slate-500">{currentSession.aiTime}</span>
                    </div>

                    {/* Loading Indicator */}
                    {isAiLoading && (
                      <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs animate-pulse py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gemma 4 Perception & Open-Source Reasoning Engine analyzing...</span>
                      </div>
                    )}

                    {/* AI Message / Structured Markdown Body */}
                    {currentSession.isCustomQuery ? (
                      <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl p-5 space-y-4">
                        {renderMarkdownText(currentSession.aiMessage)}
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                        {currentSession.aiMessage}
                      </p>
                    )}

                    {/* Sub-tab Pill Navigation */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {!currentSession.isCustomQuery && (
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
                      )}

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

                    {/* MAIN INTERACTIVE CARD: Attempt Analysis & First Deviation */}
                    {!currentSession.isCustomQuery && activeAnalysisTab === 'attempt' && (
                      <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                        
                        {/* Left Code & Scrubber View */}
                        <div className="lg:col-span-7 p-4 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between space-y-4">
                          <div className="relative rounded-xl bg-[#080b13] p-4 font-mono text-xs text-slate-300 border border-slate-800/80 leading-relaxed overflow-x-auto min-h-[140px]">
                            {currentSession.codeSnippet.lines.map((line) => (
                              <div
                                key={line.num}
                                className={`flex gap-4 ${
                                  line.highlight
                                    ? 'bg-rose-950/40 -mx-4 px-4 py-0.5 border-l-2 border-rose-500 my-0.5'
                                    : ''
                                }`}
                              >
                                <span className={`select-none ${line.highlight ? 'text-rose-400 font-bold' : 'text-slate-600'}`}>
                                  {line.num}
                                </span>
                                <span>
                                  {line.highlight ? (
                                    <span className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                      {line.text}
                                    </span>
                                  ) : (
                                    line.text
                                  )}
                                </span>
                              </div>
                            ))}

                            {/* Center Play Overlay Button */}
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

                          {/* Scrubber & Milestone Markers */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                              <span className="text-cyan-400 font-bold">
                                {formatSeconds(videoPlayTime)} / {formatSeconds(currentSession.totalDuration)}
                              </span>
                              <span className="text-[10px] text-slate-500">Screen Recording Attempt</span>
                            </div>

                            <div
                              className="relative h-2 rounded-full bg-slate-800 cursor-pointer overflow-hidden"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pos = (e.clientX - rect.left) / rect.width;
                                setVideoPlayTime(Math.floor(pos * currentSession.totalDuration));
                              }}
                            >
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-rose-500 transition-all"
                                style={{ width: `${(videoPlayTime / currentSession.totalDuration) * 100}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                              {currentSession.milestones.map((m, idx) => {
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

                        {/* Right First Deviation Panel */}
                        <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4 bg-[#0a0e18]/80">
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <span>First Deviation</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                                {currentSession.deviation.time}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">What you did</div>
                              <div className="inline-block px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold">
                                {currentSession.deviation.whatYouDid}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">What was needed</div>
                              <div className="inline-block px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
                                {currentSession.deviation.whatWasNeeded}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Why this matters</div>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                {currentSession.deviation.whyThisMatters}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Underlying concept</div>
                              <button
                                onClick={() => setActiveAnalysisTab('visual')}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-medium transition-all"
                              >
                                <Layers className="w-3.5 h-3.5 text-blue-400" />
                                <span>{currentSession.deviation.underlyingConcept}</span>
                              </button>
                            </div>
                          </div>

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

                    {/* TAB 2: Visual Explanation (elah Timeline Player) */}
                    {activeAnalysisTab === 'visual' && (
                      <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                            <Play className="w-4 h-4 fill-current" />
                            <span>elah Visual Lesson: {currentSession.lessonTitle}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Frame: <strong className="text-cyan-300">{currentFrame}</strong> / {lessonPlan?.totalFrames || 1350} ({timecode})
                          </span>
                        </div>

                        {/* Interactive Canvas */}
                        <div className="relative aspect-video rounded-xl bg-[#070a12] border border-slate-800 overflow-hidden flex flex-col justify-between p-6">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                              {frameState?.activeSteps?.[0]?.title || 'Visualizing Table Join & Elimination'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">30 FPS • Integer Timeline</span>
                          </div>

                          <div className="flex items-center justify-center gap-8 py-4">
                            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-center space-y-2">
                              <div className="text-xs font-bold text-white">Left Table: Primary Set</div>
                              <div className="font-mono text-[11px] text-slate-400 space-y-1">
                                <div className="p-1 rounded bg-slate-950 text-cyan-300">Record A (Valid Key)</div>
                                <div className="p-1 rounded bg-slate-950 text-cyan-300">Record B (Valid Key)</div>
                                <div className="p-1 rounded bg-slate-950 text-rose-400 font-bold border border-rose-500/40">Record C (Unmatched / NULL)</div>
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-1 text-cyan-400 font-mono text-xs">
                              <span>PRESERVED</span>
                              <ArrowRight className="w-6 h-6 animate-pulse" />
                              <span className="text-[9px] text-slate-400">No Data Loss</span>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-center space-y-2">
                              <div className="text-xs font-bold text-white">Right Table: Foreign Key</div>
                              <div className="font-mono text-[11px] text-slate-400 space-y-1">
                                <div className="p-1 rounded bg-slate-950 text-indigo-300">Target Attribute 1</div>
                                <div className="p-1 rounded bg-slate-950 text-indigo-300">Target Attribute 2</div>
                                <div className="p-1 rounded bg-slate-950 text-slate-500">[NULL Substitution]</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center text-xs text-slate-200">
                            "{frameState?.activeSteps?.[0]?.voiceoverScript || frameState?.activeSteps?.[0]?.captionText || 'A LEFT JOIN preserves every row from the left table regardless of whether a matching record exists in the right table.'}"
                          </div>
                        </div>

                        {/* Timeline Scrubber */}
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

                        {/* Natural Language Prompt Edit */}
                        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                          <input
                            type="text"
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyEdit()}
                            placeholder='Prompt elah: "Explain the diagram before the formula" or "Highlight with red border"...'
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={handleApplyEdit}
                            disabled={isApplyingEdit}
                            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
                          >
                            {isApplyingEdit ? 'Applying...' : 'Apply Edit'}
                          </button>
                        </div>

                        {/* Proposed Edit Diff Banner */}
                        {proposedEdit && (
                          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2 text-xs animate-fadeIn">
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

                    {/* TAB 3: Related Concepts */}
                    {activeAnalysisTab === 'concepts' && (
                      <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl p-5 space-y-3">
                        <div className="text-xs font-bold text-white">Connected Concepts & Prerequisites</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {currentSession.concepts.map((c, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                              <div className="font-bold text-cyan-300">{c.name}</div>
                              <p className="text-[11px] text-slate-400">{c.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 4: Practice Questions */}
                    {activeAnalysisTab === 'practice' && (
                      <div className="rounded-2xl bg-[#0c101c] border border-slate-800/90 shadow-xl p-5 space-y-4">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Active Recall Challenge: Verify Your Insight</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          "{currentSession.practiceQuestion.question}"
                        </p>

                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={practiceAnswer}
                            onChange={(e) => setPracticeAnswer(e.target.value)}
                            placeholder="Type your explanation here..."
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
                              <div className={`text-xs font-medium ${practiceIsCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
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

            {/* Bottom Input Composer */}
            <div className="p-4 bg-gradient-to-t from-[#090d16] via-[#090d16]/95 to-transparent z-10 max-w-5xl mx-auto w-full">
              <div className="flex items-center gap-2 bg-[#0e1322] border border-slate-800/90 rounded-2xl px-3 py-2 shadow-2xl focus-within:border-blue-500/50 transition-colors">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask anything or drop your files here..."
                  className="flex-1 bg-transparent border-none text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2"
                />

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                    title="Upload Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      alert('Microphone recording started. Speak your question...');
                    }}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                    title="Record voice"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const code = prompt('Paste your code:');
                      if (code) setChatInput(code);
                    }}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                    title="Paste code"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                    title="Add link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all active:scale-95 ml-1"
                  >
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =====================================================================
            VIEW 2: LEARNING TWIN SCREEN
           ===================================================================== */}
        {activeNav === 'twin' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white">Student Cognitive Twin</h2>
                <p className="text-xs text-slate-400">Real-time mastery tracking & misconception diagnosis across all enrolled subjects.</p>
              </div>
              <button
                onClick={() => setActiveNav('home')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Back to Chat
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-500 uppercase font-bold">Overall Mastery</div>
                <div className="text-3xl font-extrabold text-cyan-400">78%</div>
                <div className="text-xs text-emerald-400">+14% improvement this week</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-500 uppercase font-bold">Active Competencies</div>
                <div className="text-3xl font-extrabold text-white">7 Skills</div>
                <div className="text-xs text-slate-400">4 Stable • 2 Needs Attention • 1 Misconception</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-500 uppercase font-bold">Upcoming Exam</div>
                <div className="text-3xl font-extrabold text-indigo-400">14 Days</div>
                <div className="text-xs text-slate-400">DBMS End-Semester Exam</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Skill Breakdown</h3>
              <div className="space-y-3">
                {[
                  { name: 'Relational Algebra & Projection', score: 92, status: 'Stable', color: 'bg-emerald-500' },
                  { name: 'Primary & Foreign Key Constraints', score: 88, status: 'Stable', color: 'bg-emerald-500' },
                  { name: 'SQL Join Semantics (INNER vs OUTER)', score: 65, status: 'Needs Attention', color: 'bg-amber-500' },
                  { name: 'Normalization & 3NF Transitive Chains', score: 45, status: 'Misconception Active', color: 'bg-rose-500' },
                  { name: 'ACID Transaction Isolation', score: 80, status: 'Stable', color: 'bg-emerald-500' }
                ].map((sk, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{sk.name}</span>
                      <span className="font-mono text-slate-400">{sk.score}% ({sk.status})</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${sk.color}`} style={{ width: `${sk.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 3: SAVED LESSONS GALLERY
           ===================================================================== */}
        {activeNav === 'saved' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white">Saved Visual Lessons</h2>
                <p className="text-xs text-slate-400">Interactive elah video explanations generated from your learning material.</p>
              </div>
              <button onClick={() => setActiveNav('home')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                Back to Chat
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Relational Join Semantics & Null Preservation', duration: '45s', frames: 1350, topic: 'DBMS' },
                { title: 'Correlated Subqueries vs Cartesian Elimination', duration: '35s', frames: 1050, topic: 'SQL' },
                { title: 'Round Robin Quantum Fairness & Process Aging', duration: '47s', frames: 1400, topic: 'OS' },
                { title: 'Why Dijkstra Fails on Negative Cycles', duration: '38s', frames: 1150, topic: 'Algorithms' }
              ].map((lesson, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
                  <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative group">
                    <Play className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                      {lesson.duration} ({lesson.frames} frames)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">{lesson.topic}</span>
                    <h4 className="text-xs font-bold text-white mt-1">{lesson.title}</h4>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNav('home');
                      setActiveAnalysisTab('visual');
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Play in Studio
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 4: NOTEBOOK SCREEN
           ===================================================================== */}
        {activeNav === 'notebook' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white">Study Notebook & Insights</h2>
                <p className="text-xs text-slate-400">Captured equations, diagrams, rules, and student annotations.</p>
              </div>
              <button onClick={() => setActiveNav('home')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                Back to Chat
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">RULE BREAKPOINT</span>
                <h3 className="text-sm font-bold text-white">3NF vs 2NF Golden Rule</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  2NF is violated when a non-prime attribute depends on part of a composite key. 3NF is violated when a non-prime attribute depends on another non-prime attribute (transitive domino chain). If a table has a single-attribute primary key, 2NF is automatically satisfied!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">RELATIONAL JOIN RULE</span>
                <h3 className="text-sm font-bold text-white">INNER vs LEFT JOIN Invariant</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  INNER JOIN drops non-matching rows. Whenever a question says "all students, including unassigned", a LEFT JOIN is required to retain NULL records.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 5: LEARNING PATH SCREEN
           ===================================================================== */}
        {activeNav === 'path' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white">Adaptive Learning Path</h2>
                <p className="text-xs text-slate-400">Optimized curriculum prioritized by exam weight and diagnostic gap score.</p>
              </div>
              <button onClick={() => setActiveNav('home')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                Back to Chat
              </button>
            </div>

            <div className="space-y-3">
              {[
                { step: 1, title: 'Master 3NF Transitive Dependency Elimination', status: 'In Progress (Active Gap)', priority: 'High (35% Exam Weight)' },
                { step: 2, title: 'Outer Join & Null Value Preservation in SQL', status: 'Remediation Ready', priority: 'High (20% Exam Weight)' },
                { step: 3, title: 'Boyce-Codd Normal Form (BCNF) Functional Dependencies', status: 'Locked (Prerequisite 3NF required)', priority: 'Medium' },
                { step: 4, title: 'Multi-Valued Dependencies & 4NF', status: 'Locked', priority: 'Medium' }
              ].map((p) => (
                <div key={p.step} className="p-4 rounded-xl bg-[#0d121f] border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {p.step}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{p.title}</div>
                      <div className="text-[10px] text-slate-400">{p.status}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">{p.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchModal(true)}
              placeholder="Search anything..."
              className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none flex-1"
            />
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
              Ctrl K
            </span>
          </div>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-[#0e1322] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>

        {/* Notifications Dropdown Modal */}
        {showNotifications && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 font-bold text-white">
              <span>System Alerts</span>
              <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
            {notifications.map((n) => (
              <div key={n.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 space-y-0.5">
                <div className="font-semibold text-cyan-300 text-[11px]">{n.title}</div>
                <div className="text-[10px] text-slate-400">{n.desc}</div>
                <div className="text-[9px] text-slate-600 font-mono text-right">{n.time}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search Results Dropdown */}
        {showSearchModal && searchQuery && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 font-bold text-white">
              <span>Results for "{searchQuery}"</span>
              <button onClick={() => setShowSearchModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
            {searchResults.length === 0 ? (
              <div className="text-slate-500 text-[11px] py-2">No matching chats or concepts found.</div>
            ) : (
              searchResults.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setActiveChatId(r.id);
                    setActiveNav('home');
                    setShowSearchModal(false);
                  }}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 cursor-pointer space-y-0.5 transition-colors"
                >
                  <div className="font-semibold text-cyan-300 text-[11px]">{r.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{r.userMessage}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 1. Learning Pulse (Doughnut Chart) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Learning Pulse</span>
            </div>
            <button onClick={() => setActiveNav('twin')} className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1e293b" strokeWidth="3.5" />
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

            <div className="space-y-1.5 text-[11px] font-medium">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{learningPulse.stable} Stable</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{learningPulse.needsAttention} Needs attention</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{learningPulse.misconception} Misconception</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>{learningPulse.notAssessed} Not assessed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Knowledge Constellation (Interactive Graph Visualizer) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
              <span>Knowledge Constellation</span>
            </div>
            <button onClick={() => setActiveNav('twin')} className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>Explore</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="relative h-44 rounded-xl bg-[#070a12] border border-slate-800/80 overflow-hidden flex items-center justify-center p-2">
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800" strokeWidth="1.2">
              <line x1="50%" y1="50%" x2="22%" y2="30%" />
              <line x1="50%" y1="50%" x2="78%" y2="28%" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="18%" y2="70%" />
              <line x1="50%" y1="50%" x2="50%" y2="82%" />
              <line x1="50%" y1="50%" x2="82%" y2="72%" />
              <line x1="50%" y1="50%" x2="50%" y2="18%" />
            </svg>

            {/* Central DBMS Node */}
            <button
              onClick={() => setSelectedConstellationNode('DBMS: Core Relational Model')}
              className="z-10 px-3 py-1.5 rounded-full bg-blue-950 border border-blue-500/50 text-blue-300 font-bold text-xs shadow-glow-cyan hover:scale-105 transition-transform"
            >
              DBMS
            </button>

            {/* Satellite Connected Nodes */}
            <button
              onClick={() => setSelectedConstellationNode('ER Model: Entity Cardinality & Relationships (88% Mastery)')}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-cyan-300 hover:scale-105 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ER Model</span>
            </button>

            <button
              onClick={() => setSelectedConstellationNode('SQL Basics: DDL, DML & Constraints (92% Mastery)')}
              className="absolute top-6 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-emerald-300 hover:scale-105 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SQL Basics</span>
            </button>

            <button
              onClick={() => setSelectedConstellationNode('Normalization: Active Misconception in 3NF Transitive Chains')}
              className="absolute top-5 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/50 text-[10px] text-rose-300 font-bold hover:scale-105 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>Normalization</span>
            </button>

            <button
              onClick={() => setSelectedConstellationNode('Joins: Needs Attention (Null preservation in OUTER joins)')}
              className="absolute bottom-10 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-emerald-300 hover:scale-105 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Joins</span>
            </button>

            <button
              onClick={() => setSelectedConstellationNode('Subqueries: Correlated Execution Scopes (75% Mastery)')}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-indigo-300 hover:scale-105 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Subqueries</span>
            </button>

            <button
              onClick={() => setSelectedConstellationNode('Transactions: ACID Isolation & 2PL (80% Mastery)')}
              className="absolute bottom-9 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-amber-300 hover:scale-105 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Transactions</span>
            </button>
          </div>

          {selectedConstellationNode && (
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 flex items-center justify-between">
              <span>{selectedConstellationNode}</span>
              <button onClick={() => setSelectedConstellationNode(null)} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Misconception Map (Hierarchy Tree) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Misconception Map</span>
            </div>
            <button onClick={() => setActiveNav('notebook')} className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-xl bg-[#070a12] border border-slate-800/80 p-3 space-y-3">
            <div className="flex justify-center">
              <button
                onClick={() => setSelectedMisconceptionNode('Root: Relational Normalization (Dependency preservation)')}
                className="px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Normalization</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <button
                onClick={() => setSelectedMisconceptionNode('Functional Dependency: X -> Y. Satisfied in 2NF for non-prime attributes.')}
                className="p-2 rounded-lg bg-slate-900/90 border border-emerald-500/30 space-y-1.5 text-center hover:scale-105 transition-transform"
              >
                <div className="text-emerald-300 font-semibold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Functional Dependency</span>
                </div>
                <div className="flex items-center justify-center gap-1 pt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[9px]">Partial Dep</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 text-[9px]">2NF</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedMisconceptionNode('Transitive Dependency: Confusing X -> Y -> Z with partial key dependency. Fixed in 3NF.')}
                className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/30 space-y-1.5 text-center hover:scale-105 transition-transform"
              >
                <div className="text-amber-300 font-semibold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Transitive Dependency</span>
                </div>
                <div className="flex items-center justify-center gap-1 pt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px]">3NF</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">BCNF</span>
                </div>
              </button>
            </div>
          </div>

          {selectedMisconceptionNode && (
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-[10px] text-rose-300 flex items-center justify-between">
              <span>{selectedMisconceptionNode}</span>
              <button onClick={() => setSelectedMisconceptionNode(null)} className="text-rose-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* 4. Today's Progress (Activity Timeline) */}
        <div className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Today's Progress</span>
            </div>
            <button onClick={() => setActiveNav('path')} className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
              <span>See details</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pl-2 text-xs relative border-l border-slate-800 ml-2">
            {progressTimeline.slice(0, 4).map((p, idx) => (
              <div key={idx} className="relative pl-4 space-y-0.5">
                <span className={`absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full ${p.color} ring-4 ring-[#0d121f]`} />
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{p.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.time}</div>
                </div>
                <div className="text-[10px] text-slate-400">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* =========================================================================
          MODAL 1: AI Provider & Settings Dialog
         ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AI Perception & Reasoning Engine</span>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Current AI Execution Engine</label>
                <select
                  value={providerMode}
                  onChange={(e) => setProviderMode(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="hybrid">⚡ Hybrid (Gemma 4 Perception + DeepSeek-R1 Reasoning)</option>
                  <option value="gemma">Google Gemma 4 (Live Multimodal API)</option>
                  <option value="openweight">Local Ollama / vLLM (DeepSeek-R1:1.5b)</option>
                  <option value="demo">Deterministic Fast Benchmark</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Backend Server:</span>
                  <span className="text-emerald-400">Online (:4000)</span>
                </div>
                <div className="flex justify-between">
                  <span>Gemma 4 Vision:</span>
                  <span className="text-cyan-300">google/gemma-4-31B-it</span>
                </div>
                <div className="flex justify-between">
                  <span>Reasoning Model:</span>
                  <span className="text-indigo-300">deepseek-r1:8b</span>
                </div>
                <div className="flex justify-between">
                  <span>elah Engine:</span>
                  <span className="text-amber-300">@elah/editor 0.6.0 (Integer Frames)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: Add Web Link Dialog
         ========================================================================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Link2 className="w-4 h-4 text-blue-400" />
                <span>Ingest Web Page or Documentation URL</span>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400">Resource URL</label>
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                placeholder="https://docs.oracle.com/database/joins.html"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Attach Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
