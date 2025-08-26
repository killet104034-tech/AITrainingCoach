// 📊 Jobs Routes - GET /jobs/:id 

import type { Express } from "express";
import { storage } from "../storage";

export function registerJobRoutes(app: Express): void {
  // 📊 작업 상태 조회 엔드포인트
  app.get("/jobs/:id", async (req, res) => {
    try {
      const jobId = req.params.id;
      
      // Survey Response를 Job으로 취급
      const surveyResponse = await storage.getSurveyResponse(jobId);
      
      if (!surveyResponse) {
        return res.status(404).json({
          success: false,
          error: "작업을 찾을 수 없습니다",
          jobId
        });
      }
      
      // 작업 상태 매핑
      const jobStatus = surveyResponse.program ? 'completed' : 'processing';
      const processingTime = surveyResponse.createdAt ? 
        Date.now() - new Date(surveyResponse.createdAt).getTime() : 0;
      
      res.json({
        success: true,
        job: {
          id: jobId,
          status: jobStatus,
          email: surveyResponse.email,
          createdAt: surveyResponse.createdAt,
          completedAt: surveyResponse.program ? surveyResponse.updatedAt : null,
          processingTimeMs: processingTime,
          hasProgram: !!surveyResponse.program,
          // 생성 KPI 정보
          kpi: {
            totalProcessingTime: processingTime,
            programGenerated: !!surveyResponse.program,
            emailSent: surveyResponse.email ? true : false,
            sheetCreated: surveyResponse.program?.survey_data ? true : false
          }
        }
      });
    } catch (error) {
      console.error("Job retrieval error:", error);
      res.status(500).json({
        success: false,
        error: "작업 조회 중 오류가 발생했습니다"
      });
    }
  });
}