# LEARNLENS
> *"Don't just study your material. Let AI understand how you learn."*

LearnLens is a multimodal adaptive learning studio and **AI Learning Twin** that accepts multiple forms of learning materials, understands them using **Google Gemma 4**, constructs a connected knowledge model through an **Open-Source AI Reasoning Layer**, diagnoses knowledge gaps and hidden misconceptions, and renders targeted visual explanations into an interactive lesson experience powered by **elah**.

---

## 🏆 Hack Day Challenge Alignment

LearnLens was engineered from the ground up to unify the three Hack Day challenge categories into **ONE single, coherent cognitive pipeline** rather than isolated features:

```
MULTIMODAL SOURCES (PDF, PPTX, Handwritten Notes, ER Diagrams, SQL, Audio)
         ↓
TRACK 2: Best Use of Gemma 4 (Multimodal Understanding & Visual Region Anchors)
         ↓
TRACK 1: Best Open-Source AI Project (DeepSeek-R1 / Qwen2.5 Central Reasoning Layer)
         ↓
KNOWLEDGE GRAPH & STUDENT LEARNING TWIN (Mastery, Gaps, Source Conflict Matrix)
         ↓
SIGNATURE FEATURE: MISCONCEPTION ENGINE (Understood / Partial / Misconception Breakdown)
         ↓
TRACK 3: Build on elah (Structured Integer-Frame Visual Lesson Plan & Preview Diff)
         ↓
NATURAL LANGUAGE EDIT ENGINE (Prompt → Edit Plan → Validation → Keep/Discard → 1-Step Undo)
         ↓
ACTIVE RECALL CHECKPOINTS (In-Lesson Quizzes Grounded in Real Exam Questions)
         ↓
UPDATED LEARNING TWIN (Verified Mastery Delta & Evolving Cognitive Roadmap)
```

| Challenge Track | Core Technology | Architectural Role in LearnLens |
| :--- | :--- | :--- |
| **Track 1: Best Open-Source AI Project** | `DeepSeek-R1` / `Qwen2.5` / `Gemma 4` | **Central Cognitive Reasoning Layer**: Performs concept linking, dependency graph synthesis, source conflict detection, semantic misconception analysis, diagnostic generation, and structured lesson editing plans. |
| **Track 2: Best Use of Gemma 4** | `google/gemma-4-31B-it` (Google GenAI) | **Multimodal Visual Layer**: Interprets handwritten student derivations, entity-relationship diagrams, equations, code screenshots, and university question paper patterns without degrading to raw OCR. |
| **Track 3: Build on elah** | `@elah/editor` & `@elah/timeline` | **Visual Lesson Engine**: Frame-accurate multi-track playback, integer-frame calculation, strict edit schema validation, proposed diff previews, KEEP / DISCARD controls, and one-step UNDO. |

---

## 💡 Why LearnLens is Fundamentally Different

Most AI educational tools are:
- ❌ Simple PDF summarizers or document chat drawers.
- ❌ Generic chatbot tutors that hallucinate citations.
- ❌ Flashcard generators detached from classroom context.
- ❌ Rigid video players with no dynamic editing.

**LearnLens is an AI Operating System for Learning**:
1. **Unrestricted Multi-Source Input**: Works with textbooks, professor lecture slide decks, handwritten student notes, ER diagrams, code files, and university exam papers simultaneously.
2. **Deep Semantic Misconception Engine**: Distinguishes between what a student *understands*, what they *partially understand*, and their *active cognitive conflations* (e.g. confusing 2NF partial key dependencies with 3NF transitive dependencies).
3. **Multi-Source Conflict Detector**: When professor slides disagree with the textbook regarding 3NF vs BCNF priority, LearnLens surfaces the exact textual discrepancy and clarifies terminology vs engineering context.
4. **Natural Language Lesson Editing with Reversibility**: Speak to the video lesson ("Slow down the normalization example", "Explain the diagram before the formula"), inspect the validated diff preview, KEEP or DISCARD, and revert any modification with **One-Step UNDO**.
5. **Zero Hallucination Traceability**: Every explanation, visual highlight, and exam importance score links directly to an uploaded source, page, or bounding box region.

---

## ⚡ 1-Click DBMS Hackathon Benchmark Demo

LearnLens comes pre-loaded with an end-to-end benchmark dataset: **"DBMS — Final Exam Preparation"**:

1. **6 Multimodal Sources**:
   - `Silberschatz DBMS Ch 8` (Textbook PDF)
   - `Prof. Vance Lecture 14 Slides` (PPTX Presentation)
   - `Handwritten Relational Derivations` (Handwritten Student Note)
   - `E-Commerce Relational Model` (Visual ER Diagram)
   - `2024 University End-Sem Exam Paper` (10-mark past question)
   - `Production SQL Duplicate Anomaly Script` (Code snippet)
2. **Gemma 4 Multimodal Analysis**: Gemma 4 extracts entities and cardinalities from the ER diagram, and flags a suspicious deduction in the student's handwritten notes: *"If A->B is partial, is B->C transitive?"*
3. **Knowledge Graph**: 9 connected concepts linked via prerequisite DAGs with live mastery states.
4. **Source Conflict Detected**: Professor Vance argues 3NF is practically superior for dependency preservation; Silberschatz claims BCNF is the required gold standard. LearnLens explains the engineering context.
5. **Diagnostic Quiz Taken**: Student answers: *"In 2NF and 3NF, the problem is that an attribute isn't fully dependent on the key..."*
6. **Misconception Identified**:
   - ✓ **Understood**: Functional dependency concept
   - ⚠ **Partially Understood**: Candidate key role
   - ❌ **Misconception**: Confusing 2NF partial dependency with 3NF transitive dependency!
