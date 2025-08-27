// 🎯 Survey Validators
import { z } from 'zod';

// Basic survey validation schema
export const baseSurveySchema = z.object({
  name: z.string().min(1, 'Please enter a name'),
  email: z.string().email('Please enter a valid email'),
  goals: z.array(z.string()).min(1, 'Please select at least one option')
});

export type BaseSurvey = z.infer<typeof baseSurveySchema>;