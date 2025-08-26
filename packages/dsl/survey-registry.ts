// 🎯 설문 스키마 레지스트리 - 모든 설문 스키마 관리
import type { SurveySchema } from './survey-schema.js';
import { basicSurveySchema, powerliftingSurveySchema } from './survey-schema.js';
import { DynamicValidator } from './dynamic-validator.js';

export class SurveyRegistry {
  private static schemas = new Map<string, SurveySchema>();

  // 기본 스키마들 등록
  static initialize() {
    this.register(basicSurveySchema);
    this.register(powerliftingSurveySchema);
    
    console.log('📋 설문 스키마 레지스트리 초기화 완료');
    console.log(`등록된 스키마: ${Array.from(this.schemas.keys()).join(', ')}`);
  }

  static register(schema: SurveySchema) {
    this.schemas.set(schema.id, schema);
    console.log(`📝 설문 스키마 등록: ${schema.id} v${schema.version}`);
  }

  static get(schemaId: string): SurveySchema | undefined {
    return this.schemas.get(schemaId);
  }

  static getAll(): SurveySchema[] {
    return Array.from(this.schemas.values());
  }

  static createValidator(schemaId: string) {
    const schema = this.get(schemaId);
    if (!schema) {
      throw new Error(`설문 스키마를 찾을 수 없습니다: ${schemaId}`);
    }
    
    return DynamicValidator.createZodSchema(schema);
  }

  // 설문 응답 검증
  static async validateResponse(schemaId: string, data: any) {
    const validator = this.createValidator(schemaId);
    
    try {
      const validatedData = await validator.parseAsync(data);
      return { success: true, data: validatedData, errors: [] };
    } catch (error: any) {
      return { 
        success: false, 
        data: null, 
        errors: error.errors || [{ message: error.message }] 
      };
    }
  }
}