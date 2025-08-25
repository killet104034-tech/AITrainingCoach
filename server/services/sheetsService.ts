import { google } from 'googleapis';

// Google Sheets 인증 설정
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file'
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

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
}

// 템플릿 스프레드시트 ID (환경변수로 설정 가능)
const TEMPLATE_SHEET_ID = process.env.SHEET_TEMPLATE_ID?.includes('spreadsheets/d/') 
  ? process.env.SHEET_TEMPLATE_ID.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1]
  : process.env.SHEET_TEMPLATE_ID;

export async function createWorkoutSheet(programData: WorkoutProgram): Promise<string> {
  try {
    console.log('🔥 비서님 제안: 템플릿 복사 방식으로 스프레드시트 생성 시작...');
    console.log('🔐 서비스 계정:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('📋 템플릿 ID:', TEMPLATE_SHEET_ID);

    // 🎯 비서님 조언: 필수 환경변수 검증 (없으면 즉시 예외로 중단)
    if (!TEMPLATE_SHEET_ID) {
      throw new Error('❌ SHEET_TEMPLATE_ID가 App Secrets에 설정되지 않았습니다!');
    }
    if (!process.env.SHARED_FOLDER_ID) {
      throw new Error('❌ SHARED_FOLDER_ID가 App Secrets에 설정되지 않았습니다!');
    }

    // 인증 테스트
    const authClient = await auth.getClient();
    console.log('✅ 인증 성공!');

    let spreadsheetId: string;

    // 🎯 비서님 제안: 템플릿 복사 방식 (drive.files.copy)
    console.log('📋 템플릿 복사 중... (용량 효율적!)');
    
    // 🎯 비서님 조언: supportsAllDrives:true와 parents:[SHARED_FOLDER_ID] 필수 포함
    const copy = await drive.files.copy({
      fileId: TEMPLATE_SHEET_ID,
      supportsAllDrives: true,
      requestBody: {
        name: `SINABRO_${Date.now()}`,
        parents: [process.env.SHARED_FOLDER_ID!]  // 🎯 비서님 조언: 필수 포함
      }
    });
    
    spreadsheetId = copy.data.id!;
    console.log('✅ 템플릿 복사 완료! ID:', spreadsheetId);

    // 🔥 프로급 파워리프팅 시트 구조 생성 (기존 코드 완전 제거)
    await createProPowerliftingSheets(spreadsheetId, programData);

    // 공개 권한 설정
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'writer',
          type: 'anyone'
        }
      });
      console.log('공개 권한 설정 완료');
    } catch (permError) {
      console.log('공개 권한 설정 실패 (스킵):', (permError as any)?.message);
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`;
    console.log('최종 스프레드시트 URL:', spreadsheetUrl);

    return spreadsheetUrl;

  } catch (error) {
    console.error('구글 스프레드시트 생성 실패:', error);
    throw new Error(`구글 스프레드시트 생성 실패: ${(error as any)?.message || 'Unknown error'}`);
  }
}

// 🔥 프로급 파워리프팅 시트 생성 함수 (블럭별 시트 구조)
async function createProPowerliftingSheets(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  try {
    console.log('🔥 프로급 파워리프팅 시트 구조 생성 중...');
    
    // 1. 메인 시트 이름 변경 및 개요 생성
    await createMainOverviewSheet(spreadsheetId, programData);
    
    // 2. 블럭별 시트 생성
    if (programData.training_weeks && Array.isArray(programData.training_weeks)) {
      const blocksData = organizeWeeksIntoBlocks(programData.training_weeks);
      
      for (let i = 0; i < blocksData.length; i++) {
        const blockData = blocksData[i];
        await createBlockSheet(spreadsheetId, i + 1, blockData);
      }
    }
    
    console.log('✅ 프로급 파워리프팅 시트 구조 완성!');
    
  } catch (error) {
    console.log('❌ 프로급 시트 생성 실패:', (error as any)?.message);
  }
}

// 메인 개요 시트 생성
async function createMainOverviewSheet(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  // 메인 시트 이름 변경
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        updateSheetProperties: {
          properties: {
            sheetId: 0,
            title: '📊 PROGRAM OVERVIEW'
          },
          fields: 'title'
        }
      }]
    }
  });

  // 메인 개요 데이터 구성
  const overviewData = [
    ['', '', '', '', '', '', ''],
    ['🏋️ SINABRO STRENGTH', '', '', '', '', '', ''],
    ['개인 맞춤형 파워리프팅 프로그램', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['📋 TRAINING MAXES', '', '🎯 RPE REFERENCE', '', '', '', ''],
    ['Squat 1RM', `${programData.user_maxes.squat}kg`, 'RPE 10', '최대 반복 (실패)', '', '', ''],
    ['Bench 1RM', `${programData.user_maxes.bench}kg`, 'RPE 9.5', '실패 직전 (1회 더 가능)', '', '', ''],
    ['Deadlift 1RM', `${programData.user_maxes.deadlift}kg`, 'RPE 9', '2-3회 더 가능', '', '', ''],
    ['', '', 'RPE 8', '4-6회 더 가능', '', '', ''],
    ['📈 PROGRAM INFO', '', 'RPE 7', '7-8회 더 가능', '', '', ''],
    ['프로그램명', programData.program_title, 'RPE 6', '9-10회 더 가능', '', '', ''],
    ['생성일', new Date().toLocaleDateString('ko-KR'), '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['💡 사용법', '', '', '', '', '', ''],
    ['• 각 블럭 탭을 클릭하여 주차별 훈련 확인', '', '', '', '', '', ''],
    ['• RPE 기준으로 중량 조절', '', '', '', '', '', ''],
    ['• 개인 상황에 맞게 조정 가능', '', '', '', '', '', '']
  ];

  // 데이터 입력
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'A1:G17',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: overviewData
    }
  });

  // 메인 시트 스타일링
  await formatMainSheet(spreadsheetId);
}

// 주차를 블럭으로 그룹화
function organizeWeeksIntoBlocks(trainingWeeks: any[]): any[][] {
  const blocksData = [];
  let currentBlock = [];
  
  for (let i = 0; i < trainingWeeks.length; i++) {
    currentBlock.push(trainingWeeks[i]);
    
    // 6주마다 또는 마지막에 블럭 완성
    if (currentBlock.length === 6 || i === trainingWeeks.length - 1) {
      blocksData.push([...currentBlock]);
      currentBlock = [];
    }
  }
  
  return blocksData;
}

// 블럭별 시트 생성
async function createBlockSheet(spreadsheetId: string, blockNumber: number, blockWeeks: any[]): Promise<void> {
  // 새 시트 생성
  const newSheet = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: `Block ${blockNumber}`,
            gridProperties: {
              rowCount: 100,
              columnCount: 20
            }
          }
        }
      }]
    }
  });

  const sheetId = newSheet.data.replies?.[0]?.addSheet?.properties?.sheetId;
  if (!sheetId) return;

  // 블럭 데이터 구성
  const blockData = [];
  
  // 헤더
  blockData.push(['', '', '', '', '', '', '', '', '', '']);
  blockData.push([`🔥 BLOCK ${blockNumber}`, '', '', '', '', '', '', '', '', '']);
  blockData.push(['', '', '', '', '', '', '', '', '', '']);

  // 각 주차별 데이터
  for (const week of blockWeeks) {
    blockData.push(['', '', '', '', '', '', '', '', '', '']);
    blockData.push([`📅 ${week.week}주차 - ${week.focus || ''}`, '', '', '', '', '', '', '', '', '']);
    blockData.push(['', '', '', '', '', '', '', '', '', '']);
    
    if (week.workouts && Array.isArray(week.workouts)) {
      for (const workout of week.workouts) {
        // 운동일 헤더
        blockData.push([`💪 Day ${workout.day}: ${workout.workout_name || ''}`, '', '', '', '', '', '', '', '', '']);
        blockData.push(['운동', '세트', '렙수', '무게%', '휴식', 'RPE', '비고', '', '', '']);
        
        // 운동 데이터
        if (workout.exercises && Array.isArray(workout.exercises)) {
          for (const exercise of workout.exercises) {
            blockData.push([
              exercise.exercise || '',
              exercise.sets?.toString() || '',
              exercise.reps || '',
              exercise.weight_percent || '',
              `${exercise.rest_minutes || ''}분`,
              exercise.rpe || '',
              exercise.notes || '',
              '', '', ''
            ]);
          }
        }
        
        blockData.push(['', '', '', '', '', '', '', '', '', '']);
      }
    }
  }

  // 데이터 입력
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `A1:J${blockData.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: blockData
    }
  });

  // 블럭 시트 스타일링
  await formatBlockSheet(spreadsheetId, sheetId, blockData.length);
}

