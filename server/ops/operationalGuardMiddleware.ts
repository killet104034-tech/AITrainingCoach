import { Request, Response, NextFunction } from 'express';
import { operationalGuard, generateCanonicalHash, generateUserKey, OperationalError, ErrorCategory } from './operationalGuard';
import { z } from 'zod';

// 🔒 운영 가드 미들웨어

export interface GuardedRequest extends Request {
  guardContext: {
    idempotencyKey: string;
    canonicalHash: string;
    userKey: string;
    startTime: number;
    auditContext: any;
  };
}

// 📝 Idempotency Key 검증 스키마
const idempotencyKeySchema = z.string().min(1).max(100);

export function operationalGuardMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const guardedReq = req as GuardedRequest;
    const startTime = Date.now();
    
    try {
      // 🔑 Idempotency-Key 헤더 확인
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (!idempotencyKey) {
        throw new OperationalError(
          'Idempotency-Key 헤더가 필요합니다',
          ErrorCategory.VALIDATION_FAIL
        );
      }
      
      // Idempotency-Key 검증
      try {
        idempotencyKeySchema.parse(idempotencyKey);
      } catch {
        throw new OperationalError(
          'Idempotency-Key 형식이 올바르지 않습니다',
          ErrorCategory.VALIDATION_FAIL
        );
      }
      
      // 📊 Canonical Hash 생성 (요청 본문 + 주요 헤더)
      const canonicalData = {
        body: req.body,
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent']
      };
      const canonicalHash = generateCanonicalHash(canonicalData);
      
      // 👤 사용자 키 생성
      const userEmail = req.body?.email || req.headers['x-user-email'] as string;
      const userIP = req.ip || req.connection.remoteAddress;
      const userKey = generateUserKey(userEmail, userIP);
      
      // 📋 감사 컨텍스트 생성
      const auditContext = {
        idempotencyKey,
        userEmail,
        operation: `${req.method} ${req.path}`,
        templateVersion: req.headers['x-template-version'] as string,
        engineVersion: req.headers['x-engine-version'] as string,
        surveyKind: req.headers['x-survey-kind'] as string,
        surveyVersion: req.headers['x-survey-version'] as string
      };
      
      // 🔍 중복 요청 확인
      const { isDuplicate, cachedResponse } = await operationalGuard.checkIdempotency(
        idempotencyKey,
        canonicalHash,
        userEmail
      );
      
      if (isDuplicate && cachedResponse) {
        console.log('♻️ 캐시된 응답 반환:', idempotencyKey);
        return res.json(cachedResponse);
      }
      
      // 🔒 동시성 락 획득
      await operationalGuard.acquireLock(userKey);
      
      // 요청 컨텍스트 설정
      guardedReq.guardContext = {
        idempotencyKey,
        canonicalHash,
        userKey,
        startTime,
        auditContext
      };
      
      console.log(`🔒 운영 가드 활성화: ${idempotencyKey.slice(0, 8)}...`);
      next();
      
    } catch (error) {
      console.error('❌ 운영 가드 에러:', error);
      
      if (error instanceof OperationalError) {
        const statusCode = getStatusCodeForCategory(error.category);
        res.status(statusCode).json({
          success: false,
          error: error.message,
          category: error.category,
          retryable: error.isRetryable
        });
      } else {
        res.status(500).json({
          success: false,
          error: '내부 서버 오류',
          category: ErrorCategory.RETRYABLE_429_5XX
        });
      }
    }
  };
}

// 🔄 운영 가드 완료 미들웨어 (응답 후 정리)
export function operationalGuardCleanup() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const guardedReq = req as GuardedRequest;
    
    // 응답 후 정리 작업
    res.on('finish', async () => {
      if (!guardedReq.guardContext) return;
      
      const { userKey, idempotencyKey, startTime, auditContext } = guardedReq.guardContext;
      const processingTime = Date.now() - startTime;
      
      try {
        // 🔓 락 해제
        await operationalGuard.releaseLock(userKey);
        
        // 📊 성공 로그 기록
        if (res.statusCode < 400) {
          await operationalGuard.completeIdempotency(idempotencyKey, res.locals.responseData);
          
          await operationalGuard.logAudit(
            auditContext,
            'success',
            undefined,
            undefined,
            processingTime
          );
        } else {
          // 실패 처리
          await operationalGuard.failIdempotency(idempotencyKey, `HTTP ${res.statusCode}`);
          
          await operationalGuard.logAudit(
            auditContext,
            'error',
            ErrorCategory.RETRYABLE_429_5XX,
            `HTTP ${res.statusCode}`,
            processingTime
          );
        }
        
        console.log(`✅ 운영 가드 정리 완료: ${idempotencyKey.slice(0, 8)}... (${processingTime}ms)`);
        
      } catch (cleanupError) {
        console.error('❌ 운영 가드 정리 실패:', cleanupError);
      }
    });
    
    next();
  };
}

// 🎯 에러 카테고리별 HTTP 상태 코드 매핑
function getStatusCodeForCategory(category: ErrorCategory): number {
  switch (category) {
    case ErrorCategory.AUTH_KEY_PARSE:
      return 401;
    case ErrorCategory.DRIVE_PERMISSION:
      return 403;
    case ErrorCategory.DRIVE_FOLDER_NOT_FOUND:
      return 404;
    case ErrorCategory.VALIDATION_FAIL:
      return 400;
    case ErrorCategory.CONFLICT_PRECHECK:
      return 409;
    case ErrorCategory.DRIVE_QUOTA:
    case ErrorCategory.RETRYABLE_429_5XX:
      return 429;
    case ErrorCategory.SHEETS_RANGE:
      return 400;
    case ErrorCategory.EMAIL_FAIL:
      return 502;
    default:
      return 500;
  }
}

// 🔧 응답 데이터 캐싱용 헬퍼
export function cacheResponse(data: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.responseData = data;
    next();
  };
}