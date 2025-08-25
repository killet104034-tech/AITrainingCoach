import { db } from '../db';
import { idempotencyKeys, rateLimits, auditLogs } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import crypto from 'crypto';

// 🔒 안정성(운영 가드) 서비스

// ⚠️ 에러 카테고리 표준화
export enum ErrorCategory {
  AUTH_KEY_PARSE = 'AUTH_KEY_PARSE',
  DRIVE_PERMISSION = 'DRIVE_PERMISSION', 
  DRIVE_FOLDER_NOT_FOUND = 'DRIVE_FOLDER_NOT_FOUND',
  DRIVE_QUOTA = 'DRIVE_QUOTA',
  SHEETS_RANGE = 'SHEETS_RANGE',
  RETRYABLE_429_5XX = 'RETRYABLE_429_5XX',
  VALIDATION_FAIL = 'VALIDATION_FAIL',
  CONFLICT_PRECHECK = 'CONFLICT_PRECHECK',
  EMAIL_FAIL = 'EMAIL_FAIL'
}

export class OperationalError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public isRetryable: boolean = false,
    public originalError?: any
  ) {
    super(message);
    this.name = 'OperationalError';
  }
}

export interface AuditContext {
  idempotencyKey?: string;
  userEmail?: string;
  operation: string;
  templateVersion?: string;
  engineVersion?: string;
  surveyKind?: string;
  surveyVersion?: string;
  warnings?: any[];
}

// 🔧 운영 가드 서비스
export class OperationalGuardService {
  
