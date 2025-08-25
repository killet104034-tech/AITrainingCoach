// 🛡️ Preflight Guards - 3개 핵심 규칙 + warnings 기록

import { type CanonicalSurvey, type Warning, SAFETY_LIMITS } from '../domain/index';

export interface PreflightRule {
  name: string;
  description: string;
  check: (canonical: CanonicalSurvey) => boolean;
  correct: (canonical: CanonicalSurvey) => void;
  warningMessage: string;
}

// 🔒 3개 핵심 Preflight 규칙
export const PREFLIGHT_RULES: PreflightRule[] = [
  {
    name: 'frequency_safety_limit',
    description: '주간 훈련 빈도 안전 제한',
    check: (canonical) => canonical.frequency > SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY,
    correct: (canonical) => {
      canonical.frequency = SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY;
    },
    warningMessage: `주간 훈련 빈도가 안전 제한(${SAFETY_LIMITS.MAX_WEEKLY_FREQUENCY}일)으로 조정되었습니다`
  },
  
  {
    name: 'injury_frequency_adjustment',
    description: '부상 이력자 빈도 조정',
    check: (canonical) => canonical.injuries !== 'none' && canonical.frequency > 4,
    correct: (canonical) => {
      canonical.frequency = Math.min(canonical.frequency, 4);
    },
    warningMessage: '부상 이력으로 인해 주간 훈련 빈도가 4일로 제한되었습니다'
  },
  
  {
    name: 'beginner_intensity_protection',
    description: '초보자 고강도 보호',
    check: (canonical) => {
      return canonical.experience === 'beginner' && 
             canonical.intensityPreference === 'high';
    },
    correct: (canonical) => {
      canonical.intensityPreference = 'medium';
    },
    warningMessage: '초보자 안전을 위해 강도 선호도가 중간으로 조정되었습니다'
  }
];

// ⚡ Preflight 검사 실행
export function runPreflightChecks(canonical: CanonicalSurvey): Warning[] {
  const warnings: Warning[] = [];
  
  for (const rule of PREFLIGHT_RULES) {
    if (rule.check(canonical)) {
      const original = { ...canonical };
      
      rule.correct(canonical);
      
      warnings.push({
        type: 'automatic_correction',
        rule: rule.name,
        message: rule.warningMessage,
        original,
        corrected: { ...canonical }
      });
      
      console.log(`🛡️ Preflight: ${rule.name} - ${rule.warningMessage}`);
    }
  }
  
  return warnings;
}

// 📊 Preflight 통계
export function getPreflightStats(): {
  totalRules: number;
  activeRules: string[];
  description: string;
} {
  return {
    totalRules: PREFLIGHT_RULES.length,
    activeRules: PREFLIGHT_RULES.map(r => r.name),
    description: '안전 제한, 부상자 보호, 초보자 보호'
  };
}