// 📋 Survey Registry - basic_v1만 등록

import { z } from 'zod';
import { type CanonicalSurvey, createCanonicalSurvey, validateCanonicalSurvey } from '../domain/canonical';

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

// ⚠️ 기본 설문 충돌 감지 (empty for basic_v1)
export function detectBasicConflicts(canonical: CanonicalSurvey): ConflictWarning[] {
  // basic_v1은 충돌 감지 없음
  return [];
}

// 📋 설문 레지스트리 (basic_v1만 등록)
export const SURVEY_REGISTRY: Record<string, SurveyTypeDefinition> = {
  'basic_v1': {
    kind: 'basic_survey',
    version: 'v1.0',
    schema: basicSurveyV1Schema,
    toCanonical: basicToCanonical,
    detectConflicts: detectBasicConflicts,
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