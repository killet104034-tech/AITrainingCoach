// server/debugGoogle.ts - 🎯 비서님 제안: 60초 자가진단
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

(async () => {
  try {
    console.log('🔍 Google API 60초 자가진단 시작...');
    
    // 🎯 비서님 제안: 빠른 검증 포인트
    console.log('ENV:', process.env.SHARED_FOLDER_ID, process.env.SHEET_TEMPLATE_ID);
    
    // 1. 인증 테스트
    const authClient = await auth.getClient();
    console.log('✅ 인증 성공');
    
    // 2. 템플릿 접근 테스트
    const TEMPLATE_ID = process.env.SHEET_TEMPLATE_ID;
    if (TEMPLATE_ID) {
      const { data } = await drive.files.copy({
        fileId: TEMPLATE_ID,
        supportsAllDrives: true,
        requestBody: {
          name: `TEST_${Date.now()}`,
          parents: [process.env.SHARED_FOLDER_ID!]
        }
      });
      
      const newId = data.id!;
      console.log('✅ 템플릿 복사 성공! ID:', newId);
      
      // 3. 스프레드시트 업데이트 테스트
      await sheets.spreadsheets.values.update({
        spreadsheetId: newId,
        range: 'Form1A2',
        valueInputOption: 'RAW',
        requestBody: { values: [[new Date().toISOString(), "OK"]] }
      });
      
      console.log('✅ 데이터 업데이트 성공');
      
      // 4. 권한 설정 테스트
      const meta = await drive.files.get({
        fileId: newId,
        fields: 'id, name, driveId, parents, owners(emailAddress)',
        supportsAllDrives: true
      });
      
      console.log('📋 파일 정보:', meta.data);
      
      console.log('🎉 모든 테스트 통과! driveId가 있으면 Shared Drive에 제대로 생성된 것');
      
    } else {
      console.log('❌ SHEET_TEMPLATE_ID 없음');
    }
    
  } catch (e) {
    console.error('❌ 진단 실패:', e.response?.data || e);
  }
})();