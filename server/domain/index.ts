// 🎯 Domain Layer - 타입/계약/불변 로직 (엔진은 여기만 의존)

// 핵심 도메인 타입들
export interface CanonicalSurvey {
  // 기본 정보
  email: string;
  name?: string;
  
  // 경험 & 현재 상태  
  experience: 'beginner' | 'intermediate' | 'advanced';
  squatMax: number;
  benchMax: number;  
  deadliftMax: number;
  bodyweight?: number;
  
  // 목표 & 우선순위
  goals: string[];
  primaryGoal?: string;
  timeframe?: '3months' | '6months' | '1year' | 'longterm';
  
  // 훈련 빈도 & 구성
  frequency: number; // 주당 훈련 일수
  sessionsPerWeek?: number;
  trainingDuration?: number; // 분
  
  // 운동별 세부 선호도
  squatFrequency?: number;
  benchFrequency?: number;
  deadliftFrequency?: number;
  
  // 장비 & 환경
  equipment: string[];
  homeGym?: boolean;
  
  // 부상 이력
  injuries: 'none' | 'minor' | 'specific';
  injuryDetails?: string;
  currentPain?: string[];
  
  // 회복 & 라이프스타일
  sleepHours?: number;
  stressLevel?: 'low' | 'medium' | 'high';
  nutrition?: 'poor' | 'average' | 'good' | 'excellent';
  
  // 과거 프로그램 경험
  previousPrograms?: string[];
  volumeTolerance?: 'low' | 'medium' | 'high';
  intensityPreference?: 'low' | 'medium' | 'high';
}

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

// 🚨 불변 로직: 계약 검증
export function validateCanonicalSurvey(survey: CanonicalSurvey): string[] {
  const errors: string[] = [];
  
  // 필수 필드 검증
  if (!survey.email) errors.push('이메일이 필요합니다');
  if (!survey.experience) errors.push('경험 수준이 필요합니다');
  if (survey.squatMax <= 0) errors.push('스쿼트 최대 중량이 필요합니다');
  if (survey.benchMax <= 0) errors.push('벤치프레스 최대 중량이 필요합니다');
  if (survey.deadliftMax <= 0) errors.push('데드리프트 최대 중량이 필요합니다');
  if (survey.frequency < 3 || survey.frequency > 7) errors.push('주당 훈련 빈도는 3-7일이어야 합니다');
  if (!survey.equipment || survey.equipment.length === 0) errors.push('장비 정보가 필요합니다');
  
  return errors;
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