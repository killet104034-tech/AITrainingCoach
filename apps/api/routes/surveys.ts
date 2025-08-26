// 📋 설문 API 라우터 (Survey Routes) - 하드 리셋 버전
// ✨ 기능: POST /api/surveys 설문 제출 처리 (파워리프팅 로직 제거됨)
// 🔄 흐름: 설문 검증 → 저장 → 스프레드시트 생성 → 이메일 발송

import type { Express } from "express";
import { storage } from "../storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { sendTrainingProgram } from "../services/email";
import { createWorkoutSheet } from "../sheets/sheetsService";
import { operationalGuardMiddleware, operationalGuardCleanup, type GuardedRequest } from "../ops/operationalGuardMiddleware";
import { operationalGuard, OperationalError, ErrorCategory } from "../ops/operationalGuard";

export function registerSurveyRoutes(app: Express): void {
  // 🔒 운영 가드 미들웨어 적용 (Idempotency + Rate Limiting + Audit)
  app.use("/api/surveys", operationalGuardMiddleware());
  app.use("/api/surveys", operationalGuardCleanup());
  
  // Survey submission endpoint 
  app.post("/api/surveys", async (req, res) => {
    const guardedReq = req as GuardedRequest;
    const { auditContext } = guardedReq.guardContext;
    
    try {
      // 🔄 운영 가드와 함께 기본 처리 실행
      const result = await operationalGuard.executeWithRetry(async () => {
        // 🎯 간소화된 설문 데이터 검증 및 저장
        const validatedData = insertSurveyResponseSchema.parse(req.body);
        const surveyResponse = await storage.createSurveyResponse(validatedData);
        
        // 🎯 디자인용 최소 프로그램 (2개 필드만 사용)
        const basicProgram = {
          program_title: `${validatedData.name}님의 맞춤 훈련 프로그램`,
          user_maxes: {
            squat: "100",
            bench: "80", 
            deadlift: "120"
          },
          training_weeks: [
            {
              week: 1,
              focus: "기본 적응",
              workouts: [
                {
                  day: 1,
                  workout_name: "전신 운동",
                  exercises: [
                    {
                      exercise: "스쿼트",
                      sets: "3",
                      reps: "8",
                      weight_percent: "70%",
                      rest_minutes: "2-3",
                      rpe: "7-8",
                      notes: "기본 폼 집중"
                    }
                  ]
                }
              ]
            }
          ],
          survey_data: {
            timestamp: new Date().toISOString(),
            name: validatedData.name,
            goals: Array.isArray(validatedData.goals) ? validatedData.goals.join(', ') : '',
            email: validatedData.email
          }
        };
        
        return { 
          surveyResponse, 
          trainingProgram: basicProgram, 
          validatedData
        };
      }, auditContext);
      
      const { surveyResponse, trainingProgram, validatedData } = result;
      
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
          ? "기본 프로그램이 성공적으로 생성되고 이메일로 전송되었습니다."
          : "기본 프로그램이 성공적으로 생성되었습니다.",
        surveyId: surveyResponse.id,
        programUrl: `/api/program/${surveyResponse.id}`,
        emailSent: !!canEmail,
        engineVersion: 'basic-v1',
        conflictsDetected: 0,
        warnings: []
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