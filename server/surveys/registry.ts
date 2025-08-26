// 📋 설문 레지스트리 - 하드 리셋 버전
// 기본 설문 처리만 남김

export interface BasicSurveyInput {
  name?: string;
  goals?: string[];
  email?: string;
}

export interface CanonicalSurvey {
  name: string;
  goals: string[];
  email: string;
}

export interface SurveyConflict {
  rule: string;
  message: string;
  original: any;
  corrected: any;
}

export function processSurvey(
  surveyKind: string, 
  input: BasicSurveyInput
): { 
  canonical: CanonicalSurvey; 
  conflicts: SurveyConflict[]; 
  warnings: SurveyConflict[]; 
} {
  // 🎯 간소화된 변환 (조건 매핑 제거)
  const canonical: CanonicalSurvey = {
    name: input.name || '',
    goals: input.goals || [],
    email: input.email || ''
  };

  // 모든 조건 매핑 로직 제거 - 사용자가 나중에 다시 훈련시킬 예정
  return {
    canonical,
    conflicts: [], // 복잡한 충돌 감지 로직 제거
    warnings: []   // 복잡한 경고 로직 제거
  };
}