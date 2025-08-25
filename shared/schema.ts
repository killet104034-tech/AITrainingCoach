import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name"),
  experience: text("experience").notNull(), // beginner, intermediate, advanced
  squatMax: text("squat_max").notNull(),
  benchMax: text("bench_max").notNull(),
  deadliftMax: text("deadlift_max").notNull(),
  goals: jsonb("goals").notNull(), // array of strings
  frequency: text("frequency").notNull(), // 2,3,4,5,6
  equipment: jsonb("equipment").notNull(), // array of strings
  injuries: text("injuries").notNull(), // none, minor, specific
  injuryDetails: text("injury_details"),
  trainingProgram: text("training_program"), // AI generated program
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  trainingProgram: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
