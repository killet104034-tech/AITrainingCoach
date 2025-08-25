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
  try {
    console.log('📊 planFromTables() 시작: 규칙 테이블 기반 프로그램 생성');
    
    // 1. 메조사이클 길이에 따른 강도 패턴 로드
    const intensityPattern = await loadIntensityPattern(input);
    
    // 2. 블록 패턴 결정
    const blockPattern = determineBlockPattern(input);
    
    // 3. 운동별 빈도 적용
    const liftFrequencies = getLiftFrequencies(input);
    
    // 4. ProgramPlan 생성
    const programPlan = generateFromRules(input, intensityPattern, blockPattern, liftFrequencies);
    
    console.log('✅ planFromTables() 완료: 규칙 기반 ProgramPlan 생성');
    return programPlan;
    
  } catch (error) {
    console.log('❌ planFromTables() 실패, 폴백 사용:', error);
    return generateExpertProgram(input);
  }
}

// 📊 강도 패턴 로드 (config/rules/weeks.json에서)
async function loadIntensityPattern(input: CanonicalInput): Promise<number[]> {
  try {
    // 실제 파일 로드는 나중에 구현, 지금은 하드코딩
    const weeksRules = {
      "default": [0.68, 0.72, 0.76, 0.62],
      "meso3":   [0.70, 0.76, 0.62],
      "peaking": [0.72, 0.78, 0.84, 0.64]
    };
    
    // 설문에서 planning.mesoWeeks=3 이면 meso3 사용, 없으면 default
    if (input.planning?.mesoWeeks === 3) {
      return weeksRules.meso3;
    }
    
    if (input.goal === 'peaking') {
      return weeksRules.peaking;
    }
    
    return weeksRules.default;
    
  } catch (error) {
    console.log('⚠️ 강도 패턴 로드 실패, 기본값 사용');
    return [0.68, 0.72, 0.76, 0.62]; // 기본 4주 패턴
  }
}

// 🎯 블록 패턴 결정
function determineBlockPattern(input: CanonicalInput): string[] {
  // planning.blocks가 있으면 그것 사용
  if (input.planning?.blocks && input.planning.blocks.length > 0) {
    return input.planning.blocks;
  }
  
  // 목표에 따른 기본 블록 패턴
  switch (input.goal) {
    case 'hypertrophy':
      return ['hypertrophy', 'hypertrophy', 'strength', 'taper'];
    case 'strength':
      return ['hypertrophy', 'strength', 'strength', 'taper'];
    case 'peaking':
      return ['strength', 'peaking', 'peaking', 'taper'];
    default:
      return ['hypertrophy', 'strength', 'peaking', 'taper'];
  }
}

// 🏋️ 운동별 빈도 결정
function getLiftFrequencies(input: CanonicalInput): { SQ: number; BP: number; DL: number } {
  // planning.perLiftFrequency가 있으면 그것 사용
  if (input.planning?.perLiftFrequency) {
    return {
      SQ: input.planning.perLiftFrequency.SQ || Math.floor(input.frequency.total * 0.4),
      BP: input.planning.perLiftFrequency.BP || Math.floor(input.frequency.total * 0.5),
      DL: input.planning.perLiftFrequency.DL || Math.floor(input.frequency.total * 0.3)
    };
  }
  
  // 전체 빈도에서 비율로 계산
  const total = input.frequency.total;
  return {
    SQ: Math.floor(total * 0.4), // 40%
    BP: Math.floor(total * 0.5), // 50% (벤치가 가장 많음)
    DL: Math.floor(total * 0.3)  // 30%
  };
}

// 🔧 규칙 기반 ProgramPlan 생성
function generateFromRules(
  input: CanonicalInput, 
  intensityPattern: number[], 
  blockPattern: string[], 
  liftFrequencies: { SQ: number; BP: number; DL: number }
): ProgramPlan {
  const blocks: Block[] = [];
  const totalWeeks = intensityPattern.length;
  const daysPerWeek = input.frequency.total;
  
  for (let week = 1; week <= totalWeeks; week++) {
    const weekIntensity = intensityPattern[week - 1];
    const blockType = blockPattern[Math.min(week - 1, blockPattern.length - 1)];
    
    for (let day = 1; day <= daysPerWeek; day++) {
      // 해당 요일에 배치할 운동들 결정
      const liftsForDay = distributeLiftsByDay(day, daysPerWeek, liftFrequencies);
      
      liftsForDay.forEach(lift => {
        const block: Block = {
          week,
          day,
          lift,
          sets: getSetsByBlockType(blockType),
          reps: getRepsByBlockType(blockType),
          intensity: {
            type: '%1RM',
            value: weekIntensity * 100 // 0.68 → 68%
          },
          notes: `${blockType} 블록 - Week ${week}`
        };
        
        // dayTags 규칙 적용
        applyDayTags(block, input.planning?.dayTags);
        
        // dayOverrides 적용 (dayTags 이후에 적용)
        applyDayOverrides(block, input.planning?.dayOverrides);
        
        blocks.push(block);
      });
    }
  }
  
  return {
    meta: {
      mesoWeeks: totalWeeks,
      engineVersion: 'rules-based-1.0',
      createdAt: new Date().toISOString()
    },
    blocks
  };
}

