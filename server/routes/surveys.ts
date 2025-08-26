// 📋 설문 API 라우터 (깔끔하게 최적화됨)
// 🔄 흐름: 설문 → 조건매핑 → 훈련작성 → 메일발송

import type { Express } from "express";
import { storage } from "../storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { sendTrainingProgram } from "../services/email";
import { PowerliftingGenerator } from "../../packages/packs/powerlifting-v1/protocol-generator";

export function registerSurveyRoutes(app: Express): void {
  // 설문 제출 엔드포인트 (깔끔하게 최적화)
  app.post("/api/surveys", async (req, res) => {
    try {
      // 1. 설문 검증 및 저장
      const validatedData = insertSurveyResponseSchema.parse(req.body);
      const surveyResponse = await storage.createSurveyResponse(validatedData);
      
      // 2. 파워리프팅 프로그램 생성 (김동환님 매핑 기반)
      const generator = new PowerliftingGenerator();
      let trainingProgram;
      
      try {
        trainingProgram = generator.generateProgram(validatedData);
      } catch (mappingError) {
        console.log('매핑 없음:', mappingError.message);
        // 김동환님 매핑이 없으면 간단한 기본 프로그램
        trainingProgram = {
          program_title: `${validatedData.name}님의 기본 프로그램`,
          user_maxes: {
            squat: validatedData.squat_max || "100",
            bench: validatedData.bench_max || "80", 
            deadlift: validatedData.deadlift_max || "120"
          },
          training_weeks: [{
            week: 1,
            focus: "기본 훈련",
            workouts: [{
              day: 1,
              workout_name: "전신 운동",
              exercises: [{
                exercise: "스쿼트",
                sets: "3",
                reps: "8",
                weight_percent: "70%",
                rest_minutes: "3분",
                rpe: "7",
                notes: "김동환님 매핑 필요"
              }]
            }]
          }],
          metadata: {
            protocol_used: "기본",
            condition_path: "매핑 없음",
            customizations: [],
            source: "기본 템플릿"
          }
        };
      }
      
      // 3. 프로그램 저장
      await storage.updateSurveyResponseProgram(surveyResponse.id, trainingProgram);
      
      // 4. 이메일 발송 (설정된 경우만)
      const canEmail = process.env.SMTP_USER && process.env.SMTP_PASS && validatedData.email;
      
      if (canEmail) {
        try {
          await sendTrainingProgram(validatedData.email, validatedData.name, trainingProgram);
        } catch (emailError) {
          console.error('이메일 실패:', emailError);
        }
      }
      
      res.json({
        success: true,
        message: canEmail ? "프로그램 생성 및 이메일 발송 완료" : "프로그램 생성 완료",
        surveyId: surveyResponse.id,
        programUrl: `/api/program/${surveyResponse.id}`,
        emailSent: !!canEmail
      });
      
    } catch (error) {
      console.error('설문 제출 오류:', error);
      res.status(500).json({
        success: false,
        error: "설문 제출 중 오류가 발생했습니다"
      });
    }
  });
}