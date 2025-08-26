// 🔍 간단한 시트 데이터 분석

import { google } from 'googleapis';
import { createGoogleAuth } from './google';

async function simpleAnalysis() {
  try {
    const auth = createGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const targetSheetId = '1q4KvO5-SuvLyd6hdOoLPu4PLqoGwL5T_LZRuUPthsQQ';
    
    console.log('🔍 각 시트별 데이터 분석 시작...\n');
    
    // 1. Block 시트 분석
    console.log('📊 === Block 시트 분석 ===');
    const blockData = await sheets.spreadsheets.values.get({
      spreadsheetId: targetSheetId,
      range: 'Block!A1:AZ100',
      valueRenderOption: 'FORMATTED_VALUE'
    });
    
    const blockValues = blockData.data.values || [];
    console.log(`📏 Block 시트 크기: ${blockValues.length} 행`);
    
    // 헤더 및 구조 분석
    console.log('\n📋 Block 시트 주요 구조:');
    blockValues.slice(0, 30).forEach((row, index) => {
      if (row && row.some(cell => cell && cell.trim())) {
        const significantCells = row.slice(0, 30).filter(cell => cell && cell.trim());
        if (significantCells.length > 0) {
          console.log(`행 ${index + 1}: ${significantCells.join(' | ')}`);
        }
      }
    });
    
    // 2. E1RM 시트 분석
    console.log('\n📊 === E1RM 시트 분석 ===');
    const e1rmData = await sheets.spreadsheets.values.get({
      spreadsheetId: targetSheetId,
      range: 'E1RM!A1:Z50',
      valueRenderOption: 'FORMATTED_VALUE'
    });
    
    const e1rmValues = e1rmData.data.values || [];
    console.log(`📏 E1RM 시트 크기: ${e1rmValues.length} 행`);
    
    console.log('\n📋 E1RM 시트 구조:');
    e1rmValues.slice(0, 20).forEach((row, index) => {
      if (row && row.some(cell => cell && cell.trim())) {
        const significantCells = row.slice(0, 15).filter(cell => cell && cell.trim());
        if (significantCells.length > 0) {
          console.log(`행 ${index + 1}: ${significantCells.join(' | ')}`);
        }
      }
    });
    
    // 3. RPE Table 시트 분석
    console.log('\n📊 === RPE Table 시트 분석 ===');
    const rpeData = await sheets.spreadsheets.values.get({
      spreadsheetId: targetSheetId,
      range: 'RPE Table!A1:Z50',
      valueRenderOption: 'FORMATTED_VALUE'
    });
    
    const rpeValues = rpeData.data.values || [];
    console.log(`📏 RPE Table 시트 크기: ${rpeValues.length} 행`);
    
    console.log('\n📋 RPE Table 시트 구조:');
    rpeValues.slice(0, 20).forEach((row, index) => {
      if (row && row.some(cell => cell && cell.trim())) {
        const significantCells = row.slice(0, 15).filter(cell => cell && cell.trim());
        if (significantCells.length > 0) {
          console.log(`행 ${index + 1}: ${significantCells.join(' | ')}`);
        }
      }
    });
    
    // 4. 전체 시트 기본 정보
    console.log('\n📊 === 전체 시트 기본 정보 ===');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: targetSheetId,
      fields: 'sheets(properties)'
    });
    
    spreadsheet.data.sheets?.forEach(sheet => {
      const props = sheet.properties;
      console.log(`📄 ${props?.title}: ${props?.gridProperties?.rowCount}x${props?.gridProperties?.columnCount}`);
      if (props?.tabColor) {
        console.log(`   탭 색상: RGB(${Math.round((props.tabColor.red || 0) * 255)}, ${Math.round((props.tabColor.green || 0) * 255)}, ${Math.round((props.tabColor.blue || 0) * 255)})`);
      }
    });

  } catch (error) {
    console.error('❌ 분석 실패:', error);
  }
}

simpleAnalysis();