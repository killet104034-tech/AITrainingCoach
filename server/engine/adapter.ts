// 🔧 Engine Adapter: 기존 generateExpertProgram()을 감싸 **반드시** ProgramPlan을 리턴하는 어댑터

import { generateTrainingProgram } from '../services/programGenerator';
import type { CanonicalInput } from '../domain/canonical';
import type { ProgramPlan, Block, Intensity } from '../domain/types';

// 🎯 메인 어댑터 함수: CanonicalInput → ProgramPlan
export async function generateExpertProgram(input: CanonicalInput): Promise<ProgramPlan> {
  try {
    console.log('🔧 Engine Adapter 시작: CanonicalInput → ProgramPlan 변환');
    
    // 1. CanonicalInput을 기존 프로그램 생성기 형식으로 변환
    const legacyProgramData = convertToLegacyFormat(input);
    
    // 2. 기존 프로그램 생성기 호출
    const legacyProgram = await generateTrainingProgram(legacyProgramData);
    
    // 3. 기존 결과를 ProgramPlan으로 매핑
    const programPlan = mapToProgramPlan(legacyProgram, input);
    
    console.log('✅ Engine Adapter 완료: ProgramPlan 생성 성공');
    return programPlan;
    
  } catch (error) {
    console.log('❌ Engine Adapter 실패:', error);
    
    // 폴백: 기본 ProgramPlan 생성
    return createFallbackPlan(input);
  }
}

// 🔄 CanonicalInput → 기존 프로그램 생성기 형식 변환
function convertToLegacyFormat(input: CanonicalInput): any {
  return {
    experience: input.experience,
    squatMax: input.strength.SQ1RM?.toString() || '100',
    benchMax: input.strength.BP1RM?.toString() || '80', 
    deadliftMax: input.strength.DL1RM?.toString() || '120',
    goals: [input.goal],
    frequency: input.frequency.total.toString(),
    equipment: ['Full gym'], // 기본값
    injuries: input.constraints?.find(c => c.startsWith('injury:'))?.replace('injury:', '') || 'None',
    name: `${input.experience} 수준 사용자`
  };
}

// 📊 기존 프로그램 → ProgramPlan 매핑
function mapToProgramPlan(legacyProgram: any, input: CanonicalInput): ProgramPlan {
  const blocks: Block[] = [];
  let blockIndex = 0;
  
  // 기존 프로그램 구조에서 Block 배열 생성
  if (legacyProgram.training_weeks) {
    legacyProgram.training_weeks.forEach((week: any) => {
      week.workouts.forEach((workout: any) => {
        workout.exercises.forEach((exercise: any) => {
          // 운동 타입 매핑
          const lift = mapExerciseToLift(exercise.exercise);
          
          // 강도 매핑
          const intensity: Intensity = mapIntensity(exercise.weight_percent, exercise.rpe);
          
          const block: Block = {
            week: week.week,
            day: workout.day,
            lift,
            sets: parseInt(exercise.sets) || 3,
            reps: parseReps(exercise.reps),
            intensity,
            notes: exercise.notes
          };
          
          blocks.push(block);
          blockIndex++;
        });
      });
    });
  }
  
  return {
    meta: {
      mesoWeeks: input.planning?.mesoWeeks || calculateMesoWeeks(blocks),
      engineVersion: 'legacy-adapter-1.0',
      createdAt: new Date().toISOString()
    },
    blocks
  };
}

// 🏋️ 운동명 → 리프트 타입 매핑
function mapExerciseToLift(exerciseName: string): 'SQ' | 'BP' | 'DL' | 'ACC' {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('squat')) return 'SQ';
  if (name.includes('bench') || name.includes('press')) return 'BP';  
  if (name.includes('deadlift')) return 'DL';
  
  return 'ACC'; // 보조운동
}

