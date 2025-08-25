// 🎯 Domain Types - 핵심 도메인 타입 정의

// 프로그램 구조
export interface ProgramPlan {
  // 메타 정보
  programTitle: string;
  totalWeeks: number;
  overview: string;
  
  // 사용자 최대 중량
  userMaxes: {
    squat: number;
    bench: number;
    deadlift: number;
  };
  
  // 주차별 계획
  trainingWeeks: TrainingWeek[];
  
  // 가이드라인
  progressionNotes: string;
  warmupProtocol: string;
  cooldownProtocol: string;
  safetyGuidelines: string;
  nutritionGuidelines: string;
  recoveryGuidelines: string;
}

export interface TrainingWeek {
  week: number;
  focus: string;
  workouts: Workout[];
}

export interface Workout {
  day: number;
  workoutName: string;
  exercises: Exercise[];
}

export interface Exercise {
  exercise: string;
  sets: string;
  reps: string;
  weightPercent: string;
  restMinutes: string;
  rpe: string;
  notes?: string;
}

// 메타데이터
export interface ProgramMetadata {
  templateVersion: string;
  engineVersion: string;
  surveyKind: string;
  surveyVersion: string;
  canonicalHash: string;
  warnings: Warning[];
  createdAt: string;
  processingTimeMs?: number;
}

export interface Warning {
  type: 'automatic_correction' | 'safety_adjustment' | 'fallback_applied';
  rule: string;
  message: string;
  original: any;
  corrected: any;
}

// 🚨 불변 로직: 안전 제한  
export const SAFETY_LIMITS = {
  MAX_WEEKLY_FREQUENCY: 7,
  MIN_WEEKLY_FREQUENCY: 3,
  MAX_SINGLE_LIFT_FREQUENCY: 5,
  MIN_REST_BETWEEN_SESSIONS: 24, // 시간
  MAX_PROGRAM_WEEKS: 18,
  MIN_PROGRAM_WEEKS: 4,
  MAX_VOLUME_PER_WEEK: 50, // 세트
  MAX_INTENSITY: 100, // %
  MIN_INTENSITY: 40, // %
} as const;

// 🎯 도메인 이벤트
export interface DomainEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface SurveySubmittedEvent extends DomainEvent {
  type: 'survey_submitted';
  payload: {
    surveyId: string;
    canonicalSurvey: CanonicalSurvey;
    canonicalHash: string;
  };
}

export interface ProgramGeneratedEvent extends DomainEvent {
  type: 'program_generated';
  payload: {
    surveyId: string;
    programPlan: ProgramPlan;
    processingTimeMs: number;
  };
}

// Forward declaration - 실제 정의는 canonical.ts에서
export interface CanonicalSurvey {
  email: string;
  name?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  squatMax: number;
  benchMax: number;
  deadliftMax: number;
  bodyweight?: number;
  goals: string[];
  primaryGoal?: string;
  timeframe?: '3months' | '6months' | '1year' | 'longterm';
  frequency: number;
  sessionsPerWeek?: number;
  trainingDuration?: number;
  squatFrequency?: number;
  benchFrequency?: number;
  deadliftFrequency?: number;
  equipment: string[];
  homeGym?: boolean;
  injuries: 'none' | 'minor' | 'specific';
  injuryDetails?: string;
  currentPain?: string[];
  sleepHours?: number;
  stressLevel?: 'low' | 'medium' | 'high';
  nutrition?: 'poor' | 'average' | 'good' | 'excellent';
  previousPrograms?: string[];
  volumeTolerance?: 'low' | 'medium' | 'high';
  intensityPreference?: 'low' | 'medium' | 'high';
}