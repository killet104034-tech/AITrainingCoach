// 📊 Plan: 볼륨·빈도·강도 수치화
import type { UserProfile } from './ingest';

export interface ProgramPlan {
  volume: VolumeMetrics;
  frequency: FrequencyMetrics;
  intensity: IntensityMetrics;
  periodization: PeriodizationPlan;
  modifications: ModificationPlan[];
}

export interface VolumeMetrics {
  totalSets: number;
  setsPerLift: {
    squat: number;
    bench: number;
    deadlift: number;
  };
  weeklyVolume: number;
  volumeProgression: number[];
}

export interface FrequencyMetrics {
  sessionsPerWeek: number;
  liftFrequency: {
    squat: number;
    bench: number;
    deadlift: number;
  };
  dayStructure: string[];
}

export interface IntensityMetrics {
  averageIntensity: number;
  intensityRanges: {
    light: number;    // 60-75%
    moderate: number; // 75-85%
    heavy: number;    // 85-95%
    maximal: number;  // 95%+
  };
  rpeTargets: number[];
}

export interface PeriodizationPlan {
  totalWeeks: number;
  blocks: {
    name: string;
    weeks: number;
    focus: string;
    characteristics: string;
  }[];
  peakingStrategy: string;
}

export interface ModificationPlan {
  reason: string;
  modification: string;
  impact: string;
}

// 📈 프로그램 계획 수치화
export async function createProgramPlan(userProfile: UserProfile): Promise<ProgramPlan> {
  console.log('📊 Plan 단계 시작: 볼륨·빈도·강도 수치화...');
  
  try {
    // 1. 볼륨 계산
    const volume = calculateVolume(userProfile);
    
    // 2. 빈도 계산
    const frequency = calculateFrequency(userProfile);
    
    // 3. 강도 계산
    const intensity = calculateIntensity(userProfile);
    
    // 4. 피리어다이제이션 계획
    const periodization = createPeriodization(userProfile);
    
    // 5. 수정사항 계획
    const modifications = planModifications(userProfile);
    
    console.log('✅ Plan 완료: 수치화된 프로그램 계획 생성');
    
    return {
      volume,
      frequency,
      intensity,
      periodization,
      modifications
    };
    
  } catch (error) {
    console.log('❌ Plan 실패:', error);
    throw error;
  }
}

// 📊 볼륨 계산
function calculateVolume(profile: UserProfile): VolumeMetrics {
  const { experience, constraints, goals } = profile;
  
  // 경험 수준별 기본 볼륨
  let baseVolume = 0;
  switch (experience.level) {
    case 'Beginner': baseVolume = 12; break;
    case 'Intermediate': baseVolume = 16; break;
    case 'Advanced': baseVolume = 20; break;
    case 'Elite': baseVolume = 24; break;
    default: baseVolume = 16;
  }
  
  // 훈련 일수에 따른 조정
  const dayMultiplier = constraints.daysPerWeek / 3;
  const adjustedVolume = Math.round(baseVolume * dayMultiplier);
  
  // 리프트별 배분 (스쿼트 35%, 벤치 30%, 데드리프트 25%, 보조운동 10%)
  const squatSets = Math.round(adjustedVolume * 0.35);
  const benchSets = Math.round(adjustedVolume * 0.30);
  const deadliftSets = Math.round(adjustedVolume * 0.25);
  
  // 주차별 볼륨 진행
  const progression = generateVolumeProgression(adjustedVolume);
  
  return {
    totalSets: adjustedVolume,
    setsPerLift: {
      squat: squatSets,
      bench: benchSets,
      deadlift: deadliftSets
    },
    weeklyVolume: adjustedVolume,
    volumeProgression: progression
  };
}

// 🔄 빈도 계산
function calculateFrequency(profile: UserProfile): FrequencyMetrics {
  const { constraints, experience } = profile;
  const daysPerWeek = constraints.daysPerWeek;
  
  let squatFreq = 0, benchFreq = 0, deadliftFreq = 0;
  let dayStructure: string[] = [];
  
  switch (daysPerWeek) {
    case 2:
      squatFreq = 1; benchFreq = 1; deadliftFreq = 1;
      dayStructure = ['Upper/Lower', 'Upper/Lower'];
      break;
    case 3:
      squatFreq = 2; benchFreq = 2; deadliftFreq = 1;
      dayStructure = ['Push', 'Pull', 'Legs'];
      break;
    case 4:
      squatFreq = 2; benchFreq = 2; deadliftFreq = 2;
      dayStructure = ['Upper', 'Lower', 'Push', 'Pull'];
      break;
    case 5:
      squatFreq = 2; benchFreq = 3; deadliftFreq = 2;
      dayStructure = ['Push', 'Pull', 'Legs', 'Push', 'Pull'];
      break;
    default:
      squatFreq = 2; benchFreq = 2; deadliftFreq = 1;
      dayStructure = ['Full Body', 'Full Body', 'Full Body'];
  }
  
  return {
    sessionsPerWeek: daysPerWeek,
    liftFrequency: {
      squat: squatFreq,
      bench: benchFreq,
      deadlift: deadliftFreq
    },
    dayStructure
  };
}

