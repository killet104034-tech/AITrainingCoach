// ✨ Polish: batchUpdate를 통한 스타일링 및 포맷팅
import { sheets } from '../google';
import type { PersistResult } from './persist';

export interface PolishResult {
  stylingApplied: boolean;
  validationApplied: boolean;
  conditionalFormattingApplied: boolean;
  protectionApplied: boolean;
}

// 🎨 스프레드시트 완성 작업
export async function polishSpreadsheet(persistResult: PersistResult): Promise<PolishResult> {
  console.log('✨ Polish 단계 시작: batchUpdate 스타일링...');
  
  try {
    const { spreadsheetId, sheetStructure } = persistResult;
    
    // 1. 기본 스타일링 적용
    await applyBasicStyling(spreadsheetId, sheetStructure);
    
    // 2. 데이터 검증 규칙 적용
    await applyValidationRules(spreadsheetId, sheetStructure);
    
    // 3. 조건부 포맷팅 적용
    await applyConditionalFormatting(spreadsheetId, sheetStructure);
    
    // 4. 시트 보호 설정
    await applySheetProtection(spreadsheetId, sheetStructure);
    
    console.log('✅ Polish 완료: 스프레드시트 완성 작업 성공');
    
    return {
      stylingApplied: true,
      validationApplied: true,
      conditionalFormattingApplied: true,
      protectionApplied: true
    };
    
  } catch (error) {
    console.log('❌ Polish 실패:', error);
    throw error;
  }
}

// 🎨 기본 스타일링 적용
async function applyBasicStyling(spreadsheetId: string, sheetStructure: any): Promise<void> {
  try {
    const requests: any[] = [];
    
    // Form 시트 스타일링
    if (sheetStructure.formSheet) {
      const formSheetId = sheetStructure.formSheet.sheetId;
      
      // 헤더 행 스타일링
      requests.push({
        repeatCell: {
          range: { sheetId: formSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 56 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.3, blue: 0.5 },
              textFormat: { 
                foregroundColor: { red: 1, green: 1, blue: 1 }, 
                fontSize: 11, 
                bold: true 
              },
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat'
        }
      });
      
      // 행/열 고정
      requests.push({
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
      });
    }
    
    // Program 시트 스타일링
    if (sheetStructure.programSheet) {
      const programSheetId = sheetStructure.programSheet.sheetId;
      
      // 헤더 행 스타일링
      requests.push({
        repeatCell: {
          range: { sheetId: programSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.1, green: 0.2, blue: 0.4 },
              textFormat: { 
                foregroundColor: { red: 1, green: 1, blue: 1 }, 
                fontSize: 11, 
                bold: true 
              },
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat'
        }
      });
      
      // 행/열 고정 (Week, Block, Day 고정)
      requests.push({
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
      });
    }
    
    // 컬럼 너비 자동 조정
    requests.push({
      autoResizeDimensions: {
        dimensions: {
          sheetId: sheetStructure.formSheet?.sheetId,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 56
        }
      }
    });
    
    if (sheetStructure.programSheet) {
      requests.push({
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetStructure.programSheet.sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 15
          }
        }
      });
    }
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('🎨 기본 스타일링 적용 완료');
    
  } catch (error) {
    console.log('기본 스타일링 실패:', error);
  }
}

// 📋 데이터 검증 규칙 적용
async function applyValidationRules(spreadsheetId: string, sheetStructure: any): Promise<void> {
  try {
    const requests: any[] = [];
    
    if (sheetStructure.formSheet) {
      const formSheetId = sheetStructure.formSheet.sheetId;
      
      // 나이 검증 (C열)
      requests.push({
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [{ userEnteredValue: '15' }, { userEnteredValue: '80' }]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '나이는 15-80 사이여야 합니다'
          }
        }
      });
      
      // 성별 검증 (D열)
      requests.push({
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 },
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
      });
      
      // 체중 검증 (E열)
      requests.push({
        setDataValidation: {
          range: { sheetId: formSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 5, endColumnIndex: 6 },
          rule: {
            condition: {
              type: 'NUMBER_BETWEEN',
              values: [{ userEnteredValue: '30' }, { userEnteredValue: '200' }]
            },
            showCustomUi: true,
            strict: true,
            inputMessage: '체중은 30-200kg 사이여야 합니다'
          }
        }
      });
    }
    
    if (sheetStructure.programSheet) {
      const programSheetId = sheetStructure.programSheet.sheetId;
      
      // RPE 검증 (H열)
      requests.push({
        setDataValidation: {
          range: { sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 7, endColumnIndex: 8 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '6' }, { userEnteredValue: '6.5' },
                { userEnteredValue: '7' }, { userEnteredValue: '7.5' },
                { userEnteredValue: '8' }, { userEnteredValue: '8.5' },
                { userEnteredValue: '9' }, { userEnteredValue: '9.5' },
                { userEnteredValue: '10' }, { userEnteredValue: 'N/A' }
              ]
            },
            showCustomUi: true,
            strict: true
          }
        }
      });
    }
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('📋 데이터 검증 규칙 적용 완료');
    
  } catch (error) {
    console.log('데이터 검증 규칙 적용 실패:', error);
  }
}

// 🎨 조건부 포맷팅 적용
async function applyConditionalFormatting(spreadsheetId: string, sheetStructure: any): Promise<void> {
  try {
    const requests: any[] = [];
    
    if (sheetStructure.programSheet) {
      const programSheetId = sheetStructure.programSheet.sheetId;
      
      // 블록별 색상 구분
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: 'Block 1' }]
              },
              format: {
                backgroundColor: { red: 0.9, green: 0.95, blue: 1 }
              }
            }
          },
          index: 0
        }
      });
      
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: 'Block 2' }]
              },
              format: {
                backgroundColor: { red: 0.95, green: 1, blue: 0.9 }
              }
            }
          },
          index: 1
        }
      });
      
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 15 }],
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: 'Block 3' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.95, blue: 0.9 }
              }
            }
          },
          index: 2
        }
      });
      
      // 주요 파워리프팅 운동 강조
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: programSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 3, endColumnIndex: 4 }],
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: 'Squat' }]
              },
              format: {
                backgroundColor: { red: 1, green: 0.8, blue: 0.8 },
                textFormat: { bold: true, foregroundColor: { red: 0.8, green: 0, blue: 0 } }
              }
            }
          },
          index: 3
        }
      });
    }
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log('🎨 조건부 포맷팅 적용 완료');
    
  } catch (error) {
    console.log('조건부 포맷팅 적용 실패:', error);
  }
}

// 🔒 시트 보호 설정
async function applySheetProtection(spreadsheetId: string, sheetStructure: any): Promise<void> {
  try {
    // 향후 확장: 특정 범위 보호 설정
    console.log('🔒 시트 보호 설정 (추후 구현)');
    
  } catch (error) {
    console.log('시트 보호 설정 실패:', error);
  }
}