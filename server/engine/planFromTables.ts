// 🔥 기본 엔진 - 하드 리셋 버전
// 파워리프팅 특화 로직 제거됨

import type { CanonicalSurvey } from '../surveys/registry';

export interface BasicPlan {
  weeks: number;
  sessionsPerWeek: number;
  focus: string;
}

export function createSimpleEngine() {
  return {
    planFromTables: async (canonical: CanonicalSurvey): Promise<BasicPlan> => {
      // 기본 계획 생성 (복잡한 파워리프팅 로직 제거됨)
      return {
        weeks: 12,
        sessionsPerWeek: canonical.frequency,
        focus: canonical.goals[0] || 'strength'
      };
    }
  };
}