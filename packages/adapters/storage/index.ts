// 🎯 스토리지 어댑터 - 추상 인터페이스
export interface StorageAdapter {
  saveSurveyResponse(data: any): Promise<string>;
  getSurveyResponse(id: string): Promise<any | null>;
}

export * from './postgres.js';
export * from './memory.js';
export * from './upstash.js';