  // 📝 Idempotency-Key + canonical_hash(24h) → 중복 생성 0
  async checkIdempotency(
    idempotencyKey: string, 
    canonicalHash: string, 
    userEmail?: string
  ): Promise<{ isDuplicate: boolean; cachedResponse?: any }> {
    
    // 기존 요청 확인 (24시간 TTL)
    const existing = await db
      .select()
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.idempotencyKey, idempotencyKey),
          gte(idempotencyKeys.expiresAt, sql`now()`)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];
      
      // canonical_hash가 다르면 새로운 요청으로 처리
      if (record.canonicalHash !== canonicalHash) {
        console.log('🔄 Canonical hash 변경 감지 - 새로운 요청으로 처리');
        await this.updateIdempotencyRecord(record.id, canonicalHash, 'processing');
        return { isDuplicate: false };
      }
      
      // 완료된 요청이면 캐시된 응답 반환
      if (record.status === 'completed' && record.response) {
        console.log('♻️ 중복 요청 감지 - 캐시된 응답 반환');
        return { isDuplicate: true, cachedResponse: record.response };
      }
      
      // 처리 중인 요청
      if (record.status === 'processing') {
        throw new OperationalError(
          '동일한 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.',
          ErrorCategory.CONFLICT_PRECHECK
        );
      }
    }
    
    // 새로운 요청 등록
    await db.insert(idempotencyKeys).values({
      idempotencyKey,
      canonicalHash,
      userEmail,
      status: 'processing',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 TTL
    });
    
    return { isDuplicate: false };
  }
  
  // 📝 Idempotency 완료 처리
  async completeIdempotency(idempotencyKey: string, response: any): Promise<void> {
    await db
      .update(idempotencyKeys)
      .set({ 
        status: 'completed',
        response: response
      })
      .where(eq(idempotencyKeys.idempotencyKey, idempotencyKey));
  }
  
  // 📝 Idempotency 실패 처리
  async failIdempotency(idempotencyKey: string, error: string): Promise<void> {
    await db
      .update(idempotencyKeys)
      .set({ 
        status: 'failed',
        response: { error }
      })
      .where(eq(idempotencyKeys.idempotencyKey, idempotencyKey));
  }
  
  // 🔒 동시성 락: 같은 사용자(이메일/UID) 동시 요청 1개 제한
  async acquireLock(userKey: string): Promise<boolean> {
    try {
      // 기존 락 확인
      const existingLock = await db
        .select()
        .from(rateLimits)
        .where(eq(rateLimits.userKey, userKey))
        .limit(1);
      
      const now = new Date();
      
      if (existingLock.length > 0) {
        const lock = existingLock[0];
        
        // 락이 활성 상태인지 확인 (5분 타임아웃)
        if (lock.isLocked === 'true' && lock.lockStartedAt) {
          const lockAge = now.getTime() - new Date(lock.lockStartedAt).getTime();
          if (lockAge < 5 * 60 * 1000) { // 5분
            throw new OperationalError(
              '동시 요청이 제한되었습니다. 잠시 후 다시 시도해주세요.',
              ErrorCategory.CONFLICT_PRECHECK
            );
          }
        }
        
        // 락 갱신
        await db
          .update(rateLimits)
          .set({
            isLocked: 'true',
            lockStartedAt: now,
            requestCount: String(parseInt(lock.requestCount) + 1),
            lastRequestAt: now
          })
          .where(eq(rateLimits.userKey, userKey));
      } else {
        // 새로운 락 생성
        await db.insert(rateLimits).values({
          userKey,
          isLocked: 'true',
          lockStartedAt: now,
          requestCount: '1'
        });
      }
      
      return true;
    } catch (error) {
      if (error instanceof OperationalError) throw error;
      throw new OperationalError(
        '락 획득 실패',
        ErrorCategory.CONFLICT_PRECHECK,
        false,
        error
      );
    }
  }
  
  // 🔓 락 해제
  async releaseLock(userKey: string): Promise<void> {
    await db
      .update(rateLimits)
      .set({ 
        isLocked: 'false',
        lockStartedAt: null
      })
      .where(eq(rateLimits.userKey, userKey));
  }
  
  // 📊 Index DB 기록: 생성 시간, 호출 수, 경고, 실패 원인, 템플릿/엔진/설문 버전
  async logAudit(
    context: AuditContext,
    status: 'success' | 'error' | 'retry',
    errorCategory?: ErrorCategory,
    errorMessage?: string,
    processingTimeMs?: number,
    requestCount: number = 1,
    metadata?: any
  ): Promise<void> {
    
    await db.insert(auditLogs).values({
      idempotencyKey: context.idempotencyKey,
      userEmail: context.userEmail,
      operation: context.operation,
      status,
      errorCategory,
      errorMessage,
      processingTimeMs: processingTimeMs?.toString(),
      requestCount: requestCount.toString(),
      templateVersion: context.templateVersion,
      engineVersion: context.engineVersion,
      surveyKind: context.surveyKind,
      surveyVersion: context.surveyVersion,
      warnings: context.warnings,
      metadata
    });
  }

  // ⏱️ 429/5xx 재시도: 지수 백오프(3회)
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: AuditContext,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        const startTime = Date.now();
        const result = await operation();
        const processingTime = Date.now() - startTime;
        
        // 성공 로그
        await this.logAudit(
          context,
          'success',
          undefined,
          undefined,
          processingTime,
          attempt + 1
        );
        
        return result;
        
      } catch (error: any) {
        attempt++;
        lastError = error;
        
        const errorCategory = this.categorizeError(error);
        const isRetryable = this.isRetryableError(errorCategory, error);
        
        // 로그 기록
        await this.logAudit(
          context,
          attempt > maxRetries ? 'error' : 'retry',
          errorCategory,
          error.message,
          undefined,
          attempt
        );
        
        // 재시도 불가능한 에러면 즉시 실패
        if (!isRetryable || attempt > maxRetries) {
          throw new OperationalError(
            `최대 재시도 횟수 초과: ${error.message}`,
            errorCategory,
            false,
            error
          );
        }
        
        // 지수 백오프 (1초, 2초, 4초)
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`🔄 재시도 ${attempt}/${maxRetries} - ${delay}ms 대기 중...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
  
  // 🏷️ 에러 카테고리화
  private categorizeError(error: any): ErrorCategory {
    const message = error.message?.toLowerCase() || '';
    const code = error.code;
    const status = error.status || error.statusCode;
    
    // HTTP 상태 코드 기반
    if (status === 429 || status >= 500) {
      return ErrorCategory.RETRYABLE_429_5XX;
    }
    
    // Google API 에러들
    if (message.includes('insufficient permission') || message.includes('access denied')) {
      return ErrorCategory.DRIVE_PERMISSION;
    }
    
    if (message.includes('folder not found') || message.includes('file not found')) {
      return ErrorCategory.DRIVE_FOLDER_NOT_FOUND;
    }
    
    if (message.includes('quota') || message.includes('rate limit')) {
      return ErrorCategory.DRIVE_QUOTA;
    }
    
    if (message.includes('range') || message.includes('invalid range')) {
      return ErrorCategory.SHEETS_RANGE;
    }
    
    // 인증 에러
    if (message.includes('auth') || message.includes('key') || message.includes('credential')) {
      return ErrorCategory.AUTH_KEY_PARSE;
    }
    
    // 이메일 에러
    if (message.includes('email') || message.includes('smtp') || message.includes('mail')) {
      return ErrorCategory.EMAIL_FAIL;
    }
    
    // 검증 에러
    if (message.includes('validation') || message.includes('invalid') || code === 'VALIDATION_ERROR') {
      return ErrorCategory.VALIDATION_FAIL;
    }
    
    // 기본값
    return ErrorCategory.RETRYABLE_429_5XX;
  }
  
  // 🔄 재시도 가능 여부 판단
  private isRetryableError(category: ErrorCategory, error: any): boolean {
    switch (category) {
      case ErrorCategory.RETRYABLE_429_5XX:
      case ErrorCategory.DRIVE_QUOTA:
        return true;
        
      case ErrorCategory.AUTH_KEY_PARSE:
      case ErrorCategory.DRIVE_PERMISSION:
      case ErrorCategory.DRIVE_FOLDER_NOT_FOUND:
      case ErrorCategory.SHEETS_RANGE:
      case ErrorCategory.VALIDATION_FAIL:
      case ErrorCategory.CONFLICT_PRECHECK:
      case ErrorCategory.EMAIL_FAIL:
        return false;
        
      default:
        // 알 수 없는 에러는 한 번만 재시도
        return true;
    }
  }
  
  // 🧹 정리 작업 (만료된 레코드 정리)
  async cleanup(): Promise<void> {
    const now = new Date();
    
    // 만료된 idempotency keys 정리
    await db
      .delete(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.status, 'completed'),
          sql`${idempotencyKeys.expiresAt} < now()`
        )
      );
    
    // 오래된 락 정리 (1시간 이상)
    await db
      .update(rateLimits)
      .set({ 
        isLocked: 'false',
        lockStartedAt: null
      })
      .where(
        and(
          eq(rateLimits.isLocked, 'true'),
          sql`${rateLimits.lockStartedAt} < now() - interval '1 hour'`
        )
      );
  }
  
  // 📝 헬퍼: Idempotency 레코드 업데이트
  private async updateIdempotencyRecord(
    id: string, 
    canonicalHash: string, 
    status: string
  ): Promise<void> {
    await db
      .update(idempotencyKeys)
      .set({ 
        canonicalHash,
        status,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 연장
      })
      .where(eq(idempotencyKeys.id, id));
  }
}

// 🏭 싱글톤 인스턴스
export const operationalGuard = new OperationalGuardService();

// 🔧 유틸리티: canonical hash 생성
export function generateCanonicalHash(data: any): string {
  const normalizedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(normalizedData).digest('hex').slice(0, 16);
}

// 🔧 유틸리티: 사용자 키 생성 (이메일 또는 IP)
export function generateUserKey(email?: string, ip?: string): string {
  return email || ip || 'anonymous';
}