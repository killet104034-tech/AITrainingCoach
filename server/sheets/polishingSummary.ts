// 🎨 Professional Powerlifting Sheet Polish & Summary

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
  console.log('🎨 전문가급 파워리프팅 시트 폴리싱 시작...');
  
  // 📊 1차 batchUpdate: 프로페셔널 폴리싱
  await applyProfessionalPolishing(spreadsheetId);
  
  // 📈 2차 batchUpdate: 요약 및 추적 시트
  await createAdvancedSummarySheets(spreadsheetId, programData);
  
  console.log('✅ 전문가급 폴리싱 완료 (batchUpdate 2회)');
}

// 🎨 1차 전문가급 폴리싱
async function applyProfessionalPolishing(spreadsheetId: string): Promise<void> {
  const professionalRequests = [
    // 📋 헤더 섹션 (A1:J1) - 다크 블루 테마
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
            backgroundColor: { red: 0.09, green: 0.14, blue: 0.28 }, // 다크 네이비
            textFormat: { 
              bold: true, 
              foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
              fontSize: 12,
              fontFamily: 'Roboto'
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            borders: {
              top: { style: 'SOLID_THICK', color: { red: 0.05, green: 0.1, blue: 0.2 } },
              bottom: { style: 'SOLID_THICK', color: { red: 0.05, green: 0.1, blue: 0.2 } },
              left: { style: 'SOLID_MEDIUM', color: { red: 0.05, green: 0.1, blue: 0.2 } },
              right: { style: 'SOLID_MEDIUM', color: { red: 0.05, green: 0.1, blue: 0.2 } }
            },
            padding: { top: 8, bottom: 8, left: 4, right: 4 }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,borders,padding)'
      }
    },

    // 🏋️ 스쿼트 섹션 구분 (강렬한 빨간색)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 1, endColumnIndex: 2 }],
          booleanRule: {
            condition: {
              type: 'TEXT_CONTAINS',
              values: [{ userEnteredValue: 'Squat' }]
            },
            format: {
              backgroundColor: { red: 0.8, green: 0.2, blue: 0.2 },
              textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
            }
          }
        },
        index: 0
      }
    },

    // 🏋️ 벤치프레스 섹션 구분 (강렬한 초록색)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 1, endColumnIndex: 2 }],
          booleanRule: {
            condition: {
              type: 'TEXT_CONTAINS',
              values: [{ userEnteredValue: 'Bench' }]
            },
            format: {
              backgroundColor: { red: 0.2, green: 0.7, blue: 0.2 },
              textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
            }
          }
        },
        index: 1
      }
    },

    // 🏋️ 데드리프트 섹션 구분 (강렬한 보라색)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 1, endColumnIndex: 2 }],
          booleanRule: {
            condition: {
              type: 'TEXT_CONTAINS',
              values: [{ userEnteredValue: 'Deadlift' }]
            },
            format: {
              backgroundColor: { red: 0.6, green: 0.2, blue: 0.8 },
              textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
            }
          }
        },
        index: 2
      }
    },

    // 💪 RPE 9-10 (최고 강도) - 진한 빨간색
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 7 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_GREATER_THAN_EQ',
              values: [{ userEnteredValue: '9' }]
            },
            format: {
              backgroundColor: { red: 0.9, green: 0.1, blue: 0.1 },
              textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
            }
          }
        },
        index: 3
      }
    },

    // 💪 RPE 7-8 (고강도) - 오렌지
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 7 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '7' },
                { userEnteredValue: '8.9' }
              ]
            },
            format: {
              backgroundColor: { red: 1.0, green: 0.6, blue: 0.0 },
              textFormat: { bold: true, foregroundColor: { red: 0.0, green: 0.0, blue: 0.0 } }
            }
          }
        },
        index: 4
      }
    },

    // 💪 RPE 5-6 (중강도) - 노란색
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 7 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '5' },
                { userEnteredValue: '6.9' }
              ]
            },
            format: {
              backgroundColor: { red: 1.0, green: 0.9, blue: 0.2 },
              textFormat: { bold: true, foregroundColor: { red: 0.0, green: 0.0, blue: 0.0 } }
            }
          }
        },
        index: 5
      }
    },

    // ✅ 완료 체크박스 스타일
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 9, endColumnIndex: 10 }],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: '✅' }]
            },
            format: {
              backgroundColor: { red: 0.8, green: 1.0, blue: 0.8 }
            }
          }
        },
        index: 6
      }
    },

    // 📊 강도별 중량 색상 구분 (90%+)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_GREATER_THAN_EQ',
              values: [{ userEnteredValue: '90' }]
            },
            format: {
              backgroundColor: { red: 0.95, green: 0.3, blue: 0.3 },
              textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
            }
          }
        },
        index: 7
      }
    },

    // 📊 강도별 중량 색상 구분 (80-89%)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '80' },
                { userEnteredValue: '89' }
              ]
            },
            format: {
              backgroundColor: { red: 1.0, green: 0.7, blue: 0.3 }
            }
          }
        },
        index: 8
      }
    },

    // 📊 강도별 중량 색상 구분 (70-79%)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 }],
          booleanRule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [
                { userEnteredValue: '70' },
                { userEnteredValue: '79' }
              ]
            },
            format: {
              backgroundColor: { red: 1.0, green: 1.0, blue: 0.6 }
            }
          }
        },
        index: 9
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: professionalRequests
    }
  });

  console.log('🎨 전문가급 스타일링 완료 (10가지 조건부 서식 + 테두리)');
}