// 💪 강도 계산
function calculateIntensity(profile: UserProfile): IntensityMetrics {
  const { experience, goals } = profile;
  
  // 경험 수준별 강도 분배
  let intensityRanges = {
    light: 40,    // 60-75%
    moderate: 40, // 75-85% 
    heavy: 15,    // 85-95%
    maximal: 5    // 95%+
  };
  
  if (experience.level === 'Beginner') {
    intensityRanges = { light: 60, moderate: 30, heavy: 10, maximal: 0 };
  } else if (experience.level === 'Advanced' || experience.level === 'Elite') {
    intensityRanges = { light: 30, moderate: 40, heavy: 20, maximal: 10 };
  }
  
  // 목표에 따른 강도 조정
  if (goals.primary === 'Powerlifting Competition') {
    intensityRanges.heavy += 10;
    intensityRanges.maximal += 5;
    intensityRanges.light -= 15;
  }
  
  const averageIntensity = 
    (65 * intensityRanges.light + 80 * intensityRanges.moderate + 
     90 * intensityRanges.heavy + 97 * intensityRanges.maximal) / 100;
  
  // RPE 타겟 생성 (6-10 범위)
  const rpeTargets = generateRpeTargets(experience.level);
  
  return {
    averageIntensity,
    intensityRanges,
    rpeTargets
  };
}

// 📅 피리어다이제이션 계획
function createPeriodization(profile: UserProfile): PeriodizationPlan {
  const { goals } = profile;
  
  // 기본 18주 피리어다이제이션
  const blocks = [
    {
      name: 'Block 1 - Hypertrophy/Base',
      weeks: 6,
      focus: 'Volume & Technique',
      characteristics: 'High volume, moderate intensity, skill development'
    },
    {
      name: 'Block 2 - Strength',
      weeks: 6,
      focus: 'Strength Building',
      characteristics: 'Moderate volume, high intensity, strength focus'
    },
    {
      name: 'Block 3 - Peaking',
      weeks: 6,
      focus: 'Peak Strength',
      characteristics: 'Low volume, very high intensity, competition prep'
    }
  ];
  
  const peakingStrategy = goals.primary === 'Powerlifting Competition' 
    ? 'Competition-focused peaking with opener, second, third attempts'
    : 'General strength peaking with new 1RM attempts';
  
  return {
    totalWeeks: 18,
    blocks,
    peakingStrategy
  };
}

// 🔧 수정사항 계획
function planModifications(profile: UserProfile): ModificationPlan[] {
  const modifications: ModificationPlan[] = [];
  
  // 부상 이력에 따른 수정
  if (profile.constraints.injuryHistory !== 'None') {
    modifications.push({
      reason: `부상 이력: ${profile.constraints.injuryHistory}`,
      modification: '초기 볼륨 20% 감소, 점진적 증가',
      impact: '안전한 프로그램 진행을 위한 보수적 접근'
    });
  }
  
  // 나이에 따른 수정
  if (profile.demographics.age > 50) {
    modifications.push({
      reason: '50세 이상 연령대',
      modification: '회복시간 연장, 강도 조절',
      impact: '관절 건강과 회복을 고려한 프로그램 조정'
    });
  }
  
  // 시간 제약에 따른 수정
  if (profile.constraints.timeAvailable < 60) {
    modifications.push({
      reason: '제한된 운동 시간',
      modification: '복합운동 중심, 보조운동 최소화',
      impact: '효율적인 시간 활용을 위한 운동 선별'
    });
  }
  
  return modifications;
}

// 🔢 보조 함수들
function generateVolumeProgression(baseVolume: number): number[] {
  const weeks = 18;
  const progression: number[] = [];
  
  for (let week = 1; week <= weeks; week++) {
    const blockPhase = Math.floor((week - 1) / 6);
    let multiplier = 1.0;
    
    switch (blockPhase) {
      case 0: // Block 1 - 볼륨 증가
        multiplier = 0.8 + (week * 0.05);
        break;
      case 1: // Block 2 - 안정적 볼륨
        multiplier = 1.0;
        break;
      case 2: // Block 3 - 볼륨 감소 (피킹)
        multiplier = 1.1 - ((week - 12) * 0.05);
        break;
    }
    
    progression.push(Math.round(baseVolume * multiplier));
  }
  
  return progression;
}

function generateRpeTargets(level: string): number[] {
  switch (level) {
    case 'Beginner':
      return [6, 6.5, 7, 7, 7.5, 7.5];
    case 'Intermediate':
      return [7, 7.5, 8, 8, 8.5, 8];
    case 'Advanced':
      return [8, 8.5, 9, 8.5, 9, 9.5];
    case 'Elite':
      return [8.5, 9, 9.5, 9, 9.5, 10];
    default:
      return [7, 7.5, 8, 8, 8.5, 8];
  }
}