// 💾 Persist: Google Drive 복사 및 스프레드시트 생성
import { sheets } from '../google';
import type { WorkoutProgram } from './generate';
import type { UserProfile } from './ingest';

export interface PersistResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  driveFileId: string;
  sheetStructure: SheetStructure;
}

export interface SheetStructure {
  formSheet: SheetInfo;
  programSheet: SheetInfo;
  summarySheet?: SheetInfo;
}

export interface SheetInfo {
  sheetId: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

// 📂 Google Drive 복사 및 스프레드시트 생성
export async function persistToGoogleSheets(
  program: WorkoutProgram,
  userProfile: UserProfile,
  normalizedData: any
): Promise<PersistResult> {
  console.log('💾 Persist 단계 시작: Google Sheets 생성...');
  
  try {
    // 1. 새 스프레드시트 생성
    const spreadsheetId = await createNewSpreadsheet(program.title);
    
    // 2. Form 시트 생성 및 데이터 입력
    const formSheet = await createFormSheet(spreadsheetId, normalizedData);
    
    // 3. Program 시트 생성 및 데이터 입력
    const programSheet = await createProgramSheet(spreadsheetId, program);
    
    // 4. 스프레드시트 URL 생성
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`;
    
    console.log('✅ Persist 완료: Google Sheets 생성 성공');
    
    return {
      spreadsheetId,
      spreadsheetUrl,
      driveFileId: spreadsheetId, // Google Sheets의 경우 같은 ID
      sheetStructure: {
        formSheet,
        programSheet
      }
    };
    
  } catch (error) {
    console.log('❌ Persist 실패:', error);
    throw error;
  }
}

// 📊 새 스프레드시트 생성
async function createNewSpreadsheet(title: string): Promise<string> {
  try {
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${title} - ${new Date().toLocaleDateString('ko-KR')}`
        },
        sheets: [
          {
            properties: {
              title: 'Form',
              gridProperties: {
                rowCount: 1000,
                columnCount: 60
              }
            }
          }
        ]
      }
    });
    
    const spreadsheetId = response.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('스프레드시트 ID를 가져올 수 없습니다');
    }
    
    console.log(`📊 스프레드시트 생성 완료: ${spreadsheetId}`);
    return spreadsheetId;
    
  } catch (error) {
    console.log('스프레드시트 생성 실패:', error);
    throw error;
  }
}

// 📝 Form 시트 생성
async function createFormSheet(spreadsheetId: string, data: any): Promise<SheetInfo> {
  try {
    // Form 시트 헤더 정의
    const headers = [
      'Submit Date', 'Name', 'Email', 'Age', 'Gender', 'Weight', 'Height', 'Experience Years',
      'Squat Max', 'Bench Max', 'Deadlift Max', 'Experience Level', 'Days Per Week', 'Primary Goal',
      'Injury History', 'Equipment', 'Time Available', 'Goal Priority', 'Sleep Hours', 'Stress Level',
      'Intensity Preference', 'Competition Experience', 'Previous Programs', 'Mobility Issues',
      'Nutrition Focus', 'Supplement Usage', 'Recovery Methods', 'Training Location',
      'Training Partner', 'Preferred Schedule', 'Budget Constraints', 'Long Term Goals',
      'Motivation Level', 'Coaching History', 'Technique Focus', 'Weakness Areas',
      'Strength Areas', 'Mental Approach', 'Lifestyle Factors', 'Health Conditions',
      'Medications', 'Exercise Restrictions', 'Performance Metrics', 'Progress Tracking',
      'Success Criteria', 'Timeline Flexibility', 'Program Modifications', 'Support System',
      'Communication Preference', 'Feedback Style', 'Learning Style', 'Goal Importance',
      'Commitment Level', 'Challenge Preference', 'Risk Tolerance', 'Innovation Openness'
    ];
    
    // 데이터 행 생성
    const dataRow = [
      data.submittedAt || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.age || '',
      data.gender || '',
      data.weight || '',
      data.height || '',
      data.experienceYears || '',
      data.squatMax || '',
      data.benchMax || '',
      data.deadliftMax || '',
      data.experienceLevel || '',
      data.daysPerWeek || '',
      data.primaryGoal || '',
      data.injuryHistory || '',
      data.equipment || '',
      data.timeAvailable || '',
      data.goalPriority || '',
      data.sleepHours || '',
      data.stressLevel || '',
      data.intensityPreference || '',
      // 나머지 필드들도 추가 (기본값 또는 실제 데이터)
      ...Array(35).fill('') // 빈 값으로 채움
    ];
    
    // 데이터 입력
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Form!A1:BD2`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, dataRow]
      }
    });
    
    console.log('📝 Form 시트 데이터 입력 완료');
    
    return {
      sheetId: 0, // 기본 시트 ID
      title: 'Form',
      rowCount: 2,
      columnCount: 56
    };
    
  } catch (error) {
    console.log('Form 시트 생성 실패:', error);
    throw error;
  }
}

// 💪 Program 시트 생성
async function createProgramSheet(spreadsheetId: string, program: WorkoutProgram): Promise<SheetInfo> {
  try {
    // Program 시트 추가
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
    
    // Program 시트 헤더
    const headers = [
      'Week', 'Block', 'Day', 'Exercise', 'Sets', 'Reps', 'Weight(%)', 'RPE', 
      'Rest(min)', 'Notes', 'Squat Freq', 'Bench Freq', 'Deadlift Freq', 'Volume Index', 'Intensity Avg'
    ];
    
    // 프로그램 데이터를 행으로 변환
    const programRows: any[][] = [headers];
    
    program.training_blocks.forEach((block, blockIndex) => {
      const blockNum = blockIndex + 1;
      
      block.weeks?.forEach((week, weekIndex) => {
        const weekNum = weekIndex + 1;
        
        week.days?.forEach((day, dayIndex) => {
          const dayNum = dayIndex + 1;
          
          day.exercises?.forEach((exercise, exerciseIndex) => {
            const row = [
              weekNum,
              `Block ${blockNum}`,
              `Day ${dayNum}`,
              exercise.name || '',
              exercise.sets || '',
              exercise.reps || '',
              exercise.weight || '',
              exercise.rpe || '',
              exercise.rest || '',
              exercise.notes || '',
              '', '', '', '', '' // 통계 필드들
            ];
            
            programRows.push(row);
          });
        });
      });
    });
    
    // 데이터 입력
    if (programRows.length > 1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Program!A1:O${programRows.length}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: programRows
        }
      });
    }
    
    console.log(`💪 Program 시트 데이터 입력 완료 (${programRows.length-1}개 운동)`);
    
    return {
      sheetId: 1, // 두 번째 시트
      title: 'Program',
      rowCount: programRows.length,
      columnCount: 15
    };
    
  } catch (error) {
    console.log('Program 시트 생성 실패:', error);
    throw error;
  }
}