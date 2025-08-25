import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // 기본 정보
  email: text("email").notNull(),
  name: text("name"),
  
  // 경험 및 현재 상태
  experience: text("experience").notNull(), // beginner, intermediate, advanced
  squatMax: text("squat_max").notNull(),
  benchMax: text("bench_max").notNull(),
  deadliftMax: text("deadlift_max").notNull(),
  totalMax: text("total_max"), // 3대 합계
  bodyweight: text("bodyweight"),
  competitionExperience: text("competition_experience"), // none, local, national, international
  lastCompetition: text("last_competition"), // 언제 마지막 대회 참가
  
  // 목표 및 우선순위
  goals: jsonb("goals").notNull(), // [strength, competition, technique, etc.]
  primaryGoal: text("primary_goal"), // 가장 중요한 목표 1개
  timeframe: text("timeframe"), // 3months, 6months, 1year, longterm
  nextCompetition: text("next_competition"), // 다음 대회 목표
  
  // 훈련 빈도 및 구성
  frequency: text("frequency").notNull(), // 3,4,5,6,7
  sessionsPerWeek: text("sessions_per_week"), // 3,4,5,6,7,8,9
  trainingDuration: text("training_duration"), // 60min, 90min, 120min, 150min
  preferredTime: text("preferred_time"), // morning, afternoon, evening
  
  // 운동별 세부 선호도
  squatFrequency: text("squat_frequency"), // 1,2,3,4 times per week
  benchFrequency: text("bench_frequency"), // 1,2,3,4,5 times per week  
  deadliftFrequency: text("deadlift_frequency"), // 1,2,3 times per week
  accessoryPreference: text("accessory_preference"), // minimal, moderate, high
  
  // 훈련 블럭 선호도
  preferredBlocks: jsonb("preferred_blocks"), // [work_capacity, strength, peaking, technique]
  blockDuration: text("block_duration"), // 3weeks, 4weeks, 6weeks, 8weeks
  peakingExperience: text("peaking_experience"), // none, basic, experienced
  
  // 기술적 선호도
  squatStyle: text("squat_style"), // high_bar, low_bar, both
  squatStance: text("squat_stance"), // narrow, medium, wide
  benchStyle: text("bench_style"), // close_grip, medium, wide, arch
  deadliftStyle: text("deadlift_style"), // conventional, sumo, both
  
  // 약점 및 강점
  weakestLift: text("weakest_lift"), // squat, bench, deadlift
  strongestLift: text("strongest_lift"), // squat, bench, deadlift
  techniqueIssues: jsonb("technique_issues"), // [depth, lockout, speed, etc.]
  strengthIssues: jsonb("strength_issues"), // [core, legs, back, chest, etc.]
  
  // 장비 및 환경
  equipment: jsonb("equipment").notNull(), // array of strings
  homeGym: text("home_gym"), // yes, no, sometimes
  spotterAvailable: text("spotter_available"), // always, sometimes, never
  preferredEquipment: jsonb("preferred_equipment"), // [powerlifting_bar, competition_plates, etc.]
  
  // 부상 이력
  injuries: text("injuries").notNull(), // none, minor, specific
  injuryDetails: text("injury_details"),
  currentPain: jsonb("current_pain"), // [lower_back, knee, shoulder, etc.]
  injuryHistory: jsonb("injury_history"), // 과거 부상 이력
  
  // 회복 및 라이프스타일
  sleepHours: text("sleep_hours"), // 5,6,7,8,9+ hours
  stressLevel: text("stress_level"), // low, medium, high
  nutrition: text("nutrition"), // poor, average, good, excellent
  supplementation: jsonb("supplementation"), // [protein, creatine, etc.]
  
  // 과거 프로그램 경험
  previousPrograms: jsonb("previous_programs"), // [5/3/1, sheiko, westside, etc.]
  programPreference: text("program_preference"), // linear, block, conjugate, daily_undulating
  volumeTolerance: text("volume_tolerance"), // low, medium, high
  intensityPreference: text("intensity_preference"), // low, medium, high
  
  // 멘탈 및 동기
  motivation: text("motivation"), // competition, personal, health, strength
  mentalApproach: text("mental_approach"), // aggressive, steady, cautious
  failureHandling: text("failure_handling"), // push_through, deload, technique_focus
  
  // 고급 설정
  periodization: text("periodization"), // linear, block, conjugate, undulating
  autoregulation: text("autoregulation"), // none, rpe, rir, percentage
  testing: text("testing"), // regular, minimal, competition_only
  warmupPreference: text("warmup_preference"), // minimal, moderate, extensive
  
  // 시스템 데이터
  trainingProgram: text("training_program"), // AI generated program
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  trainingProgram: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
