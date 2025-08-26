// 🎯 CSV 시트 어댑터  
import type { SheetsAdapter } from './index.js';

export class CSVSheetsAdapter implements SheetsAdapter {
  async createWorkoutSheet(program: any): Promise<string> {
    // TODO: CSV 다운로드 링크 생성
    console.log('📊 [CSV] 워크아웃 시트 생성');
    return '/downloads/workout.csv';
  }
}