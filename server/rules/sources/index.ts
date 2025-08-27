// 🔄 룰 소스 로더 - JSON/시트/외부 소스에서 룰셋 로딩
// ✨ 기능: 다양한 소스(JSON 파일, Google Sheets 등)에서 룰셋 로드
// 🎯 확장성: 새로운 소스 타입 쉽게 추가 가능한 플러그인 아키텍처

import { promises as fs } from 'fs';
import * as path from 'path';
import { ruleSetSchema, type RuleSet, type RuleSourceConfig } from '../schemas.js';

// 📦 룰 소스 인터페이스 (확장 가능)
export interface RuleSourceLoader {
  type: string;
  load(config: any): Promise<RuleSet[]>;
  validate(config: any): boolean;
}

// 📄 JSON 파일 룰 로더
export class JsonRuleLoader implements RuleSourceLoader {
  type = 'json';

  async load(config: { filePath?: string; directory?: string }): Promise<RuleSet[]> {
    const ruleSets: RuleSet[] = [];

    // 단일 파일 로드
    if (config.filePath) {
      const ruleSet = await this.loadFile(config.filePath);
      if (ruleSet) ruleSets.push(ruleSet);
    }

    // 디렉터리 내 모든 JSON 파일 로드
    if (config.directory) {
      const files = await this.getJsonFiles(config.directory);
      for (const file of files) {
        const ruleSet = await this.loadFile(file);
        if (ruleSet) ruleSets.push(ruleSet);
      }
    }

    return ruleSets;
  }

  validate(config: any): boolean {
    return !!(config.filePath || config.directory);
  }

  private async loadFile(filePath: string): Promise<RuleSet | null> {
    try {
      const fullPath = path.resolve(filePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // Zod로 검증
      const validated = ruleSetSchema.parse(data);
      console.log(`✅ 룰셋 로드 완료: ${validated.name} (${validated.rules.length}개 룰)`);
      return validated;
    } catch (error) {
      console.error(`❌ 룰셋 로드 실패: ${filePath}`, error);
      return null;
    }
  }

  private async getJsonFiles(directory: string): Promise<string[]> {
    try {
      const files = await fs.readdir(directory);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(directory, file));
    } catch (error) {
      console.error(`❌ 디렉터리 읽기 실패: ${directory}`, error);
      return [];
    }
  }
}

// 📊 Google Sheets 룰 로더 (확장용 - 기본 구현)
export class SheetsRuleLoader implements RuleSourceLoader {
  type = 'sheets';

  async load(config: { 
    spreadsheetId: string; 
    sheetName?: string; 
    credentials?: any 
  }): Promise<RuleSet[]> {
    // TODO: Google Sheets API 연동 구현
    // 현재는 기본 구조만 제공
    console.log('🔄 Google Sheets 룰 로더 - 구현 예정');
    console.log('📋 설정:', config);
    
    // 기본 빈 룰셋 반환
    return [];
  }

  validate(config: any): boolean {
    return !!(config.spreadsheetId);
  }
}

// 🏗️ 메인 룰 소스 매니저
export class RuleSourceManager {
  private loaders = new Map<string, RuleSourceLoader>();
  private cache = new Map<string, { data: RuleSet[], timestamp: number, ttl: number }>();

  constructor() {
    // 기본 로더들 등록
    this.registerLoader(new JsonRuleLoader());
    this.registerLoader(new SheetsRuleLoader());
  }

  // 🔌 새로운 룰 로더 등록 (플러그인 방식)
  registerLoader(loader: RuleSourceLoader): void {
    this.loaders.set(loader.type, loader);
    console.log(`🔌 룰 로더 등록: ${loader.type}`);
  }

  // 📦 룰셋 로드 (캐시 지원)
  async loadRuleSets(sources: RuleSourceConfig[]): Promise<RuleSet[]> {
    const allRuleSets: RuleSet[] = [];

    // 우선순위로 정렬
    const sortedSources = sources
      .filter(source => source.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const source of sortedSources) {
      try {
        const ruleSets = await this.loadFromSource(source);
        allRuleSets.push(...ruleSets);
      } catch (error) {
        console.error(`❌ 소스 로드 실패: ${source.type}`, error);
      }
    }

    console.log(`📦 총 ${allRuleSets.length}개 룰셋 로드 완료`);
    return allRuleSets;
  }

  private async loadFromSource(source: RuleSourceConfig): Promise<RuleSet[]> {
    const cacheKey = this.getCacheKey(source);
    
    // 캐시 확인
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`💾 캐시에서 룰셋 로드: ${source.type}`);
      return cached.data;
    }

    // 로더 확인
    const loader = this.loaders.get(source.type);
    if (!loader) {
      throw new Error(`지원하지 않는 룰 소스 타입: ${source.type}`);
    }

    // 설정 검증
    if (!loader.validate(source.config)) {
      throw new Error(`잘못된 룰 소스 설정: ${source.type}`);
    }

    // 룰셋 로드
    const ruleSets = await loader.load(source.config);
    
    // 캐시 저장
    this.cache.set(cacheKey, {
      data: ruleSets,
      timestamp: Date.now(),
      ttl: source.cacheTtlMs
    });

    return ruleSets;
  }

  private getCacheKey(source: RuleSourceConfig): string {
    return `${source.type}:${JSON.stringify(source.config)}`;
  }

  // 🧹 캐시 정리
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 룰 소스 캐시 정리 완료');
  }

  // 📊 통계 정보
  getCacheStats(): { total: number; expired: number } {
    const now = Date.now();
    let expired = 0;
    
    const cacheEntries = Array.from(this.cache.entries());
    for (const [key, cache] of cacheEntries) {
      if (now - cache.timestamp >= cache.ttl) {
        expired++;
      }
    }

    return { total: this.cache.size, expired };
  }
}

// 🎯 기본 설정으로 매니저 인스턴스 생성
export const ruleSourceManager = new RuleSourceManager();

// 📄 기본 JSON 룰셋 로드 헬퍼
export async function loadDefaultRules(): Promise<RuleSet[]> {
  const defaultConfig: RuleSourceConfig = {
    type: 'json',
    config: {
      filePath: path.resolve('server/rules/rules.default.json')
    },
    enabled: true,
    priority: 1,
    cacheTtlMs: 300000 // 5분
  };

  return ruleSourceManager.loadRuleSets([defaultConfig]);
}

// 🔄 룰셋 리로드 헬퍼 (개발/디버그용)
export async function reloadRules(): Promise<RuleSet[]> {
  ruleSourceManager.clearCache();
  return loadDefaultRules();
}