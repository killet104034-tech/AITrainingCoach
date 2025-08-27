import { type User, type InsertUser, type SurveyResponse, type InsertSurveyResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSurveyResponse(surveyResponse: InsertSurveyResponse): Promise<SurveyResponse>;
  updateSurveyResponseContent(id: string, content: any): Promise<SurveyResponse | undefined>;
  getSurveyResponseById(id: string): Promise<SurveyResponse | undefined>;
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
      id,
      generatedContent: null,
      createdAt: new Date()
    };
    this.surveyResponses.set(id, surveyResponse);
    return surveyResponse;
  }

  async updateSurveyResponseContent(id: string, content: any): Promise<SurveyResponse | undefined> {
    const surveyResponse = this.surveyResponses.get(id);
    if (!surveyResponse) return undefined;
    
    const updatedResponse = {
      ...surveyResponse,
      generatedContent: JSON.stringify(content)
    };
    this.surveyResponses.set(id, updatedResponse);
    return updatedResponse;
  }

  async getSurveyResponseById(id: string): Promise<SurveyResponse | undefined> {
    return this.surveyResponses.get(id);
  }
}

export const storage: IStorage = new MemStorage();