// 🎯 핵심 도메인 타입 정의 (Domain Types)
// ✨ 기능: 시스템 전체에서 사용하는 모든 데이터 구조 정의
// 📊 타입: ProgramPlan (18주 프로그램), CanonicalSurvey (표준 설문), TrainingWeek (주차별 계획)
// 🛡️ 타입 안전성: TypeScript 타입 체크로 런타임 오류 방지

// 📋 18주 파워리프팅 프로그램 전체 구조
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
  
  // ===== 추가 고급 필드들 =====
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  armSpan?: number;
  legLength?: number;
  torsoLength?: number;
  trainingYears?: number;
  powerliftingYears?: number;
  competitionExperience?: 'none' | 'local' | 'national' | 'international';
  nextCompetition?: string;
  squatReps70?: number;
  benchReps70?: number;
  deadliftReps70?: number;
  targetCompetitionDate?: string;
  strengthGoals?: {
    squatGoal?: number;
    benchGoal?: number;
    deadliftGoal?: number;
  };
  sessionLength?: '60' | '90' | '120' | '150';
  preferredDays?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  liftingStyle?: 'raw' | 'equipped' | 'hybrid';
  techniqueLevel?: {
    squatTechnique?: 'beginner' | 'intermediate' | 'advanced';
    benchTechnique?: 'beginner' | 'intermediate' | 'advanced';
    deadliftTechnique?: 'beginner' | 'intermediate' | 'advanced';
  };
  weakPoints?: string[];
  gymType?: 'commercial' | 'powerlifting' | 'home';
  hasCoach?: 'yes' | 'no' | 'sometimes';
  medicalClearance?: 'yes' | 'no' | 'partial';
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  recoveryMethods?: string[];
  nutritionKnowledge?: 'beginner' | 'intermediate' | 'advanced';
  dietaryRestrictions?: string[];
  supplementUsage?: string[];
  pastPrograms?: string[];
  programPreferences?: {
    autoregulation?: 'none' | 'rpe' | 'percentage';
    variationFrequency?: 'low' | 'moderate' | 'high';
    periodizationStyle?: 'linear' | 'conjugate' | 'daily_undulating';
  };
  otherSports?: string[];
  cardioPreference?: 'none' | 'light' | 'moderate' | 'high';
  mobilityWork?: 'none' | 'light' | 'moderate' | 'high';
  additionalInfo?: string;
  programLength?: '8' | '12' | '16' | '20';
  communicationPreference?: 'email' | 'detailed' | 'simple';
  previousPrograms?: string[];
  volumeTolerance?: 'low' | 'medium' | 'high';
  intensityPreference?: 'low' | 'medium' | 'high';
}