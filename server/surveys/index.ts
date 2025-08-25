// 📋 Survey Layer - SurveyRegistry (zod, toCanonical, conflicts)

import { z } from 'zod';
import { type CanonicalSurvey, validateCanonicalSurvey } from '../domain/index';

// 🔍 설문 종류별 레지스트리
export interface SurveyTypeDefinition {
  kind: string;
  version: string;
  schema: z.ZodSchema;
  toCanonical: (data: any) => CanonicalSurvey;
  detectConflicts: (canonical: CanonicalSurvey) => ConflictWarning[];
}

export interface ConflictWarning {
  type: 'conflict';
  severity: 'warning' | 'error';
  rule: string;
  message: string;
  suggestedAction: string;
  affectedFields: string[];
}

// 📝 파워리프팅 설문 스키마 (v2.0)
export const powerliftingSurveyV2Schema = z.object({
  // 기본 정보
  email: z.string().email('유효한 이메일을 입력해주세요'),
  name: z.string().optional(),
  
  // 경험 & 현재 상태
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  squatMax: z.string().transform(val => parseInt(val)),
  benchMax: z.string().transform(val => parseInt(val)),
  deadliftMax: z.string().transform(val => parseInt(val)),
  bodyweight: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  
  // 목표 & 우선순위
  goals: z.array(z.string()).or(z.string().transform(s => [s])),
  primaryGoal: z.string().optional(),
  timeframe: z.enum(['3months', '6months', '1year', 'longterm']).optional(),
  
  // 훈련 빈도 & 구성
  frequency: z.string().transform(val => parseInt(val)),
  sessionsPerWeek: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  trainingDuration: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  
  // 운동별 세부 선호도
  squatFrequency: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  benchFrequency: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  deadliftFrequency: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  
  // 장비 & 환경
  equipment: z.array(z.string()).or(z.string().transform(s => [s])),
  homeGym: z.string().optional().transform(val => val === 'yes'),
  
  // 부상 이력
  injuries: z.enum(['none', 'minor', 'specific']),
  injuryDetails: z.string().optional(),
  currentPain: z.array(z.string()).optional(),
  
  // 회복 & 라이프스타일
  sleepHours: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  stressLevel: z.enum(['low', 'medium', 'high']).optional(),
  nutrition: z.enum(['poor', 'average', 'good', 'excellent']).optional(),
  
  // 과거 프로그램 경험
  previousPrograms: z.array(z.string()).optional(),
  volumeTolerance: z.enum(['low', 'medium', 'high']).optional(),
  intensityPreference: z.enum(['low', 'medium', 'high']).optional(),
});

// 🔄 파워리프팅 설문 → Canonical 변환
export function powerliftingToCanonical(data: z.infer<typeof powerliftingSurveyV2Schema>): CanonicalSurvey {
  return {
    // 기본 정보
    email: data.email,
    name: data.name,
    
    // 경험 & 현재 상태
    experience: data.experience,
    squatMax: data.squatMax,
    benchMax: data.benchMax,
    deadliftMax: data.deadliftMax,
    bodyweight: data.bodyweight,
    
    // 목표 & 우선순위
    goals: Array.isArray(data.goals) ? data.goals : [data.goals],
    primaryGoal: data.primaryGoal,
    timeframe: data.timeframe,
    
    // 훈련 빈도 & 구성
    frequency: data.frequency,
    sessionsPerWeek: data.sessionsPerWeek,
    trainingDuration: data.trainingDuration,
    
    // 운동별 세부 선호도
    squatFrequency: data.squatFrequency,
    benchFrequency: data.benchFrequency,
    deadliftFrequency: data.deadliftFrequency,
    
    // 장비 & 환경
    equipment: Array.isArray(data.equipment) ? data.equipment : [data.equipment],
    homeGym: data.homeGym,
    
    // 부상 이력
    injuries: data.injuries,
    injuryDetails: data.injuryDetails,
    currentPain: data.currentPain,
    
    // 회복 & 라이프스타일
    sleepHours: data.sleepHours,
    stressLevel: data.stressLevel,
    nutrition: data.nutrition,
    
    // 과거 프로그램 경험
    previousPrograms: data.previousPrograms,
    volumeTolerance: data.volumeTolerance,
    intensityPreference: data.intensityPreference,
  };
}

