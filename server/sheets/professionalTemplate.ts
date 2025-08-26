// 🏋️ 시나브로 전문 파워리프팅 템플릿 (사용자 시트 기반)

import { google } from 'googleapis';
import { createGoogleAuth } from '../google';

const auth = createGoogleAuth();
const sheets = google.sheets({ version: 'v4', auth });

export interface ProfessionalWorkoutProgram {
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

export async function createProfessionalPowerliftingTemplate(
  spreadsheetId: string, 
  programData: ProfessionalWorkoutProgram
): Promise<void> {
  console.log('🏋️ 시나브로 전문 파워리프팅 템플릿 생성 시작...');

  try {
    // 1. 기존 시트 삭제 및 새 시트 생성
    await createProfessionalSheets(spreadsheetId);
    
    // 2. Block 시트 구성 (메인 훈련표)
    await createBlockSheet(spreadsheetId, programData);
    
    // 3. E1RM 추적 시트
    await createE1RMSheet(spreadsheetId, programData);
    
    // 4. RPE Table 참조 시트
    await createRPETableSheet(spreadsheetId);
    
    // 5. 전문적인 포맷팅 적용
    await applyProfessionalFormatting(spreadsheetId);
    
    console.log('✅ 시나브로 전문 템플릿 생성 완료!');
    
  } catch (error) {
    console.error('❌ 전문 템플릿 생성 실패:', error);
    throw error;
  }
}

// 🏗️ 전문 시트 구조 생성
async function createProfessionalSheets(spreadsheetId: string): Promise<void> {
  const requests = [
    // 기존 Sheet1 삭제
    {
      deleteSheet: {
        sheetId: 0
      }
    },
    // Block 시트 (메인 훈련표)
    {
      addSheet: {
        properties: {
          title: 'Block',
          sheetId: 100,
          gridProperties: { 
            rowCount: 1000, 
            columnCount: 63,
            frozenRowCount: 1,
            frozenColumnCount: 2
          },
          tabColor: { red: 0.2, green: 0.6, blue: 1.0 }
        }
      }
    },
    // E1RM 시트
    {
      addSheet: {
        properties: {
          title: 'E1RM',
          sheetId: 200,
          gridProperties: { rowCount: 1000, columnCount: 26 },
          tabColor: { red: 0.8, green: 0.2, blue: 0.2 }
        }
      }
    },
    // RPE Table 시트
    {
      addSheet: {
        properties: {
          title: 'RPE Table',
          sheetId: 300,
          gridProperties: { rowCount: 1000, columnCount: 26 },
          tabColor: { red: 0.2, green: 0.8, blue: 0.2 }
        }
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });
}

// 🏋️ Block 시트 구성 (메인 훈련표)
async function createBlockSheet(spreadsheetId: string, programData: ProfessionalWorkoutProgram): Promise<void> {
  // 헤더 및 기본 구조
  const blockStructure = [
    // 행 1: 상단 헤더
    ['※자동표시', '최근/E1RM', '1rm', '', '', '', '', '', '', '', '', '', '', '', '', '', '훈련 차수 '],
    
    // 행 2-4: 3대 운동 기본 정보
    ['스쿼트', '#N/A', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['벤치프레스', '#N/A', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Primary', 'Secondary', 'Tertiary', 'Quaternary', '  Quinary', 'Senary', 'Septenary'],
    ['데드리프트', '#N/A'],
    
    // 행 5: 주간 구조
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '블럭구조', '월', '화', '수', '목', '금', '토', '일'],
    
    // 행 6-9: 중량 계산기
    ['예상 훈련 중량 계산기 (S,B,D Comp)', 'Squat'],
    ['목표rep', '목표RPE', '최근E1RM', 'Bench'],
    ['', '', '', 'Dead'],
    ['추천중량→'],
    
    // 행 10: 블럭 목표
    ['블럭 목표'],
    
    // 행 11: 공백
    [''],
    
    // 행 12-13: 주차 헤더
    ['W1', 'W2', 'W3'],
    ['월'],
    
    // 행 14: 상세 운동 헤더
    [
      '운동', '타겟중량', '타겟Reps', 'Set', '타겟RPE', '최소 중량', '최대 중량', 
      '실제중량', '실제Reps', '실제RPE', '예상1RM',
      '타겟중량', '타겟Reps', 'Set', '타겟RPE', '최소 중량', '최대 중량', 
      '실제중량', '실제Reps', '실제RPE', '예상1RM',
      '타겟중량', '타겟Reps', 'Set', '타겟RPE', '최소 중량'
    ]
  ];

  // 실제 운동 데이터 추가
  const squatMax = parseInt(programData.user_maxes.squat);
  const benchMax = parseInt(programData.user_maxes.bench);
  const deadliftMax = parseInt(programData.user_maxes.deadlift);

  // 운동 데이터 생성 (3주치)
  for (let week = 1; week <= 3; week++) {
    // 스쿼트
    blockStructure.push([
      'Comp Squat',
      `${Math.round(squatMax * 0.8)}kg`, '5', '3', '8',
      `${Math.round(squatMax * 0.75)}kg`, `${Math.round(squatMax * 0.85)}kg`,
      '', '', '', '',
      `${Math.round(squatMax * 0.82)}kg`, '5', '3', '8',
      `${Math.round(squatMax * 0.77)}kg`, `${Math.round(squatMax * 0.87)}kg`,
      '', '', '', '',
      `${Math.round(squatMax * 0.85)}kg`, '3', '4', '8.5'
    ]);

    // 벤치프레스
    blockStructure.push([
      'Comp Bench',
      `${Math.round(benchMax * 0.8)}kg`, '5', '3', '8',
      `${Math.round(benchMax * 0.75)}kg`, `${Math.round(benchMax * 0.85)}kg`,
      '', '', '', '',
      `${Math.round(benchMax * 0.82)}kg`, '5', '3', '8',
      `${Math.round(benchMax * 0.77)}kg`, `${Math.round(benchMax * 0.87)}kg`,
      '', '', '', '',
      `${Math.round(benchMax * 0.85)}kg`, '3', '4', '8.5'
    ]);

    // 데드리프트
    blockStructure.push([
      'Comp Deadlift',
      `${Math.round(deadliftMax * 0.8)}kg`, '5', '2', '8',
      `${Math.round(deadliftMax * 0.75)}kg`, `${Math.round(deadliftMax * 0.85)}kg`,
      '', '', '', '',
      `${Math.round(deadliftMax * 0.82)}kg`, '5', '2', '8',
      `${Math.round(deadliftMax * 0.77)}kg`, `${Math.round(deadliftMax * 0.87)}kg`,
      '', '', '', '',
      `${Math.round(deadliftMax * 0.85)}kg`, '3', '3', '8.5'
    ]);

    blockStructure.push(['']); // 공백행
  }

  // 메모 섹션
  blockStructure.push([
    '영상 참고 링크',
    '기록/메모장(그날의 큐잉, 느낌, 컨디션 등 기타 기록):',
    '기록/메모장(그날의 큐잉, 느낌, 컨디션 등 기타 기록):',
    '기록/메모장(그날의 큐잉, 느낌, 컨디션 등 기타 기록):'
  ]);

  // Block 시트에 데이터 입력
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Block!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: blockStructure
    }
  });
}

