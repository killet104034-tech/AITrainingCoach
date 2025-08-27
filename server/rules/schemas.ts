// 🎯 룰 엔진 스키마 - Zod 기반 타입 검증 및 정의
// ✨ 기능: 룰 정의, Context 검증, 결과 타입 등 모든 스키마 관리
// 🔄 용도: JSONLogic 룰 + 우선순위 + 전략 + 입출력 검증

import { z } from 'zod';

// 🔥 JSONLogic 룰 스키마
export const jsonLogicRuleSchema = z.record(z.any()).describe('JSONLogic rule object');

// 📋 개별 룰 정의 스키마
export const ruleSchema = z.object({
  id: z.string().describe('Rule unique identifier'),
  name: z.string().describe('Human readable rule name'),
  description: z.string().optional().describe('Rule description'),
  condition: jsonLogicRuleSchema.describe('JSONLogic condition'),
  result: z.record(z.any()).describe('Result object when rule matches'),
  priority: z.number().default(0).describe('Rule priority (higher = more important)'),
  enabled: z.boolean().default(true).describe('Whether rule is active'),
  tags: z.array(z.string()).default([]).describe('Rule categorization tags'),
  metadata: z.record(z.any()).default({}).describe('Additional rule metadata')
});

// 📦 룰셋 스키마 (여러 룰들의 집합)
export const ruleSetSchema = z.object({
  id: z.string().describe('RuleSet unique identifier'),
  name: z.string().describe('RuleSet name'),
  version: z.string().default('1.0.0').describe('RuleSet version'),
  description: z.string().optional().describe('RuleSet description'),
  rules: z.array(ruleSchema).describe('Array of rules'),
  strategy: z.enum(['first-match', 'collect-all']).default('first-match').describe('Rule matching strategy'),
  metadata: z.record(z.any()).default({}).describe('RuleSet metadata')
});

// 🎯 평가 컨텍스트 스키마 (입력 데이터)
export const evaluationContextSchema = z.object({
  // 📊 설문 응답 데이터
  survey: z.record(z.any()).optional().describe('Survey response data'),
  
  // 🌍 환경 변수들
  environment: z.record(z.any()).optional().describe('Environment variables'),
  
  // 🔗 외부 소스 데이터
  external: z.record(z.any()).optional().describe('External source data'),
  
  // 👤 사용자 정보
  user: z.object({
    id: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    metadata: z.record(z.any()).default({})
  }).optional().describe('User information'),
  
  // ⚙️ 런타임 컨텍스트
  runtime: z.object({
    timestamp: z.number().default(() => Date.now()),
    requestId: z.string().optional(),
    version: z.string().default('1.0.0'),
    metadata: z.record(z.any()).default({})
  }).default({}).describe('Runtime context information')
});

// 🎲 평가 요청 스키마
export const evaluateRequestSchema = z.object({
  context: evaluationContextSchema.describe('Evaluation context data'),
  ruleSetId: z.string().optional().describe('Specific ruleset to use (optional)'),
  strategy: z.enum(['first-match', 'collect-all']).optional().describe('Override strategy'),
  options: z.object({
    includeDebugInfo: z.boolean().default(false).describe('Include debug information'),
    maxRules: z.number().positive().optional().describe('Maximum rules to evaluate'),
    timeout: z.number().positive().default(5000).describe('Evaluation timeout in ms')
  }).default({}).describe('Evaluation options')
});

// 🏆 평가 결과 스키마
export const evaluationResultSchema = z.object({
  success: z.boolean().describe('Whether evaluation succeeded'),
  results: z.array(z.object({
    ruleId: z.string(),
    ruleName: z.string(),
    priority: z.number(),
    result: z.record(z.any()),
    executionTimeMs: z.number().optional()
  })).describe('Matched rules and their results'),
  
  // 📊 메타 정보
  meta: z.object({
    strategy: z.enum(['first-match', 'collect-all']),
    totalRulesEvaluated: z.number(),
    matchedRulesCount: z.number(),
    executionTimeMs: z.number(),
    ruleSetId: z.string().optional(),
    ruleSetVersion: z.string().optional()
  }).describe('Evaluation metadata'),
  
  // 🐛 디버그 정보 (옵션)
  debug: z.object({
    evaluatedRules: z.array(z.object({
      ruleId: z.string(),
      matched: z.boolean(),
      error: z.string().optional(),
      executionTimeMs: z.number().optional()
    })),
    context: z.record(z.any()).optional(),
    errors: z.array(z.string()).default([])
  }).optional().describe('Debug information (when requested)')
});

// 🚨 에러 스키마
export const evaluationErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().describe('Error message'),
  code: z.string().describe('Error code'),
  details: z.record(z.any()).optional().describe('Additional error details'),
  debug: z.record(z.any()).optional().describe('Debug information')
});

// 📄 타입 익스포트
export type JsonLogicRule = z.infer<typeof jsonLogicRuleSchema>;
export type Rule = z.infer<typeof ruleSchema>;
export type RuleSet = z.infer<typeof ruleSetSchema>;
export type EvaluationContext = z.infer<typeof evaluationContextSchema>;
export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>;
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;
export type EvaluationError = z.infer<typeof evaluationErrorSchema>;

// 🎛️ 전략 타입
export type RuleMatchStrategy = 'first-match' | 'collect-all';

// 📋 룰 소스 타입 (확장 가능)
export type RuleSource = 'json' | 'sheets' | 'database' | 'api';

// 🏗️ 룰 소스 설정 스키마
export const ruleSourceConfigSchema = z.object({
  type: z.enum(['json', 'sheets', 'database', 'api']).describe('Rule source type'),
  config: z.record(z.any()).describe('Source-specific configuration'),
  enabled: z.boolean().default(true).describe('Whether source is enabled'),
  priority: z.number().default(0).describe('Source loading priority'),
  cacheTtlMs: z.number().positive().default(300000).describe('Cache TTL in milliseconds (5 min default)')
});

export type RuleSourceConfig = z.infer<typeof ruleSourceConfigSchema>;