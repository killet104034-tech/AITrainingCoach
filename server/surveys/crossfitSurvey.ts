// 🏋️ CrossFit Survey Type - 크로스핏 특화 설문

import { z } from 'zod';
import { type CanonicalSurvey } from '../domain/index';
import { type ConflictWarning } from './index';

// 📝 크로스핏 설문 스키마 (v1.0)
export const crossfitSurveyV1Schema = z.object({
  // 기본 정보
  email: z.string().email('유효한 이메일을 입력해주세요'),
  name: z.string().optional(),
  
  // 크로스핏 특화 필드
  crossfitExperience: z.enum(['rookie', 'scaled', 'rx', 'competitive']),
  wodPreference: z.array(z.enum(['strength', 'metcon', 'olympic', 'gymnastics'])),
  
  // 기존 리프팅 경험
  squatMax: z.string().transform(val => parseInt(val)),
  benchMax: z.string().optional().transform(val => val ? parseInt(val) : 0),
  deadliftMax: z.string().transform(val => parseInt(val)),
  
  // 크로스핏 특화 중량
  cleanJerkMax: z.string().optional().transform(val => val ? parseInt(val) : 0),
  snatchMax: z.string().optional().transform(val => val ? parseInt(val) : 0),
  
  // 체력 수준
  bodyweight: z.string().transform(val => parseInt(val)),
  pullUps: z.string().transform(val => parseInt(val)),
  pushUps: z.string().transform(val => parseInt(val)),
  
  // 훈련 환경
  boxMembership: z.enum(['yes', 'no']),
  equipment: z.array(z.string()),
  
  // 목표
  goals: z.array(z.enum(['competition', 'fitness', 'strength', 'weight_loss'])),
  frequency: z.string().transform(val => parseInt(val)),
  
  // 부상 이력
  injuries: z.enum(['none', 'minor', 'specific']),
  injuryDetails: z.string().optional(),
});

// 🔄 크로스핏 설문 → Canonical 변환
export function crossfitToCanonical(data: z.infer<typeof crossfitSurveyV1Schema>): CanonicalSurvey {
  // 크로스핏 경험을 일반 경험으로 매핑
  const experienceMapping = {
    'rookie': 'beginner' as const,
    'scaled': 'intermediate' as const, 
    'rx': 'advanced' as const,
    'competitive': 'advanced' as const
  };
  
  return {
    // 기본 정보
    email: data.email,
    name: data.name,
    
    // 경험 & 현재 상태
    experience: experienceMapping[data.crossfitExperience],
    squatMax: data.squatMax,
    benchMax: data.benchMax || Math.round(data.squatMax * 0.8), // 추정값
    deadliftMax: data.deadliftMax,
    bodyweight: data.bodyweight,
    
    // 목표 (크로스핏 → 일반 목표 매핑)
    goals: data.goals.map(goal => {
      switch (goal) {
        case 'competition': return 'competition_prep';
        case 'fitness': return 'general_fitness';
        case 'strength': return 'max_strength';
        case 'weight_loss': return 'body_composition';
        default: return goal;
      }
    }),
    
    // 훈련 빈도
    frequency: data.frequency,
    
    // 장비 (크로스핏 박스 환경 반영)
    equipment: data.boxMembership === 'yes' 
      ? [...data.equipment, 'olympic_platform', 'competition_plates', 'crossfit_box']
      : data.equipment,
    
    // 부상 이력
    injuries: data.injuries,
    injuryDetails: data.injuryDetails,
    
    // 크로스핏 특화 선호도를 일반 선호도로 변환
    volumeTolerance: data.wodPreference.includes('metcon') ? 'high' : 'medium',
    intensityPreference: data.wodPreference.includes('strength') ? 'high' : 'medium',
  };
}

// ⚠️ 크로스핏 특화 충돌 감지
export function detectCrossfitConflicts(canonical: CanonicalSurvey): ConflictWarning[] {
  const conflicts: ConflictWarning[] = [];
  
  // 1. 초보자 + 고빈도 충돌
  if (canonical.experience === 'beginner' && canonical.frequency > 4) {
    conflicts.push({
      type: 'conflict',
      severity: 'warning',
      rule: 'crossfit_beginner_frequency',
      message: '크로스핏 초보자는 주 3-4회가 적절합니다',
      suggestedAction: '빈도를 줄이고 기본 동작 연습에 집중하세요',
      affectedFields: ['experience', 'frequency']
    });
  }
  
  // 2. 박스 없음 + 고급 목표 충돌
  if (!canonical.equipment.includes('crossfit_box') && 
      canonical.goals.includes('competition_prep')) {
    conflicts.push({
      type: 'conflict',
      severity: 'error',
      rule: 'competition_needs_box',
      message: '대회 준비는 크로스핏 박스 환경이 필요합니다',
      suggestedAction: '박스 멤버십을 고려하거나 목표를 조정하세요',
      affectedFields: ['equipment', 'goals']
    });
  }
  
  return conflicts;
}