// 📋 설문 등록 시스템 (Survey Registry) 
// ✨ 기능: 다양한 설문 타입을 등록하고 관리하는 중앙 시스템
// 🏗️ 구조: "설문이 들어도 엔진/시트는 고정" 원칙 구현
// 📈 확장성: basic_v1, advanced_v1 등 무한 설문 타입 추가 가능

import { z } from 'zod';
import { type CanonicalSurvey, createCanonicalSurvey, validateCanonicalSurvey } from '../domain/canonical';

// 🔍 설문 종류별 레지스트리 (각 설문 타입의 정의)
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

// 📝 기본 설문 스키마 (basic_v1)
export const basicSurveyV1Schema = z.object({
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
  
  // 훈련 빈도
  frequency: z.string().transform(val => parseInt(val)),
  
  // 장비 & 환경
  equipment: z.array(z.string()).or(z.string().transform(s => [s])),
  
  // 부상 이력
  injuries: z.enum(['none', 'minor', 'specific']),
  injuryDetails: z.string().optional(),
});

// 📝 고급 설문 스키마 (advanced_v1) - 40-50개 질문
export const advancedSurveyV1Schema = z.object({
  // ===== 1단계: 기본 정보 =====
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  age: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bodyFatPercent: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  occupation: z.enum(['desk_job', 'active_job', 'physical_job', 'student']).optional(),
  workHours: z.enum(['part_time', 'full_time', 'overtime']).optional(),
  
  // ===== 2단계: 신체 정보 =====
  height: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  armSpan: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  legLength: z.string().optional().transform(val => val ? parseInt(val) : undefined), 
  torsoLength: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  bodyweight: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  shoulderWidth: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  hipWidth: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  ankleFlexibility: z.enum(['poor', 'average', 'good']).optional(),
  hipFlexibility: z.enum(['poor', 'average', 'good']).optional(),
  
  // ===== 3단계: 경험 수준 =====
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  trainingYears: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  powerliftingYears: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  competitionExperience: z.enum(['none', 'local', 'national', 'international']).optional(),
  nextCompetition: z.string().optional(),
  
  // ===== 4단계: 현재 1RM =====
  squatMax: z.string().transform(val => parseInt(val)),
  benchMax: z.string().transform(val => parseInt(val)),
  deadliftMax: z.string().transform(val => parseInt(val)),
  
  // ===== 5단계: 서브맥스 반복수 (70% 기준) =====
  squatReps70: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  benchReps70: z.string().optional().transform(val => val ? parseInt(val) : undefined), 
  deadliftReps70: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  
  // ===== 6단계: 목표 & 우선순위 =====
  goals: z.array(z.string()).or(z.string().transform(s => [s])),
  primaryGoal: z.enum(['strength', 'powerlifting', 'muscle', 'technique']).optional(),
  targetCompetitionDate: z.string().optional(),
  strengthGoals: z.object({
    squatGoal: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    benchGoal: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    deadliftGoal: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  }).optional(),
  squatGoal: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  benchGoal: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  deadliftGoal: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  targetCompetitionDate: z.string().optional(),
  
  // ===== 7단계: 훈련 빈도 & 스케줄 =====
  frequency: z.string().transform(val => parseInt(val)),
  sessionLength: z.enum(['60', '90', '120', '150']).optional(),
  preferredDays: z.array(z.string()).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
  
  // ===== 8단계: 운동 스타일 & 선호도 =====
  liftingStyle: z.enum(['raw', 'equipped', 'hybrid']).optional(),
  techniqueLevel: z.object({
    squatTechnique: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    benchTechnique: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    deadliftTechnique: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }).optional(),
  weakPoints: z.array(z.string()).optional(),
  
  // ===== 9단계: 장비 & 환경 =====
  equipment: z.array(z.string()).or(z.string().transform(s => [s])),
  gymType: z.enum(['commercial', 'powerlifting', 'home']).optional(),
  hasCoach: z.enum(['yes', 'no', 'sometimes']).optional(),
  
  // ===== 10단계: 부상 이력 =====
  injuries: z.enum(['none', 'minor', 'specific']),
  injuryDetails: z.string().optional(),
  currentPain: z.array(z.string()).optional(),
  medicalClearance: z.enum(['yes', 'no', 'partial']).optional(),
  
  // ===== 11단계: 수면 & 회복 =====
  sleepHours: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
  stressLevel: z.enum(['low', 'moderate', 'high']).optional(),
  recoveryMethods: z.array(z.string()).optional(),
  caffeineIntake: z.enum(['none', 'light', 'moderate', 'high']).optional(),
  
  // ===== 12단계: 영양 & 보충제 =====
  nutritionKnowledge: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  supplementUsage: z.array(z.string()).optional(),
  dailyProteinGrams: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  
  // ===== 13단계: 이전 프로그램 경험 =====
  pastPrograms: z.array(z.string()).optional(),
  programPreferences: z.object({
    autoregulation: z.enum(['none', 'rpe', 'percentage']).optional(),
    variationFrequency: z.enum(['low', 'moderate', 'high']).optional(),
    periodizationStyle: z.enum(['linear', 'conjugate', 'daily_undulating']).optional(),
  }).optional(),
  autoregulationPreference: z.enum(['percentage', 'rpe', 'hybrid']).optional(),
  volumePreference: z.enum(['low', 'moderate', 'high']).optional(),
  
  // ===== 14단계: 운동 외 활동 =====
  otherSports: z.array(z.string()).optional(),
  cardioPreference: z.enum(['none', 'light', 'moderate', 'high']).optional(),
  mobilityWork: z.enum(['none', 'light', 'moderate', 'high']).optional(),
  cardioDetails: z.string().optional(),
  
  // ===== 15단계: 추가 정보 =====
  additionalInfo: z.string().optional(),
  programLength: z.enum(['8', '12', '16', '20']).optional(),
  communicationPreference: z.enum(['simple', 'detailed', 'email']).optional(),
  variationFrequency: z.enum(['low', 'moderate', 'high']).optional(),
  periodizationStyle: z.enum(['linear', 'conjugate', 'daily_undulating']).optional(),
  communicationPreference: z.enum(['email', 'detailed', 'simple']).optional(),
});

