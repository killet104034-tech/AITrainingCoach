// 📋 Program 모델 (시트 작성 계획)

export type Intensity = { 
  type: '%1RM' | 'RPE' | 'load'; 
  value: number 
};

export type Block = { 
  week: number; 
  day: number; 
  lift: 'SQ' | 'BP' | 'DL' | 'ACC'; 
  sets: number; 
  reps: number; 
  intensity: Intensity; 
  notes?: string 
};

export type ProgramPlan = { 
  meta: { 
    mesoWeeks: number; 
    engineVersion: string; 
    createdAt: string 
  }; 
  blocks: Block[] 
};