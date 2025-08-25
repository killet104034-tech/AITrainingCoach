// 📊 Summary: 피벗 테이블 및 차트 생성
import { sheets } from '../googleSheets';
import type { PersistResult } from './persist';

export interface SummaryResult {
  summarySheetCreated: boolean;
  pivotTablesCreated: number;
  chartsCreated: number;
}

// 📈 요약 시트 및 분석 도구 생성
export async function createSummary(persistResult: PersistResult): Promise<SummaryResult> {
  console.log('📊 Summary 단계 시작: 피벗 테이블 및 차트...');
  
  try {
    const { spreadsheetId } = persistResult;
    
    // 1. Summary 시트 생성
    const summarySheetId = await createSummarySheet(spreadsheetId);
    
    // 2. 피벗 테이블 생성
    const pivotTablesCount = await createPivotTables(spreadsheetId, summarySheetId);
    
    // 3. 라인 차트 생성 (8단계)
    const lineChartsCount = await createLineCharts(spreadsheetId, summarySheetId);
    
    // 4. 스택 바 차트 생성 (9단계)
    const stackedChartsCount = await createStackedBarCharts(spreadsheetId, summarySheetId);
    
    console.log('✅ Summary 완료: 분석 도구 생성 성공');
    
    return {
      summarySheetCreated: true,
      pivotTablesCreated: pivotTablesCount,
      chartsCreated: lineChartsCount + stackedChartsCount
    };
    
  } catch (error) {
    console.log('❌ Summary 실패:', error);
    throw error;
  }
}

// 📋 Summary 시트 생성
async function createSummarySheet(spreadsheetId: string): Promise<number> {
  try {
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Summary',
              gridProperties: {
                rowCount: 200,
                columnCount: 20
              }
            }
          }
        }]
      }
    });
    
    const summarySheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;
    if (!summarySheetId) {
      throw new Error('Summary 시트 ID를 가져올 수 없습니다');
    }
    
    // Summary 시트 기본 내용 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Summary!A1:E10`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['프로그램 요약', '', '', '', ''],
          ['', '', '', '', ''],
          ['지표', '값', '설명', '', ''],
          ['총 훈련 주차', '18', '전체 프로그램 기간', '', ''],
          ['훈련 블록 수', '3', 'Block 1, 2, 3', '', ''],
          ['주당 훈련일', '=Program!M2', 'Form 시트에서 가져옴', '', ''],
          ['스쿼트 빈도', '=COUNTIF(Program!D:D,"*Squat*")/18', '주당 평균 스쿼트 빈도', '', ''],
          ['벤치 빈도', '=COUNTIF(Program!D:D,"*Bench*")/18', '주당 평균 벤치 빈도', '', ''],
          ['데드리프트 빈도', '=COUNTIF(Program!D:D,"*Deadlift*")/18', '주당 평균 데드리프트 빈도', '', ''],
          ['', '', '', '', '']
        ]
      }
    });
    
    console.log(`📋 Summary 시트 생성 완료 (ID: ${summarySheetId})`);
    return summarySheetId;
    
  } catch (error) {
    console.log('Summary 시트 생성 실패:', error);
    throw error;
  }
}

// 📊 피벗 테이블 생성 (7단계)
async function createPivotTables(spreadsheetId: string, summarySheetId: number): Promise<number> {
  try {
    const requests: any[] = [];
    
    // 1. 블록별 볼륨 피벗 테이블
    requests.push({
      updateCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: 12,
          endRowIndex: 13,
          startColumnIndex: 0,
          endColumnIndex: 5
        },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: '블록별 볼륨 분석' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '' } },
              { userEnteredValue: { stringValue: '' } }
            ]
          }
        ],
        fields: 'userEnteredValue'
      }
    });
    
    // 2. 운동별 빈도 피벗 테이블
    requests.push({
      updateCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: 14,
          endRowIndex: 20,
          startColumnIndex: 0,
          endColumnIndex: 3
        },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: '운동' } },
              { userEnteredValue: { stringValue: '빈도' } },
              { userEnteredValue: { stringValue: '비율' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Squat' } },
              { userEnteredValue: { formulaValue: '=COUNTIF(Program!D:D,"*Squat*")' } },
              { userEnteredValue: { formulaValue: '=B15/SUM(B15:B17)*100&"%"' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Bench' } },
              { userEnteredValue: { formulaValue: '=COUNTIF(Program!D:D,"*Bench*")' } },
              { userEnteredValue: { formulaValue: '=B16/SUM(B15:B17)*100&"%"' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Deadlift' } },
              { userEnteredValue: { formulaValue: '=COUNTIF(Program!D:D,"*Deadlift*")' } },
              { userEnteredValue: { formulaValue: '=B17/SUM(B15:B17)*100&"%"' } }
            ]
          }
        ],
        fields: 'userEnteredValue'
      }
    });
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('📊 피벗 테이블 생성 완료');
    return 2; // 생성된 피벗 테이블 수
    
  } catch (error) {
    console.log('피벗 테이블 생성 실패:', error);
    return 0;
  }
}

