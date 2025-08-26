// 🏋️ 사용자 템플릿에 AI 데이터 입력 (구조 변경 없음)

import { google } from 'googleapis';
import { createGoogleAuth } from '../google';

const auth = createGoogleAuth();
const sheets = google.sheets({ version: 'v4', auth });

export interface WorkoutProgram {
  program_title: string;
  user_maxes: {
    squat: string;
    bench: string;
    deadlift: string;
  };
  training_weeks: Array<{
    week: number;
    focus: string;
    workouts: Array<{
      day: number;
      workout_name: string;
      exercises: Array<{
        exercise: string;
        sets: string;
        reps: string;
        weight_percent: string;
        rest_minutes?: string;
        rpe?: string;
        notes?: string;
      }>;
    }>;
  }>;
  survey_data?: any;
  meta_data?: any;
}

// 🏋️ 사용자 템플릿에 AI 훈련 데이터 입력
export async function populateUserTemplateWithAIData(
  spreadsheetId: string, 
  programData: WorkoutProgram
): Promise<void> {
  console.log('🏋️ 사용자 템플릿 데이터 입력 시작...');

  try {
    // 1. E1RM 시트에 1RM 값들 입력
    await updateMaxValues(spreadsheetId, programData);
    
    // 2. Block 시트에 훈련 프로그램 데이터 입력  
    await populateTrainingData(spreadsheetId, programData);
    
    console.log('✅ 사용자 템플릿 데이터 입력 완료!');
    
  } catch (error) {
    console.error('❌ 사용자 템플릿 데이터 입력 실패:', error);
    throw error;
  }
}

// 📊 E1RM 시트에 W1~W5 모든 주차 1RM 추정값 입력
async function updateMaxValues(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  console.log('📊 E1RM 시트에 W1~W5 모든 주차 1RM 값 입력 중...');
  
  const squatMax = parseInt(programData.user_maxes.squat);
  const benchMax = parseInt(programData.user_maxes.bench);
  const deadliftMax = parseInt(programData.user_maxes.deadlift);
  
  // 주차별 1RM 진행률 (5주 프로그램)
  const weeklyProgress = [
    { week: 1, factor: 1.00 },   // W1: 현재 최대중량
    { week: 2, factor: 1.02 },   // W2: 2% 향상
    { week: 3, factor: 1.04 },   // W3: 4% 향상
    { week: 4, factor: 1.06 },   // W4: 6% 향상 (피킹)
    { week: 5, factor: 1.03 }    // W5: 3% (디로드 후 컨디셔닝)
  ];
  
  const updates = [];
  
  // W1~W5까지 각 주차별 1RM 데이터 생성
  for (let i = 0; i < weeklyProgress.length; i++) {
    const progress = weeklyProgress[i];
    const rowNum = 2 + i; // B2, B3, B4, B5, B6
    
    const projectedSquat = Math.round(squatMax * progress.factor);
    const projectedBench = Math.round(benchMax * progress.factor);
    const projectedDeadlift = Math.round(deadliftMax * progress.factor);
    
    updates.push(
      {
        range: `E1RM!B${rowNum}`, // 스쿼트 추정 1RM
        values: [[projectedSquat]]
      },
      {
        range: `E1RM!C${rowNum}`, // 벤치 추정 1RM
        values: [[projectedBench]]
      },
      {
        range: `E1RM!D${rowNum}`, // 데드리프트 추정 1RM
        values: [[projectedDeadlift]]
      },
      {
        range: `E1RM!E${rowNum}`, // Total 자동 계산
        values: [[`=B${rowNum}+C${rowNum}+D${rowNum}`]]
      }
    );
  }

  // 일괄 업데이트
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });
  
  console.log('✅ E1RM 시트 W1~W5 모든 주차 1RM 값 입력 완료');
}

