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

// 📊 E1RM 시트에 1RM 값들 입력
async function updateMaxValues(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  console.log('📊 E1RM 시트에 1RM 값 입력 중...');
  
  const squatMax = programData.user_maxes.squat;
  const benchMax = programData.user_maxes.bench;
  const deadliftMax = programData.user_maxes.deadlift;
  
  // E1RM 시트의 첫 번째 주차(W1)에 초기 1RM 값들 입력
  const updates = [
    {
      range: 'E1RM!B2', // 스쿼트 1RM
      values: [[squatMax]]
    },
    {
      range: 'E1RM!C2', // 벤치 1RM  
      values: [[benchMax]]
    },
    {
      range: 'E1RM!D2', // 데드리프트 1RM
      values: [[deadliftMax]]
    },
    {
      range: 'E1RM!E2', // Total 자동 계산
      values: [[`=B2+C2+D2`]]
    }
  ];

  // 일괄 업데이트
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });
  
  console.log('✅ E1RM 시트 1RM 값 입력 완료');
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

  // 사용자 시트 구조에 맞춘 데이터 입력
  // W1 구역의 운동 데이터 입력 (대략 14행부터 시작)
  await populateWeekSection(spreadsheetId, 'W1', squatMax, benchMax, deadliftMax, 14, 1);
  
  // W2 구역의 운동 데이터 입력 (대략 35행부터 시작)  
  await populateWeekSection(spreadsheetId, 'W2', squatMax, benchMax, deadliftMax, 35, 2);
  
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
  
  // 주차별 강도 조정
  const baseIntensity = 0.75 + (weekNumber * 0.05);
  
  // 주차별 운동 데이터 생성
  const exerciseData = [
    // 스쿼트 운동들
    {
      exercise: 'Squat',
      targetWeight: Math.round(squatMax * baseIntensity),
      reps: '5',
      sets: '3', 
      rpe: '8.0',
      max: squatMax,
      type: 'squat'
    },
    {
      exercise: 'Pause Squat', 
      targetWeight: Math.round(squatMax * (baseIntensity - 0.1)),
      reps: '3',
      sets: '3',
      rpe: '8.5',
      max: squatMax,
      type: 'squat'
    },
    // 벤치프레스 운동들
    {
      exercise: 'Bench Press',
      targetWeight: Math.round(benchMax * baseIntensity),
      reps: '5', 
      sets: '3',
      rpe: '8.0',
      max: benchMax,
      type: 'bench'
    },
    {
      exercise: 'Close Grip Bench',
      targetWeight: Math.round(benchMax * (baseIntensity - 0.15)),
      reps: '6',
      sets: '3',
      rpe: '8.5', 
      max: benchMax,
      type: 'bench'
    },
    // 데드리프트 운동들
    {
      exercise: 'Deadlift',
      targetWeight: Math.round(deadliftMax * baseIntensity),
      reps: '5',
      sets: '2',
      rpe: '8.0',
      max: deadliftMax,
      type: 'deadlift'
    },
    {
      exercise: 'Romanian DL',
      targetWeight: Math.round(deadliftMax * (baseIntensity - 0.2)),
      reps: '8',
      sets: '3', 
      rpe: '8.5',
      max: deadliftMax,
      type: 'deadlift'
    }
  ];

  // 각 운동별로 행 데이터 생성 및 입력
  for (let i = 0; i < exerciseData.length; i++) {
    const exercise = exerciseData[i];
    const currentRow = startRow + i;
    
    // 최소/최대 중량 계산 (±10kg 정도)
    const minWeight = Math.max(exercise.targetWeight - 10, Math.round(exercise.max * 0.5));
    const maxWeight = exercise.targetWeight + 10;
    
    // 행 데이터: [운동명, 타겟중량, 타겟Reps, Set, 타겟RPE, 최소중량, 최대중량, 실제중량, 실제Reps, 실제RPE, 메모]
    const rowData = [
      exercise.exercise,           // A열: 운동명
      `${exercise.targetWeight}`,  // B열: 타겟중량  
      exercise.reps,               // C열: 타겟Reps
      exercise.sets,               // D열: Set
      exercise.rpe,                // E열: 타겟RPE
      `${minWeight}`,              // F열: 최소중량
      `${maxWeight}`,              // G열: 최대중량
      '',                          // H열: 실제중량 (빈칸)
      '',                          // I열: 실제Reps (빈칸)  
      '',                          // J열: 실제RPE (빈칸)
      ''                           // K열: 메모 (빈칸)
    ];
    
    // 시트에 데이터 입력
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Block!A${currentRow}:K${currentRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });
  }
  
  console.log(`✅ ${weekLabel} 구역 입력 완료`);
}

// ✅ E1RM 업데이트는 updateMaxValues에서 이미 처리됨