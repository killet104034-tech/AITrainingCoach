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
  
  // 🎯 디자인용 최소 필드 (딱 2개!)
  email: text("email").notNull(),
  name: text("name"),
  
  // 시스템 데이터
  trainingProgram: text("training_program"), // AI generated program
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// 🔒 안정성(운영 가드) 테이블들
export const idempotencyKeys = pgTable("idempotency_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  canonicalHash: text("canonical_hash").notNull(),
  userEmail: text("user_email"),
  response: jsonb("response"), // 캐시된 응답
  status: text("status").notNull().default('processing'), // processing, completed, failed
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 24h TTL
});

export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userKey: text("user_key").notNull().unique(), // email 또는 UID
  isLocked: text("is_locked").notNull().default('false'), // 'true', 'false'
  lockStartedAt: timestamp("lock_started_at"),
  requestCount: text("request_count").notNull().default('0'),
  lastRequestAt: timestamp("last_request_at").default(sql`now()`).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  idempotencyKey: text("idempotency_key"),
  userEmail: text("user_email"),
  operation: text("operation").notNull(), // 'create_program', 'survey_submit'
  status: text("status").notNull(), // 'success', 'error', 'retry'
  errorCategory: text("error_category"), // AUTH_KEY_PARSE, DRIVE_PERMISSION, etc.
  errorMessage: text("error_message"),
  processingTimeMs: text("processing_time_ms"),
  requestCount: text("request_count").notNull().default('1'),
  templateVersion: text("template_version"),
  engineVersion: text("engine_version"),
  surveyKind: text("survey_kind"),
  surveyVersion: text("survey_version"),
  warnings: jsonb("warnings"), // Preflight 경고들
  metadata: jsonb("metadata"), // 추가 정보
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  trainingProgram: true,
  createdAt: true,
});

export const insertIdempotencyKeySchema = createInsertSchema(idempotencyKeys).omit({
  id: true,
  createdAt: true,
});

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
  createdAt: true,
  lastRequestAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;

export type InsertIdempotencyKey = z.infer<typeof insertIdempotencyKeySchema>;
export type IdempotencyKey = typeof idempotencyKeys.$inferSelect;
export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
