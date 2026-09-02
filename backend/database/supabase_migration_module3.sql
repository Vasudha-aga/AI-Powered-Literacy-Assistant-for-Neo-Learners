-- =========================================================
-- Module 3 Supabase Database Migration
-- Voice Learning, Gamification, Streaks & Learning Reports
-- =========================================================

-- 1. Voice Practice Sessions Table
CREATE TABLE IF NOT EXISTS "VoicePractice" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "drill_id" TEXT,
    "target_text" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "accuracy_score" DOUBLE PRECISION,
    "fluency_score" DOUBLE PRECISION,
    "completeness_score" DOUBLE PRECISION,
    "word_analysis" JSONB,
    "feedback" JSONB,
    "language" TEXT NOT NULL DEFAULT 'English',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user history lookup
CREATE INDEX IF NOT EXISTS "idx_voice_practice_user_id" ON "VoicePractice"("user_id");

-- 2. User Gamification, XP & Streaks Table
CREATE TABLE IF NOT EXISTS "UserGamification" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "current_streak" INTEGER NOT NULL DEFAULT 1,
    "longest_streak" INTEGER NOT NULL DEFAULT 1,
    "last_active_date" TEXT,
    "active_dates" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "unlocked_badges" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "daily_quests" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for leaderboard sorting
CREATE INDEX IF NOT EXISTS "idx_user_gamification_xp" ON "UserGamification"("xp" DESC);

-- 3. Comprehensive Learning Reports Table
CREATE TABLE IF NOT EXISTS "LearningReport" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "report_id" TEXT UNIQUE NOT NULL,
    "overall_literacy_index" DOUBLE PRECISION NOT NULL,
    "competency_level" TEXT NOT NULL,
    "skills_breakdown" JSONB NOT NULL,
    "strengths" JSONB NOT NULL,
    "growth_areas" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for reports
CREATE INDEX IF NOT EXISTS "idx_learning_report_user_id" ON "LearningReport"("user_id");