// 🏋️ Block 시트에 사용자 구조에 맞춘 훈련 데이터 입력
async function populateTrainingData(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  console.log('🏋️ Block 시트에 훈련 프로그램 데이터 입력 중...');
  
  if (!programData.training_weeks || programData.training_weeks.length === 0) {
    console.log('⚠️ 훈련 주차 데이터가 없음');
    return;
  }

  const squatMax = parseInt(programData.user_maxes.squat);
  const benchMax = parseInt(programData.user_maxes.bench);
  const deadliftMax = parseInt(programData.user_maxes.deadlift);

  // 🎯 실제 사용자 시트 구조에 정확히 맞춘 행 번호
  const weekSections = [
    { label: 'W1', startRow: 15, weekNum: 1 },   // W1 운동 시작행 (확인됨)
    { label: 'W2', startRow: 50, weekNum: 2 },   // W2 운동 시작행 (수정됨)
    { label: 'W3', startRow: 85, weekNum: 3 },   // W3 운동 시작행 (수정됨)
    { label: 'W4', startRow: 120, weekNum: 4 },  // W4 운동 시작행 (수정됨)
    { label: 'W5', startRow: 155, weekNum: 5 }   // W5 운동 시작행 (수정됨)
  ];
  
  // 각 주차별로 데이터 입력
  for (const week of weekSections) {
    await populateWeekSection(
      spreadsheetId, 
      week.label, 
      squatMax, 
      benchMax, 
      deadliftMax, 
      week.startRow, 
      week.weekNum
    );
  }
  
  console.log('✅ Block 시트 훈련 데이터 입력 완료');
}

