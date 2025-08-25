// 📋 설문 API 라우터 (Survey Routes)
// ✨ 기능: POST /api/surveys 설문 제출 처리 및 프로그램 생성
// 🔄 흐름: 설문 검증 → Canonical 변환 → 엔진 실행 → Google Sheets 생성 → 이메일 발송
// 🛡️ 보안: 운영 가드, Rate Limiting, Idempotency, 감사 로그

import type { Express } from "express";
import { storage } from "../storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { generateTrainingProgram } from "../services/programGenerator";
import { sendTrainingProgram } from "../services/email";
import { createWorkoutSheet } from "../sheets/sheetsService";
import { operationalGuardMiddleware, operationalGuardCleanup, type GuardedRequest } from "../ops/operationalGuardMiddleware";
import { operationalGuard, OperationalError, ErrorCategory } from "../ops/operationalGuard";
import { processSurvey } from "../surveys/registry";
import { createSimpleEngine } from "../engine/planFromTables";

export function registerSurveyRoutes(app: Express): void {
  // 🔒 운영 가드 미들웨어 적용 (Idempotency + Rate Limiting + Audit)
  app.use("/api/surveys", operationalGuardMiddleware());
  app.use("/api/surveys", operationalGuardCleanup());
  
  // Survey submission endpoint 
  app.post("/api/surveys", async (req, res) => {
    // 🔍 Query parameter로 설문 타입 지정 지원
    const surveyKind = req.query.kind as string || 'basic_v1';
    const guardedReq = req as GuardedRequest;
    const { auditContext } = guardedReq.guardContext;
    
    try {
      // 🔄 운영 가드와 함께 프로그램 생성 실행
      const result = await operationalGuard.executeWithRetry(async () => {
        // 🔍 설문 처리 (새로운 아키텍처)  
        const { canonical, conflicts, warnings } = processSurvey(surveyKind, req.body);
        
        // 📊 엔진으로 프로그램 생성
        const engine = createSimpleEngine();
        const programPlan = await engine.planFromTables(canonical);
        
        // Legacy 포맷으로 변환 (기존 시스템 호환성)
        const legacyFormat = {
          experience: canonical.experience,
          squatMax: canonical.squatMax.toString(),
          benchMax: canonical.benchMax.toString(),
          deadliftMax: canonical.deadliftMax.toString(),
          goals: canonical.goals,
          frequency: canonical.frequency.toString(),
          equipment: canonical.equipment,
          injuries: canonical.injuries,
          injuryDetails: canonical.injuryDetails,
          name: canonical.name,
          email: canonical.email,
        };
        
        // Validate and store (기존 스키마 사용)
        const validatedData = insertSurveyResponseSchema.parse(legacyFormat);
        const surveyResponse = await storage.createSurveyResponse(validatedData);
        
        // Generate AI training program (기존 서비스 사용)
        const trainingProgram = await generateTrainingProgram({
          experience: validatedData.experience,
          squatMax: validatedData.squatMax,
          benchMax: validatedData.benchMax,
          deadliftMax: validatedData.deadliftMax,
          goals: validatedData.goals as string[],
          frequency: validatedData.frequency,
          equipment: validatedData.equipment as string[],
          injuries: validatedData.injuries,
          injuryDetails: validatedData.injuryDetails || undefined,
          name: validatedData.name || undefined
        });
        
        return { 
          surveyResponse, 
          trainingProgram, 
          validatedData, 
          canonical, 
          conflicts,
          warnings: warnings,
          programPlan 
        };
      }, auditContext);
      
      const { surveyResponse, trainingProgram, validatedData, canonical, conflicts } = result;
      
      // Form 시트용 설문 데이터 추가 (56개 필드 전체 매핑)
      trainingProgram.survey_data = {
        // 기본 정보
        timestamp: new Date().toISOString(),
        name: validatedData.name,
        email: validatedData.email,
        sex: validatedData.bodyweight || 'N/A', // 임시 매핑
        age: '25', // 기본값
        height: '170cm', // 기본값  
        weight: validatedData.bodyweight || '70kg',
        
        // 목표 & 경험
        goal: Array.isArray(validatedData.goals) ? validatedData.goals.join(', ') : validatedData.goals,
        experience: validatedData.experience,
        daysPerWeek: validatedData.frequency,
        
        // 장비 접근성
        equipment: Array.isArray(validatedData.equipment) ? validatedData.equipment.join(', ') : validatedData.equipment,
        
        // 부상 관련
        injuries: validatedData.injuries,
        injuryDetails: validatedData.injuryDetails,
        
        // 실제 스키마 필드들을 가능한 한 매핑
        bodyweight: validatedData.bodyweight,
        competitionExperience: validatedData.competitionExperience,
        primaryGoal: validatedData.primaryGoal,
        timeframe: validatedData.timeframe,
        sessionsPerWeek: validatedData.sessionsPerWeek,
        trainingDuration: validatedData.trainingDuration,
        squatFrequency: validatedData.squatFrequency,
        benchFrequency: validatedData.benchFrequency,
        deadliftFrequency: validatedData.deadliftFrequency,
        squatStyle: validatedData.squatStyle,
        benchStyle: validatedData.benchStyle,
        deadliftStyle: validatedData.deadliftStyle,
        weakestLift: validatedData.weakestLift,
        strongestLift: validatedData.strongestLift,
        homeGym: validatedData.homeGym,
        sleepHours: validatedData.sleepHours,
        stressLevel: validatedData.stressLevel,
        nutrition: validatedData.nutrition,
        volumeTolerance: validatedData.volumeTolerance,
        intensityPreference: validatedData.intensityPreference,
        motivation: validatedData.motivation,
        periodization: validatedData.periodization,
        autoregulation: validatedData.autoregulation
      };
      
      // Update survey response with generated program
      await storage.updateSurveyResponseProgram(surveyResponse.id, trainingProgram);
      
      // Send email with training program (only if SMTP is configured)
      const canEmail = process.env.SMTP_USER && process.env.SMTP_PASS && validatedData.email;
      
      if (canEmail) {
        try {
          await sendTrainingProgram(
            validatedData.email, 
            validatedData.name || undefined, 
            trainingProgram
          );
        } catch (emailError) {
          console.error('이메일 전송 실패:', emailError);
          // 이메일 실패해도 프로그램은 성공적으로 생성됨
        }
      }
      
      const responseData = {
        success: true, 
        message: canEmail 
          ? "훈련 프로그램이 성공적으로 생성되고 이메일로 전송되었습니다."
          : "훈련 프로그램이 성공적으로 생성되었습니다.",
        surveyId: surveyResponse.id,
        programUrl: `/api/program/${surveyResponse.id}`,
        emailSent: !!canEmail,
        // 🎯 새로운 아키텍처 정보
        engineVersion: 'rules-v3',
        conflictsDetected: conflicts.length,
        warnings: conflicts.map(c => c.message)
      };
      
      // 📋 응답 캐싱 (idempotency용)
      res.locals.responseData = responseData;
      res.json(responseData);
      
    } catch (error) {
      console.error("Survey submission error:", error);
      
      // 🏷️ 에러 카테고리화 및 감사 로그
      if (error instanceof OperationalError) {
        const statusCode = getStatusCodeForCategory(error.category);
        res.status(statusCode).json({
          success: false,
          error: error.message,
          category: error.category,
          retryable: error.isRetryable
        });
      } else {
        res.status(500).json({
          success: false,
          error: "설문 제출 중 오류가 발생했습니다",
          category: ErrorCategory.RETRYABLE_429_5XX
        });
      }
    }
  });
}

// 🎯 에러 카테고리별 HTTP 상태 코드 매핑
function getStatusCodeForCategory(category: ErrorCategory): number {
  switch (category) {
    case ErrorCategory.AUTH_KEY_PARSE:
      return 401;
    case ErrorCategory.DRIVE_PERMISSION:
      return 403;
    case ErrorCategory.DRIVE_FOLDER_NOT_FOUND:
      return 404;
    case ErrorCategory.VALIDATION_FAIL:
      return 400;
    case ErrorCategory.CONFLICT_PRECHECK:
      return 409;
    case ErrorCategory.DRIVE_QUOTA:
    case ErrorCategory.RETRYABLE_429_5XX:
      return 429;
    case ErrorCategory.SHEETS_RANGE:
      return 400;
    case ErrorCategory.EMAIL_FAIL:
      return 502;
    default:
      return 500;
  }
}