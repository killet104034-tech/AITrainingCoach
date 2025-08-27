import { google } from 'googleapis';
import { createGoogleAuth } from '../../../apps/api/google';

// Google Sheets 인증 설정 (lazy initialization)
let auth: any = null;
let sheets: any = null;
let drive: any = null;

function initializeGoogleServices() {
  if (!auth) {
    auth = createGoogleAuth();
    sheets = google.sheets({ version: 'v4', auth });
    drive = google.drive({ version: 'v3', auth });
  }
  return { auth, sheets, drive };
}

export interface WorkoutProgram {
  program_title: string;
  user_maxes: {
    exercise1?: string;
    exercise2?: string; 
    exercise3?: string;
    squat?: string;
    bench?: string;
    deadlift?: string;
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
  // 설문 데이터 (기본 필드만)
  survey_data?: {
    timestamp?: string;
    name?: string;
    email?: string;
    experience?: string;
    daysPerWeek?: number;
    goal?: string;
    equipment?: string;
    injuries?: string;
    injuryDetails?: string;
  };
}

// 🏋️ 기본 템플릿 사용 (스크린샷에서 확인된 스프레드시트)
const BASIC_TEMPLATE_ID = '1Oj-c6pIjOsaHMFiTRaZIfAoS6p-5PhwWZUaMxwvFoQo';

// 메인 스프레드시트 생성 함수
export async function createWorkoutSheet(programData: WorkoutProgram): Promise<string> {
  try {
    console.log('📋 템플릿 스프레드시트 복사 시작...');

    // Initialize Google services
    const { sheets: sheetsService, drive: driveService } = initializeGoogleServices();

    // 1. 템플릿 스프레드시트 복사 (드라이브 API 사용)
    const copyResponse = await driveService.files.copy({
      fileId: BASIC_TEMPLATE_ID,
      supportsAllDrives: true,
      requestBody: {
        name: `${programData.program_title || 'Sinabro Strength'} - ${new Date().toISOString().split('T')[0]} - ${Math.random().toString(36).substr(2, 9)}`
      }
    });

    const spreadsheetId = copyResponse.data.id!;
    console.log(`✅ 템플릿 복사 완료: ${spreadsheetId}`);

    // 2. 기본 헤더 데이터 입력
    const headerData = [
      ['프로그램 제목', programData.program_title],
      ['운동 1 최고기록', (programData.user_maxes.exercise1 || programData.user_maxes.squat || '100') + 'kg'],
      ['운동 2 최고기록', (programData.user_maxes.exercise2 || programData.user_maxes.bench || '80') + 'kg'],
      ['운동 3 최고기록', (programData.user_maxes.exercise3 || programData.user_maxes.deadlift || '120') + 'kg'],
      [''],
      ['주차', '운동', '세트', '횟수', '중량(%)', 'RPE', '비고']
    ];

    // 3. 훈련 데이터 추가
    let rowIndex = headerData.length + 1;
    for (const week of programData.training_weeks) {
      headerData.push([`Week ${week.week}`, week.focus, '', '', '', '', '']);
      
      for (const workout of week.workouts) {
        headerData.push([`Day ${workout.day}`, workout.workout_name, '', '', '', '', '']);
        
        for (const exercise of workout.exercises) {
          headerData.push([
            '',
            exercise.exercise,
            exercise.sets,
            exercise.reps,
            exercise.weight_percent,
            exercise.rpe || '',
            exercise.notes || ''
          ]);
        }
      }
      headerData.push(['']); // 주차별 구분선
    }

    // 4. 데이터 입력
    await sheetsService.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headerData
      }
    });

    // 5. 설문 데이터 시트 추가
    if (programData.survey_data) {
      await addSurveyDataSheet(spreadsheetId, programData.survey_data);
    }

    // 6. 권한 설정 (선택사항)
    if (programData.survey_data?.email) {
      try {
        await driveService.permissions.create({
          fileId: spreadsheetId,
          supportsAllDrives: true,
          requestBody: {
            role: 'reader',
            type: 'user',
            emailAddress: programData.survey_data.email
          }
        });
        console.log(`✅ 제출자 이메일 read 권한: ${programData.survey_data.email}`);
      } catch (error) {
        console.log('⚠️ 권한 설정 실패 (무시하고 계속):', error);
      }
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`;
    console.log(`✅ 구글 스프레드시트 생성 성공: ${spreadsheetUrl}`);

    return spreadsheetUrl;

  } catch (error) {
    console.error('구글 스프레드시트 생성 실패:', error);
    throw new Error(`구글 스프레드시트 생성 실패: ${(error as any)?.message || 'Unknown error'}`);
  }
}

// 설문 데이터 시트 추가
async function addSurveyDataSheet(spreadsheetId: string, surveyData: any): Promise<void> {
  try {
    const { sheets: sheetsService } = initializeGoogleServices();

    // Survey 시트 생성
    await sheetsService.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: "Survey Data",
              gridProperties: {
                rowCount: 100,
                columnCount: 20
              }
            }
          }
        }]
      }
    });

    // 설문 데이터 구성
    const surveyRows = [
      ['설문 항목', '응답'],
      ['제출 시간', surveyData.timestamp || new Date().toISOString()],
      ['이름', surveyData.name || ''],
      ['이메일', surveyData.email || ''],
      ['경험 수준', surveyData.experience || ''],
      ['주간 운동 횟수', surveyData.daysPerWeek || ''],
      ['운동 목표', surveyData.goal || ''],
      ['보유 장비', surveyData.equipment || ''],
      ['부상 이력', surveyData.injuries || ''],
      ['부상 상세', surveyData.injuryDetails || '']
    ];

    // 설문 데이터 입력
    await sheetsService.spreadsheets.values.update({
      spreadsheetId,
      range: 'Survey Data!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: surveyRows
      }
    });

    console.log('✅ 설문 데이터 시트 생성 완료');

  } catch (error) {
    console.log('❌ 설문 데이터 시트 생성 실패:', error);
  }
}