// 🎯 Dynamic Survey Schema Definition System
import { z } from 'zod';

// Field type definitions
export type FieldType = 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';

// Survey field definition
export interface SurveyField {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[]; // for select, checkbox, radio
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    dependsOn: string;
    condition: string; // e.g. "=== 'A'" or "includes 'B'"
    value: any;
  };
}

// Survey section definition
export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  fields: SurveyField[];
  conditional?: {
    dependsOn: string;
    condition: string;
    value: any;
  };
}

// Complete survey schema
export interface SurveySchema {
  id: string;
  version: string;
  title: string;
  description?: string;
  sections: SurveySection[];
}

// Basic neutral survey schema
export const basicSurveySchema: SurveySchema = {
  id: 'basic-v1',
  version: '1.0.0',
  title: 'Basic Survey',
  sections: [
    {
      id: 'basic_info',
      title: 'Basic Information',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
          validation: { min: 1, message: 'Please enter a name' }
        },
        {
          name: 'goals',
          type: 'checkbox',
          label: 'Preferences',
          required: true,
          options: ['A', 'B', 'C', 'D'],
          validation: { min: 1, message: 'Please select at least one option' }
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$', message: 'Please enter a valid email' }
        }
      ]
    }
  ]
};

// Extended neutral survey schema (example)
export const extendedSurveySchema: SurveySchema = {
  id: 'extended-v1',
  version: '1.0.0',
  title: 'Extended Survey',
  sections: [
    {
      id: 'basic_info',
      title: 'Basic Information',
      fields: [
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'age', type: 'number', label: 'Age', required: true, validation: { min: 16, max: 80 } },
        { name: 'email', type: 'email', label: 'Email', required: true }
      ]
    },
    {
      id: 'level',
      title: 'Experience Level',
      fields: [
        {
          name: 'level',
          type: 'select',
          label: 'Experience Level',
          required: true,
          options: ['A', 'B', 'C']
        }
      ]
    },
    {
      id: 'current_values',
      title: 'Current Values',
      conditional: {
        dependsOn: 'level',
        condition: '!== "A"',
        value: 'experienced'
      },
      fields: [
        { name: 'key1_max', type: 'number', label: 'Key1 Maximum', validation: { min: 40, max: 400 } },
        { name: 'key2_max', type: 'number', label: 'Key2 Maximum', validation: { min: 30, max: 300 } },
        { name: 'key3_max', type: 'number', label: 'Key3 Maximum', validation: { min: 50, max: 500 } }
      ]
    }
  ]
};