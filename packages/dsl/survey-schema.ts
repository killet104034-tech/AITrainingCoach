// 🎯 동적 설문 스키마 정의 시스템
import { z } from 'zod';

// 필드 타입 정의
export type FieldType = 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';

// 설문 필드 정의
export interface SurveyField {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[]; // select, checkbox, radio용
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    dependsOn: string;
    condition: string; // 예: "=== 'beginner'" 또는 "includes 'strength'"
    value: any;
  };
}

// 설문 섹션 정의
export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  fields: SurveyField[];
  conditional?: {
    dependsOn: string;
    condition: string;
    value: any;
  };
}

// 전체 설문 스키마
export interface SurveySchema {
  id: string;
  version: string;
  title: string;
  description?: string;
  sections: SurveySection[];
}

// 기본 3단계 설문 스키마 (현재)
export const basicSurveySchema: SurveySchema = {
  id: 'basic-v1',
  version: '1.0.0',
  title: '기본 설문',
  sections: [
    {
      id: 'basic_info',
      title: '기본 정보',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: '이름',
          required: true,
          validation: { min: 1, message: '이름을 입력해주세요' }
        },
        {
          name: 'goals',
          type: 'checkbox',
          label: '운동 목표',
          required: true,
          options: ['strength', 'muscle', 'health', 'competition'],
          validation: { min: 1, message: '최소 하나의 목표를 선택해주세요' }
        },
        {
          name: 'email',
          type: 'email',
          label: '이메일',
          required: true,
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$', message: '올바른 이메일을 입력해주세요' }
        }
      ]
    }
  ]
};

// 확장된 파워리프팅 설문 스키마 (예시)
export const powerliftingSurveySchema: SurveySchema = {
  id: 'powerlifting-v1',
  version: '1.0.0',
  title: '파워리프팅 맞춤 설문',
  sections: [
    {
      id: 'basic_info',
      title: '기본 정보',
      fields: [
        { name: 'name', type: 'text', label: '이름', required: true },
        { name: 'age', type: 'number', label: '나이', required: true, validation: { min: 16, max: 80 } },
        { name: 'email', type: 'email', label: '이메일', required: true }
      ]
    },
    {
      id: 'experience',
      title: '경험 수준',
      fields: [
        {
          name: 'experience_level',
          type: 'select',
          label: '파워리프팅 경험',
          required: true,
          options: ['beginner', 'intermediate', 'advanced']
        }
      ]
    },
    {
      id: 'current_stats',
      title: '현재 기록',
      conditional: {
        dependsOn: 'experience_level',
        condition: '!== "beginner"',
        value: 'not_beginner'
      },
      fields: [
        { name: 'squat_max', type: 'number', label: '스쿼트 1RM (kg)', validation: { min: 40, max: 400 } },
        { name: 'bench_max', type: 'number', label: '벤치프레스 1RM (kg)', validation: { min: 30, max: 300 } },
        { name: 'deadlift_max', type: 'number', label: '데드리프트 1RM (kg)', validation: { min: 50, max: 500 } }
      ]
    }
  ]
};