// 📈 2차: 고급 요약 및 추적 시트
async function createAdvancedSummarySheets(spreadsheetId: string, programData: WorkoutProgram): Promise<void> {
  const advancedRequests = [
    // 📊 Summary Dashboard 시트
    {
      addSheet: {
        properties: {
          title: '📊 Summary Dashboard',
          sheetId: 1001,
          gridProperties: { rowCount: 200, columnCount: 20 },
          tabColor: { red: 0.2, green: 0.6, blue: 1.0 }
        }
      }
    },

    // 📈 Progress Tracker 시트
    {
      addSheet: {
        properties: {
          title: '📈 Progress Tracker',
          sheetId: 1003,
          gridProperties: { rowCount: 500, columnCount: 15 },
          tabColor: { red: 0.2, green: 0.8, blue: 0.2 }
        }
      }
    },

    // 🔧 Meta Data 시트
    {
      addSheet: {
        properties: {
          title: '🔧 Meta Data',
          sheetId: 1002,
          gridProperties: { rowCount: 50, columnCount: 10 },
          tabColor: { red: 0.5, green: 0.5, blue: 0.5 }
        }
      }
    },

    // 📊 Summary Dashboard 내용 (전문적인 대시보드)
    {
      updateCells: {
        range: { sheetId: 1001, startRowIndex: 0, endRowIndex: 25, startColumnIndex: 0, endColumnIndex: 8 },
        rows: [
          // 타이틀 섹션
          {
            values: [
              { 
                userEnteredValue: { stringValue: '🏋️ POWERLIFTING TRAINING PROGRAM' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.09, green: 0.14, blue: 0.28 },
                  textFormat: { 
                    bold: true, 
                    fontSize: 16,
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } 
                  },
                  horizontalAlignment: 'CENTER'
                }
              }
            ]
          },
          { values: [{ userEnteredValue: { stringValue: '' } }] },

          // 프로그램 정보 섹션
          {
            values: [
              { 
                userEnteredValue: { stringValue: '📋 Program Overview' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 1.0 },
                  textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
                }
              }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Total Weeks' } },
              { userEnteredValue: { numberValue: programData.training_weeks?.length || 18 } },
              { userEnteredValue: { stringValue: 'weeks' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Weekly Sessions' } },
              { userEnteredValue: { numberValue: programData.training_weeks?.[0]?.workouts?.length || 3 } },
              { userEnteredValue: { stringValue: 'sessions/week' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Program Type' } },
              { userEnteredValue: { stringValue: 'Powerlifting Competition Prep' } }
            ]
          },
          { values: [{ userEnteredValue: { stringValue: '' } }] },

          // 1RM 정보 섹션
          {
            values: [
              { 
                userEnteredValue: { stringValue: '💪 Current 1RM Records' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.8, green: 0.2, blue: 0.2 },
                  textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
                }
              }
            ]
          },
          {
            values: [
              { 
                userEnteredValue: { stringValue: '🔴 Squat' },
                userEnteredFormat: { 
                  backgroundColor: { red: 1.0, green: 0.9, blue: 0.9 },
                  textFormat: { bold: true }
                }
              },
              { userEnteredValue: { stringValue: `${programData.user_maxes?.squat || '0'}kg` } },
              { userEnteredValue: { stringValue: '← Current Max' } }
            ]
          },
          {
            values: [
              { 
                userEnteredValue: { stringValue: '🟢 Bench Press' },
                userEnteredFormat: { 
                  backgroundColor: { red: 0.9, green: 1.0, blue: 0.9 },
                  textFormat: { bold: true }
                }
              },
              { userEnteredValue: { stringValue: `${programData.user_maxes?.bench || '0'}kg` } },
              { userEnteredValue: { stringValue: '← Current Max' } }
            ]
          },
          {
            values: [
              { 
                userEnteredValue: { stringValue: '🟣 Deadlift' },
                userEnteredFormat: { 
                  backgroundColor: { red: 0.95, green: 0.9, blue: 1.0 },
                  textFormat: { bold: true }
                }
              },
              { userEnteredValue: { stringValue: `${programData.user_maxes?.deadlift || '0'}kg` } },
              { userEnteredValue: { stringValue: '← Current Max' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: '🏆 Total' } },
              { 
                userEnteredValue: { 
                  formulaValue: `=B9+B10+B11`
                },
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.2 },
                  textFormat: { bold: true, fontSize: 14 }
                }
              },
              { userEnteredValue: { stringValue: 'kg' } }
            ]
          },
          { values: [{ userEnteredValue: { stringValue: '' } }] },

          // 진행 상황 섹션
          {
            values: [
              { 
                userEnteredValue: { stringValue: '📊 Training Progress' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.8, blue: 0.2 },
                  textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
                }
              }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Completed Weeks' } },
              { userEnteredValue: { stringValue: '0' } }, // 사용자가 직접 업데이트
              { userEnteredValue: { stringValue: `/ ${programData.training_weeks?.length || 18}` } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Completion %' } },
              { 
                userEnteredValue: { formulaValue: '=ROUND(B15/(B15+C15)*100,1)' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 1.0, blue: 0.9 },
                  textFormat: { bold: true }
                }
              },
              { userEnteredValue: { stringValue: '%' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Next Session' } },
              { userEnteredValue: { stringValue: 'Week 1 - Day 1' } }
            ]
          }
        ],
        fields: 'userEnteredValue,userEnteredFormat'
      }
    },

    // 📈 Progress Tracker 내용
    {
      updateCells: {
        range: { sheetId: 1003, startRowIndex: 0, endRowIndex: 10, startColumnIndex: 0, endColumnIndex: 10 },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: 'Week' } },
              { userEnteredValue: { stringValue: 'Date' } },
              { userEnteredValue: { stringValue: 'Squat Max' } },
              { userEnteredValue: { stringValue: 'Bench Max' } },
              { userEnteredValue: { stringValue: 'Deadlift Max' } },
              { userEnteredValue: { stringValue: 'Total' } },
              { userEnteredValue: { stringValue: 'Body Weight' } },
              { userEnteredValue: { stringValue: 'Notes' } },
              { userEnteredValue: { stringValue: 'RPE Avg' } },
              { userEnteredValue: { stringValue: 'Status' } }
            ].map(cell => ({
              ...cell,
              userEnteredFormat: {
                backgroundColor: { red: 0.09, green: 0.14, blue: 0.28 },
                textFormat: { 
                  bold: true, 
                  foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                  fontSize: 11
                },
                horizontalAlignment: 'CENTER'
              }
            }))
          },
          // 샘플 데이터 행
          {
            values: [
              { userEnteredValue: { numberValue: 1 } },
              { userEnteredValue: { stringValue: '2025-01-27' } },
              { userEnteredValue: { stringValue: programData.user_maxes?.squat || '0' } },
              { userEnteredValue: { stringValue: programData.user_maxes?.bench || '0' } },
              { userEnteredValue: { stringValue: programData.user_maxes?.deadlift || '0' } },
              { userEnteredValue: { formulaValue: '=C2+D2+E2' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: 'Starting week' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '🟡 In Progress' } }
            ]
          }
        ],
        fields: 'userEnteredValue,userEnteredFormat'
      }
    },

    // 🔧 Meta Data 내용
    {
      updateCells: {
        range: { sheetId: 1002, startRowIndex: 0, endRowIndex: 15, startColumnIndex: 0, endColumnIndex: 3 },
        rows: [
          {
            values: [
              { 
                userEnteredValue: { stringValue: '🔧 Technical Information' },
                userEnteredFormat: {
                  backgroundColor: { red: 0.5, green: 0.5, blue: 0.5 },
                  textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } }
                }
              }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Generated At' } },
              { userEnteredValue: { stringValue: new Date().toLocaleString('ko-KR') } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Template Version' } },
              { userEnteredValue: { stringValue: 'Professional v4.0' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'AI Engine' } },
              { userEnteredValue: { stringValue: 'Advanced Powerlifting Rules v3' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Survey Responses' } },
              { userEnteredValue: { stringValue: programData.survey_data ? 'Complete' : 'Basic' } }
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
              { userEnteredValue: { stringValue: 'Quality Score' } },
              { userEnteredValue: { stringValue: '⭐⭐⭐⭐⭐ Professional Grade' } }
            ]
          }
        ],
        fields: 'userEnteredValue,userEnteredFormat'
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: advancedRequests
    }
  });

  console.log('📈 고급 대시보드 및 추적 시트 완료');
}

