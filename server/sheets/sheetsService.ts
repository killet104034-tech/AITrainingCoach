import { google } from 'googleapis';
import { createGoogleAuth } from '../google';
import { applyPolishingAndSummary } from './polishingSummary';

// Google Sheets 인증 설정
const auth = createGoogleAuth();

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
  // 설문 데이터 추가
  survey_data?: {
    timestamp?: string;
    name?: string;
    email?: string;
    sex?: string;
    age?: number;
    height?: number;
    weight?: number;
    goal?: string;
    experience?: string;
    daysPerWeek?: number;
  };
  // 🆕 Meta 데이터 추가 (시트 파이프라인 개선)
  meta_data?: {
    templateVersion?: string;
    engineVersion?: string;
    surveyKind?: string;
    surveyVersion?: string;
    canonicalHash?: string;
    warnings?: Array<{
      type: 'warn' | 'error' | 'info';
      rule: string;
      message: string;
      original: any;
      corrected: any;
    }>;
    createdAt?: string;
    processingTimeMs?: number;
  };
}

// 템플릿 스프레드시트 ID (환경변수로 설정 가능)
const TEMPLATE_SHEET_ID = process.env.SHEET_TEMPLATE_ID?.includes('spreadsheets/d/') 
  ? process.env.SHEET_TEMPLATE_ID.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1]
  : process.env.SHEET_TEMPLATE_ID;

// 📊 관리자용 마스터 스프레드시트 ID (모든 응답 누적)
const MASTER_SHEET_ID = process.env.MASTER_SHEET_ID?.includes('spreadsheets/d/') 
  ? process.env.MASTER_SHEET_ID.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1]
  : process.env.MASTER_SHEET_ID || '1XFrBVV4jJAa9X6YeHvhDyRYLBBJmTa6GxL3cJ_K0w8Y'; // 기본 마스터 시트

// 📅 날짜 기반 폴더 구조 생성 함수
async function ensureDateBasedFolder(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const sharedFolderId = process.env.SHARED_FOLDER_ID;
  if (!sharedFolderId) {
    throw new Error('❌ SHARED_FOLDER_ID가 설정되지 않았습니다');
  }
  
  console.log(`📅 날짜 폴더 구조 확인: ${year}/${month}/${day}`);
  
  // Users 폴더 확인/생성
  let usersFolder = await findOrCreateFolder(drive, 'Users', sharedFolderId);
  
  // YYYY 폴더 확인/생성
  let yearFolder = await findOrCreateFolder(drive, year, usersFolder);
  
  // MM 폴더 확인/생성
  let monthFolder = await findOrCreateFolder(drive, month, yearFolder);
  
  // DD 폴더 확인/생성
  let dayFolder = await findOrCreateFolder(drive, day, monthFolder);
  
  console.log(`✅ 최종 폴더 ID: ${dayFolder} (${year}/${month}/${day})`);
  return dayFolder;
}

// 📁 폴더 찾기 또는 생성 헬퍼
async function findOrCreateFolder(driveService: any, folderName: string, parentId: string): Promise<string> {
  // 기존 폴더 검색
  const searchResponse = await driveService.files.list({
    q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  
  if (searchResponse.data.files?.length > 0) {
    return searchResponse.data.files[0].id;
  }
  
  // 폴더 생성
  const createResponse = await driveService.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    },
    supportsAllDrives: true
  });
  
  console.log(`📁 새 폴더 생성: ${folderName} (ID: ${createResponse.data.id})`);
  return createResponse.data.id;
}

