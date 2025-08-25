import { type User, type InsertUser, type SurveyResponse, type InsertSurveyResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSurveyResponse(surveyResponse: InsertSurveyResponse): Promise<SurveyResponse>;
  updateSurveyResponseProgram(id: string, program: string): Promise<SurveyResponse | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveyResponses: Map<string, SurveyResponse>;

  constructor() {
    this.users = new Map();
    this.surveyResponses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSurveyResponse(insertSurveyResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const id = randomUUID();
    const surveyResponse: SurveyResponse = { 
      ...insertSurveyResponse,
      name: insertSurveyResponse.name || null,
      injuryDetails: insertSurveyResponse.injuryDetails ?? null,
      id,
      trainingProgram: null,
      createdAt: new Date()
    };
    this.surveyResponses.set(id, surveyResponse);
    return surveyResponse;
  }

  async updateSurveyResponseProgram(id: string, program: string): Promise<SurveyResponse | undefined> {
    const surveyResponse = this.surveyResponses.get(id);
    if (surveyResponse) {
      surveyResponse.trainingProgram = program;
      this.surveyResponses.set(id, surveyResponse);
    }
    return surveyResponse;
  }
}

export const storage = new MemStorage();
