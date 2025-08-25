// 🚨 Preflight: 사전 충돌/자동보정 (확장 지원 ③)
// 같은 릴트의 모순점 때 엔진 진입 전에 자동 보정/차단

import type { CanonicalInput } from '../domain/canonical';

export interface PreflightWarning {
  type: 'warn' | 'error' | 'info';
  rule: string;
  message: string;
  original: any;
  corrected: any;
}

export interface PreflightResult {
  input: CanonicalInput;
  warnings: PreflightWarning[];
  blocked: boolean;
}

// 🔍 사전 충돌 검사 & 자동 보정
export function runPreflight(input: CanonicalInput): PreflightResult {
  const warnings: PreflightWarning[] = [];
  let correctedInput = { ...input };
  let blocked = false;

  // 1. 볼륨 내성 vs 빈도 충돌 검사
  const volumeFreqResult = checkVolumeFrequencyConflict(correctedInput);
  if (volumeFreqResult.corrected) {
    correctedInput = volumeFreqResult.corrected;
    warnings.push(...volumeFreqResult.warnings);
  }

  // 2. 부상 vs 운동별 빈도 충돌 검사  
  const injuryFreqResult = checkInjuryFrequencyConflict(correctedInput);
  if (injuryFreqResult.corrected) {
    correctedInput = injuryFreqResult.corrected;
    warnings.push(...injuryFreqResult.warnings);
  }

  // 3. 스트레스 vs 목표 충돌 검사
  const stressGoalResult = checkStressGoalConflict(correctedInput);
  if (stressGoalResult.corrected) {
    correctedInput = stressGoalResult.corrected;
    warnings.push(...stressGoalResult.warnings);
  }

  // 4. 경험 vs 계획 오버라이드 충돌 검사
  const experiencePlanningResult = checkExperiencePlanningConflict(correctedInput);
  if (experiencePlanningResult.corrected) {
    correctedInput = experiencePlanningResult.corrected;
    warnings.push(...experiencePlanningResult.warnings);
  }

  // 5. 치명적 차단 검사 (blocked=true 시 엔진 진입 금지)
  const blockingResult = checkBlockingConflicts(correctedInput);
  if (blockingResult.blocked) {
    blocked = true;
    warnings.push(...blockingResult.warnings);
  }

  return {
    input: correctedInput,
    warnings,
    blocked
  };
}

// 📊 1) 볼륨 내성 vs 빈도 충돌
function checkVolumeFrequencyConflict(input: CanonicalInput): { corrected?: CanonicalInput; warnings: PreflightWarning[] } {
  const warnings: PreflightWarning[] = [];
  
  // low tolerance + total_freq≥6 + sessionMin<60 → 4분로 다운스케일
  if (input.volumes?.tolerance === 'low' && input.frequency.total >= 6) {
    const originalFreq = input.frequency.total;
    const corrected = { 
      ...input, 
      frequency: { ...input.frequency, total: 4 }
    };
    
    warnings.push({
      type: 'warn',
      rule: 'volume_frequency_conflict',
      message: '낮은 볼륨 내성으로 인해 주당 빈도를 4회로 다운스케일했습니다.',
      original: { tolerance: 'low', frequency: originalFreq },
      corrected: { tolerance: 'low', frequency: 4 }
    });
    
    return { corrected, warnings };
  }
  
  return { warnings };
}

// 🏥 2) 부상 vs 운동별 빈도 충돌  
function checkInjuryFrequencyConflict(input: CanonicalInput): { corrected?: CanonicalInput; warnings: PreflightWarning[] } {
  const warnings: PreflightWarning[] = [];
  let corrected = { ...input };
  let hasCorrection = false;
  
  // shoulder pain + bench_freq≥5 → 최대 3으로 보정
  const shoulderPain = input.constraints?.some(c => c.includes('shoulder') || c.includes('어깨'));
  if (shoulderPain && input.frequency.bench && input.frequency.bench >= 5) {
    const originalBenchFreq = input.frequency.bench;
    corrected = {
      ...corrected,
      frequency: { ...corrected.frequency, bench: 3 }
    };
    hasCorrection = true;
    
    warnings.push({
      type: 'warn', 
      rule: 'shoulder_bench_frequency',
      message: '어깨 통증으로 인해 벤치프레스 빈도를 주 3회로 제한했습니다.',
      original: { constraints: shoulderPain, bench_frequency: originalBenchFreq },
      corrected: { constraints: shoulderPain, bench_frequency: 3 }
    });
  }
  
  // 무릎 통증 + 스쿼트 빈도 ≥4 → 최대 2로 보정
  const kneePain = input.constraints?.some(c => c.includes('knee') || c.includes('무릎'));
  if (kneePain && input.frequency.squat && input.frequency.squat >= 4) {
    const originalSquatFreq = input.frequency.squat;
    corrected = {
      ...corrected,
      frequency: { ...corrected.frequency, squat: 2 }
    };
    hasCorrection = true;
    
    warnings.push({
      type: 'warn',
      rule: 'knee_squat_frequency', 
      message: '무릎 통증으로 인해 스쿼트 빈도를 주 2회로 제한했습니다.',
      original: { constraints: kneePain, squat_frequency: originalSquatFreq },
      corrected: { constraints: kneePain, squat_frequency: 2 }
    });
  }
  
  return hasCorrection ? { corrected, warnings } : { warnings };
}