// 메인 시트 스타일링
async function formatMainSheet(spreadsheetId: string): Promise<void> {
  const requests = [
    // 전체 기본 스타일
    {
      repeatCell: {
        range: { sheetId: 0, startRowIndex: 0, endRowIndex: 20, startColumnIndex: 0, endColumnIndex: 7 },
        cell: {
          userEnteredFormat: {
            textFormat: { fontFamily: 'Noto Sans KR', fontSize: 11 },
            backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 }
          }
        },
        fields: 'userEnteredFormat(textFormat,backgroundColor)'
      }
    },
    // 메인 타이틀 (검은색)
    {
      repeatCell: {
        range: { sheetId: 0, startRowIndex: 1, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 7 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.1, green: 0.1, blue: 0.1 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 16, bold: true },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat'
      }
    },
    // Training Maxes 섹션 (빨간색)
    {
      repeatCell: {
        range: { sheetId: 0, startRowIndex: 4, endRowIndex: 8, startColumnIndex: 0, endColumnIndex: 2 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.8, green: 0.2, blue: 0.2 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
          }
        },
        fields: 'userEnteredFormat'
      }
    },
    // RPE 섹션 (파란색)
    {
      repeatCell: {
        range: { sheetId: 0, startRowIndex: 4, endRowIndex: 10, startColumnIndex: 2, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
          }
        },
        fields: 'userEnteredFormat'
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });
}

