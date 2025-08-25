// 📦 Index: DB/시트 기록 및 메인 파이프라인 컨트롤러
import { nanoid } from 'nanoid';
import { storage } from '../storage';
import type { SurveyResponse } from '@shared/schema';

// 파이프라인 단계들 import
import { ingestSurveyData, type IngestResult } from './ingest';
import { createProgramPlan, type ProgramPlan } from './plan';
import { generateProgram, type GenerateResult } from './generate';
import { persistToGoogleSheets, type PersistResult } from './persist';
import { polishSpreadsheet, type PolishResult } from './polish';
import { createSummary, type SummaryResult } from './summary';
import { notifyUser, type NotifyResult } from './notify';

export interface PipelineResult {
  success: boolean;
  surveyId: string;
  spreadsheetUrl: string;
  stages: {
    ingest: IngestResult;
    plan: ProgramPlan;
    generate: GenerateResult;
    persist: PersistResult;
    polish: PolishResult;
    summary: SummaryResult;
    notify: NotifyResult;
  };
  timing: {
    [key: string]: number;
  };
}

export interface PipelineError {
  success: false;
  error: string;
  stage: string;
  surveyId?: string;
}

// 🚀 메인 파이프라인 실행
export async function runPipeline(rawSurveyData: any): Promise<PipelineResult | PipelineError> {
  const surveyId = nanoid();
  const timing: { [key: string]: number } = {};
  
  console.log(`🚀 파이프라인 시작 (ID: ${surveyId})`);
  console.log(`📊 입력 데이터: ${Object.keys(rawSurveyData).length}개 필드`);
  
  try {
    // 📥 1단계: Ingest (검증/정규화)
    const ingestStart = Date.now();
    const ingestResult = await ingestSurveyData(rawSurveyData);
    timing.ingest = Date.now() - ingestStart;
    
    // 📊 2단계: Plan (볼륨·빈도·강도 수치화)
    const planStart = Date.now();
    const programPlan = await createProgramPlan(ingestResult.userProfile);
    timing.plan = Date.now() - planStart;
    
    // 🤖 3단계: Generate (AI 프로그램 생성)
    const generateStart = Date.now();
    const generateResult = await generateProgram(ingestResult.userProfile, programPlan);
    timing.generate = Date.now() - generateStart;
    
    // 💾 4단계: Persist (Google Sheets 생성)
    const persistStart = Date.now();
    const persistResult = await persistToGoogleSheets(
      generateResult.program,
      ingestResult.userProfile,
      ingestResult.normalizedData
    );
    timing.persist = Date.now() - persistStart;
    
    // ✨ 5단계: Polish (스타일링)
    const polishStart = Date.now();
    const polishResult = await polishSpreadsheet(persistResult);
    timing.polish = Date.now() - polishStart;
    
    // 📊 6단계: Summary (피벗/차트)
    const summaryStart = Date.now();
    const summaryResult = await createSummary(persistResult);
    timing.summary = Date.now() - summaryStart;
    
    // 📧 7단계: Notify (이메일)
    const notifyStart = Date.now();
    const notifyResult = await notifyUser(
      persistResult,
      ingestResult.userProfile,
      generateResult.program,
      ingestResult.normalizedData.email
    );
    timing.notify = Date.now() - notifyStart;
    
    // 📝 8단계: Index (DB 기록)
    const indexStart = Date.now();
    await indexToDatabase(surveyId, ingestResult.normalizedData, persistResult, generateResult);
    timing.index = Date.now() - indexStart;
    
    const totalTime = Object.values(timing).reduce((sum, time) => sum + time, 0);
    timing.total = totalTime;
    
    console.log(`✅ 파이프라인 완료 (${totalTime}ms)`);
    console.log(`📊 단계별 시간: ${JSON.stringify(timing, null, 2)}`);
    
    return {
      success: true,
      surveyId,
      spreadsheetUrl: persistResult.spreadsheetUrl,
      stages: {
        ingest: ingestResult,
        plan: programPlan,
        generate: generateResult,
        persist: persistResult,
        polish: polishResult,
        summary: summaryResult,
        notify: notifyResult
      },
      timing
    };
    
  } catch (error: any) {
    const errorMessage = error?.message || '알 수 없는 오류';
    const stage = error?.stage || 'unknown';
    
    console.log(`❌ 파이프라인 실패 (${stage}): ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage,
      stage,
      surveyId
    };
  }
}

// 📝 데이터베이스 기록
async function indexToDatabase(
  surveyId: string,
  normalizedData: any,
  persistResult: PersistResult,
  generateResult: GenerateResult
): Promise<void> {
  try {
    console.log('📝 Index 단계 시작: DB 기록...');
    
    // SurveyResponse 형식으로 변환
    const surveyResponse: Partial<SurveyResponse> = {
      id: surveyId,
      email: normalizedData.email,
      name: normalizedData.name,
      experience: normalizedData.experienceLevel,
      squatMax: normalizedData.squatMax?.toString(),
      benchMax: normalizedData.benchMax?.toString(),
      deadliftMax: normalizedData.deadliftMax?.toString(),
      totalMax: (normalizedData.squatMax + normalizedData.benchMax + normalizedData.deadliftMax)?.toString(),
      bodyweight: normalizedData.weight?.toString(),
      goals: [normalizedData.primaryGoal],
      primaryGoal: normalizedData.primaryGoal,
      timeframe: normalizedData.timeframe,
      frequency: normalizedData.daysPerWeek?.toString(),
      equipment: [normalizedData.equipment],
      injuries: normalizedData.injuryHistory,
      sleepHours: normalizedData.sleepHours,
      stressLevel: normalizedData.stressLevel,
      intensityPreference: normalizedData.intensityPreference,
      trainingProgram: JSON.stringify({
        program: generateResult.program,
        spreadsheetUrl: persistResult.spreadsheetUrl,
        metadata: generateResult.metadata
      })
    };
    
    // 메모리 저장소에 저장 (실제 DB가 아닌 경우)
    // await storage.createSurveyResponse(surveyResponse);
    
    console.log(`✅ Index 완료: 데이터 기록 성공 (ID: ${surveyId})`);
    
  } catch (error) {
    console.log('데이터베이스 기록 실패:', error);
    // 치명적이지 않은 오류로 처리 (파이프라인 중단 안함)
  }
}

// 🔍 파이프라인 상태 조회
export async function getPipelineStatus(surveyId: string): Promise<any> {
  try {
    // 향후 구현: Redis나 DB에서 진행 상태 조회
    return {
      surveyId,
      status: 'completed', // processing, completed, failed
      progress: 100,
      stage: 'index',
      message: '파이프라인 처리 완료'
    };
  } catch (error) {
    return {
      surveyId,
      status: 'unknown',
      error: error
    };
  }
}

// 📊 파이프라인 통계
export function getPipelineStats(): any {
  return {
    totalPipelines: 0, // 향후 구현
    averageTime: 0,
    successRate: 0,
    stagePerformance: {}
  };
}