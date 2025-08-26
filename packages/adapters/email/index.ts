// 🎯 이메일 어댑터 - 추상 인터페이스
export interface EmailAdapter {
  sendTrainingProgram(to: string, program: string, subject?: string): Promise<boolean>;
}

export * from './smtp.js';
export * from './resend.js';
export * from './sendgrid.js';