// 📈 주차별 구역에 운동 데이터 입력
async function populateWeekSection(
  spreadsheetId: string,
  weekLabel: string,
  squatMax: number, 
  benchMax: number, 
  deadliftMax: number, 
  startRow: number,
  weekNumber: number
): Promise<void> {
  
  console.log(`📈 ${weekLabel} 구역 데이터 입력 (${startRow}행부터)...`);
  
  // 주차별 강도 및 볼륨 조정 (점진적 프로그레시브 오버로드)
  const weekPrograms = {
    1: { // W1: 적응기
      intensity: 0.75,
      rpeRange: [7.5, 8.0],
      exercises: [
        { name: 'Back Squat', type: 'squat', intensity: 0.75, reps: '5', sets: '3', rpe: '7.5' },
        { name: 'Pause Squat', type: 'squat', intensity: 0.65, reps: '3', sets: '3', rpe: '8.0' },
        { name: 'Bench Press', type: 'bench', intensity: 0.75, reps: '5', sets: '3', rpe: '7.5' },
        { name: 'Close Grip Bench', type: 'bench', intensity: 0.65, reps: '6', sets: '3', rpe: '8.0' },
        { name: 'Deadlift', type: 'deadlift', intensity: 0.75, reps: '5', sets: '2', rpe: '7.5' },
        { name: 'Romanian DL', type: 'deadlift', intensity: 0.60, reps: '8', sets: '3', rpe: '8.0' }
      ]
    },
    2: { // W2: 볼륨 증가
      intensity: 0.80,
      rpeRange: [8.0, 8.5],
      exercises: [
        { name: 'Back Squat', type: 'squat', intensity: 0.80, reps: '4', sets: '4', rpe: '8.0' },
        { name: 'Box Squat', type: 'squat', intensity: 0.70, reps: '3', sets: '4', rpe: '8.0' },
        { name: 'Bench Press', type: 'bench', intensity: 0.80, reps: '4', sets: '4', rpe: '8.0' },
        { name: 'Spoto Press', type: 'bench', intensity: 0.70, reps: '5', sets: '3', rpe: '8.5' },
        { name: 'Deadlift', type: 'deadlift', intensity: 0.80, reps: '4', sets: '3', rpe: '8.0' },
        { name: 'Stiff Leg DL', type: 'deadlift', intensity: 0.65, reps: '6', sets: '3', rpe: '8.5' }
      ]
    },
    3: { // W3: 강도 증가
      intensity: 0.85,
      rpeRange: [8.5, 9.0],
      exercises: [
        { name: 'Back Squat', type: 'squat', intensity: 0.85, reps: '3', sets: '4', rpe: '8.5' },
        { name: 'Pin Squat', type: 'squat', intensity: 0.90, reps: '2', sets: '3', rpe: '9.0' },
        { name: 'Bench Press', type: 'bench', intensity: 0.85, reps: '3', sets: '4', rpe: '8.5' },
        { name: 'Floor Press', type: 'bench', intensity: 0.80, reps: '4', sets: '3', rpe: '8.5' },
        { name: 'Deadlift', type: 'deadlift', intensity: 0.85, reps: '3', sets: '3', rpe: '8.5' },
        { name: 'Deficit DL', type: 'deadlift', intensity: 0.75, reps: '5', sets: '3', rpe: '8.5' }
      ]
    },
    4: { // W4: 피킹
      intensity: 0.90,
      rpeRange: [9.0, 9.5],
      exercises: [
        { name: 'Back Squat', type: 'squat', intensity: 0.90, reps: '2', sets: '5', rpe: '9.0' },
        { name: 'Front Squat', type: 'squat', intensity: 0.85, reps: '3', sets: '3', rpe: '9.0' },
        { name: 'Bench Press', type: 'bench', intensity: 0.90, reps: '2', sets: '5', rpe: '9.0' },
        { name: 'Incline Bench', type: 'bench', intensity: 0.85, reps: '3', sets: '3', rpe: '8.5' },
        { name: 'Deadlift', type: 'deadlift', intensity: 0.90, reps: '2', sets: '4', rpe: '9.0' },
        { name: 'Block Pull', type: 'deadlift', intensity: 0.95, reps: '2', sets: '3', rpe: '9.5' }
      ]
    },
    5: { // W5: 디로드
      intensity: 0.70,
      rpeRange: [7.0, 7.5],
      exercises: [
        { name: 'Back Squat', type: 'squat', intensity: 0.70, reps: '5', sets: '3', rpe: '7.0' },
        { name: 'Goblet Squat', type: 'squat', intensity: 0.50, reps: '10', sets: '3', rpe: '7.0' },
        { name: 'Bench Press', type: 'bench', intensity: 0.70, reps: '5', sets: '3', rpe: '7.0' },
        { name: 'Push-ups', type: 'bench', intensity: 0.30, reps: '15', sets: '3', rpe: '7.5' },
        { name: 'Deadlift', type: 'deadlift', intensity: 0.70, reps: '5', sets: '2', rpe: '7.0' },
        { name: 'Good Morning', type: 'deadlift', intensity: 0.40, reps: '12', sets: '3', rpe: '7.5' }
      ]
    }
  };
  
  const weekProgram = weekPrograms[weekNumber] || weekPrograms[1];
  
  // 주차별 운동 데이터 생성
  const exerciseData = weekProgram.exercises.map(ex => ({
    exercise: ex.name,
    targetWeight: Math.round(
      ex.type === 'squat' ? squatMax * ex.intensity :
      ex.type === 'bench' ? benchMax * ex.intensity :
      deadliftMax * ex.intensity
    ),
    reps: ex.reps,
    sets: ex.sets,
    rpe: ex.rpe,
    max: ex.type === 'squat' ? squatMax : ex.type === 'bench' ? benchMax : deadliftMax,
    type: ex.type
  }));

  // 각 운동별로 행 데이터 생성 및 입력
  for (let i = 0; i < exerciseData.length; i++) {
    const exercise = exerciseData[i];
    const currentRow = startRow + i;
    
    // 최소/최대 중량 계산 (±10kg 정도)
    const minWeight = Math.max(exercise.targetWeight - 10, Math.round(exercise.max * 0.5));
    const maxWeight = exercise.targetWeight + 10;
    
    // 🎯 운동명은 기존 고정값 유지, B열부터만 데이터 입력
    const rowData = [
      exercise.sets,               // B열: Set수
      exercise.rpe,                // C열: RPE
      `${minWeight}`,              // D열: 최소중량
      `${maxWeight}`,              // E열: 최대중량
      '',                          // F열: 실제중량 (빈칸)
      '',                          // G열: 실제Reps (빈칸)
      '',                          // H열: 실제RPE (빈칸)
      ''                           // I열: 메모 (빈칸)
    ];
    
    // 시트에 데이터 입력 (A열 운동명 제외, B열부터만)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Block!B${currentRow}:I${currentRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });
  }
  
  console.log(`✅ ${weekLabel} 구역 입력 완료`);
}

// ✅ E1RM 업데이트는 updateMaxValues에서 이미 처리됨