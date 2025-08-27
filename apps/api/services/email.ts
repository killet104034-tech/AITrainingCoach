// 📧 Email service
export async function sendTrainingProgram(email: string, name?: string, program?: any): Promise<void> {
  console.log(`📧 이메일 발송 (모의): ${email}에게 프로그램 발송`);
  // 실제 이메일 발송 로직은 packages/adapters/email에 있음
  // 여기서는 간단한 로깅만 수행
}