// 🔄 기본 설문 → Canonical 변환
export function basicToCanonical(data: z.infer<typeof basicSurveyV1Schema>): CanonicalSurvey {
  return createCanonicalSurvey({
    email: data.email,
    name: data.name,
    experience: data.experience,
    squatMax: data.squatMax,
    benchMax: data.benchMax,
    deadliftMax: data.deadliftMax,
    bodyweight: data.bodyweight,
    goals: Array.isArray(data.goals) ? data.goals : [data.goals],
    frequency: data.frequency,
    equipment: Array.isArray(data.equipment) ? data.equipment : [data.equipment],
    injuries: data.injuries,
    injuryDetails: data.injuryDetails,
  });
}

// 🔄 고급 설문 → Canonical 변환 (모든 필드 활용)
export function advancedToCanonical(data: z.infer<typeof advancedSurveyV1Schema>): CanonicalSurvey {
  return createCanonicalSurvey({
    // 기본 정보
    email: data.email,
    name: data.name,
    age: data.age,
    gender: data.gender,
    
    // 신체 정보 (고급)
    height: data.height,
    bodyweight: data.bodyweight,
    armSpan: data.armSpan,
    legLength: data.legLength,
    torsoLength: data.torsoLength,
    
    // 경험 & 현재 상태 (고급)
    experience: data.experience,
    trainingYears: data.trainingYears,
    powerliftingYears: data.powerliftingYears,
    competitionExperience: data.competitionExperience,
    nextCompetition: data.nextCompetition,
    
    // 1RM & 서브맥스 (고급)
    squatMax: data.squatMax,
    benchMax: data.benchMax,
    deadliftMax: data.deadliftMax,
    squatReps70: data.squatReps70,
    benchReps70: data.benchReps70,
    deadliftReps70: data.deadliftReps70,
    
    // 목표 & 우선순위 (고급)
    goals: Array.isArray(data.goals) ? data.goals : [data.goals],
    primaryGoal: data.primaryGoal,
    targetCompetitionDate: data.targetCompetitionDate,
    strengthGoals: data.strengthGoals,
    
    // 훈련 빈도 & 스케줄 (고급)
    frequency: data.frequency,
    sessionLength: data.sessionLength,
    preferredDays: data.preferredDays,
    timeOfDay: data.timeOfDay,
    
    // 운동 스타일 & 선호도 (고급)
    liftingStyle: data.liftingStyle,
    techniqueLevel: data.techniqueLevel,
    weakPoints: data.weakPoints,
    
    // 장비 & 환경 (고급)
    equipment: Array.isArray(data.equipment) ? data.equipment : [data.equipment],
    gymType: data.gymType,
    hasCoach: data.hasCoach,
    
    // 부상 이력 (고급)
    injuries: data.injuries,
    injuryDetails: data.injuryDetails,
    currentPain: data.currentPain,
    medicalClearance: data.medicalClearance,
    
    // 수면 & 회복 (고급)
    sleepHours: data.sleepHours,
    sleepQuality: data.sleepQuality,
    stressLevel: data.stressLevel,
    recoveryMethods: data.recoveryMethods,
    
    // 영양 & 보충제 (고급)
    nutritionKnowledge: data.nutritionKnowledge,
    dietaryRestrictions: data.dietaryRestrictions,
    supplementUsage: data.supplementUsage,
    
    // 이전 프로그램 경험 (고급)
    pastPrograms: data.pastPrograms,
    programPreferences: data.programPreferences,
    
    // 운동 외 활동 (고급)
    otherSports: data.otherSports,
    cardioPreference: data.cardioPreference,
    mobilityWork: data.mobilityWork,
    
    // 추가 정보 (고급)
    additionalInfo: data.additionalInfo,
    programLength: data.programLength,
    communicationPreference: data.communicationPreference,
  });
}