7. **elah Visual Lesson Generated**: 45-second, 1350-frame visual lesson with 6 frame-accurate steps anchored directly to the student's handwritten notes.
8. **Natural Language Refinement**: User commands: *"Explain the diagram before the formula."*
9. **Proposed Diff Preview**: AI generates validated operations diff; user inspects before applying.
10. **KEEP & ONE-STEP UNDO**: User clicks KEEP; elah timeline updates immediately; user clicks ONE-STEP UNDO to restore original state.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+ (Workspaces enabled)

### 1. Installation
Clone the repository and install all dependencies across monorepo packages:
```bash
git clone https://github.com/learnlens/learnlens.git
cd learnlens
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
# 'demo' runs 100% offline out-of-the-box with pre-parsed multimodal sources!
AI_PROVIDER=demo

# Optional: Provide Google Gemini API Key for live Gemma 4 vision calls
GEMINI_API_KEY=your_gemini_api_key_here
GEMMA_MODEL=google/gemma-4-31B-it

# Optional: Configure local Ollama / vLLM endpoint for Open-Source AI reasoning
OPEN_SOURCE_API_BASE=http://localhost:11434/v1
OPEN_SOURCE_MODEL=deepseek-ai/DeepSeek-R1
```

### 3. Build Shared Packages
```bash
npm run build --workspace=packages/schemas
npm run build --workspace=packages/ui
npm run build --workspace=packages/ai-core
npm run build --workspace=packages/knowledge-engine
npm run build --workspace=packages/lesson-engine
```

### 4. Run Development Servers
Start both backend API and frontend React studio simultaneously:
```bash
# Terminal 1: Backend Express Server (Port 4000)
npm run dev:api

# Terminal 2: Frontend React Studio (Port 5173)
npm run dev:web
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Click **"Launch DBMS Final Exam Demo"** on the hero banner for the instant end-to-end experience!

---

## 🏗️ Monorepo Architecture

```
learnlens/
├── apps/
│   ├── web/                     # React 18 + Vite + Tailwind CSS + @elah/editor
│   │   ├── src/
│   │   │   ├── screens/         # 14 Full Studio Screens
│   │   │   │   ├── LandingScreen.tsx
│   │   │   │   ├── KnowledgeGraphScreen.tsx
│   │   │   │   ├── MisconceptionCenterScreen.tsx
│   │   │   │   ├── ElahEditorScreen.tsx
│   │   │   │   ├── LearningTwinScreen.tsx
│   │   │   │   ├── LearningGapMapScreen.tsx
│   │   │   │   ├── SourceConflictScreen.tsx
│   │   │   │   ├── SourceImportScreen.tsx
│   │   │   │   ├── GemmaAnalysisScreen.tsx
│   │   │   │   ├── ExamModeScreen.tsx
│   │   │   │   └── SettingsScreen.tsx
│   │   │   ├── stores/          # Zustand Global Reactive State
│   │   │   └── services/        # API Client & elah Adapter
│   └── api/                     # Node.js + Express + TypeScript
│       ├── src/
│       │   ├── services/ai/     # Isolated Gemma 4 & OpenWeight Services
│       │   ├── db/schema.sql    # Relational Database Schema
│       │   └── server.ts        # REST API Endpoints
├── packages/
│   ├── schemas/                 # Zod Type Contracts for All AI Outputs & Plans
│   ├── ai-core/                 # Provider Abstractions (Demo, Gemma 4, Open-Weight)
│   ├── knowledge-engine/        # DAG Algorithms, Prereq Chains, Conflict Resolver
│   ├── lesson-engine/           # Frame Calculator, Edit Validator & Undo Stack
│   └── ui/                      # Shared Styling Tokens & Color Math
├── .env.example
├── LICENSE                      # Apache-2.0
└── package.json
```

---

## 🔒 Strict AI Contracts & Schema Validation

No AI model is permitted to mutate application state or canvas pixels with unstructured text. Every AI response is validated through **Zod schemas**:

- **Multimodal Visual Schema**: `GemmaMultimodalExtractionSchema` enforces visual bounding boxes, latex equations, and diagram entity models.
- **Semantic Evaluation Schema**: `SemanticEvaluationSchema` isolates `understood`, `partiallyUnderstood`, and `misconceptions` into structured arrays with quantified mastery score deltas.
- **elah Timeline Schema**: `StructuredLessonPlanSchema` strictly enforces non-negative integer frame bounds, track IDs, and collision detection.
- **Edit Schema**: `StructuredEditPlanSchema` mandates before/after operation diffs and validation reports before any edit is previewed or applied.

---

## 🗄️ Relational Database Schema (PostgreSQL / Supabase)

LearnLens is architected with a production-grade relational database schema (`apps/api/src/db/schema.sql`):
1. `learning_spaces`
2. `sources`
3. `source_chunks`
4. `concepts`
5. `concept_relationships`
6. `source_evidence`
7. `misconceptions`
8. `assessments`
9. `assessment_questions`
10. `assessment_answers`
11. `learning_state` (Student Learning Twin)
12. `lesson_plans`
13. `lesson_edits`
14. `lesson_versions`

---

## 📜 License

Licensed under the [Apache License, Version 2.0](LICENSE).
