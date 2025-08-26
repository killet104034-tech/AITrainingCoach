// 🎯 새로운 모듈형 API v2 - 설문 처리
import type { Express } from 'express';
import { SurveyRegistry } from '@sinabro/dsl';
import { CoreEngine } from '@sinabro/core';
import { PowerliftingV1Engine } from '@sinabro/pack-powerlifting-v1';

// 설문 스키마 레지스트리 초기화
SurveyRegistry.initialize();

// 엔진 설정
const coreEngine = new CoreEngine();
const powerliftingEngine = new PowerliftingV1Engine();

export function registerV2Routes(app: Express) {
  // 설문 스키마 레지스트리 초기화
  SurveyRegistry.initialize();

  // 엔진 설정
  const coreEngine = new CoreEngine();
  const powerliftingEngine = new PowerliftingV1Engine();

  // 🚀 새로운 구조의 설문 제출 API
  app.post('/api/v2/surveys', async (req, res) => {
  try {
    const { schemaId = 'basic-v1', ...surveyData } = req.body;
    
    console.log(`📝 [API-v2] 설문 처리 시작: ${schemaId}`);
    
    // 1. DSL 검증
    const validation = await SurveyRegistry.validateResponse(schemaId, surveyData);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: '설문 검증 실패',
        errors: validation.errors
      });
    }

    // 2. 적절한 엔진 선택
    let engine = coreEngine;
    let engineName = 'core';
    
    if (schemaId.includes('powerlifting')) {
      engine = powerliftingEngine;
      engineName = 'powerlifting-v1';
    }

    // 3. 엔진으로 훈련 프로그램 생성
    const result = await engine.processResponse(validation.data, schemaId);
    
    // 4. 응답 (이메일은 일단 로깅만)
    console.log(`📧 [API-v2] 이메일 발송 대상: ${surveyData.email}`);
    console.log(`🏋️ [API-v2] 생성된 프로그램: ${result.trainingProgram.substring(0, 100)}...`);

    res.json({
      success: true,
      message: '새로운 모듈 구조로 프로그램 생성 완료!',
      schemaId,
      engineUsed: engineName,
      trainingProgram: result.trainingProgram,
      warnings: result.warnings,
      conflicts: result.conflicts,
      metadata: {
        structure: 'modular',
        version: 'v2.0',
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ [API-v2] 처리 완료: ${surveyData.name} (${engineName})`);
    
  } catch (error) {
    console.error('❌ [API-v2] 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다: ' + (error as Error).message
    });
  }
});

  // 설문 스키마 목록 API
  app.get('/api/v2/surveys/schemas', (req, res) => {
  const schemas = SurveyRegistry.getAll();
  res.json({
    success: true,
    schemas: schemas.map(s => ({
      id: s.id,
      version: s.version,
      title: s.title,
      description: s.description,
      sections: s.sections.length
    }))
  });
});

  // 특정 설문 스키마 조회 API
  app.get('/api/v2/surveys/schemas/:schemaId', (req, res) => {
  const schema = SurveyRegistry.get(req.params.schemaId);
  if (!schema) {
    return res.status(404).json({
      success: false,
      message: '스키마를 찾을 수 없습니다'
    });
  }
  
  res.json({
    success: true,
    schema
  });
});

}