// ⚠️ 기본 설문 충돌 감지 (empty for basic_v1)
export function detectBasicConflicts(canonical: CanonicalSurvey): ConflictWarning[] {
  // basic_v1은 충돌 감지 없음
  return [];
}

// ⚠️ 고급 설문 충돌 감지 (advanced_v1)
export function detectAdvancedConflicts(canonical: CanonicalSurvey): ConflictWarning[] {
  const conflicts: ConflictWarning[] = [];
  
  // 1. 경험년수 vs 1RM 충돌 감지
  if (canonical.trainingYears && canonical.trainingYears < 1) {
    const totalMax = (canonical.squatMax || 0) + (canonical.benchMax || 0) + (canonical.deadliftMax || 0);
    if (totalMax > 400) {  // 초보자치고 너무 강함
      conflicts.push({
        type: 'conflict',
        severity: 'warning',
        rule: 'experience_strength_mismatch',
        message: '훈련 경험이 1년 미만인데 총합 중량이 매우 높습니다',
        suggestedAction: '경험 수준이나 1RM 중량을 다시 확인해주세요',
        affectedFields: ['trainingYears', 'squatMax', 'benchMax', 'deadliftMax'],
      });
    }
  }
  
  // 2. 체중 vs 1RM 비율 검증
  if (canonical.bodyweight && canonical.deadliftMax) {
    const deadliftRatio = canonical.deadliftMax / canonical.bodyweight;
    if (deadliftRatio > 3.5) {  // 데드리프트가 체중의 3.5배 이상
      conflicts.push({
        type: 'conflict',
        severity: 'warning', 
        rule: 'unrealistic_deadlift_ratio',
        message: '데드리프트가 체중 대비 매우 높습니다',
        suggestedAction: '체중이나 데드리프트 1RM을 다시 확인해주세요',
        affectedFields: ['bodyweight', 'deadliftMax'],
      });
    }
  }
  
  // 3. 대회 경험 vs 1RM 충돌
  if (canonical.competitionExperience === 'none' && canonical.experience === 'advanced') {
    const wilksScore = calculateEstimatedWilks(canonical);
    if (wilksScore > 400) {  // 대회 경험 없는데 윌크스 400 이상
      conflicts.push({
        type: 'conflict',
        severity: 'warning',
        rule: 'competition_strength_mismatch',
        message: '대회 경험이 없는데 상당한 실력입니다',
        suggestedAction: '대회 참가를 고려해보시거나 경험 수준을 재검토해주세요',
        affectedFields: ['competitionExperience', 'squatMax', 'benchMax', 'deadliftMax'],
      });
    }
  }
  
  // 4. 부상 vs 훈련 빈도 충돌
  if (canonical.injuries === 'specific' && canonical.frequency > 5) {
    conflicts.push({
      type: 'conflict',
      severity: 'warning',
      rule: 'injury_frequency_mismatch',
      message: '특정 부위 부상이 있는데 훈련 빈도가 높습니다',
      suggestedAction: '부상 회복을 위해 훈련 빈도를 줄이는 것을 고려해주세요',
      affectedFields: ['injuries', 'frequency'],
    });
  }
  
  return conflicts;
}

// 🧮 추정 윌크스 점수 계산 (간단한 공식)
function calculateEstimatedWilks(canonical: CanonicalSurvey): number {
  if (!canonical.bodyweight || !canonical.squatMax || !canonical.benchMax || !canonical.deadliftMax) {
    return 0;
  }
  
  const total = canonical.squatMax + canonical.benchMax + canonical.deadliftMax;
  // 간단한 윌크스 근사 공식 (남성 기준)
  const bodyweight = canonical.bodyweight;
  const wilksCoeff = 500 / (bodyweight + 110.135); // 매우 간단한 근사
  return total * wilksCoeff;
}

// 📋 설문 레지스트리 (basic_v1 + advanced_v1)
export const SURVEY_REGISTRY: Record<string, SurveyTypeDefinition> = {
  'basic_v1': {
    kind: 'basic_survey',
    version: 'v1.0',
    schema: basicSurveyV1Schema,
    toCanonical: basicToCanonical,
    detectConflicts: detectBasicConflicts,
  },
  'advanced_v1': {
    kind: 'advanced_survey',
    version: 'v1.0',
    schema: advancedSurveyV1Schema,
    toCanonical: advancedToCanonical,
    detectConflicts: detectAdvancedConflicts,
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
  // 기본적으로 basic_v1 반환
  return 'basic_v1';
}