// ⚠️ 충돌 감지 로직
export function detectPowerliftingConflicts(canonical: CanonicalSurvey): ConflictWarning[] {
  const conflicts: ConflictWarning[] = [];
  
  // 1. 부상 + 고빈도 충돌
  if (canonical.injuries !== 'none' && canonical.frequency > 5) {
    conflicts.push({
      type: 'conflict',
      severity: 'warning',
      rule: 'injury_high_frequency',
      message: '부상 이력이 있으면서 주 5회 이상 훈련은 위험할 수 있습니다',
      suggestedAction: '주 4회 이하로 조정하거나 부상 부위를 고려한 프로그램이 필요합니다',
      affectedFields: ['injuries', 'frequency']
    });
  }
  
  // 2. 초보자 + 고강도 충돌
  if (canonical.experience === 'beginner' && canonical.intensityPreference === 'high') {
    conflicts.push({
      type: 'conflict',
      severity: 'warning',
      rule: 'beginner_high_intensity',
      message: '초보자에게는 고강도 훈련보다 기술 습득이 우선입니다',
      suggestedAction: '중간 강도로 조정하고 기술 연습에 집중하세요',
      affectedFields: ['experience', 'intensityPreference']
    });
  }
  
  // 3. 낮은 수면 + 고빈도 충돌
  if (canonical.sleepHours && canonical.sleepHours < 6 && canonical.frequency > 4) {
    conflicts.push({
      type: 'conflict',
      severity: 'error',
      rule: 'low_sleep_high_frequency',
      message: '수면 부족 상태에서 고빈도 훈련은 회복을 방해합니다',
      suggestedAction: '수면을 7-8시간으로 늘리거나 훈련 빈도를 줄이세요',
      affectedFields: ['sleepHours', 'frequency']
    });
  }
  
  // 4. 스트레스 + 고볼륨 충돌
  if (canonical.stressLevel === 'high' && canonical.volumeTolerance === 'high') {
    conflicts.push({
      type: 'conflict',
      severity: 'warning',
      rule: 'high_stress_high_volume',
      message: '높은 스트레스 상태에서는 훈련 볼륨을 줄이는 것이 좋습니다',
      suggestedAction: '볼륨을 중간 수준으로 조정하고 회복에 집중하세요',
      affectedFields: ['stressLevel', 'volumeTolerance']
    });
  }
  
  // 5. 장비 부족 + 고급자 충돌
  if (canonical.experience === 'advanced' && 
      !canonical.equipment.includes('powerlifting_bar') && 
      !canonical.equipment.includes('competition_plates')) {
    conflicts.push({
      type: 'conflict',
      severity: 'warning',
      rule: 'advanced_limited_equipment',
      message: '고급자에게는 전문 장비가 중요합니다',
      suggestedAction: '파워리프팅 바와 경쟁용 플레이트 사용을 권장합니다',
      affectedFields: ['experience', 'equipment']
    });
  }
  
  return conflicts;
}

// 📋 설문 레지스트리
export const SURVEY_REGISTRY: Record<string, SurveyTypeDefinition> = {
  'powerlifting-survey-v2': {
    kind: 'powerlifting-survey',
    version: 'v2.0',
    schema: powerliftingSurveyV2Schema,
    toCanonical: powerliftingToCanonical,
    detectConflicts: detectPowerliftingConflicts,
  },
};

// 🔍 설문 처리 메인 함수
export function processSurvey(surveyKind: string, rawData: any): {
  canonical: CanonicalSurvey;
  conflicts: ConflictWarning[];
  warnings: string[];
} {
  // 1. 설문 타입 확인
  const surveyDef = SURVEY_REGISTRY[surveyKind];
  if (!surveyDef) {
    throw new Error(`지원하지 않는 설문 타입: ${surveyKind}`);
  }
  
  // 2. 스키마 검증
  const validatedData = surveyDef.schema.parse(rawData);
  
  // 3. Canonical 변환
  const canonical = surveyDef.toCanonical(validatedData);
  
  // 4. 도메인 검증
  const domainWarnings = validateCanonicalSurvey(canonical);
  
  // 5. 충돌 감지
  const conflicts = surveyDef.detectConflicts(canonical);
  
  return {
    canonical,
    conflicts,
    warnings: domainWarnings,
  };
}

// 🎯 설문 타입 추론
export function inferSurveyType(rawData: any): string {
  // 간단한 휴리스틱으로 설문 타입 추론
  if (rawData.squatMax && rawData.benchMax && rawData.deadliftMax) {
    return 'powerlifting-survey-v2';
  }
  
  throw new Error('설문 타입을 추론할 수 없습니다');
}