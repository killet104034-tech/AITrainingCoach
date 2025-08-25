import { google } from 'googleapis';

// Google Sheets 인증 설정
// 더 넓은 권한으로 시도
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

export async function createWorkoutSheet(programData: WorkoutProgram): Promise<string> {
  try {
    console.log('구글 스프레드시트 생성 시작...');
    console.log('서비스 계정:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

    // 인증 테스트
    const authClient = await auth.getClient();
    console.log('인증 성공!');

    // 1. 새 스프레드시트 생성
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${programData.program_title} - ${new Date().toLocaleDateString('ko-KR')}`
        },
        sheets: [
          {
            properties: {
              title: '프로그램 정보',
              gridProperties: {
                rowCount: 50,
                columnCount: 10
              }
            }
          }
        ]
      }
    });

    const spreadsheetId = createResponse.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('스프레드시트 ID를 받을 수 없습니다.');
    }

    console.log('스프레드시트 생성 완료:', spreadsheetId);

    // 2. 프로그램 정보 시트에 데이터 추가
    const infoData = [
      ['항목', '값'],
      ['프로그램명', programData.program_title],
      ['생성일', new Date().toLocaleDateString('ko-KR')],
      ['', ''],
      ['현재 최대중량 (KG)', ''],
      ['Squat', programData.user_maxes.squat],
      ['Bench Press', programData.user_maxes.bench],
      ['Deadlift', programData.user_maxes.deadlift],
      ['', ''],
      ['RPE 평가 기준', ''],
      ['10', '최대 노력 - 더 이상 불가능'],
      ['9.5', '아마도 한 번 더 가능'],
      ['9', '확실히 한 번 더 가능'],
      ['8.5', '아마도 두 번 더 가능'],
      ['8', '확실히 두 번 더 가능'],
      ['7.5', '아마도 세 번 더 가능'],
      ['7', '확실히 세 번 더 가능']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: '프로그램 정보!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: infoData
      }
    });

    // 3. 각 주차별 시트 생성 및 데이터 추가
    for (let i = 0; i < programData.training_weeks.length; i++) {
      const week = programData.training_weeks[i];
      const sheetTitle = `Week ${week.week}`;

      // 새 시트 추가
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetTitle,
                gridProperties: {
                  rowCount: 100,
                  columnCount: 11
                }
              }
            }
          }]
        }
      });

      // 시트 헤더 설정
      const headers = [
        '일차', '운동명', '목표세트', '목표렙', '목표중량(%)', 
        '실제세트', '실제렙', '실제중량(kg)', 'RPE', '볼륨(kg)', '메모'
      ];

      const weekData = [headers];

      // 운동 데이터 추가
      for (const workout of week.workouts) {
        // 일차 헤더
        weekData.push([
          `Day ${workout.day}`,
          workout.workout_name,
          '', '', '', '', '', '', '', '', ''
        ]);

        // 각 운동
        for (const exercise of workout.exercises) {
          weekData.push([
            '',
            exercise.exercise,
            exercise.sets,
            exercise.reps,
            exercise.weight_percent,
            '', // 실제세트
            '', // 실제렙
            '', // 실제중량
            exercise.rpe || '', // RPE
            '', // 볼륨
            exercise.notes || '' // 메모
          ]);
        }

        // 공백 행
        weekData.push(['', '', '', '', '', '', '', '', '', '', '']);
      }

      // 데이터 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetTitle}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: weekData
        }
      });
    }

    // 4. 진행상황 추적 시트 생성
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: '진행상황 추적',
              gridProperties: {
                rowCount: 50,
                columnCount: 6
              }
            }
          }
        }]
      }
    });

    const progressData = [
      ['날짜', '운동명', '최고중량(kg)', '예상1RM', '총볼륨(kg)', '메모'],
      [
        new Date().toLocaleDateString('ko-KR'),
        'Squat',
        programData.user_maxes.squat,
        programData.user_maxes.squat,
        '',
        '시작 중량'
      ],
      [
        new Date().toLocaleDateString('ko-KR'),
        'Bench Press',
        programData.user_maxes.bench,
        programData.user_maxes.bench,
        '',
        '시작 중량'
      ],
      [
        new Date().toLocaleDateString('ko-KR'),
        'Deadlift',
        programData.user_maxes.deadlift,
        programData.user_maxes.deadlift,
        '',
        '시작 중량'
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: '진행상황 추적!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: progressData
      }
    });

    // 5. 스프레드시트를 공개로 설정 (권한 문제 시 스킵)
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
    console.error('구글 스프레드시트 생성 실패 - 상세 에러:', error);
    console.error('에러 타입:', typeof error);
    console.error('에러 객체:', JSON.stringify(error, null, 2));
    
    throw new Error(`구글 스프레드시트 생성 실패: ${(error as any)?.message || 'Unknown error'}`);
  }
}