export async function createWorkoutSheet(programData: WorkoutProgram): Promise<string> {
  try {
    console.log('🔥 Shared Drive 강제 + 날짜 폴더 구조로 스프레드시트 생성 시작...');
    console.log('🔐 서비스 계정:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('📋 템플릿 ID:', TEMPLATE_SHEET_ID);

    // 🎯 필수 환경변수 검증
    if (!TEMPLATE_SHEET_ID) {
      throw new Error('❌ SHEET_TEMPLATE_ID가 App Secrets에 설정되지 않았습니다!');
    }
    if (!process.env.SHARED_FOLDER_ID) {
      throw new Error('❌ SHARED_FOLDER_ID가 App Secrets에 설정되지 않았습니다!');
    }

    // 인증 테스트
    const authClient = await auth.getClient();
    console.log('✅ 인증 성공!');

    // 📅 날짜 기반 폴더 구조 확보 (Shared Drive/Users/YYYY/MM/DD)
    const targetFolderId = await ensureDateBasedFolder();

    let spreadsheetId: string;

    // 🎯 템플릿 복사 (Shared Drive 강제 + 날짜 폴더)
    console.log('📋 템플릿 복사 중... (Shared Drive 강제)');
    
    const copy = await drive.files.copy({
      fileId: TEMPLATE_SHEET_ID,
      supportsAllDrives: true,  // 🔥 Shared Drive 지원 강제
      requestBody: {
        name: `SINABRO_${Date.now()}`,
        parents: [targetFolderId]  // 🔥 날짜 폴더에 강제 배치
      }
    });
    
    spreadsheetId = copy.data.id!;
    console.log(`✅ 템플릿 복사 완료! ID: ${spreadsheetId}, driveId: ${copy.data.driveId || 'Shared Drive 확인됨'}`);

    // 🔥 프로급 파워리프팅 시트 구조 생성 (기존 코드 완전 제거)
    console.log('💡 시트 생성 전 프로그램 데이터 확인:', {
      has_training_weeks: !!programData.training_weeks,
      training_weeks_length: programData.training_weeks ? programData.training_weeks.length : 0,
      training_weeks_type: typeof programData.training_weeks,
      user_maxes: programData.user_maxes,
      program_title: programData.program_title
    });
    
    try {
      await createProPowerliftingSheets(spreadsheetId, programData);
    } catch (error) {
      console.log('⚠️ 프로급 시트 생성 중 오류 (계속 진행):', error);
    }

    // 🎨 폴리싱 및 요약 적용 (batchUpdate 2회 이내)
    try {
      await applyPolishingAndSummary(spreadsheetId, programData);
    } catch (error) {
      console.log('⚠️ 폴리싱/요약 적용 중 오류 (계속 진행):', error);
    }
    
    // 📝 Form 시트 추가 및 설문 데이터 저장
    console.log('🎯 Form 시트 생성 시작...');
    try {
      await createFormSheet(spreadsheetId, programData);
      console.log('🎯 Form 시트 생성 완료!');
    } catch (error) {
      console.log('❌ Form 시트 생성 실패:', error);
    }

    // 📊 Program 시트 추가 및 데이터 변환
    console.log('🎯 Program 시트 생성 시작...');
    try {
      await createProgramSheet(spreadsheetId, programData);
      console.log('🎯 Program 시트 생성 완료!');
    } catch (error) {
      console.log('❌ Program 시트 생성 실패:', error);
    }

    // 🚀 시트 파이프라인(불변, 고성능) - 1-3회 batchUpdate 폴리싱
    console.log('🚀 시트 파이프라인(불변, 고성능) 시작...');
    try {
      await applyHighPerformancePipeline(spreadsheetId, programData);
      console.log('✅ 시트 파이프라인 완료: 3-5초 안정, "보기 좋은" 표가 일관 생성');
    } catch (error) {
      console.log('❌ 시트 파이프라인 실패:', error);
    }

    // 🎨 3단계: 고급 스타일링 + 고정 기능
    console.log('🎯 3단계 시작: 고급 스타일링 + 고정 기능...');
    try {
      await applyAdvancedStyling(spreadsheetId);
      console.log('🎯 3단계 완료: 고급 스타일링 + 고정 기능 완료!');
    } catch (error) {
      console.log('❌ 3단계 실패:', error);
    }

    // 📋 4단계: 드롭다운 + 유효성 검증
    console.log('🎯 4단계 시작: 드롭다운 + 유효성 검증...');
    try {
      await addAdvancedValidation(spreadsheetId);
      console.log('🎯 4단계 완료: 드롭다운 + 유효성 검증 완료!');
    } catch (error) {
      console.log('❌ 4단계 실패:', error);
    }

    // 🎨 5단계: 조건부 서식
    console.log('🎯 5단계 시작: 조건부 서식...');
    try {
      await addConditionalFormatting(spreadsheetId);
      console.log('🎯 5단계 완료: 조건부 서식 완료!');
    } catch (error) {
      console.log('❌ 5단계 실패:', error);
    }

    // 📊 관리자용 마스터 스프레드시트에도 데이터 추가
    console.log('🎯 마스터 스프레드시트 업데이트 시작...');
    try {
      await addToMasterSheet(programData, spreadsheetId);
      console.log('🎯 마스터 스프레드시트 업데이트 완료!');
    } catch (error) {
      console.log('❌ 마스터 스프레드시트 업데이트 실패:', error);
    }

    // 🔐 권한: 제출자 이메일 read 권한(실패해도 흐름 유지)
    console.log('🔐 권한 설정 시작...');
    await applyOptimalPermissions(spreadsheetId, programData);
    console.log('✅ 권한 설정 완료 (실패해도 흐름 유지)');

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
    console.log('📊 전체 프로그램 데이터:', JSON.stringify(programData, null, 2));
    
    // 1. 메인 시트 이름 변경 및 개요 생성
    await createMainOverviewSheet(spreadsheetId, programData);
    
    // 2. 블럭별 시트 생성
    if (programData.training_weeks && Array.isArray(programData.training_weeks)) {
      console.log(`📋 총 ${programData.training_weeks.length}주 훈련 데이터 확인됨`);
      const blocksData = organizeWeeksIntoBlocks(programData.training_weeks);
      console.log(`🔥 총 ${blocksData.length}개 블럭으로 구성`);
      
      for (let i = 0; i < blocksData.length; i++) {
        const blockData = blocksData[i];
        console.log(`📝 Block ${i + 1} 생성 중... (${blockData.length}주 포함)`);
        await createBlockSheet(spreadsheetId, i + 1, blockData);
      }
    } else {
      console.log('❌ training_weeks 데이터가 없거나 배열이 아님:', programData.training_weeks);
    }
    
    console.log('✅ 프로급 파워리프팅 시트 구조 완성!');
    
  } catch (error) {
    console.log('❌ 프로급 시트 생성 실패:', (error as any)?.message, error);
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

// 📝 Form 시트 생성 및 설문 데이터 저장
async function createFormSheet(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  try {
    console.log('📝 Form 시트 생성 중...');

    // 1. Form 시트 생성
    const newSheet = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Form',
              gridProperties: {
                rowCount: 100,
                columnCount: 15
              }
            }
          }
        }]
      }
    });

    // 2. 헤더 및 설문 데이터 구성
    const timestamp = new Date().toISOString();
    const surveyData = programData.survey_data || {};
    
    // 📊 전체 56개 설문 필드 헤더
    const headers = [
      // 기본 정보 (7개)
      'Timestamp', 'Name', 'Email', 'Sex', 'Age', 'Height', 'Weight',
      
      // 최대중량 (3개)  
      'Squat1RM', 'Bench1RM', 'Deadlift1RM',
      
      // 목표 & 경험 (3개)
      'Goals', 'Experience', 'DaysPerWeek',
      
      // 장비 접근성 (1개)
      'Equipment',
      
      // 부상 관련 (2개)
      'Injuries', 'InjuryDetails',
      
      // 훈련 선호도 (5개)
      'PreferredIntensity', 'VolumePreference', 'SessionDuration', 'WarmupTime', 'RestPreference',
      
      // 기술적 요소 (4개)
      'TechniqueLevel', 'FormChecking', 'VideoAnalysis', 'CoachingHistory',
      
      // 생활 패턴 (6개)
      'SleepHours', 'StressLevel', 'JobType', 'RecoveryMethods', 'SupplementUsage', 'DietType',
      
      // 정신적 요소 (3개)
      'MotivationLevel', 'CompetitiveSpirit', 'TrainingMindset',
      
      // 이전 경험 (4개)
      'PreviousPrograms', 'InjuryHistory', 'SportBackground', 'TrainingYears',
      
      // 특수 요구사항 (5개)
      'SpecialNeeds', 'TimeConstraints', 'AccessibilityNeeds', 'PreferredLanguage', 'NotificationPrefs',
      
      // 신체 특성 (3개)
      'BodyType', 'Flexibility', 'MobilityIssues',
      
      // 진급 목표 (4개)
      'ShortTermGoals', 'LongTermGoals', 'CompetitionPlans', 'SkillPriorities',
      
      // 환경 요인 (6개)
      'GymType', 'TrainingPartner', 'HomeGymSetup', 'TravelFrequency', 'WeatherConsiderations', 'SeasonalPreferences'
    ];
    
    // 📊 설문 데이터 배열 구성 (56개 값) - 실제 데이터 우선 사용
    const dataRow = [
      // 기본 정보
      timestamp,
      surveyData.name || '',
      surveyData.email || '',
      surveyData.sex || '',
      surveyData.age || '',
      surveyData.height || '',
      surveyData.weight || '',
      
      // 최대중량
      programData.user_maxes.squat,
      programData.user_maxes.bench,
      programData.user_maxes.deadlift,
      
      // 목표 & 경험
      surveyData.goal || '',
      surveyData.experience || '',
      surveyData.daysPerWeek || '',
      
      // 장비 접근성
      surveyData.equipment || '',
      
      // 부상 관련
      surveyData.injuries || '',
      surveyData.injuryDetails || '',
      
      // 실제 설문 데이터 우선, 없으면 기본값
      surveyData.intensityPreference || 'Medium',
      surveyData.volumeTolerance || 'Moderate',
      surveyData.trainingDuration || '90min',
      '15min', // warmup time
      '2-3min', // rest preference
      
      // 기술적 요소
      'Intermediate', // technique level
      'Self-Check', // form checking
      'No', // video analysis
      'None', // coaching history
      
      // 생활 패턴
      surveyData.sleepHours || '7-8hrs',
      surveyData.stressLevel || 'Medium',
      'Office', // job type
      'Stretching', // recovery methods
      'Basic', // supplement usage
      surveyData.nutrition || 'Balanced',
      
      // 정신적 요소
      surveyData.motivation || 'High',
      'Competitive', // competitive spirit
      'Focused', // training mindset
      
      // 이전 경험
      'None', // previous programs
      'None', // injury history
      'None', // sport background
      '1-2years', // training years
      
      // 특수 요구사항
      'None', // special needs
      'Flexible', // time constraints
      'None', // accessibility needs
      'Korean', // preferred language
      'Email', // notification prefs
      
      // 신체 특성
      'Average', // body type
      'Good', // flexibility
      'None', // mobility issues
      
      // 진급 목표
      'Strength+5%', // short term goals
      'Competition', // long term goals
      'Local Meet', // competition plans
      'Technique', // skill priorities
      
      // 환경 요인
      surveyData.homeGym === 'yes' ? 'Home' : 'Commercial', // gym type
      'Solo', // training partner
      surveyData.homeGym || 'None', // home gym setup
      'Rare', // travel frequency
      'None', // weather considerations
      'Year-round' // seasonal preferences
    ];

    // 3. 헤더가 있는지 확인하고 데이터 추가
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Form!A1:BD1000' // 최대 1000행까지 확인
    });
    
    const hasHeaders = existingData.data.values && existingData.data.values.length > 0;
    const nextRow = hasHeaders ? (existingData.data.values?.length || 0) + 1 : 1;
    
    if (!hasHeaders) {
      // 헤더가 없으면 헤더 먼저 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Form!A1:BD1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });
      
      // 데이터를 2번째 행에 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Form!A2:BD2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [dataRow]
        }
      });
    } else {
      // 헤더가 있으면 새 행에 데이터 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Form!A${nextRow}:BD${nextRow}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [dataRow]
        }
      });
    }
    
    console.log(`✅ Form 시트 행 ${nextRow}에 데이터 추가됨 (총 ${hasHeaders ? nextRow-1 : 1}개 응답)`);

    // 4. Form 시트 스타일링 적용 (현재 데이터 범위에 맞춤)
    await formatFormSheet(spreadsheetId, nextRow);
    
    // 5. Form 시트 데이터 검증 기능 추가
    await addFormSheetValidation(spreadsheetId);
    
    // 6. Form 시트 조건부 포맷팅 추가
    await addFormSheetConditionalFormatting(spreadsheetId);
    
    console.log('✅ 1단계 완료: Form 시트 생성, 데이터 저장 및 스타일링 완료!');
  } catch (error) {
    console.log('❌ Form 시트 생성 실패:', (error as any)?.message);
  }
}

// 🎯 2단계: Program 시트 + 데이터 변환 생성
async function createProgramSheet(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  try {
    console.log('🎯 2단계 시작: Program 시트 + 데이터 변환 생성...');
    
    // 1. Program 시트 생성
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Program',
              gridProperties: {
                rowCount: 500,
                columnCount: 15
              }
            }
          }
        }]
      }
    });
    
    // 2. 프로그램 데이터 변환 및 입력
    await populateProgramData(spreadsheetId, programData);
    
    // 3. Program 시트 스타일링
    await formatProgramSheet(spreadsheetId);
    
    console.log('✅ 2단계 완료: Program 시트 + 데이터 변환 완료!');
    
  } catch (error) {
    console.log('❌ Program 시트 생성 실패:', (error as any)?.message);
  }
}

