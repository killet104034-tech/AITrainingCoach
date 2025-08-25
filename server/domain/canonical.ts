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
    bench?: number 
  };
  constraints?: string[];   // 통증/장비/시간
  psychology?: { 
    arousal: 'low' | 'moderate' | 'high'; 
    stress: 'low' | 'moderate' | 'high' 
  };
  volumes?: { 
    tolerance: 'low' | 'typical' | 'high' 
  };
  meta: { 
    survey_kind: SurveyKind; 
    survey_version: string 
  };
};

// Re-export program types
export type { Intensity, Block, ProgramPlan } from './program';

// 입력→계획 변환 함수 타입
export type PlanningEngine = (input: CanonicalInput) => ProgramPlan;