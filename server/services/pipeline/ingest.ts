// 📥 Ingest: 설문 데이터 검증/정규화
import { z } from 'zod';

export interface IngestResult {
  normalizedData: any;
  userProfile: UserProfile;
  validation: ValidationResult;
}

export interface UserProfile {
  demographics: {
    age: number;
    gender: string;
    weight: number;
    height: number;
  };
  experience: {
    years: number;
    level: string;
    currentMax: {
      squat: number;
      bench: number;
      deadlift: number;
    };
  };
  goals: {
    primary: string;
    timeframe: string;
    priority: string;
  };
  constraints: {
    daysPerWeek: number;
    injuryHistory: string;
    equipment: string[];
    timeAvailable: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 📊 설문 데이터 검증 및 정규화
export async function ingestSurveyData(rawData: any): Promise<IngestResult> {
  console.log('📥 Ingest 단계 시작: 설문 데이터 검증/정규화...');
  
  try {
    // 1. 데이터 검증
    const validation = validateSurveyData(rawData);
    if (!validation.isValid) {
      throw new Error(`검증 실패: ${validation.errors.join(', ')}`);
    }
    
    // 2. 데이터 정규화
    const normalizedData = normalizeSurveyData(rawData);
    
    // 3. 사용자 프로필 생성
    const userProfile = createUserProfile(normalizedData);
    
    console.log('✅ Ingest 완료: 데이터 검증 및 정규화 성공');
    
    return {
      normalizedData,
      userProfile,
      validation
    };
    
  } catch (error) {
    console.log('❌ Ingest 실패:', error);
    throw error;
  }
}

// 🔍 설문 데이터 검증
function validateSurveyData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 필수 필드 검증
  if (!data.name) errors.push('이름이 필요합니다');
  if (!data.email) errors.push('이메일이 필요합니다');
  if (!data.age || data.age < 15 || data.age > 80) errors.push('나이는 15-80 사이여야 합니다');
  if (!data.weight || data.weight < 30 || data.weight > 200) errors.push('체중은 30-200kg 사이여야 합니다');
  
  // 1RM 검증
  if (!data.squatMax || data.squatMax < 20) errors.push('스쿼트 1RM이 필요합니다');
  if (!data.benchMax || data.benchMax < 20) errors.push('벤치프레스 1RM이 필요합니다');
  if (!data.deadliftMax || data.deadliftMax < 20) errors.push('데드리프트 1RM이 필요합니다');
  
  // 경고 사항
  if (data.injuryHistory && data.injuryHistory !== 'None') {
    warnings.push('부상 이력이 있어 프로그램 조정이 필요할 수 있습니다');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// 🔄 설문 데이터 정규화
function normalizeSurveyData(data: any): any {
  return {
    // 개인정보 정규화
    name: data.name?.trim(),
    email: data.email?.toLowerCase().trim(),
    age: parseInt(data.age),
    gender: data.gender || 'Not specified',
    weight: parseFloat(data.weight),
    height: parseFloat(data.height),
    
    // 운동 경험 정규화
    experienceYears: parseFloat(data.experienceYears || '0'),
    experienceLevel: data.experienceLevel || 'Beginner',
    
    // 1RM 정규화
    squatMax: parseFloat(data.squatMax),
    benchMax: parseFloat(data.benchMax),
    deadliftMax: parseFloat(data.deadliftMax),
    
    // 목표 정규화
    primaryGoal: data.primaryGoal || 'General Fitness',
    timeframe: data.timeframe || '12 weeks',
    goalPriority: data.goalPriority || 'Strength',
    
    // 제약사항 정규화
    daysPerWeek: parseInt(data.daysPerWeek || '3'),
    injuryHistory: data.injuryHistory || 'None',
    equipment: data.equipment || 'Full gym',
    timeAvailable: parseInt(data.timeAvailable || '60'),
    
    // 생활습관 정규화
    sleepHours: data.sleepHours || '7-8 hours',
    stressLevel: data.stressLevel || 'Medium',
    intensityPreference: data.intensityPreference || 'Medium (70-85%)',
    
    // 메타데이터
    submittedAt: new Date().toISOString(),
    surveyVersion: '1.0'
  };
}

// 👤 사용자 프로필 생성
function createUserProfile(data: any): UserProfile {
  return {
    demographics: {
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height
    },
    experience: {
      years: data.experienceYears,
      level: data.experienceLevel,
      currentMax: {
        squat: data.squatMax,
        bench: data.benchMax,
        deadlift: data.deadliftMax
      }
    },
    goals: {
      primary: data.primaryGoal,
      timeframe: data.timeframe,
      priority: data.goalPriority
    },
    constraints: {
      daysPerWeek: data.daysPerWeek,
      injuryHistory: data.injuryHistory,
      equipment: data.equipment ? [data.equipment] : [],
      timeAvailable: data.timeAvailable
    }
  };
}