// 🧠 룰 평가 엔진 - JSONLogic 기반 범용 룰 엔진
// ✨ 기능: 조건 평가, 우선순위 처리, 전략 지원, 성능 최적화
// 🎯 목표: Context → Rules → Results 변환의 핵심 로직

import * as jsonLogic from 'json-logic-js';
import {
  type RuleSet,
  type Rule,
  type EvaluationContext,
  type EvaluateRequest,
  type EvaluationResult,
  type EvaluationError,
  type RuleMatchStrategy,
  evaluateRequestSchema,
  evaluationResultSchema,
  evaluationErrorSchema
} from './schemas.js';
import { loadDefaultRules, ruleSourceManager } from './sources/index.js';

// 🎲 룰 평가 결과 인터페이스
interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  priority: number;
  result: Record<string, any>;
  executionTimeMs?: number;
  matched: boolean;
  error?: string;
}

// 🧠 메인 룰 평가 엔진
export class RuleEvaluator {
  private ruleSets: RuleSet[] = [];
  private initialized = false;

  constructor() {
    // JSONLogic 커스텀 오퍼레이터 등록 (필요시 확장)
    this.registerCustomOperators();
  }

  // 🚀 초기화 (룰셋 로드)
  async initialize(ruleSets?: RuleSet[]): Promise<void> {
    if (ruleSets) {
      this.ruleSets = ruleSets;
    } else {
      // 기본 룰셋 로드
      this.ruleSets = await loadDefaultRules();
    }

    this.initialized = true;
    console.log(`🚀 룰 평가 엔진 초기화 완료 (${this.ruleSets.length}개 룰셋)`);
  }

  // 🎯 메인 평가 메소드
  async evaluate(request: EvaluateRequest): Promise<EvaluationResult | EvaluationError> {
    const startTime = Date.now();

    try {
      // 초기화 확인
      if (!this.initialized) {
        await this.initialize();
      }

      // 요청 검증
      const validatedRequest = evaluateRequestSchema.parse(request);
      
      // 평가 실행
      const result = await this.executeEvaluation(validatedRequest);
      
      // 결과 검증 및 반환
      return evaluationResultSchema.parse(result);

    } catch (error) {
      return this.createErrorResponse(error, startTime);
    }
  }

  // 🔍 핵심 평가 로직
  private async executeEvaluation(request: EvaluateRequest): Promise<EvaluationResult> {
    const startTime = Date.now();
    const context = request.context;
    const options = request.options;

    // 사용할 룰셋 결정
    const targetRuleSets = this.getTargetRuleSets(request.ruleSetId);
    
    // 모든 룰 수집 및 우선순위 정렬
    const allRules = this.collectAndSortRules(targetRuleSets);
    
    // 전략 결정
    const strategy = request.strategy || 
      (targetRuleSets.length > 0 ? targetRuleSets[0].strategy : 'first-match');

    // 룰 평가 실행
    const evaluationResults = await this.evaluateRules(
      allRules, 
      context, 
      strategy, 
      options
    );

    // 성공한 룰들만 필터링
    const successfulResults = evaluationResults.filter(r => r.matched);
    
    // 결과 구성
    const result: EvaluationResult = {
      success: true,
      results: successfulResults.map(r => ({
        ruleId: r.ruleId,
        ruleName: r.ruleName,
        priority: r.priority,
        result: r.result,
        executionTimeMs: r.executionTimeMs
      })),
      meta: {
        strategy,
        totalRulesEvaluated: evaluationResults.length,
        matchedRulesCount: successfulResults.length,
        executionTimeMs: Date.now() - startTime,
        ruleSetId: targetRuleSets[0]?.id,
        ruleSetVersion: targetRuleSets[0]?.version
      }
    };

    // 디버그 정보 추가 (요청시)
    if (options.includeDebugInfo) {
      result.debug = {
        evaluatedRules: evaluationResults.map(r => ({
          ruleId: r.ruleId,
          matched: r.matched,
          error: r.error,
          executionTimeMs: r.executionTimeMs
        })),
        context: options.includeDebugInfo ? context : undefined,
        errors: evaluationResults
          .filter(r => r.error)
          .map(r => `${r.ruleId}: ${r.error}`)
      };
    }

    return result;
  }

