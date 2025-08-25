// 🚀 batchUpdate 1-3회로 플러시 최적화 (시트 파이프라인 개선)
// 데이터/편성/갓승/초간수서사/보호를 최소 API 호출로 처리

import { sheets_v4 } from 'googleapis';

export interface BatchOperation {
  type: 'data' | 'format' | 'chart' | 'protection' | 'sheet';
  operation: any;
  priority: number; // 1: 높음, 2: 중간, 3: 낮음
}

export class BatchOptimizer {
  private operations: BatchOperation[] = [];
  private spreadsheetId: string;
  private sheetsApi: sheets_v4.Sheets;

  constructor(spreadsheetId: string, sheetsApi: sheets_v4.Sheets) {
    this.spreadsheetId = spreadsheetId;
    this.sheetsApi = sheetsApi;
  }

  // 📊 데이터 입력 작업 추가
  addDataOperation(range: string, values: any[][], priority: number = 2) {
    this.operations.push({
      type: 'data',
      operation: {
        range,
        values,
        valueInputOption: 'USER_ENTERED'
      },
      priority
    });
  }

  // 🎨 포맷팅 작업 추가
  addFormatOperation(request: any, priority: number = 3) {
    this.operations.push({
      type: 'format',
      operation: request,
      priority
    });
  }

  // 📈 차트 작업 추가
  addChartOperation(request: any, priority: number = 3) {
    this.operations.push({
      type: 'chart',
      operation: request,
      priority
    });
  }

  // 🛡️ 보호 작업 추가
  addProtectionOperation(request: any, priority: number = 1) {
    this.operations.push({
      type: 'protection',
      operation: request,
      priority
    });
  }

  // 📋 시트 생성/수정 작업 추가
  addSheetOperation(request: any, priority: number = 1) {
    this.operations.push({
      type: 'sheet',
      operation: request,
      priority
    });
  }

  // 🚀 3회 플러시 실행 (우선순위별)
  async flush(): Promise<void> {
    console.log(`🚀 BatchOptimizer: ${this.operations.length}개 작업을 3회 플러시로 최적화`);
    
    // 우선순위별 그룹화
    const priorityGroups = {
      1: this.operations.filter(op => op.priority === 1), // 시트/보호 (높음)
      2: this.operations.filter(op => op.priority === 2), // 데이터 (중간)
      3: this.operations.filter(op => op.priority === 3)  // 포맷/차트 (낮음)
    };

    // 1차: 시트 생성 및 보호 설정
    if (priorityGroups[1].length > 0) {
      console.log(`📋 1차 플러시: ${priorityGroups[1].length}개 시트/보호 작업`);
      await this.executeBatch(priorityGroups[1]);
    }

    // 2차: 데이터 입력 (병렬 처리)
    if (priorityGroups[2].length > 0) {
      console.log(`📊 2차 플러시: ${priorityGroups[2].length}개 데이터 작업`);
      await this.executeDataBatch(priorityGroups[2]);
    }

    // 3차: 포맷팅 및 차트
    if (priorityGroups[3].length > 0) {
      console.log(`🎨 3차 플러시: ${priorityGroups[3].length}개 포맷/차트 작업`);
      await this.executeBatch(priorityGroups[3]);
    }

    console.log('✅ 3회 플러시 완료!');
    this.operations = []; // 초기화
  }

  // batchUpdate 실행 (포맷팅/차트/시트 작업용)
  private async executeBatch(operations: BatchOperation[]): Promise<void> {
    if (operations.length === 0) return;

    const requests = operations
      .filter(op => op.type !== 'data')
      .map(op => op.operation);

    if (requests.length > 0) {
      try {
        await this.sheetsApi.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: { requests }
        });
        console.log(`✅ batchUpdate 완료: ${requests.length}개 요청`);
      } catch (error) {
        console.log('❌ batchUpdate 실패:', error);
        throw error;
      }
    }
  }

  // 데이터 입력 병렬 처리
  private async executeDataBatch(operations: BatchOperation[]): Promise<void> {
    const dataOps = operations.filter(op => op.type === 'data');
    
    if (dataOps.length === 0) return;

    try {
      // 병렬로 데이터 입력 (최대 5개씩)
      const chunks = this.chunkArray(dataOps, 5);
      
      for (const chunk of chunks) {
        const promises = chunk.map(op => 
          this.sheetsApi.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: op.operation.range,
            valueInputOption: op.operation.valueInputOption,
            requestBody: { values: op.operation.values }
          })
        );
        
        await Promise.all(promises);
        console.log(`✅ 데이터 입력 완료: ${chunk.length}개 범위`);
      }
    } catch (error) {
      console.log('❌ 데이터 입력 실패:', error);
      throw error;
    }
  }

  // 배열을 청크로 분할
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 현재 대기 중인 작업 수
  getPendingOperationsCount(): number {
    return this.operations.length;
  }

  // 우선순위별 작업 수
  getOperationsByPriority(): { [key: number]: number } {
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 };
    this.operations.forEach(op => {
      counts[op.priority] = (counts[op.priority] || 0) + 1;
    });
    return counts;
  }
}