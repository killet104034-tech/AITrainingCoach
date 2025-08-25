import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Google Sheets 인증 설정
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export interface WorkoutProgramData {
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

export async function createWorkoutSpreadsheet(programData: WorkoutProgramData, userEmail?: string): Promise<string> {
  try {
    console.log('구글 스프레드시트 생성 시작...');
    
    // 새 스프레드시트 생성
    const doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(
      serviceAccountAuth,
      { 
        title: `${programData.program_title} - ${new Date().toLocaleDateString('ko-KR')}` 
      }
    );

    console.log('스프레드시트 생성 완료:', doc.spreadsheetId);

    // 첫 번째 시트 삭제하고 새로 시작
    const sheets = doc.sheetsByIndex;
    if (sheets.length > 0) {
      await sheets[0].delete();
    }

    // 1. 프로그램 정보 시트 추가
    const infoSheet = await doc.addSheet({
      title: '프로그램 정보',
      headerValues: ['항목', '값'],
    });

    // 프로그램 기본 정보 추가
    await infoSheet.addRows([
      { '항목': '프로그램명', '값': programData.program_title },
      { '항목': '생성일', '값': new Date().toLocaleDateString('ko-KR') },
      { '항목': '', '값': '' },
      { '항목': '현재 최대중량 (KG)', '값': '' },
      { '항목': 'Squat', '값': programData.user_maxes.squat },
      { '항목': 'Bench Press', '값': programData.user_maxes.bench },
      { '항목': 'Deadlift', '값': programData.user_maxes.deadlift },
      { '항목': '', '값': '' },
      { '항목': 'RPE 평가 기준', '값': '' },
      { '항목': '10', '값': '최대 노력 - 더 이상 불가능' },
      { '항목': '9.5', '값': '아마도 한 번 더 가능' },
      { '항목': '9', '값': '확실히 한 번 더 가능' },
      { '항목': '8.5', '값': '아마도 두 번 더 가능' },
      { '항목': '8', '값': '확실히 두 번 더 가능' },
      { '항목': '7.5', '값': '아마도 세 번 더 가능' },
      { '항목': '7', '값': '확실히 세 번 더 가능' },
    ]);

    // 2. 각 주차별 훈련 시트 생성
    for (const week of programData.training_weeks) {
      const sheetTitle = `Week ${week.week} - ${week.focus}`;
      
      // 시트 헤더 설정
      const weekSheet = await doc.addSheet({
        title: sheetTitle,
        headerValues: [
          '일차', '운동명', '목표 세트', '목표 렙', '목표 중량(%)', 
          '실제 세트', '실제 렙', '실제 중량(kg)', 'RPE', '볼륨(kg)', '메모'
        ],
      });

      // 운동 데이터 추가
      const rows = [];
      for (const workout of week.workouts) {
        // 일차 헤더 추가
        rows.push({
          '일차': `Day ${workout.day}`,
          '운동명': workout.workout_name,
          '목표 세트': '',
          '목표 렙': '',
          '목표 중량(%)': '',
          '실제 세트': '',
          '실제 렙': '',
          '실제 중량(kg)': '',
          'RPE': '',
          '볼륨(kg)': '',
          '메모': ''
        });

        // 각 운동 추가
        for (const exercise of workout.exercises) {
          rows.push({
            '일차': '',
            '운동명': exercise.exercise,
            '목표 세트': exercise.sets,
            '목표 렙': exercise.reps,
            '목표 중량(%)': exercise.weight_percent,
            '실제 세트': '',
            '실제 렙': '',
            '실제 중량(kg)': '',
            'RPE': exercise.rpe || '',
            '볼륨(kg)': '',
            '메모': exercise.notes || ''
          });
        }

        // 공백 행 추가
        rows.push({
          '일차': '',
          '운동명': '',
          '목표 세트': '',
          '목표 렙': '',
          '목표 중량(%)': '',
          '실제 세트': '',
          '실제 렙': '',
          '실제 중량(kg)': '',
          'RPE': '',
          '볼륨(kg)': '',
          '메모': ''
        });
      }

      await weekSheet.addRows(rows);
    }

    // 3. 진행 상황 추적 시트 생성
    const progressSheet = await doc.addSheet({
      title: '진행상황 추적',
      headerValues: [
        '날짜', '운동명', '최고 중량(kg)', '예상 1RM', '총 볼륨(kg)', '메모'
      ],
    });

    // 예시 데이터 추가
    await progressSheet.addRows([
      {
        '날짜': new Date().toLocaleDateString('ko-KR'),
        '운동명': 'Squat',
        '최고 중량(kg)': programData.user_maxes.squat,
        '예상 1RM': programData.user_maxes.squat,
        '총 볼륨(kg)': '',
        '메모': '시작 중량'
      },
      {
        '날짜': new Date().toLocaleDateString('ko-KR'),
        '운동명': 'Bench Press',
        '최고 중량(kg)': programData.user_maxes.bench,
        '예상 1RM': programData.user_maxes.bench,
        '총 볼륨(kg)': '',
        '메모': '시작 중량'
      },
      {
        '날짜': new Date().toLocaleDateString('ko-KR'),
        '운동명': 'Deadlift',
        '최고 중량(kg)': programData.user_maxes.deadlift,
        '예상 1RM': programData.user_maxes.deadlift,
        '총 볼륨(kg)': '',
        '메모': '시작 중량'
      }
    ]);

    // 스프레드시트를 공개로 설정 (편집 가능)
    await doc.updateProperties({
      title: `${programData.program_title} - ${new Date().toLocaleDateString('ko-KR')}`
    });

    // 사용자 이메일이 있으면 공유
    if (userEmail) {
      try {
        await doc.share(userEmail, {
          role: 'writer'
        });
        console.log(`스프레드시트를 ${userEmail}과 공유 완료`);
      } catch (shareError) {
        console.log('이메일 공유 실패, 링크로 공유:', shareError);
      }
    }

    // 공개 링크 반환
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${doc.spreadsheetId}/edit#gid=0`;
    console.log('스프레드시트 URL:', spreadsheetUrl);
    
    return spreadsheetUrl;

  } catch (error) {
    console.error('구글 스프레드시트 생성 실패:', error);
    throw new Error('구글 스프레드시트 생성에 실패했습니다.');
  }
}