// 🎯 동적 검증기 - 스키마로부터 Zod 스키마 생성
import { z } from 'zod';
import type { SurveySchema, SurveyField, FieldType } from './survey-schema.js';

export class DynamicValidator {
  static createZodSchema(surveySchema: SurveySchema): z.ZodSchema {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    for (const section of surveySchema.sections) {
      for (const field of section.fields) {
        schemaFields[field.name] = this.createFieldValidator(field);
      }
    }

    return z.object(schemaFields);
  }

  private static createFieldValidator(field: SurveyField): z.ZodTypeAny {
    let validator: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
      case 'textarea':
        validator = z.string();
        if (field.validation?.min) validator = validator.min(field.validation.min, field.validation.message);
        if (field.validation?.max) validator = validator.max(field.validation.max);
        if (field.validation?.pattern) validator = validator.regex(new RegExp(field.validation.pattern), field.validation.message);
        break;

      case 'email':
        validator = z.string().email(field.validation?.message || '올바른 이메일을 입력해주세요');
        break;

      case 'number':
        validator = z.number();
        if (field.validation?.min) validator = validator.min(field.validation.min);
        if (field.validation?.max) validator = validator.max(field.validation.max);
        break;

      case 'select':
      case 'radio':
        if (field.options) {
          validator = z.enum(field.options as [string, ...string[]]);
        } else {
          validator = z.string();
        }
        break;

      case 'checkbox':
        if (field.options) {
          const enumValidator = z.enum(field.options as [string, ...string[]]);
          validator = z.array(enumValidator);
          if (field.validation?.min) {
            validator = validator.min(field.validation.min, field.validation?.message || '최소 하나를 선택해주세요');
          }
        } else {
          validator = z.array(z.string());
        }
        break;

      default:
        validator = z.string();
    }

    // 필수 여부 처리
    if (!field.required) {
      validator = validator.optional();
    }

    return validator;
  }

  // 조건부 필드 체크
  static shouldShowField(field: SurveyField, formData: any): boolean {
    if (!field.conditional) return true;

    const dependentValue = formData[field.conditional.dependsOn];
    const condition = field.conditional.condition;

    // 간단한 조건 평가 (실제로는 더 복잡한 파서 필요)
    if (condition.includes('===')) {
      const [, expectedValue] = condition.split('===').map(s => s.trim().replace(/['"]/g, ''));
      return dependentValue === expectedValue;
    }
    
    if (condition.includes('!==')) {
      const [, expectedValue] = condition.split('!==').map(s => s.trim().replace(/['"]/g, ''));
      return dependentValue !== expectedValue;
    }

    if (condition.includes('includes')) {
      const [, expectedValue] = condition.split('includes').map(s => s.trim().replace(/['"]/g, ''));
      return Array.isArray(dependentValue) && dependentValue.includes(expectedValue);
    }

    return true;
  }
}