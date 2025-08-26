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
    // 1. Block 시트에 1RM 값들 입력
    await updateMaxValues(spreadsheetId, programData);
    
    // 2. Block 시트에 훈련 프로그램 데이터 입력
    await populateTrainingData(spreadsheetId, programData);
    
    // 3. E1RM 시트에 초기값 입력
    await updateE1RMSheet(spreadsheetId, programData);
    
    console.log('✅ 사용자 템플릿 데이터 입력 완료!');
    
  } catch (error) {
    console.error('❌ 사용자 템플릿 데이터 입력 실패:', error);
    throw error;
  }
}

// 📊 1RM 값들 입력
async function updateMaxValues(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  console.log('📊 1RM 값 입력 중...');
  
  const squatMax = programData.user_maxes.squat;
  const benchMax = programData.user_maxes.bench;
  const deadliftMax = programData.user_maxes.deadlift;
  
  // Block 시트의 기본 1RM 정보 업데이트
  const updates = [
    {
      range: 'Block!C2', // 스쿼트 1RM
      values: [[squatMax]]
    },
    {
      range: 'Block!C3', // 벤치 1RM  
      values: [[benchMax]]
    },
    {
      range: 'Block!C4', // 데드리프트 1RM
      values: [[deadliftMax]]
    },
    // 중량 계산기 부분의 최근 E1RM 값들
    {
      range: 'Block!C7', // 스쿼트 최근 E1RM
      values: [[squatMax]]
    },
    {
      range: 'Block!D7', // 벤치 최근 E1RM
      values: [[benchMax]]
    },
    {
      range: 'Block!D8', // 데드 최근 E1RM
      values: [[deadliftMax]]
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
  
  console.log('✅ 1RM 값 입력 완료');
}

// 🏋️ 훈련 프로그램 데이터 입력
async function populateTrainingData(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  console.log('🏋️ 훈련 프로그램 데이터 입력 중...');
  
  if (!programData.training_weeks || programData.training_weeks.length === 0) {
    console.log('⚠️ 훈련 주차 데이터가 없음');
    return;
  }

  const squatMax = parseInt(programData.user_maxes.squat);
  const benchMax = parseInt(programData.user_maxes.bench);
  const deadliftMax = parseInt(programData.user_maxes.deadlift);

  // Block 시트의 훈련 데이터 시작 행 (약 15행부터 시작)
  let currentRow = 15;
  
  // 처음 3주 데이터만 Block 시트에 입력 (기존 구조 유지)
  const weeksToProcess = Math.min(3, programData.training_weeks.length);
  
  for (let weekIndex = 0; weekIndex < weeksToProcess; weekIndex++) {
    const week = programData.training_weeks[weekIndex];
    
    // 주차별 운동 데이터 생성
    const weekData = generateWeekData(week, squatMax, benchMax, deadliftMax, weekIndex + 1);
    
    // 각 운동별로 데이터 입력
    for (const exerciseRow of weekData) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Block!A${currentRow}:Z${currentRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [exerciseRow]
        }
      });
      
      currentRow++;
    }
    
    // 주차 간 공백행
    currentRow++;
  }
  
  console.log('✅ 훈련 프로그램 데이터 입력 완료');
}

// 📈 주차별 운동 데이터 생성
function generateWeekData(
  week: any, 
  squatMax: number, 
  benchMax: number, 
  deadliftMax: number, 
  weekNumber: number
): string[][] {
  
  const weekData: string[][] = [];
  
  // 주차에 따른 강도 조정
  const intensityFactor = 0.75 + (weekNumber * 0.05); // 주차별 점진적 증가
  
  // 스쿼트 데이터
  const squatWeight = Math.round(squatMax * intensityFactor);
  weekData.push([
    'Comp Squat',
    `${squatWeight}kg`, '5', '3', '8',
    `${squatWeight - 10}kg`, `${squatWeight + 10}kg`,
    '', '', '', '', // 실제 기록 공간
    `${squatWeight + 5}kg`, '5', '3', '8',
    `${squatWeight - 5}kg`, `${squatWeight + 15}kg`,
    '', '', '', '', // 실제 기록 공간
    `${squatWeight + 10}kg`, '3', '4', '8.5'
  ]);

  // 벤치프레스 데이터
  const benchWeight = Math.round(benchMax * intensityFactor);
  weekData.push([
    'Comp Bench',
    `${benchWeight}kg`, '5', '3', '8',
    `${benchWeight - 5}kg`, `${benchWeight + 5}kg`,
    '', '', '', '', // 실제 기록 공간
    `${benchWeight + 2}kg`, '5', '3', '8',
    `${benchWeight - 3}kg`, `${benchWeight + 7}kg`,
    '', '', '', '', // 실제 기록 공간
    `${benchWeight + 5}kg`, '3', '4', '8.5'
  ]);

  // 데드리프트 데이터
  const deadWeight = Math.round(deadliftMax * intensityFactor);
  weekData.push([
    'Comp Deadlift',
    `${deadWeight}kg`, '5', '2', '8',
    `${deadWeight - 10}kg`, `${deadWeight + 10}kg`,
    '', '', '', '', // 실제 기록 공간
    `${deadWeight + 5}kg`, '5', '2', '8',
    `${deadWeight - 5}kg`, `${deadWeight + 15}kg`,
    '', '', '', '', // 실제 기록 공간
    `${deadWeight + 10}kg`, '3', '3', '8.5'
  ]);

  return weekData;
}

// 📈 E1RM 시트 업데이트
async function updateE1RMSheet(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  console.log('📈 E1RM 시트 업데이트 중...');
  
  // W1 행에 초기 1RM 값들 입력
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'E1RM!B2:E2',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        programData.user_maxes.squat,
        programData.user_maxes.bench,
        programData.user_maxes.deadlift,
        `=B2+C2+D2` // Total 자동 계산
      ]]
    }
  });
  
  console.log('✅ E1RM 시트 업데이트 완료');
}