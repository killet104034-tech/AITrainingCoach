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
      }
    });
  });
}