// 🎯 메인 엔진 - 규칙 실행 & 조건 처리
export interface SurveyEngine {
  processResponse(surveyData: any, packName: string): Promise<{
    trainingProgram: string;
    warnings: string[];
    conflicts: string[];
  }>;
}

export class CoreEngine implements SurveyEngine {
  async processResponse(surveyData: any, packName: string) {
    // TODO: 규칙 엔진 구현
    console.log(`🚀 [Engine] ${packName} 팩으로 처리 중...`);
    
    return {
      trainingProgram: `${surveyData.name}님을 위한 기본 프로그램`,
      warnings: [],
      conflicts: []
    };
  }
}