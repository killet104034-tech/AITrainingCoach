// 🌐 룰 평가 API 라우터 - POST /api/evaluate 엔드포인트
// ✨ 기능: Context 입력 → 룰 평가 → 결과 반환 (planId, emailTemplateId 등)
// 🎯 목표: RESTful API로 룰 엔진 기능 제공

import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import { defaultEvaluator } from '../evaluator.js';
import { 
  evaluateRequestSchema,
  evaluationContextSchema,
  type EvaluateRequest,
  type EvaluationResult,
  type EvaluationError
} from '../schemas.js';

// 🎯 POST /api/evaluate - 메인 룰 평가 엔드포인트
export function registerEvaluateRoutes(app: Express): void {
  
  // 메인 평가 엔드포인트
  app.post('/api/evaluate', async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      // 요청 검증
      const evaluateRequest: EvaluateRequest = evaluateRequestSchema.parse(req.body);
      
      console.log(`🎯 룰 평가 요청: ${JSON.stringify(evaluateRequest.context.runtime?.requestId || 'no-id')}`);
      
      // 룰 평가 실행
      const result = await defaultEvaluator.evaluate(evaluateRequest);
      
      // 성공/실패에 따른 응답
      if ('success' in result && result.success) {
        const evaluationResult = result as EvaluationResult;
        
        // 응답 로깅
        console.log(`✅ 룰 평가 성공: ${evaluationResult.meta.matchedRulesCount}개 매치 (${Date.now() - startTime}ms)`);
        
        res.json(evaluationResult);
      } else {
        const evaluationError = result as EvaluationError;
        
        console.error(`❌ 룰 평가 실패: ${evaluationError.error}`);
        
        res.status(400).json(evaluationError);
      }
      
    } catch (error) {
      // 예상치 못한 에러 처리
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      console.error('🚨 룰 평가 API 에러:', error);
      
      const errorResponse: EvaluationError = {
        success: false,
        error: errorMessage,
        code: 'API_ERROR',
        details: {
          timestamp: Date.now(),
          executionTimeMs: Date.now() - startTime
        }
      };
      
      res.status(500).json(errorResponse);
    }
  });

  // 🔍 GET /api/evaluate/health - 헬스체크 엔드포인트
  app.get('/api/evaluate/health', async (req: Request, res: Response) => {
    try {
      const stats = defaultEvaluator.getStats();
      
      res.json({
        status: 'healthy',
        timestamp: Date.now(),
        evaluator: {
          initialized: true,
          stats
        },
        version: '1.0.0'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: Date.now()
      });
    }
  });

  // 🔄 POST /api/evaluate/reload - 룰 리로드 엔드포인트 (개발/관리용)
  app.post('/api/evaluate/reload', async (req: Request, res: Response) => {
    try {
      console.log('🔄 룰 리로드 요청');
      
      await defaultEvaluator.reloadRules();
      const stats = defaultEvaluator.getStats();
      
      console.log('✅ 룰 리로드 완료');
      
      res.json({
        success: true,
        message: '룰 리로드 완료',
        stats,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ 룰 리로드 실패:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: Date.now()
      });
    }
  });

  // 📊 GET /api/evaluate/stats - 룰 엔진 통계 엔드포인트
  app.get('/api/evaluate/stats', (req: Request, res: Response) => {
    try {
      const stats = defaultEvaluator.getStats();
      
      res.json({
        success: true,
        stats,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: Date.now()
      });
    }
  });

  // 🧪 POST /api/evaluate/test - 테스트 엔드포인트
  app.post('/api/evaluate/test', async (req: Request, res: Response) => {
    try {
      // 간단한 테스트 컨텍스트
      const testContext = evaluationContextSchema.parse({
        survey: {
          name: 'Test User',
          goals: ['strength', 'muscle'],
          experience_level: 'beginner'
        },
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        runtime: {
          requestId: `test-${Date.now()}`,
          timestamp: Date.now()
        }
      });

      const result = await defaultEvaluator.evaluate({
        context: testContext,
        strategy: 'collect-all',
        options: {
          includeDebugInfo: true,
          timeout: 2000
        }
      });

      res.json({
        success: true,
        testResult: result,
        timestamp: Date.now()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: Date.now()
      });
    }
  });

  console.log('🌐 룰 평가 API 라우터 등록 완료');
  console.log('  POST /api/evaluate - 메인 룰 평가');
  console.log('  GET  /api/evaluate/health - 헬스체크');
  console.log('  POST /api/evaluate/reload - 룰 리로드');
  console.log('  GET  /api/evaluate/stats - 통계 정보');
  console.log('  POST /api/evaluate/test - 테스트');
}

// 📋 편의 타입 및 스키마들 (클라이언트용)
export const quickEvaluateRequestSchema = z.object({
  context: evaluationContextSchema,
  strategy: z.enum(['first-match', 'collect-all']).default('first-match')
});

export type QuickEvaluateRequest = z.infer<typeof quickEvaluateRequestSchema>;