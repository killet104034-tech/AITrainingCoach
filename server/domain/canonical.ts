// 📋 Canonical 모델 (전체 단일 입력)
import type { SurveyKind } from '../surveys/registry';
import type { ProgramPlan } from './program';

export type CanonicalInput = {
  profile: { 
    sex?: 'M' | 'F'; 
    age?: number; 
    height?: number; 
    weight?: number 
  };
  strength: { 
    SQ1RM?: number; 
    BP1RM?: number; 
    DL1RM?: number 
  };
  goal: 'strength' | 'hypertrophy' | 'balanced' | 'peaking';
  experience: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  frequency: { 
    total: number; 
    bench?: number; 
    squat?: number; 
    deadlift?: number 
  };
  constraints?: string[];
  psychology?: { 
    arousal: 'low' | 'moderate' | 'high'; 
    stress: 'low' | 'moderate' | 'high' 
  };
  volumes?: { 
    tolerance: 'low' | 'typical' | 'high' 
  };
  planning?: {
    mesoWeeks?: number;                    // 3주, 4주, 6주 등
    blocks?: string[];                     // ['hypertrophy','strength','peaking','taper'] 등
    perliftFrequency?: { 
      SQ?: number; 
      BP?: number; 
      DL?: number 
    };                                     // 벤치 6회 같은 것
    dayTags?: Array<{ 
      week: number; 
      day: number; 
      tag: 'recovery' | 'technique' | 'overload' 
    }>;
    dayOverrides?: Array<{ 
      week: number; 
      day: number; 
      setsDelta?: number; 
      pctDelta?: number; 
      rpeCap?: number 
    }>;
  };
  meta: { 
    survey_kind: string; 
    survey_version: string 
  };
};

// Re-export program types
export type { Intensity, Block, ProgramPlan } from './program';

// 입력→계획 변환 함수 타입
export type PlanningEngine = (input: CanonicalInput) => ProgramPlan;