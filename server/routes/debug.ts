// 🔧 Debug Routes - GET /debug-env (Enhanced Environment Variable Testing)

import type { Express } from "express";
import { Pool, neonConfig } from '@neondatabase/serverless';
import OpenAI from 'openai';
import ws from "ws";

export function registerDebugRoutes(app: Express): void {
  // 🔧 환경변수 상태 확인 엔드포인트 (Enhanced with comprehensive testing)
  app.get('/api/debug-env', async (req, res) => {
    const envStatus = await testAllEnvironmentVariables();
    
    res.json({
      timestamp: new Date().toISOString(),
      overall_status: envStatus.allCriticalPassing ? '✅ 모든 중요 환경변수 정상' : '❌ 일부 환경변수에 문제 있음',
      environment_variables: envStatus.variables,
      summary: envStatus.summary,
      recommendations: envStatus.recommendations,
      // Keep existing architecture info for compatibility
      architecture: {
        domain: 'Types/Contracts/Invariant Logic',
        surveys: 'SurveyRegistry (zod, toCanonical, conflicts)',
        engine: 'planFromTables(), guards, split, variations',
        sheets: 'copy/create/write/polish/summary (Google Adapter)',
        ops: 'idempotency, locks, retry, logging',
        config: 'rules JSON/DSL (operator modifiable)',
        routes: 'POST /api/surveys, GET /jobs/:id, GET /debug-env'
      }
    });
  });
}

// 🧪 Environment Variable Testing Function
async function testAllEnvironmentVariables() {
  const variables: Record<string, any> = {};
  const recommendations: string[] = [];
  let criticalIssues = 0;

  // 📊 Database Configuration
  variables.DATABASE_URL = await testDatabaseUrl();
  if (!variables.DATABASE_URL.isValid) criticalIssues++;

  // 🤖 OpenAI Configuration
  variables.OPENAI_API_KEY = await testOpenAI();
  if (!variables.OPENAI_API_KEY.isValid) criticalIssues++;

  // 📧 Google Services Configuration
  const googleAuth = await testGoogleAuth();
  variables.GOOGLE_SERVICE_ACCOUNT_EMAIL = googleAuth.email;
  variables.GOOGLE_PRIVATE_KEY = googleAuth.privateKey;
  variables.SHEET_TEMPLATE_ID = testSimpleEnvVar('SHEET_TEMPLATE_ID', 'Google Sheets 템플릿 ID');
  variables.SHARED_FOLDER_ID = testSimpleEnvVar('SHARED_FOLDER_ID', 'Google Drive 공유 폴더 ID');
  
  if (!googleAuth.email.isValid || !googleAuth.privateKey.isValid) criticalIssues++;

  // 📬 SMTP Configuration
  const smtpConfig = testSMTPConfig();
  variables.SMTP_USER = smtpConfig.user;
  variables.SMTP_PASS = smtpConfig.pass;
  variables.SMTP_FROM = smtpConfig.from;

  // ⚙️ System Configuration
  variables.PORT = testPortConfig();
  variables.NODE_ENV = testNodeEnv();
  variables.REPL_ID = testSimpleEnvVar('REPL_ID', 'Replit 환경 ID (선택사항)', false);

  // Generate recommendations
  if (criticalIssues > 0) {
    recommendations.push(`${criticalIssues}개의 중요한 환경변수에 문제가 있습니다.`);
  }
  
  if (!smtpConfig.user.isValid || !smtpConfig.pass.isValid) {
    recommendations.push('SMTP 설정이 없어 이메일 전송 기능이 비활성화됩니다.');
  }
  
  if (!variables.SHEET_TEMPLATE_ID.isValid || !variables.SHARED_FOLDER_ID.isValid) {
    recommendations.push('Google Sheets 템플릿 또는 폴더 ID가 설정되지 않았습니다.');
  }

  return {
    variables,
    allCriticalPassing: criticalIssues === 0,
    summary: {
      total_variables: Object.keys(variables).length,
      valid_variables: Object.values(variables).filter((v: any) => v.isValid).length,
      critical_issues: criticalIssues
    },
    recommendations: recommendations.length > 0 ? recommendations : ['모든 환경변수가 올바르게 설정되었습니다.']
  };
}

// 🗄️ Database URL Testing
async function testDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return {
      isValid: false,
      status: '❌ 미설정',
      description: 'DATABASE_URL이 설정되지 않음',
      recommendation: 'Neon PostgreSQL 연결 문자열을 DATABASE_URL에 설정하세요'
    };
  }

  // Test database connection with Neon serverless
  try {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: dbUrl });
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    client.release();

    return {
      isValid: true,
      status: '✅ 연결 성공',
      description: '데이터베이스 연결 테스트 성공',
      host: new URL(dbUrl).hostname,
      database: new URL(dbUrl).pathname.slice(1)
    };
  } catch (error) {
    return {
      isValid: false,
      status: '❌ 연결 실패',
      description: `데이터베이스 연결 실패: ${(error as Error).message}`,
      recommendation: '데이터베이스 URL과 권한을 확인하세요'
    };
  }
}

