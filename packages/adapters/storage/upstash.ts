// 🎯 Upstash Redis 스토리지 어댑터
import type { StorageAdapter } from './index.js';

export class UpstashStorageAdapter implements StorageAdapter {
  constructor(private url: string, private token: string) {}

  async saveSurveyResponse(data: any): Promise<string> {
    // TODO: Upstash Redis 구현
    const id = Date.now().toString();
    console.log(`💾 [Upstash] 설문 응답 저장: ${id}`);
    return id;
  }

  async getSurveyResponse(id: string): Promise<any | null> {
    // TODO: Upstash Redis 구현
    console.log(`📤 [Upstash] 설문 응답 조회: ${id}`);
    return null;
  }
}