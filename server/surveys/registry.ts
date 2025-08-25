// 📋 Survey Registry: 설문 타입별 스키마 관리
import { z, type ZodSchema } from 'zod';
import type { CanonicalInput } from '../domain/canonical';

export interface SurveySchema {
  version: string;     // "1.0.0"
  zod: ZodSchema<any>; // 입력 검증
  toCanonical: (raw: any) => CanonicalInput; // 변환기
  conflicts: (raw: any) => Conflict[];      // 사전 충돌 검사
}

// 충돌/경고 타입
export interface Conflict {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  severity: 'critical' | 'moderate' | 'minor';
}

// 기본 설문 (basic_v1) 스키마
const basicV1Schema = z.object({
  // 기본 정보
  name: z.string().min(1, '이름이 필요합니다'),
  email: z.string().email('유효한 이메일이 필요합니다'),
  age: z.number().min(15).max(80, '나이는 15-80 사이여야 합니다'),
  gender: z.enum(['Male', 'Female', 'Other']),
  weight: z.number().min(30).max(200, '체중은 30-200kg 사이여야 합니다'),
  height: z.number().min(140).max(220, '신장은 140-220cm 사이여야 합니다'),
  
  // 운동 경험
  experienceYears: z.number().min(0).max(50),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Elite']),
  squatMax: z.number().min(20, '스쿼트 1RM이 필요합니다'),
  benchMax: z.number().min(20, '벤치프레스 1RM이 필요합니다'),
  deadliftMax: z.number().min(20, '데드리프트 1RM이 필요합니다'),
  
  // 목표 및 제약
  primaryGoal: z.string(),
  timeframe: z.string(),
  daysPerWeek: z.number().min(2).max(7),
  injuryHistory: z.string(),
  equipment: z.array(z.string()),
  timeAvailable: z.number().min(30).max(180),
  
  // 선택적 필드들
  sleepHours: z.string().optional(),
  stressLevel: z.string().optional(),
  intensityPreference: z.string().optional()
});

// 코치용 설문 (coach_v2) 스키마
const coachV2Schema = basicV1Schema.extend({
  // 추가 코치 전용 필드들
  clientGoals: z.array(z.string()),
  programmingExperience: z.string(),
  certifications: z.array(z.string()),
  preferredMethodology: z.string(),
  clientProgress: z.object({
    before: z.object({
      squat: z.number(),
      bench: z.number(),
      deadlift: z.number()
    }),
    current: z.object({
      squat: z.number(),
      bench: z.number(),
      deadlift: z.number()
    })
  }).optional()
});

// 재활용 설문 (rehab_v1) 스키마
const rehabV1Schema = basicV1Schema.extend({
  // 재활 전용 필드들
  injuryDetails: z.string(),
  painLevel: z.number().min(0).max(10),
  movementRestrictions: z.array(z.string()),
  medicalClearance: z.boolean(),
  physicalTherapy: z.boolean(),
  previousSurgeries: z.array(z.string()).optional()
});

// 변환 함수들
function basicV1ToCanonical(raw: any): CanonicalInput {
  // 목표 매핑
  const goalMap: Record<string, CanonicalInput['goal']> = {
    'Strength': 'strength',
    'Powerlifting Competition': 'peaking',
    'General Fitness': 'balanced',
    'Muscle Building': 'hypertrophy'
  };
  
  // 경험 매핑
  const expMap: Record<string, CanonicalInput['experience']> = {
    'Beginner': 'beginner',
    'Intermediate': 'intermediate', 
    'Advanced': 'advanced',
    'Elite': 'elite'
  };
  
  // 제약사항 정리
  const constraints: string[] = [];
  if (raw.injuryHistory && raw.injuryHistory !== 'None') {
    constraints.push(`injury:${raw.injuryHistory}`);
  }
  if (raw.equipment && !raw.equipment.includes('Full gym')) {
    constraints.push(`equipment:${raw.equipment.join(',')}`);
  }
  if (raw.timeAvailable && raw.timeAvailable < 60) {
    constraints.push(`time:${raw.timeAvailable}min`);
  }
  
  return {
    profile: {
      sex: raw.gender === 'Male' ? 'M' : raw.gender === 'Female' ? 'F' : undefined,
      age: raw.age,
      height: raw.height,
      weight: raw.weight
    },
    strength: {
      SQ1RM: raw.squatMax,
      BP1RM: raw.benchMax,
      DL1RM: raw.deadliftMax
    },
    goal: goalMap[raw.primaryGoal] || 'balanced',
    experience: expMap[raw.experienceLevel] || 'beginner',
    frequency: {
      total: raw.daysPerWeek,
      bench: raw.benchFrequency
    },
    constraints: constraints.length > 0 ? constraints : undefined,
    psychology: {
      arousal: raw.intensityPreference === 'High (85%+)' ? 'high' : 
               raw.intensityPreference === 'Low (60-70%)' ? 'low' : 'moderate',
      stress: raw.stressLevel === 'High' ? 'high' : 
              raw.stressLevel === 'Low' ? 'low' : 'moderate'
    },
    volumes: {
      tolerance: raw.volumeTolerance === 'high' ? 'high' :
                 raw.volumeTolerance === 'low' ? 'low' : 'typical'
    },
    meta: {
      survey_kind: 'basic_v1',
      survey_version: '1.0.0'
    }
  };
}

function coachV2ToCanonical(raw: any): CanonicalInput {
  const basic = basicV1ToCanonical(raw);
  
  // 코치 전용 데이터를 메타에 추가
  basic.meta = {
    ...basic.meta,
    survey_kind: 'coach_v2',
    survey_version: '2.0.0'
  };
  
  // 코치 경험에 따른 볼륨 조정
  if (raw.programmingExperience === 'Advanced') {
    basic.volumes = { tolerance: 'high' };
  }
  
  return basic;
}

