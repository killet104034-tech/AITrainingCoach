// 🎯 SendGrid 이메일 어댑터
import type { EmailAdapter } from './index.js';

export class SendGridEmailAdapter implements EmailAdapter {
  constructor(private apiKey: string) {}

  async sendTrainingProgram(to: string, program: string, subject = "맞춤 훈련 프로그램"): Promise<boolean> {
    // TODO: SendGrid API 구현
    console.log(`📧 [SendGrid] ${to}에게 프로그램 전송`);
    return true;
  }
}