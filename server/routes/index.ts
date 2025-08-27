import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "../storage";
// registerDebugRoutes 제거됨
import { registerSurveyRoutes } from "./surveys";
// registerJobRoutes 제거됨
import { registerEvaluateRoutes } from "../rules/routes/evaluate";

export async function registerRoutes(app: Express): Promise<Server> {
  // 디버그 라우트 제거됨
  
  // 📋 설문 라우트 등록 (새로운 도메인 기반 아키텍처)
  registerSurveyRoutes(app);
  
  // 🧠 룰 엔진 평가 라우트 등록
  registerEvaluateRoutes(app);
  
  // 작업 상태 라우트 제거됨
  
  // Serve attached assets (images, etc.) statically
  app.use('/api/assets', express.static(path.resolve(import.meta.dirname, '..', 'attached_assets')));

  // Program retrieval endpoint (legacy)
  app.get("/api/program/:id", async (req, res) => {
    try {
      const programId = req.params.id;
      const surveyResponse = await storage.getSurveyResponseById(programId);
      
      if (!surveyResponse?.trainingProgram) {
        return res.status(404).json({
          success: false,
          error: "프로그램을 찾을 수 없습니다"
        });
      }
      
      res.json({
        success: true,
        program: surveyResponse.trainingProgram
      });
    } catch (error) {
      console.error("Program retrieval error:", error);
      res.status(500).json({
        success: false,
        error: "프로그램 조회 중 오류가 발생했습니다"
      });
    }
  });

  // Create server
  const server = createServer(app);
  return server;
}