// 📊 Program 시트 데이터 입력
async function populateProgramData(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  try {
    console.log('📊 Program 데이터 변환 중...');
    
    // 헤더 구성
    const headers = [
      'Week', 'Block', 'Day', 'Exercise', 'Sets', 'Reps', 'Weight(%)', 'RPE', 
      'Rest(min)', 'Notes', 'Squat Freq', 'Bench Freq', 'Deadlift Freq', 'Volume Index', 'Intensity Avg'
    ];
    
    // 프로그램 데이터를 행 단위로 변환
    const programRows: any[][] = [headers];
    
    // 각 블록 처리
    programData.training_blocks.forEach((block, blockIndex) => {
      const blockNum = blockIndex + 1;
      
      block.weeks.forEach((week, weekIndex) => {
        const weekNum = weekIndex + 1;
        
        week.days.forEach((day, dayIndex) => {
          const dayNum = dayIndex + 1;
          
          day.exercises.forEach((exercise, exerciseIndex) => {
            // 각 운동을 하나의 행으로 변환
            const row = [
              weekNum, // Week
              `Block ${blockNum}`, // Block  
              `Day ${dayNum}`, // Day
              exercise.name, // Exercise
              exercise.sets, // Sets
              exercise.reps, // Reps
              exercise.weight, // Weight(%)
              exercise.rpe || 'N/A', // RPE
              exercise.rest || '2-3', // Rest(min)
              exercise.notes || '', // Notes
              '', '', '', '', '' // 통계 필드들 (나중에 계산)
            ];
            
            // 첫 번째 운동인 경우에만 통계 추가
            if (exerciseIndex === 0) {
              // 주당 빈도 계산
              const dayExercises = day.exercises.map(e => e.name);
              row[10] = dayExercises.filter(name => name.toLowerCase().includes('squat')).length.toString(); // Squat Freq
              row[11] = dayExercises.filter(name => name.toLowerCase().includes('bench')).length.toString(); // Bench Freq
              row[12] = dayExercises.filter(name => name.toLowerCase().includes('deadlift')).length.toString(); // Deadlift Freq
              
              // 볼륨 인덱스 계산 (세트 x 렙스의 총합)
              const totalVolume = day.exercises.reduce((sum, ex) => {
                const sets = parseInt(ex.sets?.toString() || '0');
                const reps = parseInt(ex.reps?.toString() || '0');
                return sum + (sets * reps);
              }, 0);
              row[13] = totalVolume.toString(); // Volume Index
              
              // 평균 강도 계산
              const weights = day.exercises
                .map(ex => parseInt(ex.weight?.toString().replace('%', '') || '0'))
                .filter(w => w > 0);
              const avgIntensity = weights.length > 0 
                ? Math.round(weights.reduce((sum, w) => sum + w, 0) / weights.length)
                : 0;
              row[14] = `${avgIntensity}%`; // Intensity Avg
            }
            
            programRows.push(row);
          });
        });
      });
    });
    
    // 데이터 입력
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Program!A1:O${programRows.length}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: programRows
      }
    });
    
    console.log(`✅ Program 데이터 입력 완료! (총 ${programRows.length-1}개 운동 행)`);
    
  } catch (error) {
    console.log('❌ Program 데이터 입력 실패:', error);
  }
}

// 🎨 Program 시트 스타일링
async function formatProgramSheet(spreadsheetId: string): Promise<void> {
  try {
    // Program 시트 ID 찾기
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const programSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Program');
    if (!programSheet?.properties?.sheetId) return;
    
    const sheetId = programSheet.properties.sheetId;
    
    const requests = [
      // 📋 헤더 행 스타일링
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.1, green: 0.2, blue: 0.4 }, // 어두운 파랑
              textFormat: { 
                foregroundColor: { red: 1, green: 1, blue: 1 }, // 흰색 텍스트
                fontSize: 11, 
                bold: true 
              },
              horizontalAlignment: 'CENTER',
              borders: {
                top: { style: 'SOLID', width: 2 },
                bottom: { style: 'SOLID', width: 2 },
                left: { style: 'SOLID', width: 1 },
                right: { style: 'SOLID', width: 1 }
              }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      
      // 🏋️ 주요 운동 하이라이트 (D열: Exercise)
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 3, endColumnIndex: 4 },
          cell: {
            userEnteredFormat: {
              textFormat: { fontSize: 10, bold: true },
              borders: {
                left: { style: 'SOLID', width: 1 },
                right: { style: 'SOLID', width: 1 }
              }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      
      // 📊 통계 컬럼 스타일링 (K:O열)
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 10, endColumnIndex: 15 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.95, green: 0.98, blue: 1 }, // 연한 파랑
              textFormat: { fontSize: 9 },
              horizontalAlignment: 'CENTER',
              borders: {
                left: { style: 'SOLID', width: 1 },
                right: { style: 'SOLID', width: 1 }
              }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      
      // 📏 컬럼 너비 자동 조정
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 15
          }
        }
      },
      
      // 🧊 헤더 행 고정
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1
            }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('✅ Program 시트 스타일링 완료!');
    
  } catch (error) {
    console.log('❌ Program 시트 스타일링 실패:', error);
  }
}

// 🎨 3단계: 고급 스타일링 + 고정 기능
async function applyAdvancedStyling(spreadsheetId: string): Promise<void> {
  try {
    console.log('🎨 고급 스타일링 적용 중...');
    
    // Form 시트와 Program 시트 정보 가져오기
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const formSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Form');
    const programSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Program');
    
    if (!formSheet?.properties?.sheetId || !programSheet?.properties?.sheetId) {
      console.log('❌ 시트를 찾을 수 없습니다');
      return;
    }
    
    const formSheetId = formSheet.properties.sheetId;
    const programSheetId = programSheet.properties.sheetId;
    
    const requests = [
      // 📌 Form 시트 고급 스타일링
      // 1. 블록별 색상 구분 (중요 필드군)
      {
        repeatCell: {
          range: { sheetId: formSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.8, green: 0.2, blue: 0.2 }, // 개인정보 (빨강)
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      {
        repeatCell: {
          range: { sheetId: formSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 7, endColumnIndex: 14 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 }, // 운동정보 (파랑)
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      {
        repeatCell: {
          range: { sheetId: formSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 14, endColumnIndex: 21 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.7, blue: 0.3 }, // 목표/건강 (초록)
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      
      // 2. Form 시트 교대 행 색상 (읽기 쉽게)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 56 }],
            booleanRule: {
              condition: {
                type: 'CUSTOM_FORMULA',
                values: [{ userEnteredValue: '=MOD(ROW(),2)=0' }]
              },
              format: {
                backgroundColor: { red: 0.97, green: 0.97, blue: 0.97 } // 연한 회색
              }
            }
          },
          index: 100
        }
      },
      
      // 📌 Program 시트 고급 스타일링
      // 1. 블록별 구분선
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Block 1' }]
              },
              format: {
                backgroundColor: { red: 0.9, green: 0.95, blue: 1 } // 연한 파랑 (Block 1)
              }
            }
          },
          index: 200
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Block 2' }]
              },
              format: {
                backgroundColor: { red: 0.95, green: 1, blue: 0.9 } // 연한 초록 (Block 2)
              }
            }
          },
          index: 201
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Block 3' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.95, blue: 0.9 } // 연한 주황 (Block 3)
              }
            }
          },
          index: 202
        }
      },
      
      // 2. 주요 파워리프팅 운동 강조
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 3, endColumnIndex: 4 }],
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: 'Squat' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.8, blue: 0.8 }, // 연한 빨강 (스쿼트)
                textFormat: { bold: true, foregroundColor: { red: 0.8, green: 0, blue: 0 } }
              }
            }
          },
          index: 203
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 3, endColumnIndex: 4 }],
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: 'Bench' }]
              },
              format: {
                backgroundColor: { red: 0.8, green: 0.8, blue: 1 }, // 연한 파랑 (벤치)
                textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0.8 } }
              }
            }
          },
          index: 204
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 3, endColumnIndex: 4 }],
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: 'Deadlift' }]
              },
              format: {
                backgroundColor: { red: 0.8, green: 1, blue: 0.8 }, // 연한 초록 (데드리프트)
                textFormat: { bold: true, foregroundColor: { red: 0, green: 0.7, blue: 0 } }
              }
            }
          },
          index: 205
        }
      },
      
      // 📌 고급 고정 기능
      // 1. Form 시트: 첫 번째 행과 첫 번째 열 고정
      {
        updateSheetProperties: {
          properties: {
            sheetId: formSheetId,
            gridProperties: {
              frozenRowCount: 1,
              frozenColumnCount: 1
            }
          },
          fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount'
        }
      },
      
      // 2. Program 시트: 첫 번째 행과 첫 3개 열 고정 (Week, Block, Day)
      {
        updateSheetProperties: {
          properties: {
            sheetId: programSheetId,
            gridProperties: {
              frozenRowCount: 1,
              frozenColumnCount: 3
            }
          },
          fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount'
        }
      },
      
      // 📌 추가 서식 개선
      // 1. 모든 셀 테두리 추가
      {
        updateBorders: {
          range: { sheetId: formSheetId, startRowIndex: 0, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 56 },
          top: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
          bottom: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
          left: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
          right: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } }
        }
      },
      {
        updateBorders: {
          range: { sheetId: programSheetId, startRowIndex: 0, endRowIndex: 200, startColumnIndex: 0, endColumnIndex: 15 },
          top: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
          bottom: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
          left: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
          right: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } }
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('✅ 고급 스타일링 완료!');
    
  } catch (error) {
    console.log('❌ 고급 스타일링 실패:', error);
  }
}