// 📊 차트 및 시각화 추가 (선택적)
export async function addProfessionalCharts(spreadsheetId: string): Promise<void> {
  const chartRequests = [
    {
      addChart: {
        chart: {
          spec: {
            title: '💪 Strength Progression Over Time',
            titleTextFormat: { fontSize: 16, bold: true },
            basicChart: {
              chartType: 'LINE',
              legendPosition: 'RIGHT_LEGEND',
              domains: [
                {
                  domain: {
                    sourceRange: {
                      sources: [{
                        sheetId: 1003,
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
                        sheetId: 1003,
                        startRowIndex: 1,
                        endRowIndex: 20,
                        startColumnIndex: 2,
                        endColumnIndex: 3
                      }]
                    }
                  },
                  targetAxis: 'LEFT_AXIS',
                  color: { red: 0.8, green: 0.2, blue: 0.2 }
                },
                {
                  series: {
                    sourceRange: {
                      sources: [{
                        sheetId: 1003,
                        startRowIndex: 1,
                        endRowIndex: 20,
                        startColumnIndex: 3,
                        endColumnIndex: 4
                      }]
                    }
                  },
                  targetAxis: 'LEFT_AXIS',
                  color: { red: 0.2, green: 0.7, blue: 0.2 }
                },
                {
                  series: {
                    sourceRange: {
                      sources: [{
                        sheetId: 1003,
                        startRowIndex: 1,
                        endRowIndex: 20,
                        startColumnIndex: 4,
                        endColumnIndex: 5
                      }]
                    }
                  },
                  targetAxis: 'LEFT_AXIS',
                  color: { red: 0.6, green: 0.2, blue: 0.8 }
                }
              ]
            }
          },
          position: {
            overlayPosition: {
              anchorCell: { sheetId: 1001, rowIndex: 20, columnIndex: 0 },
              offsetXPixels: 20,
              offsetYPixels: 20,
              widthPixels: 600,
              heightPixels: 400
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

  console.log('📊 전문가급 차트 추가 완료');
}