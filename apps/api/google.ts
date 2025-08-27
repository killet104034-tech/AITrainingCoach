import { google } from 'googleapis';

export function createGoogleAuth() {
  // 이메일 설정 확인 (둘 다 지원)
  const email = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  if (!email) {
    throw new Error('구글 서비스 계정 이메일이 설정되지 않았습니다. GOOGLE_CLIENT_EMAIL 또는 GOOGLE_SERVICE_ACCOUNT_EMAIL을 설정해주세요.');
  }

  // Private Key 처리 (\\n을 \n으로 복원, \r 제거)
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('구글 서비스 계정 Private Key가 설정되지 않았습니다. GOOGLE_PRIVATE_KEY를 설정해주세요.');
  }

  const processedPrivateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '');

  console.log('🔐 서비스 계정:', email);

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: processedPrivateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  });
}

// 🔧 Safe Google Auth Creation (for testing purposes)
export function createGoogleAuthSafe() {
  try {
    return createGoogleAuth();
  } catch (error) {
    console.warn('⚠️ Google Auth initialization failed:', (error as Error).message);
    return null;
  }
}