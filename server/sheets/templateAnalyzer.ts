// 🔍 템플릿 분석기 - 사용자 시트 학습

import { google } from 'googleapis';
import { createGoogleAuth } from '../google';

const auth = createGoogleAuth();
const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

export interface SheetAnalysis {
  sheetId: string;
  sheetName: string;
  structure: {
    rows: number;
    columns: number;
    headers: string[];
    dataTypes: { [column: string]: string };
  };
  formatting: {
    colors: { [range: string]: any };
    fonts: { [range: string]: any };
    borders: { [range: string]: any };
  };
  conditionalFormatting: any[];
  charts: any[];
  formulas: { [cell: string]: string };
}

// 🔍 최근 공유된 스프레드시트 찾기
export async function findRecentSharedSheets(): Promise<string[]> {
  try {
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and sharedWithMe=true",
      orderBy: 'modifiedTime desc',
      pageSize: 10,
      fields: 'files(id, name, modifiedTime, owners)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    const sheets = response.data.files || [];
    console.log('📋 발견된 공유 시트들:');
    sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.name} (ID: ${sheet.id}) - ${sheet.modifiedTime}`);
    });

    return sheets.map(sheet => sheet.id!);
  } catch (error) {
    console.error('❌ 공유 시트 검색 실패:', error);
    return [];
  }
}

// 📊 시트 구조 완전 분석
export async function analyzeSheetStructure(spreadsheetId: string): Promise<SheetAnalysis[]> {
  try {
    console.log(`🔍 시트 분석 시작: ${spreadsheetId}`);

    // 기본 스프레드시트 정보 가져오기
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: true,
      ranges: [],
      fields: 'sheets(properties,data,conditionalFormatRules,charts)'
    });

    const sheetAnalyses: SheetAnalysis[] = [];

    for (const sheet of spreadsheet.data.sheets || []) {
      const sheetId = sheet.properties?.sheetId?.toString() || '0';
      const sheetName = sheet.properties?.title || 'Unknown';
      
      console.log(`📄 분석 중인 시트: ${sheetName}`);

      // 기본 구조 분석
      const gridData = sheet.data?.[0];
      const rowData = gridData?.rowData || [];
      
      const structure = {
        rows: sheet.properties?.gridProperties?.rowCount || 0,
        columns: sheet.properties?.gridProperties?.columnCount || 0,
        headers: [],
        dataTypes: {}
      };

      // 헤더 행 추출 (첫 번째 행)
      if (rowData.length > 0 && rowData[0].values) {
        structure.headers = rowData[0].values.map((cell: any) => 
          cell.formattedValue || cell.userEnteredValue?.stringValue || ''
        );
      }

      // 데이터 타입 분석 (첫 10행 샘플링)
      const sampleRows = rowData.slice(1, 11);
      structure.headers.forEach((header, colIndex) => {
        const sampleValues = sampleRows
          .map(row => row.values?.[colIndex])
          .filter(cell => cell && (cell.formattedValue || cell.userEnteredValue))
          .map(cell => cell.userEnteredValue);

        // 데이터 타입 추론
        if (sampleValues.length > 0) {
          const hasNumbers = sampleValues.some(v => v?.numberValue !== undefined);
          const hasFormulas = sampleValues.some(v => v?.formulaValue !== undefined);
          const hasText = sampleValues.some(v => v?.stringValue !== undefined);
          
          if (hasFormulas) structure.dataTypes[header] = 'formula';
          else if (hasNumbers) structure.dataTypes[header] = 'number';
          else if (hasText) structure.dataTypes[header] = 'text';
          else structure.dataTypes[header] = 'mixed';
        }
      });

      // 포맷팅 분석
      const formatting = {
        colors: {},
        fonts: {},
        borders: {}
      };

      // 첫 20행의 포맷팅 분석
      rowData.slice(0, 20).forEach((row, rowIndex) => {
        row.values?.forEach((cell: any, colIndex: any) => {
          if (cell.userEnteredFormat) {
            const cellRef = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
            
            if (cell.userEnteredFormat.backgroundColor) {
              formatting.colors[cellRef] = cell.userEnteredFormat.backgroundColor;
            }
            
            if (cell.userEnteredFormat.textFormat) {
              formatting.fonts[cellRef] = cell.userEnteredFormat.textFormat;
            }
            
            if (cell.userEnteredFormat.borders) {
              formatting.borders[cellRef] = cell.userEnteredFormat.borders;
            }
          }
        });
      });

      // 조건부 서식 분석
      const conditionalFormatting = sheet.conditionalFormatRules || [];

      // 차트 분석
      const charts = sheet.charts || [];

      // 수식 분석 (첫 20행)
      const formulas: { [cell: string]: string } = {};
      rowData.slice(0, 20).forEach((row, rowIndex) => {
        row.values?.forEach((cell: any, colIndex: any) => {
          if (cell.userEnteredValue?.formulaValue) {
            const cellRef = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
            formulas[cellRef] = cell.userEnteredValue.formulaValue;
          }
        });
      });

      sheetAnalyses.push({
        sheetId,
        sheetName,
        structure,
        formatting,
        conditionalFormatting,
        charts,
        formulas
      });
    }

    return sheetAnalyses;

  } catch (error) {
    console.error('❌ 시트 분석 실패:', error);
    return [];
  }
}

// 📋 완전한 시트 데이터 추출 (값 + 포맷)
export async function extractCompleteSheetData(spreadsheetId: string, sheetName?: string) {
  try {
    const range = sheetName ? `${sheetName}!A1:Z1000` : 'A1:Z1000';
    
    // 값과 포맷 모두 가져오기
    const [valuesResponse, formatResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
        valueRenderOption: 'FORMATTED_VALUE'
      }),
      sheets.spreadsheets.get({
        spreadsheetId,
        ranges: [range],
        includeGridData: true,
        fields: 'sheets.data.rowData.values.userEnteredFormat'
      })
    ]);

    return {
      values: valuesResponse.data.values || [],
      formatting: formatResponse.data.sheets?.[0]?.data?.[0]?.rowData || []
    };
  } catch (error) {
    console.error('❌ 시트 데이터 추출 실패:', error);
    return { values: [], formatting: [] };
  }
}

// 🎨 포맷팅 패턴 학습
export async function learnFormattingPatterns(analysis: SheetAnalysis[]): Promise<any> {
  const patterns = {
    headerStyle: null,
    dataStyles: {},
    colorScheme: [],
    borderPatterns: [],
    conditionalRules: []
  };

  analysis.forEach(sheet => {
    console.log(`📊 ${sheet.sheetName} 패턴 학습:`);
    console.log(`  - 행/열: ${sheet.structure.rows}x${sheet.structure.columns}`);
    console.log(`  - 헤더: ${sheet.structure.headers.join(', ')}`);
    console.log(`  - 조건부 서식: ${sheet.conditionalFormatting.length}개`);
    console.log(`  - 차트: ${sheet.charts.length}개`);
    console.log(`  - 수식: ${Object.keys(sheet.formulas).length}개`);
    
    // 색상 패턴 수집
    Object.values(sheet.formatting.colors).forEach((color: any) => {
      if (color && !patterns.colorScheme.some((c: any) => 
        c.red === color.red && c.green === color.green && c.blue === color.blue
      )) {
        patterns.colorScheme.push(color);
      }
    });

    // 조건부 서식 패턴 수집
    patterns.conditionalRules.push(...sheet.conditionalFormatting);
  });

  return patterns;
}