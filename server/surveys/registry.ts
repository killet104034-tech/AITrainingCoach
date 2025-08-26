// 📋 설문 레지스트리 - 하드 리셋 버전
// 기본 설문 처리만 남김

export interface BasicSurveyInput {
  experience?: string;
  squatMax?: string;
  benchMax?: string;
  deadliftMax?: string;
  goals?: string[];
  frequency?: string;
  equipment?: string[];
  injuries?: string;
  injuryDetails?: string;
  name?: string;
  email?: string;
}

export interface CanonicalSurvey {
  experience: string;
  squatMax: number;
  benchMax: number;
  deadliftMax: number;
  goals: string[];
  frequency: number;
  equipment: string[];
  injuries: string;
  injuryDetails: string;
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
  // 기본 변환 로직 (파워리프팅 특화 로직 제거됨)
  const canonical: CanonicalSurvey = {
    experience: input.experience || 'beginner',
    squatMax: parseInt(input.squatMax || '100'),
    benchMax: parseInt(input.benchMax || '80'),
    deadliftMax: parseInt(input.deadliftMax || '120'),
    goals: input.goals || ['strength'],
    frequency: parseInt(input.frequency || '3'),
    equipment: input.equipment || ['barbell'],
    injuries: input.injuries || 'none',
    injuryDetails: input.injuryDetails || '',
    name: input.name || '',
    email: input.email || ''
  };

  return {
    canonical,
    conflicts: [],
    warnings: []
  };
}