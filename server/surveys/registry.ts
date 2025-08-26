// 📋 설문 레지스트리 - 하드 리셋 버전
// 기본 설문 처리만 남김

export interface BasicSurveyInput {
  name?: string;
  email?: string;
}

export interface CanonicalSurvey {
  name: string;
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
  // 🎯 최소 변환 로직 (디자인용)
  const canonical: CanonicalSurvey = {
    name: input.name || '',
    email: input.email || ''
  };

  return {
    canonical,
    conflicts: [],
    warnings: []
  };
}