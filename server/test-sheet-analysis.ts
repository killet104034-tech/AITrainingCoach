// 🔍 간단한 시트 분석 테스트

import { google } from 'googleapis';
import { createGoogleAuth } from './google';

async function testSheetAccess() {
  try {
    console.log('🔐 인증 설정 중...');
    const auth = createGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('🔍 최근 공유된 스프레드시트 검색 중...');
    
    const driveResponse = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      orderBy: 'modifiedTime desc',
      pageSize: 5,
      fields: 'files(id, name, modifiedTime, owners)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    const files = driveResponse.data.files || [];
    console.log(`📋 발견된 스프레드시트: ${files.length}개`);
    
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   ID: ${file.id}`);
      console.log(`   수정일: ${file.modifiedTime}`);
      console.log('');
    });

    if (files.length > 0) {
      const targetFile = files[0];
      console.log(`🎯 분석 대상: ${targetFile.name} (${targetFile.id})`);
      
      console.log('📊 시트 구조 분석 중...');
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: targetFile.id!,
        includeGridData: false,
        fields: 'sheets(properties)'
      });

      console.log('📄 시트 목록:');
      spreadsheet.data.sheets?.forEach((sheet, index) => {
        const props = sheet.properties;
        console.log(`${index + 1}. ${props?.title} (${props?.gridProperties?.rowCount}x${props?.gridProperties?.columnCount})`);
      });

      // 첫 번째 시트의 데이터 샘플 가져오기
      const firstSheet = spreadsheet.data.sheets?.[0]?.properties?.title;
      if (firstSheet) {
        console.log(`\n📋 "${firstSheet}" 시트 데이터 샘플:`);
        
        const valuesResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: targetFile.id!,
          range: `${firstSheet}!A1:Z20`,
          valueRenderOption: 'FORMATTED_VALUE'
        });

        const values = valuesResponse.data.values || [];
        console.log(`📊 데이터 행 수: ${values.length}`);
        
        if (values.length > 0) {
          console.log('📋 헤더 행:');
          console.log(values[0]);
          
          console.log('\n📊 샘플 데이터 (처음 5행):');
          values.slice(0, 5).forEach((row, index) => {
            console.log(`${index + 1}: ${JSON.stringify(row)}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

testSheetAccess();