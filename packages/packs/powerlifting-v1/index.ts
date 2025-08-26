// 🎯 파워리프팅 v1 팩 - 100% 조건매핑 시스템
import { SurveyEngine } from '@sinabro/core';
import { PowerliftingProtocolGenerator } from './protocol-generator';

export class PowerliftingV1Engine implements SurveyEngine {
  private protocolGenerator: PowerliftingProtocolGenerator;
  
  constructor() {
    this.protocolGenerator = new PowerliftingProtocolGenerator();
  }

  async processResponse(surveyData: any) {
    console.log(`🏋️ [김동환 코치] ${surveyData.name} 고객 훈련 분석 중...`);
    console.log(`📊 [김동환 코치] 백오프 방식: ${surveyData.backoff_method || '미설정'}`);
    console.log(`🎯 [김동환 코치] 경험수준: ${surveyData.experience_level || '미설정'}`);
    
    // 🎯 김동환님 방식으로 프로그램 생성
    const generatedProgram = this.protocolGenerator.generateProgram(surveyData);
    
    // 📋 구조화된 프로그램을 텍스트로 변환 (기존 호환성)
    const programText = this.formatProgramAsText(generatedProgram);
    
    console.log(`✅ [김동환 코치] 훈련 처방 완료: ${generatedProgram.metadata.condition_path}`);
    console.log(`🔧 [김동환 코치] 적용된 방식: ${generatedProgram.metadata.protocol_used}`);

    return {
      trainingProgram: programText,
      structuredProgram: generatedProgram, // 새로운 구조화된 데이터
      warnings: this.generateWarnings(surveyData, generatedProgram),
      conflicts: this.detectConflicts(surveyData, generatedProgram),
      metadata: generatedProgram.metadata,
      coachSignature: "김동환 코치가 직접 설계한 맞춤 프로그램"
    };
  }

  // 📝 구조화된 프로그램 → 텍스트 변환 (기존 호환성)
  private formatProgramAsText(program: any): string {
    let text = `${program.program_title}\n\n`;
    text += `현재 기록:\n`;
    text += `- 스쿼트: ${program.user_maxes.squat}kg\n`;
    text += `- 벤치프레스: ${program.user_maxes.bench}kg\n`;
    text += `- 데드리프트: ${program.user_maxes.deadlift}kg\n\n`;
    text += `사용된 프로토콜: ${program.metadata.protocol_used}\n`;
    text += `조건 경로: ${program.metadata.condition_path}\n\n`;

    program.training_weeks.forEach((week: any) => {
      text += `=== ${week.week}주차: ${week.focus} ===\n`;
      
      week.workouts.forEach((workout: any) => {
        text += `\n${workout.day}일차: ${workout.workout_name}\n`;
        
        workout.exercises.forEach((exercise: any) => {
          text += `- ${exercise.exercise}: ${exercise.sets}세트 x ${exercise.reps}회`;
          text += ` @ ${exercise.weight_percent}`;
          if (exercise.rpe) text += ` (RPE ${exercise.rpe})`;
          if (exercise.notes) text += ` - ${exercise.notes}`;
          text += `\n`;
        });
      });
      text += `\n`;
    });

    return text;
  }

  // ⚠️ 경고 생성
  private generateWarnings(surveyData: any, program: any): string[] {
    const warnings: string[] = [];
    
    if (!surveyData.backoff_method) {
      warnings.push('백오프 방식이 지정되지 않아 기본값(스트레이트 세트)을 적용했습니다.');
    }
    
    if (!surveyData.experience_level) {
      warnings.push('경험 수준이 지정되지 않아 초급자 프로그램을 적용했습니다.');
    }
    
    if (program.metadata.customizations.length > 0) {
      warnings.push(`다음 제약사항에 맞춰 프로그램을 조정했습니다: ${program.metadata.customizations.join(', ')}`);
    }
    
    return warnings;
  }

  // 🔍 충돌 감지
  private detectConflicts(surveyData: any, program: any): string[] {
    const conflicts: string[] = [];
    
    // 훈련 빈도와 가능 요일 충돌
    if (surveyData.available_days) {
      const requiredDays = program.training_weeks[0]?.workouts?.length || 3;
      if (surveyData.available_days.length < requiredDays) {
        conflicts.push(`권장 훈련 빈도(${requiredDays}일)보다 가능한 요일(${surveyData.available_days.length}일)이 적습니다.`);
      }
    }
    
    // 경험 수준과 목표 불일치
    if (surveyData.experience_level === 'beginner' && surveyData.goals?.includes('competition')) {
      conflicts.push('초급자에게는 대회 준비보다 기본기 습득을 권장합니다.');
    }
    
    return conflicts;
  }
}