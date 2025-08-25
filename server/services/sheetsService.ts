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
const TEMPLATE_SHEET_ID = process.env.SHEET_TEMPLATE_ID;

export async function createWorkoutSheet(programData: WorkoutProgram): Promise<string> {
  try {
    console.log('🔥 비서님 제안: 템플릿 복사 방식으로 스프레드시트 생성 시작...');
    console.log('🔐 서비스 계정:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('📋 템플릿 ID:', TEMPLATE_SHEET_ID);

    // 인증 테스트
    const authClient = await auth.getClient();
    console.log('✅ 인증 성공!');

    let spreadsheetId: string;

    if (TEMPLATE_SHEET_ID) {
      // 🎯 비서님 제안: 템플릿 복사 방식 (drive.files.copy)
      console.log('📋 템플릿 복사 중... (용량 효율적!)');
      
      const copy = await drive.files.copy({
        fileId: TEMPLATE_SHEET_ID,
        supportsAllDrives: true,
        requestBody: {
          name: `SINABRO_${Date.now()}`,
          parents: process.env.SHARED_FOLDER_ID ? [process.env.SHARED_FOLDER_ID] : undefined
        }
      });
      
      spreadsheetId = copy.data.id!;
      console.log('✅ 템플릿 복사 완료! ID:', spreadsheetId);

      // 핵심 데이터만 업데이트 (빠르고 효율적)
      const updateData = [
        [programData.user_maxes.squat],    // B6: Squat 1RM
        [programData.user_maxes.bench],    // B7: Bench 1RM  
        [programData.user_maxes.deadlift], // B8: Deadlift 1RM
        [programData.program_title],       // B9: Program Title
        [new Date().toLocaleDateString('ko-KR')] // B10: Created Date
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Program Info!B6:B10',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: updateData
        }
      });
      
      console.log('✅ 템플릿 데이터 업데이트 완료!');
      
    } else {
      // 기존 방식: 새로 생성 (템플릿이 없는 경우)
      console.log('📋 기본 스프레드시트 생성 중...');
      
      const createResponse = await drive.files.create({
        requestBody: {
          name: `${programData.program_title} - ${new Date().toLocaleDateString('ko-KR')}`,
          mimeType: 'application/vnd.google-apps.spreadsheet',
        }
      });

      spreadsheetId = createResponse.data.id!;
      console.log('✅ 스프레드시트 생성 완료! ID:', spreadsheetId);

      // 기본 시트 생성
      await createBasicSheets(spreadsheetId, programData);
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