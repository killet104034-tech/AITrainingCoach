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

    // 핵심 데이터만 업데이트 (빠르고 효율적)
    const updateData = [
      ['Squat 1RM', programData.user_maxes.squat],
      ['Bench 1RM', programData.user_maxes.bench],  
      ['Deadlift 1RM', programData.user_maxes.deadlift],
      ['프로그램명', programData.program_title],
      ['생성일', new Date().toLocaleDateString('ko-KR')]
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:B5', // 기본 시트의 첫 번째 영역
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: updateData
      }
    });
    
    console.log('✅ 템플릿 데이터 업데이트 완료!');

    // 🎨 먼저 디자인부터 적용! (가장 중요)
    console.log('🔥 스프레드시트 디자인 우선 적용!');
    try {
      await formatWorkoutSheet(spreadsheetId, 100);
      console.log('✅ 스프레드시트 디자인 적용 완료!');
    } catch (formatError) {
      console.log('❌ 디자인 적용 실패:', formatError);
    }

    // 🔥 실제 훈련 프로그램 데이터를 스프레드시트에 추가!
    try {
      console.log('📊 훈련 프로그램 스케줄 추가 중...');
    
    // A8부터 실제 훈련 프로그램 시작
    let currentRow = 8;
    const programScheduleData: string[][] = [];
    
    // 헤더 추가
    programScheduleData.push(['', '', '', '', '', '', '']);
    programScheduleData.push(['📋 18주 훈련 프로그램 스케줄', '', '', '', '', '', '']);
    programScheduleData.push(['', '', '', '', '', '', '']);
    
    // 실제 프로그램 JSON 데이터 파싱 및 추가
    if (programData.training_weeks && Array.isArray(programData.training_weeks)) {
      // 스프레드시트 헤더
      programScheduleData.push(['운동', '세트', '렙수', '무게(%)', '휴식(분)', 'RPE', '비고']);
      programScheduleData.push(['', '', '', '', '', '', '']);
      
      // 각 주차별 데이터 추가
      for (const week of programData.training_weeks) {
        // 주차 헤더
        programScheduleData.push([`${week.week}주차 - ${week.focus || ''}`, '', '', '', '', '', '']);
        
        // 각 운동일별 데이터
        if (week.workouts && Array.isArray(week.workouts)) {
          for (const workout of week.workouts) {
            // 운동일 헤더
            programScheduleData.push([`Day ${workout.day}: ${workout.workout_name || ''}`, '', '', '', '', '', '']);
            
            // 각 운동별 데이터
            if (workout.exercises && Array.isArray(workout.exercises)) {
              for (const exercise of workout.exercises) {
                const row = [
                  exercise.exercise || '',
                  exercise.sets?.toString() || '',
                  exercise.reps || '',
                  exercise.weight_percent || '',
                  exercise.rest_minutes?.toString() || '',
                  exercise.rpe || '',
                  exercise.notes || ''
                ];
                programScheduleData.push(row);
              }
            }
            
            // 운동일 간 구분선
            programScheduleData.push(['', '', '', '', '', '', '']);
          }
        }
      }
    }
    
    // 스프레드시트에 훈련 프로그램 데이터 추가
    if (programScheduleData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${currentRow}:G${currentRow + programScheduleData.length - 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: programScheduleData
        }
      });
      console.log('✅ 훈련 프로그램 스케줄 추가 완료!');
    }
    
    } catch (scheduleError) {
      console.log('❌ 훈련 프로그램 스케줄 추가 실패:', scheduleError);
    }

    // 🎨 스프레드시트 포맷팅 적용 (프로페셔널한 디자인) - 별도 실행
    try {
      console.log('🎨 스프레드시트 디자인 적용 중...');
      await formatWorkoutSheet(spreadsheetId, 100); // 충분한 행 수로 설정
      console.log('✅ 스프레드시트 디자인 완료!');
    } catch (formatError) {
      console.log('❌ 스프레드시트 디자인 적용 실패:', formatError);
    }

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

// 🎨 프로페셔널한 스프레드시트 포맷팅 함수
async function formatWorkoutSheet(spreadsheetId: string, totalRows: number): Promise<void> {
  try {
    const requests = [
      // 전체 시트 기본 스타일
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: totalRows,
            startColumnIndex: 0,
            endColumnIndex: 7
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                fontFamily: 'Noto Sans KR',
                fontSize: 10
              },
              borders: {
                top: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                bottom: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                left: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                right: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } }
              }
            }
          },
          fields: 'userEnteredFormat(textFormat,borders)'
        }
      },
      
      // 메인 헤더 (1-5행) 스타일
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 6,
            startColumnIndex: 0,
            endColumnIndex: 7
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.1, green: 0.1, blue: 0.1 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 12,
                bold: true
              },
              horizontalAlignment: 'LEFT',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      },
      
      // 훈련 프로그램 제목 헤더
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 8,
            endRowIndex: 10,
            startColumnIndex: 0,
            endColumnIndex: 7
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.3, blue: 0.8 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 14,
                bold: true
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      },
      
      // 컬럼 헤더 스타일 (운동, 세트, 렙수 등)
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 11,
            endRowIndex: 12,
            startColumnIndex: 0,
            endColumnIndex: 7
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.4, green: 0.4, blue: 0.4 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 11,
                bold: true
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      },
      
      // 컬럼 너비 자동 조정
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 7
          }
        }
      },
      
      // 행 높이 조정
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: 0,
            endIndex: totalRows
          },
          properties: {
            pixelSize: 25
          },
          fields: 'pixelSize'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests
      }
    });
    
  } catch (error) {
    console.log('포맷팅 적용 실패 (스킵):', (error as any)?.message);
  }
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