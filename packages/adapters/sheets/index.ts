// 🎯 시트 어댑터 - 추상 인터페이스
export interface SheetsAdapter {
  createWorkoutSheet(program: any): Promise<string>; // 스프레드시트 URL 반환
}

export * from './google.js';
export * from './csv.js';