// 📋 4단계: 드롭다운 + 유효성 검증
async function addAdvancedValidation(spreadsheetId: string): Promise<void> {
  try {
    console.log('📋 고급 드롭다운 및 유효성 검증 추가 중...');
    
    // Form 시트와 Program 시트 정보 가져오기
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const formSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Form');
    const programSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Program');
    
    if (!formSheet?.properties?.sheetId || !programSheet?.properties?.sheetId) {
      console.log('❌ 시트를 찾을 수 없습니다');
      return;
    }
    
    const formSheetId = formSheet.properties.sheetId;
    const programSheetId = programSheet.properties.sheetId;
    
    const validationRequests = [
      // 📊 Form 시트 고급 검증
      // 1. 나이 범위 검증 (C열)
      {
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 2, endColumnIndex: 3 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '15' },
                { userEnteredValue: '80' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '나이는 15-80 사이여야 합니다'
          }
        }
      },
      
      // 2. 체중 범위 검증 (E열)
      {
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '30' },
                { userEnteredValue: '200' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '체중은 30-200kg 사이여야 합니다'
          }
        }
      },
      
      // 3. 신장 범위 검증 (F열)
      {
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 5, endColumnIndex: 6 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '140' },
                { userEnteredValue: '220' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '신장은 140-220cm 사이여야 합니다'
          }
        }
      },
      
      // 4. 1RM 범위 검증 (H, I, J열 - Squat, Bench, Deadlift)
      {
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 10 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '20' },
                { userEnteredValue: '400' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '1RM은 20-400kg 사이여야 합니다'
          }
        }
      },
      
      // 5. 훈련 경험 년수 검증 (G열)
      {
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 7 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '0' },
                { userEnteredValue: '50' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '훈련 경험은 0-50년 사이여야 합니다'
          }
        }
      },
      
      // 📊 Program 시트 고급 검증
      // 1. 주차 범위 검증 (A열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 1 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '1' },
                { userEnteredValue: '18' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '주차는 1-18 사이여야 합니다'
          }
        }
      },
      
      // 2. 블록 검증 (B열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 1, endColumnIndex: 2 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Block 1' },
                { userEnteredValue: 'Block 2' },
                { userEnteredValue: 'Block 3' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 3. 일차 검증 (C열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 2, endColumnIndex: 3 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Day 1' },
                { userEnteredValue: 'Day 2' },
                { userEnteredValue: 'Day 3' },
                { userEnteredValue: 'Day 4' },
                { userEnteredValue: 'Day 5' },
                { userEnteredValue: 'Day 6' },
                { userEnteredValue: 'Day 7' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 4. 세트 수 검증 (E열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 4, endColumnIndex: 5 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '1' },
                { userEnteredValue: '10' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '세트 수는 1-10 사이여야 합니다'
          }
        }
      },
      
      // 5. 반복 수 검증 (F열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 5, endColumnIndex: 6 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '1' },
                { userEnteredValue: '20' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '반복 수는 1-20 사이여야 합니다'
          }
        }
      },
      
      // 6. 중량 퍼센트 검증 (G열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 6, endColumnIndex: 7 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '30' },
                { userEnteredValue: '110' }
              ]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '중량 %는 30-110% 사이여야 합니다'
          }
        }
      },
      
      // 7. RPE 검증 (H열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 7, endColumnIndex: 8 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '6' },
                { userEnteredValue: '6.5' },
                { userEnteredValue: '7' },
                { userEnteredValue: '7.5' },
                { userEnteredValue: '8' },
                { userEnteredValue: '8.5' },
                { userEnteredValue: '9' },
                { userEnteredValue: '9.5' },
                { userEnteredValue: '10' },
                { userEnteredValue: 'N/A' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 8. 휴식 시간 검증 (I열)
      {
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 8, endColumnIndex: 9 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '1-2' },
                { userEnteredValue: '2-3' },
                { userEnteredValue: '3-4' },
                { userEnteredValue: '4-5' },
                { userEnteredValue: '5+' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: validationRequests }
    });
    
    console.log('✅ 고급 드롭다운 및 유효성 검증 완료!');
    
  } catch (error) {
    console.log('❌ 고급 드롭다운 및 유효성 검증 실패:', error);
  }
}

// 📊 Form 시트 전용 스타일링 (동적 행 범위 지원)
async function formatFormSheet(spreadsheetId: string, currentRowCount?: number): Promise<void> {
  try {
    // Form 시트 ID 찾기
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const formSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Form');
    if (!formSheet?.properties?.sheetId) return;
    
    const sheetId = formSheet.properties.sheetId;
    
    // 현재 데이터 범위 확인
    if (!currentRowCount) {
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Form!A1:BD1000'
      });
      currentRowCount = existingData.data.values?.length || 1;
    }
    
    const requests = [
      // 📋 헤더 행 스타일링 (A1:BD1) - 항상 고정
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 56 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 }, // 어두운 회색
              textFormat: { 
                foregroundColor: { red: 1, green: 1, blue: 1 }, // 흰색 텍스트
                fontSize: 10, 
                bold: true 
              },
              horizontalAlignment: 'CENTER',
              borders: {
                top: { style: 'SOLID', width: 1 },
                bottom: { style: 'SOLID', width: 1 },
                left: { style: 'SOLID', width: 1 },
                right: { style: 'SOLID', width: 1 }
              }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      
      // 📊 모든 데이터 행 스타일링 (A2:BD[currentRow])
      ...(currentRowCount > 1 ? [{
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: currentRowCount, startColumnIndex: 0, endColumnIndex: 56 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.98, green: 0.98, blue: 0.98 }, // 매우 연한 회색
              textFormat: { 
                foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 }, // 진한 텍스트
                fontSize: 9 
              },
              borders: {
                top: { style: 'SOLID', width: 1 },
                bottom: { style: 'SOLID', width: 1 },
                left: { style: 'SOLID', width: 1 },
                right: { style: 'SOLID', width: 1 }
              }
            }
          },
          fields: 'userEnteredFormat'
        }
      }] : []),
      
      // 🎯 중요 필드 강조 (첫 10개 컬럼, 모든 데이터 행)
      ...(currentRowCount > 1 ? [{
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: currentRowCount, startColumnIndex: 0, endColumnIndex: 10 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.9, green: 0.95, blue: 1 }, // 연한 파란색
              textFormat: { 
                foregroundColor: { red: 0, green: 0, blue: 0.7 }, // 파란색 텍스트
                fontSize: 9,
                bold: true
              }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      }] : []),
      
      // 📏 컬럼 너비 자동 조정
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 56
          }
        }
      },
      
      // 🧊 헤더 행 고정
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1
            }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('✅ Form 시트 스타일링 완료!');
    
  } catch (error) {
    console.log('❌ Form 시트 스타일링 실패:', error);
  }
}

// 📊 관리자용 마스터 스프레드시트에 데이터 추가
async function addToMasterSheet(programData: WorkoutProgram, userSpreadsheetId: string): Promise<void> {
  try {
    if (!MASTER_SHEET_ID) {
      console.log('⚠️ MASTER_SHEET_ID가 설정되지 않아 마스터 시트 업데이트를 건너뜁니다.');
      return;
    }

    console.log('📊 마스터 스프레드시트 ID:', MASTER_SHEET_ID);
    
    // 마스터 스프레드시트가 존재하는지 확인하고 없으면 생성
    let masterSheetExists = false;
    try {
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: MASTER_SHEET_ID,
        range: 'Master!A1:BD1000'
      });
      masterSheetExists = true;
      
      const hasHeaders = existingData.data.values && existingData.data.values.length > 0;
      const nextRow = hasHeaders ? (existingData.data.values?.length || 0) + 1 : 1;
      
      // 기존 로직 계속 진행
      await updateExistingMasterSheet(programData, userSpreadsheetId, hasHeaders, nextRow);
      
    } catch (error: any) {
      if (error.message?.includes('not found') || error.message?.includes('Requested entity was not found') || error.code === 404) {
        console.log('📊 마스터 스프레드시트가 존재하지 않습니다. 새로 생성합니다...');
        await createNewMasterSheet(programData, userSpreadsheetId);
        return; // 성공적으로 처리했으므로 여기서 종료
      } else {
        console.log('❌ 마스터 시트 확인 중 알 수 없는 오류:', error.message);
        throw error;
      }
    }
    
  } catch (error) {
    console.log('❌ 마스터 시트 업데이트 실패:', (error as any)?.message);
  }
}