function rehabV1ToCanonical(raw: any): CanonicalInput {
  const basic = basicV1ToCanonical(raw);
  
  // 재활 전용 설정
  basic.meta = {
    ...basic.meta,
    survey_kind: 'rehab_v1',
    survey_version: '1.0.0'
  };
  
  // 재활 제약사항 추가
  const rehabConstraints = basic.constraints || [];
  if (raw.injuryDetails) {
    rehabConstraints.push(`injury_detail:${raw.injuryDetails}`);
  }
  if (raw.painLevel > 3) {
    rehabConstraints.push(`pain_level:${raw.painLevel}`);
  }
  if (raw.movementRestrictions?.length > 0) {
    rehabConstraints.push(`movement:${raw.movementRestrictions.join(',')}`);
  }
  
  basic.constraints = rehabConstraints;
  
  // 재활은 보수적 설정
  basic.psychology = {
    arousal: 'low',
    stress: raw.painLevel > 5 ? 'high' : 'moderate'
  };
  basic.volumes = { tolerance: 'low' };
  
  return basic;
}

// 충돌 검사 함수들
function basicV1Conflicts(raw: any): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // 나이와 경험 불일치
  if (raw.age < 20 && raw.experienceYears > 5) {
    conflicts.push({
      type: 'warning',
      field: 'experienceYears',
      message: '나이에 비해 운동 경력이 길어 보입니다',
      severity: 'minor'
    });
  }
  
  // 1RM과 경험 수준 불일치
  const total = (raw.squatMax || 0) + (raw.benchMax || 0) + (raw.deadliftMax || 0);
  const bodyweight = raw.weight || 70;
  const wilksScore = total / bodyweight; // 간단한 상대적 강도
  
  if (raw.experienceLevel === 'Beginner' && wilksScore > 4) {
    conflicts.push({
      type: 'warning',
      field: 'experienceLevel',
      message: '1RM 수치가 초급자 수준을 넘어 보입니다',
      severity: 'moderate'
    });
  }
  
  // 부상 이력과 강도 설정 불일치
  if (raw.injuryHistory !== 'None' && raw.intensityPreference === 'High (85%+)') {
    conflicts.push({
      type: 'error',
      field: 'intensityPreference',
      message: '부상 이력이 있는 경우 고강도 훈련은 권장되지 않습니다',
      severity: 'critical'
    });
  }
  
  return conflicts;
}

function coachV2Conflicts(raw: any): Conflict[] {
  const baseConflicts = basicV1Conflicts(raw);
  
  // 코치 전용 충돌 검사
  if (raw.programmingExperience === 'Beginner' && raw.clientProgress) {
    baseConflicts.push({
      type: 'info',
      field: 'programmingExperience',
      message: '초급 코치의 경우 멘토링이 필요할 수 있습니다',
      severity: 'minor'
    });
  }
  
  return baseConflicts;
}

function rehabV1Conflicts(raw: any): Conflict[] {
  const baseConflicts = basicV1Conflicts(raw);
  
  // 재활 전용 충돌 검사
  if (!raw.medicalClearance) {
    baseConflicts.push({
      type: 'error',
      field: 'medicalClearance',
      message: '의료진 승인 없이는 프로그램을 진행할 수 없습니다',
      severity: 'critical'
    });
  }
  
  if (raw.painLevel > 5) {
    baseConflicts.push({
      type: 'error',
      field: 'painLevel',
      message: '현재 통증 수준이 높아 운동을 중단해야 합니다',
      severity: 'critical'
    });
  }
  
  return baseConflicts;
}

// 📋 Survey Registry
export const SurveyRegistry: Record<string, SurveySchema> = {
  basic_v1: {
    version: '1.0.0',
    zod: basicV1Schema,
    toCanonical: basicV1ToCanonical,
    conflicts: basicV1Conflicts
  },
  
  coach_v2: {
    version: '2.0.0',
    zod: coachV2Schema,
    toCanonical: coachV2ToCanonical,
    conflicts: coachV2Conflicts
  },
  
  rehab_v1: {
    version: '1.0.0',
    zod: rehabV1Schema,
    toCanonical: rehabV1ToCanonical,
    conflicts: rehabV1Conflicts
  }
};

// 🔍 Registry 유틸리티 함수들
export function getSurveySchema(kind: string): SurveySchema {
  const schema = SurveyRegistry[kind];
  if (!schema) {
    throw new Error(`Unknown survey kind: ${kind}`);
  }
  return schema;
}

export function validateSurvey(kind: string, rawData: any): {
  success: boolean;
  data?: any;
  errors?: string[];
  conflicts?: Conflict[];
} {
  try {
    const schema = getSurveySchema(kind);
    
    // 1. Zod 검증
    const validatedData = schema.zod.parse(rawData);
    
    // 2. 충돌 검사
    const conflicts = schema.conflicts(validatedData);
    
    // 3. 치명적 오류 확인
    const criticalErrors = conflicts.filter(c => c.severity === 'critical');
    
    if (criticalErrors.length > 0) {
      return {
        success: false,
        errors: criticalErrors.map(e => e.message),
        conflicts
      };
    }
    
    return {
      success: true,
      data: validatedData,
      conflicts
    };
    
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || '검증 실패']
    };
  }
}

export function processToCanonical(kind: string, rawData: any): CanonicalInput {
  const schema = getSurveySchema(kind);
  return schema.toCanonical(rawData);
}