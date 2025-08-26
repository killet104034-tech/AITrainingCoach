// 🔍 상세 시트 구조 및 포맷팅 분석

import { google } from 'googleapis';
import { createGoogleAuth } from './google';

async function analyzeDetailedStructure() {
  try {
    const auth = createGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const targetSheetId = '1q4KvO5-SuvLyd6hdOoLPu4PLqoGwL5T_LZRuUPthsQQ';
    
    console.log('🔍 전체 시트 구조 및 포맷팅 분석 중...');
    
    // 전체 스프레드시트 정보 (포맷팅 포함)
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: targetSheetId,
      includeGridData: true,
      fields: 'sheets(properties,data.rowData.values(userEnteredValue,userEnteredFormat),conditionalFormatRules,charts)'
    });

    console.log('📄 === 시트별 상세 분석 ===\n');

    for (const sheet of spreadsheet.data.sheets || []) {
      const sheetName = sheet.properties?.title || 'Unknown';
      const rows = sheet.properties?.gridProperties?.rowCount || 0;
      const cols = sheet.properties?.gridProperties?.columnCount || 0;
      
      console.log(`🎯 시트: ${sheetName} (${rows}x${cols})`);
      
      // 실제 데이터가 있는 영역 분석
      const gridData = sheet.data?.[0];
      const rowData = gridData?.rowData || [];
      
      let lastDataRow = 0;
      let lastDataCol = 0;
      
      rowData.forEach((row, rowIndex) => {
        if (row.values && row.values.some(cell => 
          cell.userEnteredValue || 
          cell.userEnteredFormat?.backgroundColor ||
          cell.userEnteredFormat?.textFormat?.bold
        )) {
          lastDataRow = Math.max(lastDataRow, rowIndex);
          
          row.values.forEach((cell, colIndex) => {
            if (cell.userEnteredValue || cell.userEnteredFormat) {
              lastDataCol = Math.max(lastDataCol, colIndex);
            }
          });
        }
      });
      
      console.log(`📊 실제 데이터 영역: ${lastDataRow + 1} 행 x ${lastDataCol + 1} 열`);
      
      // 헤더 분석 (첫 5행)
      console.log('📋 헤더 구조:');
      rowData.slice(0, 5).forEach((row, rowIndex) => {
        if (row.values) {
          const rowValues = row.values.map(cell => {
            const value = cell.userEnteredValue?.stringValue || 
                         cell.userEnteredValue?.numberValue?.toString() || 
                         cell.userEnteredValue?.formulaValue || '';
            const hasFormat = !!(cell.userEnteredFormat?.backgroundColor || 
                               cell.userEnteredFormat?.textFormat?.bold);
            return hasFormat ? `[${value}]` : value;
          }).filter(v => v).slice(0, 10);
          
          if (rowValues.length > 0) {
            console.log(`  행 ${rowIndex + 1}: ${rowValues.join(' | ')}`);
          }
        }
      });
      
      // 색상 패턴 분석
      const colorMap = new Map();
      const fontPatterns = new Set();
      
      rowData.slice(0, 20).forEach((row, rowIndex) => {
        row.values?.forEach((cell, colIndex) => {
          const format = cell.userEnteredFormat;
          if (format?.backgroundColor) {
            const colorKey = `${format.backgroundColor.red || 0},${format.backgroundColor.green || 0},${format.backgroundColor.blue || 0}`;
            const count = colorMap.get(colorKey) || 0;
            colorMap.set(colorKey, count + 1);
          }
          
          if (format?.textFormat) {
            const fontKey = `${format.textFormat.bold ? 'B' : ''}${format.textFormat.italic ? 'I' : ''}${format.textFormat.fontSize || 10}`;
            fontPatterns.add(fontKey);
          }
        });
      });
      
      console.log('🎨 색상 패턴:');
      colorMap.forEach((count, color) => {
        const [r, g, b] = color.split(',').map(Number);
        console.log(`  RGB(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}): ${count}개 셀`);
      });
      
      console.log('🖋️ 폰트 패턴:', Array.from(fontPatterns));
      
      // 조건부 서식 분석
      if (sheet.conditionalFormatRules && sheet.conditionalFormatRules.length > 0) {
        console.log(`📏 조건부 서식: ${sheet.conditionalFormatRules.length}개 규칙`);
        sheet.conditionalFormatRules.forEach((rule, index) => {
          console.log(`  규칙 ${index + 1}: ${JSON.stringify(rule, null, 2)}`);
        });
      }
      
      console.log('\n');
    }
    
    // Block 시트의 더 많은 데이터 분석
    console.log('🔍 Block 시트 상세 데이터 분석...');
    const blockData = await sheets.spreadsheets.values.get({
      spreadsheetId: targetSheetId,
      range: 'Block!A1:AG50',
      valueRenderOption: 'FORMATTED_VALUE'
    });
    
    const values = blockData.data.values || [];
    console.log(`📊 Block 시트 데이터: ${values.length} 행`);
    
    console.log('\n📋 Block 시트 전체 구조:');
    values.forEach((row, index) => {
      if (row && row.some(cell => cell && cell.trim())) {
        const displayRow = row.slice(0, 20).map(cell => cell || '').join(' | ');
        console.log(`행 ${index + 1}: ${displayRow}`);
      }
    });

  } catch (error) {
    console.error('❌ 상세 분석 실패:', error);
  }
}

analyzeDetailedStructure();