// 🤖 OpenAI API Testing
async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;
  
  if (!apiKey || apiKey === 'default_key') {
    return {
      isValid: false,
      status: '❌ API 키 없음',
      description: 'OpenAI API 키가 설정되지 않음',
      recommendation: 'OPENAI_API_KEY를 설정하세요'
    };
  }

  // Validate API key format
  if (!apiKey.startsWith('sk-')) {
    return {
      isValid: false,
      status: '❌ 잘못된 형식',
      description: 'OpenAI API 키 형식이 잘못됨',
      recommendation: 'sk-로 시작하는 올바른 OpenAI API 키를 설정하세요'
    };
  }

  // Test API connection (lightweight call)
  try {
    const openai = new OpenAI({ apiKey });
    await openai.models.list();
    
    return {
      isValid: true,
      status: '✅ API 연결 성공',
      description: 'OpenAI API 키 검증 완료',
      keyPrefix: apiKey.substring(0, 10) + '...'
    };
  } catch (error) {
    return {
      isValid: false,
      status: '❌ API 연결 실패',
      description: `OpenAI API 연결 실패: ${(error as Error).message}`,
      recommendation: 'API 키가 유효한지 확인하세요'
    };
  }
}

// 🔐 Google Authentication Testing
async function testGoogleAuth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  const emailStatus = !email 
    ? { isValid: false, status: '❌ 미설정', description: 'Google 서비스 계정 이메일이 설정되지 않음' }
    : email.includes('@') && email.includes('.iam.gserviceaccount.com')
    ? { isValid: true, status: '✅ 형식 올바름', description: 'Google 서비스 계정 이메일 형식 검증', email: email.substring(0, email.indexOf('@') + 1) + '...' }
    : { isValid: false, status: '❌ 잘못된 형식', description: 'Google 서비스 계정 이메일 형식이 잘못됨' };

  const keyStatus = !privateKey 
    ? { isValid: false, status: '❌ 미설정', description: 'Google 개인 키가 설정되지 않음' }
    : privateKey.includes('BEGIN PRIVATE KEY') && privateKey.includes('END PRIVATE KEY')
    ? { isValid: true, status: '✅ 키 형식 올바름', description: 'Google 개인 키 형식 검증' }
    : { isValid: false, status: '❌ 키 형식 오류', description: 'Google 개인 키 형식이 잘못됨' };

  return {
    email: emailStatus,
    privateKey: keyStatus
  };
}

// 📬 SMTP Configuration Testing
function testSMTPConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  return {
    user: !user 
      ? { isValid: false, status: '⚠️ 미설정', description: 'SMTP 사용자가 설정되지 않음 (이메일 기능 비활성화)' }
      : { isValid: true, status: '✅ 설정됨', description: 'SMTP 사용자 설정', value: user.replace(/(.{3}).*(@.*)/, '$1***$2') },
    
    pass: !pass 
      ? { isValid: false, status: '⚠️ 미설정', description: 'SMTP 비밀번호가 설정되지 않음 (이메일 기능 비활성화)' }
      : { isValid: true, status: '✅ 설정됨', description: 'SMTP 비밀번호 설정' },
    
    from: !from 
      ? { isValid: true, status: '⚠️ 기본값 사용', description: 'SMTP_FROM 미설정, SMTP_USER를 사용함' }
      : { isValid: true, status: '✅ 설정됨', description: '사용자 정의 발신자 이메일', value: from }
  };
}

// 🌐 Port Configuration Testing
function testPortConfig() {
  const port = process.env.PORT;
  const defaultPort = 5000;
  const actualPort = port ? parseInt(port, 10) : defaultPort;

  return {
    isValid: true,
    status: '✅ 정상',
    description: port ? `사용자 설정 포트: ${actualPort}` : `기본 포트 사용: ${defaultPort}`,
    port: actualPort
  };
}

// 🏗️ Node Environment Testing
function testNodeEnv() {
  const nodeEnv = process.env.NODE_ENV;
  
  return {
    isValid: true,
    status: '✅ 정상',
    description: `현재 환경: ${nodeEnv || 'development'}`,
    environment: nodeEnv || 'development'
  };
}

// 🔧 Simple Environment Variable Testing
function testSimpleEnvVar(varName: string, description: string, required: boolean = true) {
  const value = process.env[varName];
  
  if (!value) {
    return {
      isValid: !required,
      status: required ? '❌ 미설정' : '⚠️ 선택사항',
      description: `${description}${required ? '' : ' (선택사항)'}가 설정되지 않음`
    };
  }

  return {
    isValid: true,
    status: '✅ 설정됨',
    description: description,
    valuePreview: value.length > 20 ? value.substring(0, 20) + '...' : value
  };
}