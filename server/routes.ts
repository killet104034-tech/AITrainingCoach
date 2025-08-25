import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { generateTrainingProgram } from "./services/programGenerator";
import { sendTrainingProgram } from "./services/email";
import { createWorkoutSheet } from "./services/sheetsService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve attached assets (images, etc.) statically
  app.use('/api/assets', express.static(path.resolve(import.meta.dirname, '..', 'attached_assets')));
  // Survey submission endpoint
  app.post("/api/survey", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertSurveyResponseSchema.parse(req.body);
      
      // Store survey response
      const surveyResponse = await storage.createSurveyResponse(validatedData);
      
      // Generate AI training program
      const programData = {
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
      };
      
      const trainingProgram = await generateTrainingProgram(programData);
      
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
      
      res.json({ 
        success: true, 
        message: canEmail 
          ? "훈련 프로그램이 성공적으로 생성되고 이메일로 전송되었습니다."
          : "훈련 프로그램이 성공적으로 생성되었습니다.",
        surveyId: surveyResponse.id,
        programUrl: `/api/program/${surveyResponse.id}`,
        emailSent: !!canEmail
      });
      
    } catch (error) {
      console.error("Survey submission error:", error);
      res.status(400).json({ 
        success: false, 
        message: (error as Error).message || "설문 제출 처리 중 오류가 발생했습니다." 
      });
    }
  });

  // Get training program by ID
  app.get("/api/program/:id", async (req, res) => {
    try {
      const surveyResponse = await storage.getSurveyResponseById(req.params.id);
      if (!surveyResponse || !surveyResponse.trainingProgram) {
        return res.status(404).json({ 
          success: false, 
          message: "프로그램을 찾을 수 없습니다." 
        });
      }

      const program = JSON.parse(surveyResponse.trainingProgram);
      
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sinabro Strength 훈련 프로그램</title>
          <style>
              body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; line-height: 1.5; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 30px; }
              h1 { margin: 0; font-size: 28px; font-weight: 300; }
              h2 { color: #000; font-weight: 500; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
              .workout-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .workout-table th { background: #f8f9fa; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 600; }
              .workout-table td { border: 1px solid #ddd; padding: 10px; }
              .week-header { background: #000; color: white; text-align: center; font-weight: 600; }
              .workout-header { background: #f1f3f4; font-weight: 600; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .info-box { padding: 15px; background: #f8f9fa; border-radius: 5px; }
              @media (max-width: 768px) { 
                  .info-grid { grid-template-columns: 1fr; }
                  .workout-table { font-size: 14px; }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>SINABRO STRENGTH</h1>
              <p>개인 맞춤형 파워리프팅 훈련 프로그램</p>
          </div>

          <div class="section">
              <h2>${program.program_title}</h2>
              <p>${program.overview}</p>
          </div>

          <div class="section">
              <h2>📋 훈련 프로그램 스프레드시트</h2>
              ${program.training_weeks.map((week: any) => `
                  <table class="workout-table">
                      <tr class="week-header">
                          <td colspan="7">${week.week}주차 - ${week.focus}</td>
                      </tr>
                      <tr>
                          <th>운동명</th>
                          <th>세트</th>
                          <th>반복수</th>
                          <th>중량(%)</th>
                          <th>휴식(분)</th>
                          <th>RPE</th>
                          <th>비고</th>
                      </tr>
                      ${week.workouts.map((workout: any) => `
                          <tr class="workout-header">
                              <td colspan="7">${workout.day}일차 - ${workout.workout_name}</td>
                          </tr>
                          ${workout.exercises.map((exercise: any) => `
                              <tr>
                                  <td><strong>${exercise.exercise}</strong></td>
                                  <td>${exercise.sets}</td>
                                  <td>${exercise.reps}</td>
                                  <td>${exercise.weight_percent}</td>
                                  <td>${exercise.rest_minutes}</td>
                                  <td>${exercise.rpe}</td>
                                  <td>${exercise.notes || '-'}</td>
                              </tr>
                          `).join('')}
                      `).join('')}
                  </table>
              `).join('')}
          </div>

          <div class="info-grid">
              <div class="info-box">
                  <h3>📈 주차별 진행 방법</h3>
                  <p>${program.progression_notes}</p>
              </div>
              <div class="info-box">
                  <h3>🔥 웜업 프로토콜</h3>
                  <p>${program.warmup_protocol}</p>
              </div>
              <div class="info-box">
                  <h3>😌 쿨다운 프로토콜</h3>
                  <p>${program.cooldown_protocol}</p>
              </div>
              <div class="info-box">
                  <h3>⚠️ 안전 수칙</h3>
                  <p>${program.safety_guidelines}</p>
              </div>
          </div>

          <div class="info-grid">
              <div class="info-box">
                  <h3>🥗 영양 가이드라인</h3>
                  <p>${program.nutrition_guidelines}</p>
              </div>
              <div class="info-box">
                  <h3>💤 회복 가이드라인</h3>
                  <p>${program.recovery_guidelines}</p>
              </div>
          </div>

      </body>
      </html>
      `;

      res.send(htmlContent);
      
    } catch (error) {
      console.error("프로그램 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "프로그램 조회 중 오류가 발생했습니다." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
