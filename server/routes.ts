import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { generateTrainingProgram } from "./services/openai";
import { sendTrainingProgram } from "./services/email";

export async function registerRoutes(app: Express): Promise<Server> {
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
        injuryDetails: validatedData.injuryDetails,
        name: validatedData.name
      };
      
      const trainingProgram = await generateTrainingProgram(programData);
      
      // Update survey response with generated program
      await storage.updateSurveyResponseProgram(surveyResponse.id, trainingProgram);
      
      // Send email with training program
      await sendTrainingProgram(
        validatedData.email, 
        validatedData.name, 
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
        message: error.message || "설문 제출 처리 중 오류가 발생했습니다." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
