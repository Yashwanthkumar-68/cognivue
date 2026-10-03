-- ========================================================
-- LearnLens PostgreSQL / Supabase Relational Schema
-- ========================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Learning Spaces
CREATE TABLE IF NOT EXISTS learning_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    learning_goal TEXT,
    exam_target_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sources (Multi-format: PDF, PPTX, Handwritten, Diagram, Code, etc.)
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES learning_spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    storage_url TEXT,
    raw_content TEXT,
    page_count INT,
    extracted_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Source Chunks & Visual Regions
CREATE TABLE IF NOT EXISTS source_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT,
    is_visual BOOLEAN DEFAULT FALSE,
    box2d_ymin INT,
    box2d_xmin INT,
    box2d_ymax INT,
    box2d_xmax INT,
    visual_interpretation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Concepts (Synthesized Knowledge Units)
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES learning_spaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    short_summary TEXT NOT NULL,
    full_explanation TEXT,
    complexity INT CHECK (complexity BETWEEN 1 AND 5),
    exam_weight NUMERIC(3, 2) DEFAULT 0.5,
    has_conflict BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Concept Relationships (Prerequisite, Part-of, etc.)
CREATE TABLE IF NOT EXISTS concept_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    target_concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    label TEXT,
    confidence NUMERIC(3, 2) DEFAULT 0.9,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Source Evidence (Traceability Anchors)
CREATE TABLE IF NOT EXISTS source_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    excerpt TEXT NOT NULL,
    page_or_slide TEXT,
    confidence NUMERIC(3, 2) DEFAULT 0.9,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Misconceptions
CREATE TABLE IF NOT EXISTS misconceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    root_cause TEXT,
    corrective_guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Assessments & Diagnostics
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES learning_spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assessment_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Assessment Questions
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    expected_rubric TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Assessment Answers (Semantic Diagnostic Submissions)
CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES assessment_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_answer TEXT NOT NULL,
    understood_points JSONB DEFAULT '[]',
    partially_understood_points JSONB DEFAULT '[]',
    detected_misconceptions JSONB DEFAULT '[]',
    semantic_rationale TEXT,
    mastery_delta NUMERIC(3, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Learning State (The Student Learning Twin)
CREATE TABLE IF NOT EXISTS learning_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    space_id UUID REFERENCES learning_spaces(id) ON DELETE CASCADE,
    overall_mastery NUMERIC(3, 2) DEFAULT 0.0,
    overall_confidence NUMERIC(3, 2) DEFAULT 0.5,
    concept_mastery_map JSONB DEFAULT '{}',
    active_misconceptions JSONB DEFAULT '[]',
    recommended_next_action JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Lesson Plans (Structured elah Visual Lessons)
CREATE TABLE IF NOT EXISTS lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES learning_spaces(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_seconds INT NOT NULL,
    fps INT DEFAULT 30,
    total_frames INT NOT NULL,
    steps_json JSONB NOT NULL,
    tracks_json JSONB NOT NULL,
    pedagogical_rationale TEXT,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Lesson Edits (Natural Language Proposed Modifications)
CREATE TABLE IF NOT EXISTS lesson_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE,
    natural_language_prompt TEXT NOT NULL,
    ai_interpretation TEXT,
    operations_json JSONB NOT NULL,
    validation_report JSONB NOT NULL,
    status TEXT DEFAULT 'proposed', -- 'proposed', 'applied', 'discarded', 'undone'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Lesson Versions (For Complete Reversible Undo / Keep History)
CREATE TABLE IF NOT EXISTS lesson_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    plan_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
