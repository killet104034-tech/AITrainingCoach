// 🎯 스키마 마이그레이션 도구
export interface SchemaMigration {
  version: string;
  description: string;
  migrate: (oldData: any) => any;
}

// v1 → v2 예시 마이그레이션
export const migrations: SchemaMigration[] = [
  {
    version: '1.0.0',
    description: '기본 설문 스키마',
    migrate: (data) => data
  }
];