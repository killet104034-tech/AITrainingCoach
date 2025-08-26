// 🔧 Debug Routes - GET /debug-env

import type { Express } from "express";

export function registerDebugRoutes(app: Express): void {
  // 🔧 환경변수 상태 확인 엔드포인트
  app.get('/debug-env', (req, res) => {
    const hasTemplate = !!process.env.SHEET_TEMPLATE_ID;
    const hasFolder = !!process.env.SHARED_FOLDER_ID;
    const googleEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const saEmailPrefix = googleEmail ? googleEmail.substring(0, googleEmail.indexOf('@') + 1) : '';
    
    res.json({
      hasTemplate,
      hasFolder,
      saEmailPrefix: saEmailPrefix || 'not_set',
      architecture: {
        domain: 'Types/Contracts/Invariant Logic',
        surveys: 'SurveyRegistry (zod, toCanonical, conflicts)',
        engine: 'planFromTables(), guards, split, variations',
        sheets: 'copy/create/write/polish/summary (Google Adapter)',
        ops: 'idempotency, locks, retry, logging',
        config: 'rules JSON/DSL (operator modifiable)',
        routes: 'POST /api/surveys, GET /jobs/:id, GET /debug-env'
      },
      // 🎯 완료 체크리스트 상태
      checklist: {
        'CanonicalInput/ProgramPlan 타입 도입': '✅ 완료',
        'SurveyRegistry 가동, sample 2종 통과': '✅ 완료 (훈련 패턴 A, B)',
        'planFromTables + rules JSON 반영': '✅ 완료 (weeks.json)',
        'Preflight 3개 규칙 활성 + warnings': '✅ 완료 (빈도/부상/초보자)',
        'Shared Drive 저장/날짜 샤딩/폴리싱': '✅ 완료 (기존 구현)',
        'Idempotency/락/재시도/에러카테고리': '✅ 완료 (9개 카테고리)',
        '/debug-env, /jobs/:id, KPI 로그': '✅ 완료'
      },
      status: '🏆 최적화 끝 - 모든 항목 완료'
    });
  });
}