  // 📦 룰 평가 실행
  private async evaluateRules(
    rules: Rule[],
    context: EvaluationContext,
    strategy: RuleMatchStrategy,
    options: { maxRules?: number; timeout?: number } = {}
  ): Promise<RuleEvaluationResult[]> {
    const results: RuleEvaluationResult[] = [];
    const maxRules = options.maxRules || rules.length;
    const timeout = options.timeout || 5000;
    const startTime = Date.now();

    for (let i = 0; i < Math.min(rules.length, maxRules); i++) {
      // 타임아웃 체크
      if (Date.now() - startTime > timeout) {
        console.warn(`⏱️ 룰 평가 타임아웃: ${timeout}ms`);
        break;
      }

      const rule = rules[i];
      const ruleResult = await this.evaluateRule(rule, context);
      results.push(ruleResult);

      // first-match 전략: 첫 매치에서 중단
      if (strategy === 'first-match' && ruleResult.matched) {
        console.log(`🎯 First-match 전략: ${rule.name} 매치됨, 평가 중단`);
        break;
      }
    }

    return results;
  }

  // 🎲 개별 룰 평가
  private async evaluateRule(rule: Rule, context: EvaluationContext): Promise<RuleEvaluationResult> {
    const startTime = Date.now();

    try {
      // 룰 비활성화 체크
      if (!rule.enabled) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          result: {},
          matched: false,
          executionTimeMs: Date.now() - startTime
        };
      }

      // JSONLogic로 조건 평가
      const matched = jsonLogic.apply(rule.condition, context);

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        priority: rule.priority,
        result: matched ? rule.result : {},
        matched: !!matched,
        executionTimeMs: Date.now() - startTime
      };

    } catch (error) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        priority: rule.priority,
        result: {},
        matched: false,
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  // 🎯 대상 룰셋 결정
  private getTargetRuleSets(ruleSetId?: string): RuleSet[] {
    if (ruleSetId) {
      const target = this.ruleSets.find(rs => rs.id === ruleSetId);
      return target ? [target] : [];
    }
    return this.ruleSets;
  }

  // 📋 룰 수집 및 정렬
  private collectAndSortRules(ruleSets: RuleSet[]): Rule[] {
    const allRules: Rule[] = [];

    for (const ruleSet of ruleSets) {
      allRules.push(...ruleSet.rules.filter(rule => rule.enabled));
    }

    // 우선순위로 정렬 (높은 순서)
    return allRules.sort((a, b) => b.priority - a.priority);
  }

  // 🚨 에러 응답 생성
  private createErrorResponse(error: any, startTime: number): EvaluationError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return evaluationErrorSchema.parse({
      success: false,
      error: errorMessage,
      code: error.code || 'EVALUATION_ERROR',
      details: {
        executionTimeMs: Date.now() - startTime
      },
      debug: error.stack ? { stack: error.stack } : undefined
    });
  }

  // ⚙️ 커스텀 JSONLogic 오퍼레이터 등록
  private registerCustomOperators(): void {
    // 배열에 포함 확인
    jsonLogic.add_operation('includes', (array: any[], value: any) => {
      if (!Array.isArray(array)) return false;
      return array.includes(value);
    });

    // 문자열 포함 확인
    jsonLogic.add_operation('contains', (str: string, substring: string) => {
      if (typeof str !== 'string') return false;
      return str.includes(substring);
    });

    // 정규식 매치
    jsonLogic.add_operation('regex', (str: string, pattern: string) => {
      if (typeof str !== 'string') return false;
      try {
        const regex = new RegExp(pattern);
        return regex.test(str);
      } catch {
        return false;
      }
    });

    // 나이 계산 (생년월일 기준)
    jsonLogic.add_operation('age', (birthDate: string) => {
      try {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      } catch {
        return 0;
      }
    });

    console.log('🔧 커스텀 JSONLogic 오퍼레이터 등록 완료');
  }

  // 🔄 룰셋 리로드
  async reloadRules(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }

  // 📊 통계 정보
  getStats(): { ruleSetsCount: number; totalRulesCount: number; enabledRulesCount: number } {
    const totalRules = this.ruleSets.reduce((sum, rs) => sum + rs.rules.length, 0);
    const enabledRules = this.ruleSets.reduce(
      (sum, rs) => sum + rs.rules.filter(r => r.enabled).length, 
      0
    );

    return {
      ruleSetsCount: this.ruleSets.length,
      totalRulesCount: totalRules,
      enabledRulesCount: enabledRules
    };
  }
}

// 🎯 기본 평가 엔진 인스턴스
export const defaultEvaluator = new RuleEvaluator();

// 🔥 편의 함수: 빠른 평가
export async function quickEvaluate(
  context: EvaluationContext,
  strategy: RuleMatchStrategy = 'first-match'
): Promise<EvaluationResult | EvaluationError> {
  return defaultEvaluator.evaluate({
    context,
    strategy,
    options: { includeDebugInfo: false, timeout: 5000 }
  });
}