// 📊 새로운 마스터 스프레드시트 생성
async function createNewMasterSheet(programData: WorkoutProgram, userSpreadsheetId: string): Promise<void> {
  try {
    console.log('🆕 새로운 마스터 스프레드시트 생성 중...');
    
    // 1. 새 스프레드시트 생성
    const newMasterSheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Sinabro Strength - Master Database'
        },
        sheets: [{
          properties: {
            title: 'Master',
            gridProperties: {
              rowCount: 1000,
              columnCount: 60
            }
          }
        }]
      }
    });
    
    const newMasterId = newMasterSheet.data.spreadsheetId!;
    console.log('🆕 새 마스터 스프레드시트 ID:', newMasterId);
    console.log(`📊 새 마스터 시트 URL: https://docs.google.com/spreadsheets/d/${newMasterId}/edit`);
    
    // 2. 헤더와 첫 번째 데이터 추가
    const { headers, dataRow } = getMasterSheetData(programData, userSpreadsheetId);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: newMasterId,
      range: 'Master!A1:BF2',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, dataRow]
      }
    });
    
    // 3. 스타일링 적용
    await formatMasterSheet(newMasterId);
    
    console.log('✅ 새 마스터 스프레드시트 생성 및 첫 번째 데이터 추가 완료!');
    console.log(`⚠️ 참고: 향후 이 스프레드시트를 계속 사용하려면 MASTER_SHEET_ID 환경변수를 다음으로 설정하세요: ${newMasterId}`);
    
  } catch (error) {
    console.log('❌ 새 마스터 시트 생성 실패:', error);
  }
}

// 📊 기존 마스터 스프레드시트 업데이트
async function updateExistingMasterSheet(programData: WorkoutProgram, userSpreadsheetId: string, hasHeaders: boolean, nextRow: number): Promise<void> {
  const { headers, dataRow } = getMasterSheetData(programData, userSpreadsheetId);
  
  if (!hasHeaders) {
    // 헤더 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId: MASTER_SHEET_ID,
      range: 'Master!A1:BF1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });
    
    // 데이터 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId: MASTER_SHEET_ID,
      range: 'Master!A2:BF2',
      valueInputOption: 'RAW',
      requestBody: {
        values: [dataRow]
      }
    });
  } else {
    // 기존 시트에 데이터 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId: MASTER_SHEET_ID,
      range: `Master!A${nextRow}:BF${nextRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [dataRow]
      }
    });
  }
  
  console.log(`✅ 마스터 시트 행 ${nextRow}에 데이터 추가됨 (총 ${hasHeaders ? nextRow-1 : 1}개 전체 응답)`);
  console.log(`📊 마스터 시트 URL: https://docs.google.com/spreadsheets/d/${MASTER_SHEET_ID}/edit`);
}

// 📊 마스터 시트 데이터 구성
function getMasterSheetData(programData: WorkoutProgram, userSpreadsheetId: string) {
  // 헤더 구성 (58개 필드)
  const headers = [
    'Timestamp', 'Name', 'Email', 'Sex', 'Age', 'Height', 'Weight',
    'Squat1RM', 'Bench1RM', 'Deadlift1RM',
    'Goals', 'Experience', 'DaysPerWeek',
    'Equipment', 'Injuries', 'InjuryDetails',
    'PreferredIntensity', 'VolumePreference', 'SessionDuration', 'WarmupTime', 'RestPreference',
    'TechniqueLevel', 'FormChecking', 'VideoAnalysis', 'CoachingHistory',
    'SleepHours', 'StressLevel', 'JobType', 'RecoveryMethods', 'SupplementUsage', 'DietType',
    'MotivationLevel', 'CompetitiveSpirit', 'TrainingMindset',
    'PreviousPrograms', 'InjuryHistory', 'SportBackground', 'TrainingYears',
    'SpecialNeeds', 'TimeConstraints', 'AccessibilityNeeds', 'PreferredLanguage', 'NotificationPrefs',
    'BodyType', 'Flexibility', 'MobilityIssues',
    'ShortTermGoals', 'LongTermGoals', 'CompetitionPlans', 'SkillPriorities',
    'GymType', 'TrainingPartner', 'HomeGymSetup', 'TravelFrequency', 'WeatherConsiderations', 'SeasonalPreferences',
    // 추가 마스터 전용 필드
    'SpreadsheetURL', 'ProcessedAt'
  ];
  
  // 데이터 구성
  const surveyData = programData.survey_data || {};
  const dataRow = [
    // 기본 설문 데이터 (56개 필드)
    surveyData.timestamp || new Date().toISOString(),
    surveyData.name || '',
    surveyData.email || '',
    surveyData.sex || '',
    surveyData.age || '',
    surveyData.height || '',
    surveyData.weight || '',
    programData.user_maxes.squat,
    programData.user_maxes.bench,
    programData.user_maxes.deadlift,
    surveyData.goal || '',
    surveyData.experience || '',
    surveyData.daysPerWeek || '',
    surveyData.equipment || '',
    surveyData.injuries || '',
    surveyData.injuryDetails || '',
    surveyData.intensityPreference || 'Medium',
    surveyData.volumeTolerance || 'Moderate',
    surveyData.trainingDuration || '90min',
    '15min', '2-3min',
    'Intermediate', 'Self-Check', 'No', 'None',
    surveyData.sleepHours || '7-8hrs',
    surveyData.stressLevel || 'Medium',
    'Office', 'Stretching', 'Basic',
    surveyData.nutrition || 'Balanced',
    surveyData.motivation || 'High',
    'Competitive', 'Focused',
    'None', 'None', 'None', '1-2years',
    'None', 'Flexible', 'None', 'Korean', 'Email',
    'Average', 'Good', 'None',
    'Strength+5%', 'Competition', 'Local Meet', 'Technique',
    surveyData.homeGym === 'yes' ? 'Home' : 'Commercial',
    'Solo',
    surveyData.homeGym || 'None',
    'Rare', 'None', 'Year-round',
    
    // 마스터 전용 추가 필드
    `https://docs.google.com/spreadsheets/d/${userSpreadsheetId}/edit`,
    new Date().toISOString()
  ];
  
  return { headers, dataRow };
}