// 💪 강도 매핑 (백분율 또는 RPE)
function mapIntensity(weightPercent: string, rpe: string): Intensity {
  // RPE가 있으면 RPE 사용
  if (rpe && rpe !== '-' && !isNaN(parseFloat(rpe))) {
    return {
      type: 'RPE',
      value: parseFloat(rpe)
    };
  }
  
  // 백분율이 있으면 %1RM 사용
  if (weightPercent && weightPercent.includes('%')) {
    const percent = parseFloat(weightPercent.replace('%', ''));
    return {
      type: '%1RM',
      value: percent
    };
  }
  
  // 기본값: 75%
  return {
    type: '%1RM',
    value: 75
  };
}

// 🔢 반복수 파싱
function parseReps(repsStr: string): number {
  if (!repsStr) return 5;
  
  // "8-10" 형태면 평균값
  if (repsStr.includes('-')) {
    const [min, max] = repsStr.split('-').map(n => parseInt(n));
    return Math.round((min + max) / 2);
  }
  
  return parseInt(repsStr) || 5;
}

// 📅 메조사이클 주수 계산
function calculateMesoWeeks(blocks: Block[]): number {
  if (blocks.length === 0) return 6;
  
  const maxWeek = Math.max(...blocks.map(b => b.week));
  
  // 일반적인 메조사이클 길이로 반올림
  if (maxWeek <= 4) return 4;
  if (maxWeek <= 6) return 6;
  if (maxWeek <= 8) return 8;
  if (maxWeek <= 12) return 12;
  
  return maxWeek;
}

// 🆘 폴백 ProgramPlan 생성
function createFallbackPlan(input: CanonicalInput): ProgramPlan {
  console.log('⚠️ 폴백 ProgramPlan 생성');
  
  const totalWeeks = input.planning?.mesoWeeks || 6;
  const daysPerWeek = input.frequency.total;
  const blocks: Block[] = [];
  
  // 기본 3대 운동 패턴 생성
  for (let week = 1; week <= totalWeeks; week++) {
    for (let day = 1; day <= daysPerWeek; day++) {
      // 요일별 운동 패턴
      const lifts: Array<'SQ' | 'BP' | 'DL'> = 
        day === 1 ? ['SQ', 'BP'] :
        day === 2 ? ['DL', 'BP'] :
        day === 3 ? ['SQ', 'BP'] :
        ['BP']; // 추가 날은 벤치 위주
      
      lifts.forEach(lift => {
        blocks.push({
          week,
          day,
          lift,
          sets: 4,
          reps: getBaseReps(input.goal),
          intensity: getBaseIntensity(input.goal, week, totalWeeks),
          notes: `${input.experience} 수준 기본 프로그램`
        });
      });
    }
  }
  
  return {
    meta: {
      mesoWeeks: totalWeeks,
      engineVersion: 'fallback-1.0',
      createdAt: new Date().toISOString()
    },
    blocks
  };
}

// 📋 목표별 기본 반복수
function getBaseReps(goal: string): number {
  switch (goal) {
    case 'strength': return 5;
    case 'hypertrophy': return 8;
    case 'peaking': return 3;
    default: return 6;
  }
}

// 💪 목표별 기본 강도
function getBaseIntensity(goal: string, week: number, totalWeeks: number): Intensity {
  const progress = week / totalWeeks;
  
  switch (goal) {
    case 'strength':
      return { type: '%1RM', value: 70 + (progress * 15) }; // 70-85%
    case 'hypertrophy': 
      return { type: '%1RM', value: 65 + (progress * 10) }; // 65-75%
    case 'peaking':
      return { type: '%1RM', value: 80 + (progress * 15) }; // 80-95%
    default:
      return { type: '%1RM', value: 70 + (progress * 10) }; // 70-80%
  }
}

// 🔮 나중에 구현할 planFromTables() 로 스위치할 예정
export async function planFromTables(input: CanonicalInput): Promise<ProgramPlan> {
  // TODO: 추후 구현 - 테이블 기반 프로그램 계획
  console.log('🔮 planFromTables() - 추후 구현 예정');
  return generateExpertProgram(input);
}