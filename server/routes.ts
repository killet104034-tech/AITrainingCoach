import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { generateTrainingProgram } from "./services/programGenerator";
import { sendTrainingProgram } from "./services/email";

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
      
      // Send email with training program
      await sendTrainingProgram(
        validatedData.email, 
        validatedData.name || undefined, 
        trainingProgram
      );
      
      res.json({ 
        success: true, 
        message: "훈련 프로그램이 성공적으로 생성되고 이메일로 전송되었습니다.",
        surveyId: surveyResponse.id 
      });
      
    } catch (error) {
      console.error("Survey submission error:", error);
      res.status(400).json({ 
        success: false, 
        message: (error as Error).message || "설문 제출 처리 중 오류가 발생했습니다." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