// 📅 요일별 운동 배치
function distributeLiftsByDay(day: number, totalDays: number, frequencies: { SQ: number; BP: number; DL: number }): Array<'SQ' | 'BP' | 'DL'> {
  const lifts: Array<'SQ' | 'BP' | 'DL'> = [];
  
  // 간단한 라운드로빈 배치 (실제로는 더 정교한 로직 필요)
  if (day <= frequencies.SQ) lifts.push('SQ');
  if (day <= frequencies.BP) lifts.push('BP');
  if (day <= frequencies.DL) lifts.push('DL');
  
  // 최소한 하나는 있어야 함
  if (lifts.length === 0) lifts.push('BP');
  
  return lifts;
}

// 📊 블록 타입별 세트수
function getSetsByBlockType(blockType: string): number {
  switch (blockType) {
    case 'hypertrophy': return 4;
    case 'strength': return 5;
    case 'peaking': return 3;
    case 'taper': return 2;
    default: return 4;
  }
}

// 🔢 블록 타입별 반복수
function getRepsByBlockType(blockType: string): number {
  switch (blockType) {
    case 'hypertrophy': return 8;
    case 'strength': return 5;
    case 'peaking': return 3;
    case 'taper': return 5;
    default: return 6;
  }
}

// 🎯 dayTags 규칙 적용 (config/rules/dayTypes.json 기반)
function applyDayTags(block: Block, dayTags?: Array<{week:number; day:number; tag:'recovery'|'technique'|'overload'}>) {
  if (!dayTags) return;
  
  const dayTag = dayTags.find(t => t.week === block.week && t.day === block.day);
  if (!dayTag) return;
  
  // dayTypes 규칙 로드 (실제로는 파일에서 로드, 지금은 하드코딩)
  const dayTypesRules = {
    "recovery": { "setsDelta": -2, "pctDelta": -0.08, "rpeCap": 7.5 },
    "technique": { "pctDelta": -0.05, "rpeCap": 7.0 },
    "overload": { "pctDelta": +0.03, "rpeCap": 8.5, "setsDelta": +1 }
  };
  
  const rule = dayTypesRules[dayTag.tag];
  if (!rule) return;
  
  // 세트수 조정
  if (rule.setsDelta) {
    block.sets = Math.max(1, block.sets + rule.setsDelta);
  }
  
  // 강도 조정 (% 단위를 비율로 변환: -0.08 = -8%)
  if (rule.pctDelta && block.intensity.type === '%1RM') {
    const deltaPercent = rule.pctDelta * 100; // -0.08 → -8%
    block.intensity.value = Math.max(50, Math.min(100, block.intensity.value + deltaPercent));
  }
  
  // RPE 제한
  if (rule.rpeCap) {
    block.intensity = {
      type: 'RPE',
      value: rule.rpeCap
    };
  }
  
  // 태그 표시
  block.notes = `${block.notes} [${dayTag.tag}]`;
}

// ⚙️ dayOverrides 적용 (개별 날짜 미세 조정)
function applyDayOverrides(block: Block, overrides?: Array<{week:number; day:number; setsDelta?:number; pctDelta?:number; rpeCap?:number}>) {
  if (!overrides) return;
  
  const override = overrides.find(o => o.week === block.week && o.day === block.day);
  if (!override) return;
  
  // 세트수 조정
  if (override.setsDelta) {
    block.sets = Math.max(1, block.sets + override.setsDelta);
  }
  
  // 강도 조정
  if (override.pctDelta && block.intensity.type === '%1RM') {
    block.intensity.value = Math.max(50, Math.min(100, block.intensity.value + override.pctDelta));
  }
  
  // RPE 제한
  if (override.rpeCap) {
    block.intensity = {
      type: 'RPE',
      value: override.rpeCap
    };
  }
  
  if (override.setsDelta || override.pctDelta || override.rpeCap) {
    block.notes = `${block.notes} (조정됨)`;
  }
}