// 🧠 3) 스트레스 vs 목표 충돌
function checkStressGoalConflict(input: CanonicalInput): { corrected?: CanonicalInput; warnings: PreflightWarning[] } {
  const warnings: PreflightWarning[] = [];
  
  // stress=high + goal=peaking → peaking weekPct 금지/완화
  if (input.psychology?.stress === 'high' && input.goal === 'peaking') {
    const corrected = { 
      ...input, 
      goal: 'strength' as const,
      // planning의 mesoWeeks나 blocks도 조정할 수 있음
      planning: {
        ...input.planning,
        blocks: ['hypertrophy', 'strength', 'strength', 'taper']  // peaking 단계 제거
      }
    };
    
    warnings.push({
      type: 'warn',
      rule: 'stress_peaking_conflict',
      message: '높은 스트레스 상태에서 피킹은 위험합니다. 목표를 근력증가로 변경했습니다.',
      original: { stress: 'high', goal: 'peaking' },
      corrected: { stress: 'high', goal: 'strength' }
    });
    
    return { corrected, warnings };
  }
  
  return { warnings };
}

// 📚 4) 경험 vs 계획 오버라이드 충돌
function checkExperiencePlanningConflict(input: CanonicalInput): { corrected?: CanonicalInput; warnings: PreflightWarning[] } {
  const warnings: PreflightWarning[] = [];
  let corrected = { ...input };
  let hasCorrection = false;
  
  // 초급자 + 복잡한 dayOverrides → 단순화
  if (input.experience === 'beginner' && input.planning?.dayOverrides && input.planning.dayOverrides.length > 2) {
    const originalOverrides = input.planning.dayOverrides.length;
    corrected = {
      ...corrected,
      planning: {
        ...corrected.planning,
        dayOverrides: [] // 모든 개별 조정 제거
      }
    };
    hasCorrection = true;
    
    warnings.push({
      type: 'warn',
      rule: 'beginner_complex_planning',
      message: '초급자에게는 복잡한 개별 조정이 적합하지 않습니다. 기본 프로그램을 사용합니다.',
      original: { experience: 'beginner', dayOverrides_count: originalOverrides },
      corrected: { experience: 'beginner', dayOverrides_count: 0 }
    });
  }
  
  // 초급자 + 과도한 perLiftFrequency → 안전 범위로 조정
  if (input.experience === 'beginner' && input.planning?.perLiftFrequency) {
    const { SQ, BP, DL } = input.planning.perLiftFrequency;
    let needsCorrection = false;
    const safeLimits = { SQ: 3, BP: 3, DL: 2 }; // 초급자 안전 한계
    const adjustedFreq = { ...input.planning.perLiftFrequency };
    
    if (SQ && SQ > safeLimits.SQ) { adjustedFreq.SQ = safeLimits.SQ; needsCorrection = true; }
    if (BP && BP > safeLimits.BP) { adjustedFreq.BP = safeLimits.BP; needsCorrection = true; }
    if (DL && DL > safeLimits.DL) { adjustedFreq.DL = safeLimits.DL; needsCorrection = true; }
    
    if (needsCorrection) {
      corrected = {
        ...corrected,
        planning: {
          ...corrected.planning,
          perLiftFrequency: adjustedFreq
        }
      };
      hasCorrection = true;
      
      warnings.push({
        type: 'warn',
        rule: 'beginner_frequency_limits',
        message: '초급자의 안전을 위해 운동별 빈도를 조정했습니다.',
        original: { experience: 'beginner', frequencies: { SQ, BP, DL } },
        corrected: { experience: 'beginner', frequencies: adjustedFreq }
      });
    }
  }
  
  return hasCorrection ? { corrected, warnings } : { warnings };
}

// 🚫 5) 치명적 차단 검사
function checkBlockingConflicts(input: CanonicalInput): { blocked: boolean; warnings: PreflightWarning[] } {
  const warnings: PreflightWarning[] = [];
  let blocked = false;
  
  // 심각한 부상 + 고강도 목표 → 완전 차단
  const seriousInjury = input.constraints?.some(c => 
    c.includes('surgery') || c.includes('acute') || c.includes('수술') || c.includes('급성')
  );
  
  if (seriousInjury && (input.goal === 'peaking' || input.goal === 'strength')) {
    blocked = true;
    warnings.push({
      type: 'error',
      rule: 'serious_injury_blocking',
      message: '심각한 부상 상태에서는 고강도 훈련이 불가능합니다. 의료진과 상담 후 진행하세요.',
      original: { injury: seriousInjury, goal: input.goal },
      corrected: null
    });
  }
  
  // 나이 + 경험 불일치 심각한 경우 → 차단  
  if (input.profile.age && input.profile.age > 65 && input.experience === 'beginner' && input.frequency.total > 5) {
    blocked = true;
    warnings.push({
      type: 'error', 
      rule: 'age_experience_safety',
      message: '고령 초급자의 안전을 위해 전문가 상담이 필요합니다.',
      original: { age: input.profile.age, experience: input.experience, frequency: input.frequency.total },
      corrected: null
    });
  }
  
  return { blocked, warnings };
}

// 🔍 특정 룰 체크 유틸리티 
export function checkSpecificRule(input: CanonicalInput, ruleName: string): PreflightWarning[] {
  switch (ruleName) {
    case 'volume_frequency':
      return checkVolumeFrequencyConflict(input).warnings;
    case 'injury_frequency':
      return checkInjuryFrequencyConflict(input).warnings;
    case 'stress_goal':
      return checkStressGoalConflict(input).warnings;
    case 'experience_planning':
      return checkExperiencePlanningConflict(input).warnings;
    case 'blocking':
      return checkBlockingConflicts(input).warnings;
    default:
      return [];
  }
}

// 📋 사용 가능한 모든 룰 목록
export const AVAILABLE_RULES = [
  'volume_frequency_conflict',
  'shoulder_bench_frequency', 
  'knee_squat_frequency',
  'stress_peaking_conflict',
  'beginner_complex_planning',
  'beginner_frequency_limits',
  'serious_injury_blocking',
  'age_experience_safety'
] as const;