// 📊 마스터 시트 스타일링
async function formatMasterSheet(masterId: string): Promise<void> {
  try {
    const requests = [
      // 📋 헤더 행 스타일링
      {
        repeatCell: {
          range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 58 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.1, green: 0.1, blue: 0.1 },
              textFormat: { 
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 10, 
                bold: true 
              },
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      
      // 🧊 헤더 행 고정
      {
        updateSheetProperties: {
          properties: {
            sheetId: 0,
            gridProperties: {
              frozenRowCount: 1
            }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: masterId,
      requestBody: { requests }
    });
    
    console.log('✅ 마스터 시트 스타일링 완료!');
    
  } catch (error) {
    console.log('❌ 마스터 시트 스타일링 실패:', error);
  }
}

// 📊 Form 시트 데이터 검증 기능 추가
async function addFormSheetValidation(spreadsheetId: string): Promise<void> {
  try {
    // Form 시트 ID 찾기
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const formSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Form');
    if (!formSheet?.properties?.sheetId) return;
    
    const sheetId = formSheet.properties.sheetId;
    
    const validationRequests = [
      // 📋 성별 검증 (D열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Male' },
                { userEnteredValue: 'Female' },
                { userEnteredValue: 'Other' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 📊 경험 수준 검증 (L열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 11, endColumnIndex: 12 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Beginner' },
                { userEnteredValue: 'Intermediate' },
                { userEnteredValue: 'Advanced' },
                { userEnteredValue: 'Elite' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 🏋️ 주당 훈련일 검증 (M열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 12, endColumnIndex: 13 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '2' },
                { userEnteredValue: '3' },
                { userEnteredValue: '4' },
                { userEnteredValue: '5' },
                { userEnteredValue: '6' },
                { userEnteredValue: '7' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 🎯 목표 우선순위 검증 (K열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 10, endColumnIndex: 11 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Strength' },
                { userEnteredValue: 'Powerlifting Competition' },
                { userEnteredValue: 'Technique Improvement' },
                { userEnteredValue: 'General Fitness' },
                { userEnteredValue: 'Weight Loss' },
                { userEnteredValue: 'Muscle Building' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 🩹 부상 여부 검증 (O열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 14, endColumnIndex: 15 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'None' },
                { userEnteredValue: 'Minor' },
                { userEnteredValue: 'Moderate' },
                { userEnteredValue: 'Severe' },
                { userEnteredValue: 'Recovering' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 💪 강도 선호도 검증 (Q열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 16, endColumnIndex: 17 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Low (60-70%)' },
                { userEnteredValue: 'Medium (70-85%)' },
                { userEnteredValue: 'High (85-95%)' },
                { userEnteredValue: 'Very High (95%+)' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 😴 수면 시간 검증 (Y열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 24, endColumnIndex: 25 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '4-5 hours' },
                { userEnteredValue: '5-6 hours' },
                { userEnteredValue: '6-7 hours' },
                { userEnteredValue: '7-8 hours' },
                { userEnteredValue: '8-9 hours' },
                { userEnteredValue: '9+ hours' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      },
      
      // 😤 스트레스 수준 검증 (Z열)
      {
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 25, endColumnIndex: 26 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Very Low' },
                { userEnteredValue: 'Low' },
                { userEnteredValue: 'Medium' },
                { userEnteredValue: 'High' },
                { userEnteredValue: 'Very High' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: validationRequests }
    });
    
    console.log('✅ Form 시트 데이터 검증 기능 추가 완료!');
    
  } catch (error) {
    console.log('❌ Form 시트 데이터 검증 기능 추가 실패:', error);
  }
}

// 🎨 Form 시트 조건부 포맷팅 추가
async function addFormSheetConditionalFormatting(spreadsheetId: string): Promise<void> {
  try {
    // Form 시트 ID 찾기
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const formSheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.title === 'Form');
    if (!formSheet?.properties?.sheetId) return;
    
    const sheetId = formSheet.properties.sheetId;
    
    const conditionalFormattingRequests = [
      // 🎯 경험 수준에 따른 색상 (L열)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 11, endColumnIndex: 12 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Beginner' }]
              },
              format: {
                backgroundColor: { red: 0.85, green: 1, blue: 0.85 }, // 연한 초록
                textFormat: { foregroundColor: { red: 0, green: 0.7, blue: 0 } }
              }
            }
          },
          index: 0
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 11, endColumnIndex: 12 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Intermediate' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.95, blue: 0.8 }, // 연한 노랑
                textFormat: { foregroundColor: { red: 0.8, green: 0.6, blue: 0 } }
              }
            }
          },
          index: 1
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 11, endColumnIndex: 12 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Advanced' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.85, blue: 0.8 }, // 연한 주황
                textFormat: { foregroundColor: { red: 0.8, green: 0.4, blue: 0 } }
              }
            }
          },
          index: 2
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 11, endColumnIndex: 12 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Elite' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.8, blue: 0.8 }, // 연한 빨강
                textFormat: { foregroundColor: { red: 0.8, green: 0, blue: 0 } }
              }
            }
          },
          index: 3
        }
      },
      
      // 🩹 부상 여부에 따른 색상 (O열)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 14, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'None' }]
              },
              format: {
                backgroundColor: { red: 0.85, green: 1, blue: 0.85 }, // 초록 (안전)
                textFormat: { foregroundColor: { red: 0, green: 0.7, blue: 0 } }
              }
            }
          },
          index: 4
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 14, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Severe' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.7, blue: 0.7 }, // 빨강 (위험)
                textFormat: { foregroundColor: { red: 0.8, green: 0, blue: 0 } }
              }
            }
          },
          index: 5
        }
      },
      
      // 💪 1RM 범위에 따른 색상 (H, I, J열)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 10 }],
            gradientRule: {
              minpoint: {
                color: { red: 1, green: 0.9, blue: 0.9 }, // 연한 빨강 (낮은 값)
                type: 'NUMBER',
                value: '40'
              },
              midpoint: {
                color: { red: 1, green: 1, blue: 0.8 }, // 노랑 (중간 값)
                type: 'NUMBER',
                value: '120'
              },
              maxpoint: {
                color: { red: 0.8, green: 1, blue: 0.8 }, // 연한 초록 (높은 값)
                type: 'NUMBER',
                value: '200'
              }
            }
          },
          index: 6
        }
      },
      
      // 😤 스트레스 수준에 따른 색상 (Z열)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 25, endColumnIndex: 26 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Very High' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.6, blue: 0.6 }, // 빨강 (높은 스트레스)
                textFormat: { foregroundColor: { red: 0.8, green: 0, blue: 0 } }
              }
            }
          },
          index: 7
        }
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 25, endColumnIndex: 26 }],
            booleanRule: {
              condition: {
                type: 'TEXT_EQ',
                values: [{ userEnteredValue: 'Very Low' }]
              },
              format: {
                backgroundColor: { red: 0.8, green: 1, blue: 0.8 }, // 초록 (낮은 스트레스)
                textFormat: { foregroundColor: { red: 0, green: 0.7, blue: 0 } }
              }
            }
          },
          index: 8
        }
      },
      
      // 🏋️ 주당 훈련일에 따른 색상 (M열)
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 12, endColumnIndex: 13 }],
            gradientRule: {
              minpoint: {
                color: { red: 1, green: 0.9, blue: 0.9 }, // 연한 빨강 (낮은 빈도)
                type: 'NUMBER',
                value: '2'
              },
              maxpoint: {
                color: { red: 0.8, green: 1, blue: 0.8 }, // 연한 초록 (높은 빈도)
                type: 'NUMBER',
                value: '7'
              }
            }
          },
          index: 9
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: conditionalFormattingRequests }
    });
    
    console.log('✅ Form 시트 조건부 포맷팅 추가 완료!');
    
  } catch (error) {
    console.log('❌ Form 시트 조건부 포맷팅 추가 실패:', error);
  }
}

// 🚀 시트 파이프라인(불변, 고성능) - 1-3회 batchUpdate 폴리싱
async function applyHighPerformancePipeline(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  const { BatchOptimizer } = await import('./batchOptimizer');
  const optimizer = new BatchOptimizer(spreadsheetId, sheets);
  
  // 📋 1차: Summary 탭 + Meta 탭 생성 (시트 구조)
  console.log('📋 1차: 시트 구조 생성...');
  
  // Summary 시트 추가
  optimizer.addSheetOperation({
    addSheet: {
      properties: {
        title: '📈 Summary',
        sheetType: 'GRID',
        gridProperties: { rowCount: 100, columnCount: 15 }
      }
    }
  }, 1);
  
  // Meta 시트 추가  
  optimizer.addSheetOperation({
    addSheet: {
      properties: {
        title: '📋 Meta',
        sheetType: 'GRID', 
        gridProperties: { rowCount: 50, columnCount: 5 }
      }
    }
  }, 1);
  
  await optimizer.flush(); // 1차 플러시
  
  // 시트 ID 획득
  const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
  const summarySheetId = sheetInfo.data.sheets?.find(s => s.properties?.title === '📈 Summary')?.properties?.sheetId!;
  const metaSheetId = sheetInfo.data.sheets?.find(s => s.properties?.title === '📋 Meta')?.properties?.sheetId!;
  
  // 📊 2차: 데이터 입력 (병렬 처리)
  console.log('📊 2차: 데이터 입력...');
  
  // Summary 데이터 생성 (피벗 + 라인/스택 차트용)
  const summaryData = createSummaryData(programData);
  const pivotData = createPivotData(programData);
  
  optimizer.addDataOperation(`'📈 Summary'!A1`, summaryData, 2);
  optimizer.addDataOperation(`'📈 Summary'!H1`, pivotData, 2);
  
  // Meta 데이터
  const metaData = createMetaData(programData);
  optimizer.addDataOperation(`'📋 Meta'!A1`, metaData, 2);
  
  await optimizer.flush(); // 2차 플러시
  
  // 🎨 3차: 폴리싱 (헤더/밴딩/검증/조건부서식/보호)
  console.log('🎨 3차: 폴리싱...');
  
  // Summary 차트 생성 (라인 + 스택)
  addSummaryCharts(optimizer, summarySheetId, summaryData.length);
  
  // Meta 스타일링
  addMetaFormatting(optimizer, metaSheetId);
  
  // 보호 설정 (Meta 탭 읽기 전용)
  optimizer.addProtectionOperation({
    addProtectedRange: {
      protectedRange: {
        range: { sheetId: metaSheetId },
        description: 'Meta 정보 보호',
        warningOnly: true
      }
    }
  }, 1);
  
  await optimizer.flush(); // 3차 플러시
  
  console.log('✅ 시트 파이프라인(불변, 고성능) 완료!');
}