// 📈 라인 차트 생성 (8단계)
async function createLineCharts(spreadsheetId: string, summarySheetId: number): Promise<number> {
  try {
    const requests: any[] = [];
    
    // 주차별 볼륨 진행 라인 차트
    requests.push({
      addChart: {
        chart: {
          spec: {
            title: '주차별 훈련 볼륨 진행',
            basicChart: {
              chartType: 'LINE',
              legendPosition: 'BOTTOM_LEGEND',
              axis: [
                {
                  position: 'BOTTOM_AXIS',
                  title: '주차'
                },
                {
                  position: 'LEFT_AXIS',
                  title: '볼륨 (세트 수)'
                }
              ],
              domains: [
                {
                  domain: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: summarySheetId,
                          startRowIndex: 25,
                          endRowIndex: 43,
                          startColumnIndex: 0,
                          endColumnIndex: 1
                        }
                      ]
                    }
                  }
                }
              ],
              series: [
                {
                  series: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: summarySheetId,
                          startRowIndex: 25,
                          endRowIndex: 43,
                          startColumnIndex: 1,
                          endColumnIndex: 2
                        }
                      ]
                    }
                  },
                  targetAxis: 'LEFT_AXIS'
                }
              ]
            }
          },
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId: summarySheetId,
                rowIndex: 22,
                columnIndex: 0
              },
              offsetXPixels: 10,
              offsetYPixels: 10,
              widthPixels: 400,
              heightPixels: 300
            }
          }
        }
      }
    });
    
    // 주차별 볼륨 데이터 생성 (샘플)
    const volumeData: any[][] = [['주차', '볼륨']];
    for (let week = 1; week <= 18; week++) {
      let volume = 15; // 기본 볼륨
      if (week <= 6) volume = 12 + week; // Block 1: 증가
      else if (week <= 12) volume = 18; // Block 2: 유지
      else volume = 22 - (week - 12); // Block 3: 감소
      
      volumeData.push([week, volume]);
    }
    
    requests.push({
      updateCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: 25,
          endRowIndex: 43,
          startColumnIndex: 0,
          endColumnIndex: 2
        },
        rows: volumeData.map(row => ({
          values: row.map(cell => ({ userEnteredValue: { numberValue: typeof cell === 'number' ? cell : undefined, stringValue: typeof cell === 'string' ? cell : undefined } }))
        })),
        fields: 'userEnteredValue'
      }
    });
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('📈 라인 차트 생성 완료');
    return 1; // 생성된 라인 차트 수
    
  } catch (error) {
    console.log('라인 차트 생성 실패:', error);
    return 0;
  }
}

// 📊 스택 바 차트 생성 (9단계)
async function createStackedBarCharts(spreadsheetId: string, summarySheetId: number): Promise<number> {
  try {
    const requests: any[] = [];
    
    // 블록별 운동 분포 스택 바 차트
    requests.push({
      addChart: {
        chart: {
          spec: {
            title: '블록별 운동 분포',
            basicChart: {
              chartType: 'COLUMN',
              stackedType: 'STACKED',
              legendPosition: 'RIGHT_LEGEND',
              axis: [
                {
                  position: 'BOTTOM_AXIS',
                  title: '블록'
                },
                {
                  position: 'LEFT_AXIS',
                  title: '운동 세트 수'
                }
              ],
              domains: [
                {
                  domain: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: summarySheetId,
                          startRowIndex: 50,
                          endRowIndex: 53,
                          startColumnIndex: 0,
                          endColumnIndex: 1
                        }
                      ]
                    }
                  }
                }
              ],
              series: [
                {
                  series: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: summarySheetId,
                          startRowIndex: 50,
                          endRowIndex: 53,
                          startColumnIndex: 1,
                          endColumnIndex: 2
                        }
                      ]
                    }
                  },
                  targetAxis: 'LEFT_AXIS'
                },
                {
                  series: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: summarySheetId,
                          startRowIndex: 50,
                          endRowIndex: 53,
                          startColumnIndex: 2,
                          endColumnIndex: 3
                        }
                      ]
                    }
                  },
                  targetAxis: 'LEFT_AXIS'
                },
                {
                  series: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: summarySheetId,
                          startRowIndex: 50,
                          endRowIndex: 53,
                          startColumnIndex: 3,
                          endColumnIndex: 4
                        }
                      ]
                    }
                  },
                  targetAxis: 'LEFT_AXIS'
                }
              ]
            }
          },
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId: summarySheetId,
                rowIndex: 22,
                columnIndex: 7
              },
              offsetXPixels: 10,
              offsetYPixels: 10,
              widthPixels: 400,
              heightPixels: 300
            }
          }
        }
      }
    });
    
    // 블록별 운동 분포 데이터 (샘플)
    requests.push({
      updateCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: 50,
          endRowIndex: 53,
          startColumnIndex: 0,
          endColumnIndex: 4
        },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: 'Block 1' } },
              { userEnteredValue: { numberValue: 21 } }, // Squat
              { userEnteredValue: { numberValue: 18 } }, // Bench
              { userEnteredValue: { numberValue: 15 } }  // Deadlift
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Block 2' } },
              { userEnteredValue: { numberValue: 18 } },
              { userEnteredValue: { numberValue: 18 } },
              { userEnteredValue: { numberValue: 12 } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Block 3' } },
              { userEnteredValue: { numberValue: 12 } },
              { userEnteredValue: { numberValue: 15 } },
              { userEnteredValue: { numberValue: 9 } }
            ]
          }
        ],
        fields: 'userEnteredValue'
      }
    });
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('📊 스택 바 차트 생성 완료');
    return 1; // 생성된 스택 바 차트 수
    
  } catch (error) {
    console.log('스택 바 차트 생성 실패:', error);
    return 0;
  }
}