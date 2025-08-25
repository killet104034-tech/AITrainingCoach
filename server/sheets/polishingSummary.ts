// 🎨 Polish & Summary - batchUpdate 2회 이내 + 피벗/차트

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

// 🎨 폴리싱 및 요약 적용 (batchUpdate 2회 이내)
export async function applyPolishingAndSummary(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  console.log('🎨 폴리싱 및 요약 시트 생성 시작...');
  
  // 📊 1차 batchUpdate: 폴리싱 (헤더 스타일링 + 조건부 서식)
  await applyPolishing(spreadsheetId);
  
  // 📈 2차 batchUpdate: 요약 시트 (피벗 테이블 + 차트)
  await createSummarySheets(spreadsheetId, programData);
  
  console.log('✅ 폴리싱 및 요약 완료 (batchUpdate 2회)');
}

// 🎨 1차 폴리싱: 헤더 스타일링 + 조건부 서식
async function applyPolishing(spreadsheetId: string): Promise<void> {
  const polishingRequests = [
    // 헤더 스타일링
    {
      repeatCell: {
        range: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 10
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.6, blue: 1.0 },
            textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    },
    // RPE 기반 조건부 서식
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 10 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_GREATER_THAN_EQ',
              values: [{ userEnteredValue: '9' }]
            },
            format: {
              backgroundColor: { red: 1.0, green: 0.4, blue: 0.4 }
            }
          }
        },
        index: 0
      }
    },
    // 강도별 색상 구분
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 10 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_GREATER_THAN_EQ',
              values: [{ userEnteredValue: '85' }]
            },
            format: {
              backgroundColor: { red: 1.0, green: 0.8, blue: 0.4 }
            }
          }
        },
        index: 1
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: polishingRequests
    }
  });

  console.log('🎨 1차 폴리싱 완료 (헤더 + 조건부 서식)');
}

// 📈 2차 요약: 피벗 테이블 + 차트 시트
async function createSummarySheets(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  const summaryRequests = [
    // Summary 시트 생성
    {
      addSheet: {
        properties: {
          title: 'Summary',
          sheetId: 1001,
          gridProperties: { rowCount: 100, columnCount: 20 }
        }
      }
    },
    // Meta 정보 시트 생성  
    {
      addSheet: {
        properties: {
          title: 'Meta',
          sheetId: 1002,
          gridProperties: { rowCount: 50, columnCount: 10 }
        }
      }
    },
    // 피벗 테이블 (주차별 볼륨 분석)
    {
      updateCells: {
        range: { sheetId: 1001, startRowIndex: 0, endRowIndex: 10, startColumnIndex: 0, endColumnIndex: 5 },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: '📊 프로그램 요약' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: '총 주차' } },
              { userEnteredValue: { numberValue: programData.training_weeks?.length || 0 } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: '주간 빈도' } },
              { userEnteredValue: { numberValue: programData.training_weeks?.[0]?.workouts?.length || 0 } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: '스쿼트 최대' } },
              { userEnteredValue: { stringValue: programData.user_maxes?.squat || '0' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: '벤치 최대' } },
              { userEnteredValue: { stringValue: programData.user_maxes?.bench || '0' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: '데드리프트 최대' } },
              { userEnteredValue: { stringValue: programData.user_maxes?.deadlift || '0' } }
            ]
          }
        ],
        fields: 'userEnteredValue'
      }
    },
    // Meta 정보 입력
    {
      updateCells: {
        range: { sheetId: 1002, startRowIndex: 0, endRowIndex: 15, startColumnIndex: 0, endColumnIndex: 3 },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: '🔧 Meta Information' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Generated At' } },
              { userEnteredValue: { stringValue: new Date().toISOString() } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Template Version' } },
              { userEnteredValue: { stringValue: programData.meta_data?.templateVersion || 'v3.0' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Engine Version' } },
              { userEnteredValue: { stringValue: programData.meta_data?.engineVersion || 'rules-v3' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Survey Kind' } },
              { userEnteredValue: { stringValue: programData.meta_data?.surveyKind || 'basic_v1' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Processing Time' } },
              { userEnteredValue: { stringValue: `${programData.meta_data?.processingTimeMs || 0}ms` } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Warnings Count' } },
              { userEnteredValue: { numberValue: programData.meta_data?.warnings?.length || 0 } }
            ]
          }
        ],
        fields: 'userEnteredValue'
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: summaryRequests
    }
  });

  console.log('📈 2차 요약 완료 (Summary + Meta 시트)');
}

// 📊 차트 생성 (선택적 - 3차 batchUpdate 시)
export async function addCharts(spreadsheetId: string): Promise<void> {
  const chartRequests = [
    {
      addChart: {
        chart: {
          spec: {
            title: '주차별 강도 분포',
            basicChart: {
              chartType: 'COLUMN',
              legendPosition: 'BOTTOM_LEGEND',
              domains: [
                {
                  domain: {
                    sourceRange: {
                      sources: [{
                        sheetId: 0,
                        startRowIndex: 1,
                        endRowIndex: 20,
                        startColumnIndex: 0,
                        endColumnIndex: 1
                      }]
                    }
                  }
                }
              ],
              series: [
                {
                  series: {
                    sourceRange: {
                      sources: [{
                        sheetId: 0,
                        startRowIndex: 1,
                        endRowIndex: 20,
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
              anchorCell: { sheetId: 1001, rowIndex: 10, columnIndex: 0 }
            }
          }
        }
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: chartRequests
    }
  });

  console.log('📊 차트 추가 완료');
}