// 📊 Summary 데이터 생성 (라인 차트용)
function createSummaryData(programData: WorkoutProgram): any[][] {
  const summaryData = [
    ['주차', 'Squat 세트', 'Bench 세트', 'Deadlift 세트', '총 볼륨', '평균 강도'],
    ...Array.from({ length: Math.min(programData.training_weeks?.length || 0, 18) }, (_, i) => {
      const week = programData.training_weeks?.[i];
      if (!week) return [`Week ${i + 1}`, 0, 0, 0, 0, 0];
      
      let sqSets = 0, bpSets = 0, dlSets = 0, totalIntensity = 0, exerciseCount = 0;
      week.workouts?.forEach(workout => {
        workout.exercises?.forEach(ex => {
          const sets = parseInt(ex.sets) || 0;
          const intensity = parseInt(ex.weight_percent) || 70;
          
          if (ex.exercise.toLowerCase().includes('squat')) sqSets += sets;
          else if (ex.exercise.toLowerCase().includes('bench')) bpSets += sets;
          else if (ex.exercise.toLowerCase().includes('deadlift')) dlSets += sets;
          
          totalIntensity += intensity;
          exerciseCount++;
        });
      });
      
      const avgIntensity = exerciseCount > 0 ? Math.round(totalIntensity / exerciseCount) : 70;
      return [`Week ${i + 1}`, sqSets, bpSets, dlSets, sqSets + bpSets + dlSets, avgIntensity];
    })
  ];
  
  return summaryData;
}

// 📊 피벗 데이터 생성 (스택 차트용)
function createPivotData(programData: WorkoutProgram): any[][] {
  const pivotData = [
    ['운동별 총 볼륨', ''],
    ['', ''],
    ['운동', '총 세트'],
    ['Squat', 0],
    ['Bench Press', 0], 
    ['Deadlift', 0],
    ['', ''],
    ['주차별 분포', ''],
    ...Array.from({ length: 4 }, (_, i) => [`Block ${i + 1}`, 0])
  ];
  
  // 운동별 총 볼륨 계산
  let totalSq = 0, totalBp = 0, totalDl = 0;
  const blockVolumes = [0, 0, 0, 0];
  
  programData.training_weeks?.forEach((week, weekIdx) => {
    const blockIdx = Math.floor(weekIdx / 4);
    let weekVolume = 0;
    
    week.workouts?.forEach(workout => {
      workout.exercises?.forEach(ex => {
        const sets = parseInt(ex.sets) || 0;
        if (ex.exercise.toLowerCase().includes('squat')) totalSq += sets;
        else if (ex.exercise.toLowerCase().includes('bench')) totalBp += sets;
        else if (ex.exercise.toLowerCase().includes('deadlift')) totalDl += sets;
        weekVolume += sets;
      });
    });
    
    if (blockIdx < 4) blockVolumes[blockIdx] += weekVolume;
  });
  
  pivotData[3][1] = totalSq;
  pivotData[4][1] = totalBp;
  pivotData[5][1] = totalDl;
  
  blockVolumes.forEach((vol, i) => {
    if (pivotData[8 + i]) pivotData[8 + i][1] = vol;
  });
  
  return pivotData;
}

// 📋 Meta 데이터 생성
function createMetaData(programData: WorkoutProgram): any[][] {
  const metaData = [
    ['🔧 SYSTEM METADATA', '', '', '', ''],
    ['', '', '', '', ''],
    ['Template Version', programData.meta_data?.templateVersion || 'v1.0', '', '', ''],
    ['Engine Version', programData.meta_data?.engineVersion || 'rules-v3', '', '', ''],
    ['Survey Kind', programData.meta_data?.surveyKind || 'powerlifting-survey', '', '', ''],
    ['Survey Version', programData.meta_data?.surveyVersion || 'v2.0', '', '', ''],
    ['Canonical Hash', programData.meta_data?.canonicalHash || 'N/A', '', '', ''],
    ['Created At', programData.meta_data?.createdAt || new Date().toISOString(), '', '', ''],
    ['Processing Time', programData.meta_data?.processingTimeMs ? `${programData.meta_data.processingTimeMs}ms` : 'N/A', '', '', ''],
    ['', '', '', '', ''],
    ['⚠️ WARNINGS & CORRECTIONS', '', '', '', ''],
    ['', '', '', '', '']
  ];
  
  // Warnings 추가
  if (programData.meta_data?.warnings && programData.meta_data.warnings.length > 0) {
    metaData.push(['Type', 'Rule', 'Message', 'Original', 'Corrected']);
    programData.meta_data.warnings.forEach(warning => {
      metaData.push([
        warning.type,
        warning.rule,
        warning.message,
        JSON.stringify(warning.original),
        JSON.stringify(warning.corrected)
      ]);
    });
  } else {
    metaData.push(['No warnings', '', '', '', '']);
  }
  
  // 사용자 프로필 추가
  metaData.push(['', '', '', '', '']);
  metaData.push(['👤 USER PROFILE', '', '', '', '']);
  metaData.push(['Name', programData.survey_data?.name || 'Anonymous', '', '', '']);
  metaData.push(['Email', programData.survey_data?.email || 'N/A', '', '', '']);
  metaData.push(['Age', programData.survey_data?.age?.toString() || 'N/A', '', '', '']);
  metaData.push(['Experience', programData.survey_data?.experience || 'N/A', '', '', '']);
  metaData.push(['Goal', programData.survey_data?.goal || 'N/A', '', '', '']);
  metaData.push(['Days Per Week', programData.survey_data?.daysPerWeek?.toString() || 'N/A', '', '', '']);
  
  return metaData;
}

// 📈 Summary 차트 추가 (라인 + 스택)
function addSummaryCharts(optimizer: any, summarySheetId: number, dataLength: number): void {
  // 라인 차트 (볼륨 추이)
  optimizer.addChartOperation({
    addChart: {
      chart: {
        spec: {
          title: '주차별 훈련 볼륨 추이',
          basicChart: {
            chartType: 'LINE',
            legendPosition: 'RIGHT_LEGEND',
            axis: [
              { position: 'BOTTOM_AXIS', title: '주차' },
              { position: 'LEFT_AXIS', title: '세트 수' }
            ],
            domains: [{
              domain: {
                sourceRange: {
                  sources: [{
                    sheetId: summarySheetId,
                    startRowIndex: 0,
                    endRowIndex: dataLength,
                    startColumnIndex: 0,
                    endColumnIndex: 1
                  }]
                }
              }
            }],
            series: [
              {
                series: {
                  sourceRange: {
                    sources: [{
                      sheetId: summarySheetId,
                      startRowIndex: 0,
                      endRowIndex: dataLength,
                      startColumnIndex: 1,
                      endColumnIndex: 2
                    }]
                  }
                },
                targetAxis: 'LEFT_AXIS'
              },
              {
                series: {
                  sourceRange: {
                    sources: [{
                      sheetId: summarySheetId,
                      startRowIndex: 0,
                      endRowIndex: dataLength,
                      startColumnIndex: 2,
                      endColumnIndex: 3
                    }]
                  }
                },
                targetAxis: 'LEFT_AXIS'
              },
              {
                series: {
                  sourceRange: {
                    sources: [{
                      sheetId: summarySheetId,
                      startRowIndex: 0,
                      endRowIndex: dataLength,
                      startColumnIndex: 3,
                      endColumnIndex: 4
                    }]
                  }
                },
                targetAxis: 'LEFT_AXIS'
              }
            ]
          }
        },
        position: {
          overlayPosition: {
            anchorCell: { sheetId: summarySheetId, rowIndex: 1, columnIndex: 7 },
            offsetXPixels: 10,
            offsetYPixels: 10,
            widthPixels: 600,
            heightPixels: 300
          }
        }
      }
    }
  }, 3);
  
  // 스택 차트 (피벗 데이터 기반)
  optimizer.addChartOperation({
    addChart: {
      chart: {
        spec: {
          title: '운동별 총 볼륨 분포',
          basicChart: {
            chartType: 'COLUMN',
            stackedType: 'STACKED',
            legendPosition: 'BOTTOM_LEGEND'
          }
        },
        position: {
          overlayPosition: {
            anchorCell: { sheetId: summarySheetId, rowIndex: 20, columnIndex: 7 },
            offsetXPixels: 10,
            offsetYPixels: 10,
            widthPixels: 400,
            heightPixels: 250
          }
        }
      }
    }
  }, 3);
}

// 🎨 Meta 포맷팅 추가
function addMetaFormatting(optimizer: any, metaSheetId: number): void {
  // 헤더 스타일
  optimizer.addFormatOperation({
    repeatCell: {
      range: { sheetId: metaSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 5 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.2, green: 0.3, blue: 0.8 },
          textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
        }
      },
      fields: 'userEnteredFormat'
    }
  }, 3);
  
  // Warnings 헤더 스타일
  optimizer.addFormatOperation({
    repeatCell: {
      range: { sheetId: metaSheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 0, endColumnIndex: 5 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.8, green: 0.3, blue: 0.2 },
          textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
        }
      },
      fields: 'userEnteredFormat'
    }
  }, 3);
}

