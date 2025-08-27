// 🗄️ Storage abstraction layer
import { db } from './db.js';
import { surveyResponses, insertSurveyResponseSchema, type SurveyResponse } from '@shared/schema';
import { eq } from 'drizzle-orm';

class Storage {
  async createSurveyResponse(data: any): Promise<SurveyResponse> {
    const insertData = insertSurveyResponseSchema.parse(data);
    const [result] = await db.insert(surveyResponses).values(insertData).returning();
    return result;
  }

  async getSurveyResponseById(id: string): Promise<SurveyResponse | null> {
    const [result] = await db.select().from(surveyResponses).where(eq(surveyResponses.id, id));
    return result || null;
  }

  async updateSurveyResponseProgram(id: string, program: string): Promise<void> {
    await db.update(surveyResponses)
      .set({ trainingProgram: program })
      .where(eq(surveyResponses.id, id));
  }
}

export const storage = new Storage();