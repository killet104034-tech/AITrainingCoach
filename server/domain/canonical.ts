// 📋 표준 설문 인터페이스 (Canonical Survey)
// ✨ 기능: 모든 설문 타입을 하나의 통일된 형태로 변환 및 검증
// 🔄 변환: basic_v1, advanced_v1 등 → 공통 CanonicalSurvey 형태
// 🛡️ 안정성: 엔진이 항상 같은 데이터 구조로 프로그램을 생성할 수 있도록 보장

import { type CanonicalSurvey, SAFETY_LIMITS } from './types';

// 🚨 데이터 무결성 검증 (필수 필드 및 안전 범위 체크)
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

// 🔧 Canonical 생성 헬퍼
export function createCanonicalSurvey(
  baseData: Partial<CanonicalSurvey>
): CanonicalSurvey {
  return {
    email: baseData.email || '',
    name: baseData.name,
    experience: baseData.experience || 'beginner',
    squatMax: baseData.squatMax || 0,
    benchMax: baseData.benchMax || 0,
    deadliftMax: baseData.deadliftMax || 0,
    bodyweight: baseData.bodyweight,
    goals: baseData.goals || ['general_fitness'],
    primaryGoal: baseData.primaryGoal,
    timeframe: baseData.timeframe,
    frequency: baseData.frequency || 3,
    sessionsPerWeek: baseData.sessionsPerWeek,
    trainingDuration: baseData.trainingDuration,
    squatFrequency: baseData.squatFrequency,
    benchFrequency: baseData.benchFrequency,
    deadliftFrequency: baseData.deadliftFrequency,
    equipment: baseData.equipment || ['barbell'],
    homeGym: baseData.homeGym,
    injuries: baseData.injuries || 'none',
    injuryDetails: baseData.injuryDetails,
    currentPain: baseData.currentPain,
    sleepHours: baseData.sleepHours,
    stressLevel: baseData.stressLevel,
    nutrition: baseData.nutrition,
    previousPrograms: baseData.previousPrograms,
    volumeTolerance: baseData.volumeTolerance,
    intensityPreference: baseData.intensityPreference,
  };
}

// 🎯 Canonical 해시 생성
export function generateCanonicalHash(canonical: CanonicalSurvey): string {
  const key = JSON.stringify({
    email: canonical.email,
    experience: canonical.experience,
    maxes: [canonical.squatMax, canonical.benchMax, canonical.deadliftMax],
    frequency: canonical.frequency,
    goals: canonical.goals.sort(),
    equipment: canonical.equipment.sort(),
    injuries: canonical.injuries,
  });
  
  // 간단한 해시 (실제로는 crypto.createHash 사용 권장)
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash).toString(16);
}