// 블럭 시트 스타일링
async function formatBlockSheet(spreadsheetId: string, sheetId: number, totalRows: number): Promise<void> {
  const requests = [
    // 전체 기본 스타일
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: totalRows, startColumnIndex: 0, endColumnIndex: 10 },
        cell: {
          userEnteredFormat: {
            textFormat: { fontFamily: 'Noto Sans KR', fontSize: 10 },
            backgroundColor: { red: 0.98, green: 0.98, blue: 0.98 }
          }
        },
        fields: 'userEnteredFormat(textFormat,backgroundColor)'
      }
    },
    // 블럭 타이틀 (검은색)
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 10 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.1, green: 0.1, blue: 0.1 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 18, bold: true },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat'
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });
}

// 기본 시트 생성 함수 (템플릿이 없는 경우)
async function createBasicSheets(spreadsheetId: string, programData: WorkoutProgram) {
  // 간단한 기본 시트만 생성
  const infoData = [
    ['항목', '값'],
    ['프로그램명', programData.program_title],
    ['생성일', new Date().toLocaleDateString('ko-KR')],
    ['', ''],
    ['현재 최대중량 (KG)', ''],
    ['Squat', programData.user_maxes.squat],
    ['Bench Press', programData.user_maxes.bench],
    ['Deadlift', programData.user_maxes.deadlift]
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: '프로그램 정보!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: infoData
    }
  });
}