// 📈 E1RM 추적 시트
async function createE1RMSheet(spreadsheetId: string, programData: ProfessionalWorkoutProgram): Promise<void> {
  const e1rmData = [
    ['주차', 'Comp squat', 'Comp bench', 'Comp dead', 'Total'],
    ['W1', programData.user_maxes.squat, programData.user_maxes.bench, programData.user_maxes.deadlift, 
     `=B2+C2+D2`]
  ];

  // 18주치 확장
  for (let week = 2; week <= 18; week++) {
    e1rmData.push([
      `W${week}`, '', '', '', `=B${week + 1}+C${week + 1}+D${week + 1}`
    ]);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'E1RM!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: e1rmData
    }
  });
}

// 📋 RPE Table 참조 시트
async function createRPETableSheet(spreadsheetId: string): Promise<void> {
  const rpeTableData = [
    ['RPE', '1.00', '2.00', '3.00', '4.00', '5.00', '6.00', '7.00', '8.00', '9.00', '10.00', '11.00', '12.00'],
    ['10.00', '1', '0.955', '0.922', '0.893', '0.863', '0.837', '0.811', '0.786', '0.762', '0.739', '0.707', '0.68'],
    ['9.50', '0.978', '0.939', '0.907', '0.875', '0.85', '0.824', '0.799', '0.774', '0.751', '0.723', '0.694', '0.667'],
    ['9.00', '0.955', '0.922', '0.892', '0.863', '0.837', '0.811', '0.786', '0.762', '0.739', '0.707', '0.68', '0.653'],
    ['8.50', '0.939', '0.907', '0.878', '0.85', '0.824', '0.799', '0.774', '0.751', '0.723', '0.694', '0.667', '0.64'],
    ['8.00', '0.922', '0.892', '0.863', '0.837', '0.811', '0.786', '0.762', '0.739', '0.707', '0.68', '0.653', '0.626'],
    ['7.50', '0.907', '0.878', '0.85', '0.824', '0.799', '0.775', '0.751', '0.723', '0.694', '0.667', '0.64', '0.613'],
    ['7.00', '0.892', '0.863', '0.837', '0.811', '0.786', '0.762', '0.739', '0.707', '0.68', '0.653', '0.626', '0.599'],
    ['6.50', '0.878', '0.85', '0.824', '0.799', '0.774', '0.751', '0.728', '0.696', '0.669', '0.642', '0.615', '0.586'],
    ['6.00', '0.861', '0.833', '0.807', '0.782', '0.757', '0.734', '0.711', '0.679', '0.652', '0.625', '0.598', '0.569'],
    ['5.50', '0.844', '0.816', '0.79', '0.765', '0.74', '0.717', '0.694', '0.662', '0.635', '0.608', '0.581', '0.552'],
    ['5.00', '0.827', '0.799', '0.773', '0.748', '0.723', '0.7', '0.677', '0.645', '0.618', '0.591', '0.564', '0.535'],
    ['4.50', '0.81', '0.782', '0.756', '0.731', '0.706', '0.683', '0.66', '0.628', '0.601', '0.574', '0.547', '0.518'],
    ['4.00', '0.793', '0.765', '0.739', '0.714', '0.689', '0.666', '0.643', '0.611', '0.584', '0.557', '0.53', '0.501'],
    ['3.50', '0.776', '0.748', '0.722', '0.697', '0.672', '0.649', '0.626', '0.594', '0.567', '0.54', '0.513', '0.484'],
    ['3.00', '0.759', '0.731', '0.705', '0.68', '0.655', '0.632', '0.609', '0.577', '0.55', '0.523', '0.496', '0.467']
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'RPE Table!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rpeTableData
    }
  });
}

// 🎨 전문적인 포맷팅 적용
async function applyProfessionalFormatting(spreadsheetId: string): Promise<void> {
  const requests = [
    // Block 시트 헤더 포맷팅
    {
      repeatCell: {
        range: {
          sheetId: 100,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 25
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
            textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    },
    
    // 운동 헤더 포맷팅 (행 14)
    {
      repeatCell: {
        range: {
          sheetId: 100,
          startRowIndex: 13,
          endRowIndex: 14,
          startColumnIndex: 0,
          endColumnIndex: 25
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
            textFormat: { bold: true },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    },

    // E1RM 시트 헤더
    {
      repeatCell: {
        range: {
          sheetId: 200,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 5
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.8, green: 0.2, blue: 0.2 },
            textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    },

    // RPE Table 헤더
    {
      repeatCell: {
        range: {
          sheetId: 300,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 13
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.8, blue: 0.2 },
            textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });
}