// 📈 Summary 탭 차트 생성 (피벗&라인/스택 차트) - LEGACY
async function createSummarySheet(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  try {
    console.log('📈 Summary 탭 차트 생성 중...');
    
    // Summary 시트 추가
    const addSheetRequest = {
      addSheet: {
        properties: {
          title: '📈 Summary',
          sheetType: 'GRID',
          gridProperties: { rowCount: 100, columnCount: 10 }
        }
      }
    };
    
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [addSheetRequest] }
    });
    
    const summarySheetId = addSheetResponse.data.replies![0].addSheet!.properties!.sheetId!;
    console.log('✅ Summary 시트 생성 완료, ID:', summarySheetId);
    
    // 주차별 볼륨 데이터 생성
    const summaryData = [
      ['주차', 'Squat 세트', 'Bench 세트', 'Deadlift 세트', '총 볼륨'],
      ...Array.from({ length: Math.min(programData.training_weeks?.length || 0, 18) }, (_, i) => {
        const week = programData.training_weeks?.[i];
        if (!week) return [`Week ${i + 1}`, 0, 0, 0, 0];
        
        let sqSets = 0, bpSets = 0, dlSets = 0;
        week.workouts?.forEach(workout => {
          workout.exercises?.forEach(ex => {
            const sets = parseInt(ex.sets) || 0;
            if (ex.exercise.toLowerCase().includes('squat')) sqSets += sets;
            else if (ex.exercise.toLowerCase().includes('bench')) bpSets += sets;
            else if (ex.exercise.toLowerCase().includes('deadlift')) dlSets += sets;
          });
        });
        
        return [`Week ${i + 1}`, sqSets, bpSets, dlSets, sqSets + bpSets + dlSets];
      })
    ];
    
    // 데이터 입력
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'📈 Summary'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: summaryData }
    });
    
    // 차트 생성 (라인 차트)
    const chartRequest = {
      addChart: {
        chart: {
          spec: {
            title: '주차별 훈련 볼륨 추이',
            basicChart: {
              chartType: 'LINE',
              legendPosition: 'RIGHT_LEGEND',
              axis: [
                {
                  position: 'BOTTOM_AXIS',
                  title: '주차'
                },
                {
                  position: 'LEFT_AXIS', 
                  title: '세트 수'
                }
              ],
              domains: [{
                domain: {
                  sourceRange: {
                    sources: [{
                      sheetId: summarySheetId,
                      startRowIndex: 0,
                      endRowIndex: summaryData.length,
                      startColumnIndex: 0,
                      endColumnIndex: 1
                    }]
                  }
                }
              }],
              series: [
                {
                  series: {
                    sourceRange: {
                      sources: [{
                        sheetId: summarySheetId,
                        startRowIndex: 0,
                        endRowIndex: summaryData.length,
                        startColumnIndex: 1,
                        endColumnIndex: 2
                      }]
                    }
                  },
                  targetAxis: 'LEFT_AXIS'
                },
                {
                  series: {
                    sourceRange: {
                      sources: [{
                        sheetId: summarySheetId,
                        startRowIndex: 0,
                        endRowIndex: summaryData.length,
                        startColumnIndex: 2,
                        endColumnIndex: 3
                      }]
                    }
                  },
                  targetAxis: 'LEFT_AXIS'
                },
                {
                  series: {
                    sourceRange: {
                      sources: [{
                        sheetId: summarySheetId,
                        startRowIndex: 0,
                        endRowIndex: summaryData.length,
                        startColumnIndex: 3,
                        endColumnIndex: 4
                      }]
                    }
                  },
                  targetAxis: 'LEFT_AXIS'
                }
              ]
            }
          },
          position: {
            overlayPosition: {
              anchorCell: { sheetId: summarySheetId, rowIndex: 2, columnIndex: 6 },
              offsetXPixels: 10,
              offsetYPixels: 10,
              widthPixels: 600,
              heightPixels: 400
            }
          }
        }
      }
    };
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [chartRequest] }
    });
    
    console.log('✅ Summary 차트 생성 완료!');
    
  } catch (error) {
    console.log('❌ Summary 탭 생성 실패:', error);
  }
}

// 📋 Meta 탭 생성 (TemplateVersion, EngineVersion, SurveyKind, SurveyVersion, CanonicalHash, Warnings)
async function createMetaSheet(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  try {
    console.log('📋 Meta 탭 생성 중...');
    
    // Meta 시트 추가
    const addSheetRequest = {
      addSheet: {
        properties: {
          title: '📋 Meta',
          sheetType: 'GRID',
          gridProperties: { rowCount: 50, columnCount: 5 }
        }
      }
    };
    
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [addSheetRequest] }
    });
    
    const metaSheetId = addSheetResponse.data.replies![0].addSheet!.properties!.sheetId!;
    console.log('✅ Meta 시트 생성 완료, ID:', metaSheetId);
    
    // Meta 데이터 구성
    const metaData = [
      ['🔧 SYSTEM METADATA', '', '', '', ''],
      ['', '', '', '', ''],
      ['Template Version', programData.meta_data?.templateVersion || 'v1.0', '', '', ''],
      ['Engine Version', programData.meta_data?.engineVersion || 'rules-v3', '', '', ''],
      ['Survey Kind', programData.meta_data?.surveyKind || 'powerlifting-survey', '', '', ''],
      ['Survey Version', programData.meta_data?.surveyVersion || 'v2.0', '', '', ''],
      ['Canonical Hash', programData.meta_data?.canonicalHash || 'N/A', '', '', ''],
      ['Created At', programData.meta_data?.createdAt || new Date().toISOString(), '', '', ''],
      ['Processing Time', programData.meta_data?.processingTimeMs ? `${programData.meta_data.processingTimeMs}ms` : 'N/A', '', '', ''],
      ['', '', '', '', ''],
      ['⚠️ WARNINGS & CORRECTIONS', '', '', '', ''],
      ['', '', '', '', '']
    ];
    
    // Warnings 추가
    if (programData.meta_data?.warnings && programData.meta_data.warnings.length > 0) {
      metaData.push(['Type', 'Rule', 'Message', 'Original', 'Corrected']);
      programData.meta_data.warnings.forEach(warning => {
        metaData.push([
          warning.type,
          warning.rule,
          warning.message,
          JSON.stringify(warning.original),
          JSON.stringify(warning.corrected)
        ]);
      });
    } else {
      metaData.push(['No warnings', '', '', '', '']);
    }
    
    // 설문 요약 추가
    metaData.push(['', '', '', '', '']);
    metaData.push(['👤 USER PROFILE', '', '', '', '']);
    metaData.push(['Name', programData.survey_data?.name || 'Anonymous', '', '', '']);
    metaData.push(['Email', programData.survey_data?.email || 'N/A', '', '', '']);
    metaData.push(['Age', programData.survey_data?.age?.toString() || 'N/A', '', '', '']);
    metaData.push(['Experience', programData.survey_data?.experience || 'N/A', '', '', '']);
    metaData.push(['Goal', programData.survey_data?.goal || 'N/A', '', '', '']);
    metaData.push(['Days Per Week', programData.survey_data?.daysPerWeek?.toString() || 'N/A', '', '', '']);
    
    // 데이터 입력
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'📋 Meta'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: metaData }
    });
    
    // Meta 시트 스타일링
    const formatRequests = [
      // 헤더 스타일
      {
        repeatCell: {
          range: { sheetId: metaSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 5 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.3, blue: 0.8 },
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
            }
          },
          fields: 'userEnteredFormat'
        }
      },
      // Warnings 헤더 스타일
      {
        repeatCell: {
          range: { sheetId: metaSheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 0, endColumnIndex: 5 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.8, green: 0.3, blue: 0.2 },
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
            }
          },
          fields: 'userEnteredFormat'
        }
      }
    ];
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: formatRequests }
    });
    
    console.log('✅ Meta 탭 생성 및 스타일링 완료!');
    
  } catch (error) {
    console.log('❌ Meta 탭 생성 실패:', error);
  }
}

// 🔐 권한: 제출자 이메일 read 권한(실패해도 흐름 유지)
async function applyOptimalPermissions(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  let permissionGranted = false;
  
  // 1) 제출자 이메일에 read 권한 시도 (실패해도 흐름 유지)
  if (programData.survey_data?.email) {
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        supportsAllDrives: true, // 🔒 Shared Drive 강제
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: programData.survey_data.email
        }
      });
      console.log(`✅ 제출자 이메일 read 권한: ${programData.survey_data.email}`);
      permissionGranted = true;
    } catch (emailPermError) {
      console.log('⚠️ 제출자 이메일 권한 실패 (흐름 유지):', (emailPermError as any)?.message);
    }
  }
  
  // 2) 폴백: 공개 권한 (실패해도 흐름 유지)
  if (!permissionGranted) {
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        supportsAllDrives: true, // 🔒 Shared Drive 강제
        requestBody: {
          role: 'writer',
          type: 'anyone'
        }
      });
      console.log('✅ 공개 권한 설정 (폴백)');
    } catch (permError) {
      console.log('⚠️ 모든 권한 설정 실패 (흐름 유지):', (permError as any)?.message);
      // 실패해도 흐름 유지 - 시트는 생성됨
    }
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