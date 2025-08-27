// 🧪 룰 평가 엔진 테스트 - 종합 테스트 스위트
// ✨ 기능: 룰 엔진의 모든 기능을 검증하는 테스트 코드
// 🎯 커버리지: 스키마, 평가 로직, API, 에러 처리, 성능

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { RuleEvaluator, defaultEvaluator, quickEvaluate } from '../rules/evaluator.js';
import { 
  ruleSetSchema, 
  evaluationContextSchema,
  evaluateRequestSchema,
  type RuleSet,
  type EvaluationContext,
  type EvaluateRequest,
  type EvaluationResult 
} from '../rules/schemas.js';
import { ruleSourceManager, loadDefaultRules } from '../rules/sources/index.js';

describe('🧠 룰 평가 엔진 테스트', () => {
  let testEvaluator: RuleEvaluator;
  let sampleRuleSet: RuleSet;

  beforeAll(async () => {
    // 테스트용 룰셋 준비
    sampleRuleSet = {
      id: 'test-rules',
      name: '테스트 룰셋',
      version: '1.0.0',
      strategy: 'first-match',
      rules: [
        {
          id: 'test-beginner-strength',
          name: '초보자 근력 테스트',
          condition: {
            'and': [
              { '==': [{ 'var': 'survey.experience_level' }, 'beginner'] },
              { 'includes': [{ 'var': 'survey.goals' }, 'strength'] }
            ]
          },
          result: {
            planId: 'beginner-strength-plan',
            emailTemplateId: 'beginner-welcome'
          },
          priority: 100,
          enabled: true,
          tags: ['beginner', 'strength']
        },
        {
          id: 'test-advanced-competition',
          name: '고급자 대회 테스트',
          condition: {
            'and': [
              { '==': [{ 'var': 'survey.experience_level' }, 'advanced'] },
              { 'includes': [{ 'var': 'survey.goals' }, 'competition'] }
            ]
          },
          result: {
            planId: 'advanced-competition-plan',
            emailTemplateId: 'advanced-welcome'
          },
          priority: 90,
          enabled: true,
          tags: ['advanced', 'competition']
        },
        {
          id: 'test-health-focus',
          name: '건강 목적 테스트',
          condition: {
            'or': [
              { 'includes': [{ 'var': 'survey.goals' }, 'health'] },
              { '>': [{ 'var': 'survey.age' }, 45] }
            ]
          },
          result: {
            planId: 'health-plan',
            emailTemplateId: 'health-welcome'
          },
          priority: 80,
          enabled: true,
          tags: ['health']
        },
        {
          id: 'test-disabled-rule',
          name: '비활성화된 룰',
          condition: {
            '==': [{ 'var': 'survey.test' }, 'disabled']
          },
          result: {
            planId: 'disabled-plan'
          },
          priority: 50,
          enabled: false,
          tags: ['disabled']
        }
      ],
      metadata: {}
    };

    testEvaluator = new RuleEvaluator();
    await testEvaluator.initialize([sampleRuleSet]);
  });

  afterAll(() => {
    // 정리 작업
    ruleSourceManager.clearCache();
  });

  describe('📋 스키마 검증 테스트', () => {
    it('룰셋 스키마가 올바르게 검증되어야 함', () => {
      const result = ruleSetSchema.safeParse(sampleRuleSet);
      expect(result.success).toBe(true);
    });

    it('평가 컨텍스트 스키마가 올바르게 검증되어야 함', () => {
      const context: EvaluationContext = {
        survey: {
          name: 'Test User',
          experience_level: 'beginner',
          goals: ['strength'],
          age: 25
        },
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        runtime: {
          timestamp: Date.now(),
          requestId: 'test-123'
        }
      };

      const result = evaluationContextSchema.safeParse(context);
      expect(result.success).toBe(true);
    });

    it('평가 요청 스키마가 올바르게 검증되어야 함', () => {
      const request: EvaluateRequest = {
        context: {
          survey: { name: 'Test' },
          runtime: {}
        },
        strategy: 'first-match',
        options: {
          includeDebugInfo: false,
          timeout: 5000
        }
      };

      const result = evaluateRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('🎯 룰 평가 로직 테스트', () => {
    it('초보자 근력 목표에 맞는 룰이 매치되어야 함', async () => {
      const context: EvaluationContext = {
        survey: {
          experience_level: 'beginner',
          goals: ['strength', 'muscle'],
          age: 25
        },
        runtime: {}
      };

      const result = await testEvaluator.evaluate({
        context,
        strategy: 'first-match',
        options: { includeDebugInfo: true }
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].ruleId).toBe('test-beginner-strength');
      expect(result.results[0].result.planId).toBe('beginner-strength-plan');
      expect(result.meta.strategy).toBe('first-match');
    });

    it('고급자 대회 목표에 맞는 룰이 매치되어야 함', async () => {
      const context: EvaluationContext = {
        survey: {
          experience_level: 'advanced',
          goals: ['competition', 'strength'],
          age: 30
        },
        runtime: {}
      };

      const result = await testEvaluator.evaluate({
        context,
        strategy: 'first-match'
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      expect(result.results[0].ruleId).toBe('test-advanced-competition');
    });

    it('나이 조건으로 건강 목적 룰이 매치되어야 함', async () => {
      const context: EvaluationContext = {
        survey: {
          experience_level: 'intermediate',
          goals: ['strength'],
          age: 50  // 45세 초과
        },
        runtime: {}
      };

      const result = await testEvaluator.evaluate({
        context,
        strategy: 'first-match'
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      expect(result.results[0].ruleId).toBe('test-health-focus');
    });

    it('collect-all 전략으로 모든 매치되는 룰을 수집해야 함', async () => {
      const context: EvaluationContext = {
        survey: {
          experience_level: 'beginner',
          goals: ['strength', 'health'],
          age: 50  // 건강 룰도 매치됨
        },
        runtime: {}
      };

      const result = await testEvaluator.evaluate({
        context,
        strategy: 'collect-all'
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      expect(result.results.length).toBeGreaterThan(1);
      expect(result.meta.strategy).toBe('collect-all');
    });

    it('비활성화된 룰은 매치되지 않아야 함', async () => {
      const context: EvaluationContext = {
        survey: {
          test: 'disabled'
        },
        runtime: {}
      };

      const result = await testEvaluator.evaluate({
        context,
        strategy: 'collect-all'
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('🔧 커스텀 JSONLogic 오퍼레이터 테스트', () => {
    it('includes 오퍼레이터가 올바르게 작동해야 함', async () => {
      const context: EvaluationContext = {
        survey: {
          goals: ['strength', 'muscle', 'health']
        },
        runtime: {}
      };

      // includes 조건을 가진 룰 테스트
      const result = await testEvaluator.evaluate({
        context,
        strategy: 'collect-all'
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      // goals에 health가 포함되어 건강 룰이 매치되어야 함
      const healthRule = result.results.find(r => r.ruleId === 'test-health-focus');
      expect(healthRule).toBeDefined();
    });
  });

  describe('⚡ 성능 및 에러 처리 테스트', () => {
    it('대량의 룰 평가가 제한 시간 내에 완료되어야 함', async () => {
      const startTime = Date.now();
      
      const context: EvaluationContext = {
        survey: { experience_level: 'beginner', goals: ['strength'] },
        runtime: {}
      };

      const result = await testEvaluator.evaluate({
        context,
        options: { timeout: 1000 }
      });

      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(1000);
      expect(result.success).toBe(true);
    });

    it('잘못된 JSONLogic 조건에서 에러가 적절히 처리되어야 함', async () => {
      const badRuleSet: RuleSet = {
        id: 'bad-rules',
        name: '잘못된 룰셋',
        version: '1.0.0',
        strategy: 'first-match',
        rules: [{
          id: 'bad-rule',
          name: '잘못된 룰',
          condition: { 'invalid-operator': [null, undefined] },
          result: { error: 'should-not-reach' },
          priority: 1,
          enabled: true,
          tags: []
        }],
        metadata: {}
      };

      const badEvaluator = new RuleEvaluator();
      await badEvaluator.initialize([badRuleSet]);

      const result = await badEvaluator.evaluate({
        context: { survey: {}, runtime: {} },
        options: { includeDebugInfo: true }
      });

      expect(result.success).toBe(true);
      // 에러가 있어도 평가는 계속되어야 함
      if ('debug' in result && result.debug) {
        expect(result.debug.errors.length).toBeGreaterThan(0);
      }
    });

    it('빈 컨텍스트에서도 안전하게 처리되어야 함', async () => {
      const result = await testEvaluator.evaluate({
        context: { runtime: {} }
      });

      expect(result.success).toBe(true);
      // 조건이 맞지 않아 매치되는 룰이 없을 수 있음
      expect(result.results).toEqual([]);
    });
  });

  describe('🔄 룰 소스 관리 테스트', () => {
    it('기본 룰셋이 올바르게 로드되어야 함', async () => {
      const ruleSets = await loadDefaultRules();
      expect(Array.isArray(ruleSets)).toBe(true);
      
      if (ruleSets.length > 0) {
        expect(ruleSets[0]).toHaveProperty('id');
        expect(ruleSets[0]).toHaveProperty('rules');
        expect(Array.isArray(ruleSets[0].rules)).toBe(true);
      }
    });

    it('룰 엔진 통계가 올바르게 반환되어야 함', () => {
      const stats = testEvaluator.getStats();
      
      expect(stats).toHaveProperty('ruleSetsCount');
      expect(stats).toHaveProperty('totalRulesCount');
      expect(stats).toHaveProperty('enabledRulesCount');
      expect(stats.ruleSetsCount).toBe(1);
      expect(stats.totalRulesCount).toBe(4);
      expect(stats.enabledRulesCount).toBe(3); // 1개는 disabled
    });
  });

  describe('🚀 편의 함수 테스트', () => {
    beforeAll(async () => {
      // 기본 평가 엔진 초기화
      await defaultEvaluator.initialize([sampleRuleSet]);
    });

    it('quickEvaluate 함수가 올바르게 작동해야 함', async () => {
      const context: EvaluationContext = {
        survey: {
          experience_level: 'beginner',
          goals: ['strength']
        },
        runtime: {}
      };

      const result = await quickEvaluate(context, 'first-match');

      expect(result.success).toBe(true);
      if ('results' in result) {
        expect(result.results.length).toBeGreaterThan(0);
      }
    });
  });

  describe('🎨 실제 시나리오 테스트', () => {
    it('실제 설문 응답 시나리오 - 초보자', async () => {
      const realWorldContext: EvaluationContext = {
        survey: {
          name: '김철수',
          email: 'chulsu@example.com',
          age: 28,
          experience_level: 'beginner',
          goals: ['strength', 'muscle'],
          training_days: 3,
          injury_history: false
        },
        user: {
          id: 'user-123',
          email: 'chulsu@example.com',
          name: '김철수'
        },
        environment: {
          season: 'winter',
          gym_type: 'commercial'
        },
        runtime: {
          timestamp: Date.now(),
          requestId: 'real-scenario-001',
          version: '1.0.0'
        }
      };

      const result = await testEvaluator.evaluate({
        context: realWorldContext,
        strategy: 'first-match',
        options: {
          includeDebugInfo: true,
          timeout: 3000
        }
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].result).toHaveProperty('planId');
      expect(result.results[0].result).toHaveProperty('emailTemplateId');
      expect(result.meta.executionTimeMs).toBeLessThan(100);
    });

    it('실제 설문 응답 시나리오 - 중년층 건강', async () => {
      const middleAgedContext: EvaluationContext = {
        survey: {
          name: '박영희',
          age: 48,
          experience_level: 'beginner',
          goals: ['health', 'weight-loss'],
          medical_conditions: ['hypertension']
        },
        user: {
          email: 'younghee@example.com',
          name: '박영희'
        },
        runtime: {}
      };

      const result = await testEvaluator.evaluate({
        context: middleAgedContext,
        strategy: 'collect-all'
      }) as EvaluationResult;

      expect(result.success).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
      // 나이가 45 초과이므로 건강 룰이 매치되어야 함
      const healthRule = result.results.find(r => r.ruleId === 'test-health-focus');
      expect(healthRule).toBeDefined();
    });
  });
});