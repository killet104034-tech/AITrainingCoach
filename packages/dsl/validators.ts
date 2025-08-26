// 🎯 설문 검증기들
import { z } from 'zod';

// 기본 설문 검증 스키마
export const baseSurveySchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  goals: z.array(z.string()).min(1, '최소 하나의 목표를 선택해주세요')
});

export type BaseSurvey = z.infer<typeof baseSurveySchema>;