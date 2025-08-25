// 📋 입력 표준
export type CanonicalInput = {
  profile: { sex?:'M'|'F'; age?:number; height?:number; weight?:number };
  strength: { SQ1RM?:number; BP1RM?:number; DL1RM?:number };
  goal: 'strength'|'hypertrophy'|'balanced'|'peaking';
  experience: 'beginner'|'intermediate'|'advanced'|'elite';
  frequency: { total:number; squat?:number; bench?:number; deadlift?:number };
  constraints?: string[];                    // 통증/장비/시간
  psychology?: { arousal:'low'|'moderate'|'high'; stress:'low'|'moderate'|'high' };
  volumes?: { tolerance:'low'|'typical'|'high' };

  // 설문이 요구하는 세부 오버라이드 (선택)
  planning?: {
    mesoWeeks?: number;                      // 3, 4, 6 …
    blocks?: string[];                       // ['hyper','strength','peaking','taper']
    perLiftFrequency?: { SQ?:number; BP?:number; DL?:number };
    dayTags?: Array<{week:number; day:number; tag:'recovery'|'technique'|'overload'}>;
    dayOverrides?: Array<{week:number; day:number; setsDelta?:number; pctDelta?:number; rpeCap?:number}>;
  };

  meta: { survey_kind:string; survey_version:string; raw_hash:string };
};

// Re-export program types
export type { Intensity, Block, ProgramPlan } from './types';

// 입력→계획 변환 함수 타입
export type PlanningEngine = (input: CanonicalInput) => Promise<ProgramPlan>;