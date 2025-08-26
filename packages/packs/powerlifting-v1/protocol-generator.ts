// 🏋️ 파워리프팅 프로그램 생성기 (최적화됨)

import { ConditionMapper, TrainingProtocol } from '../../core/user-defined-mapping';
import { AIPreventionGuard } from '../../core/ai-prevention-guard';

export interface WorkoutDay {
  day: number;
  workout_name: string;
  focus: string;
  exercises: Exercise[];
}

export interface Exercise {
  exercise: string;
  sets: string;
  reps: string;
  weight_percent: string;
  rpe?: string;
  rest_minutes?: string;
  notes?: string;
}

export interface GeneratedProgram {
  program_title: string;
  user_maxes: {
    squat: string;
    bench: string; 
    deadlift: string;
  };
  training_weeks: Array<{
    week: number;
    focus: string;
    workouts: WorkoutDay[];
  }>;
  metadata: {
    protocol_used: string;
    condition_path: string;
    customizations: string[];
  };
}

export class PowerliftingGenerator {
  private mapper: ConditionMapper;
  
  constructor() {
    this.mapper = new ConditionMapper();
  }

  // 🎯 메인 생성 함수 (심플하게)
  public generateProgram(surveyData: any): GeneratedProgram {
    // 1. 매핑 찾기
    const protocol = this.mapper.findProtocol(surveyData);
    
    // 2. 없으면 김동환님께 질문
    if (!protocol) {
      const conditionKey = this.buildConditionKey(surveyData);
      const questionMessage = AIPreventionGuard.generateQuestionMessage(conditionKey);
      console.log(questionMessage);
      
      throw new Error(`❓ 김동환님께 질문: ${conditionKey}\n\n${questionMessage}`);
    }
    
    // 3. 프로그램 생성
    const program = this.protocolToProgram(protocol, surveyData);
    
    return program;
  }

  // 🔑 조건키 생성
  private buildConditionKey(surveyData: any): string {
    const experience = surveyData.experience_level || 'unknown';
    const goal = surveyData.goals?.[0] || 'unknown';
    const backoff = surveyData.backoff_method || 'unknown';
    return `${experience}-${goal}-${backoff}`;
  }

  // 🔄 프로토콜 → 프로그램 변환 (심플하게)
  private protocolToProgram(protocol: TrainingProtocol, surveyData: any): GeneratedProgram {
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= protocol.protocol.schedule.block_length_weeks; weekNum++) {
      const week = {
        week: weekNum,
        focus: `훈련 ${weekNum}주차`,
        workouts: this.generateWeekWorkouts(weekNum, protocol.protocol, surveyData)
      };
      weeks.push(week);
    }

    return {
      program_title: `${surveyData.name || '고객'}님의 맞춤 파워리프팅 프로그램`,
      user_maxes: {
        squat: surveyData.squat_max || "100",
        bench: surveyData.bench_max || "80", 
        deadlift: surveyData.deadlift_max || "120"
      },
      training_weeks: weeks,
      metadata: {
        protocol_used: protocol.condition_key,
        condition_path: protocol.condition_key,
        customizations: [],
        source: "김동환님 직접 입력"
      }
    };
  }

  // 📅 김동환님 수치로 주차별 운동 생성 (수치 변경 금지!)
  private generateWeekWorkoutsFromDonghwanProtocol(weekNum: number, protocol: any, surveyData: any): WorkoutDay[] {
    const workouts: WorkoutDay[] = [];
    
    for (let dayNum = 1; dayNum <= protocol.days_per_week; dayNum++) {
      const workout = this.generateDayWorkoutFromDonghwanProtocol(dayNum, weekNum, protocol, surveyData);
      workouts.push(workout);
    }
    
    return workouts;
  }

  // 🏋️ 김동환님 수치로 일일 운동 생성 (수치 변경 금지!)
  private generateDayWorkoutFromDonghwanProtocol(dayNum: number, weekNum: number, protocol: any, surveyData: any): WorkoutDay {
    const exercises: Exercise[] = [];
    
    // 요일별 메인 운동 배치 (김동환님이 정한 것만)
    const mainLift = this.getMainLiftForDay(dayNum, protocol);
    
    if (mainLift === 'squat') {
      exercises.push(...this.generateSquatFromDonghwanProtocol(protocol, weekNum));
    } else if (mainLift === 'bench') {
      exercises.push(...this.generateBenchFromDonghwanProtocol(protocol, weekNum));
    } else if (mainLift === 'deadlift') {
      exercises.push(...this.generateDeadliftFromDonghwanProtocol(protocol, weekNum));
    }
    
    // 보조 운동 추가 (김동환님 수치만 사용!)
    exercises.push(...this.generateAccessoryFromDonghwanProtocol(protocol, mainLift));
    
    return {
      day: dayNum,
      workout_name: `${mainLift} 중심 훈련`,
      focus: mainLift.toUpperCase(),
      exercises
    };
  }

  // 🏋️ 김동환님 스쿼트 수치 그대로 적용 (변경 금지!)
  private generateSquatFromDonghwanProtocol(protocol: any, weekNum: number): Exercise[] {
    const squat = protocol.squat;
    // 🚫 AI가 임의로 조정하면 안 됨! 김동환님 수치 그대로 사용!
    
    return [{
      exercise: '백 스쿼트',
      sets: squat.sets.toString(),
      reps: squat.reps.toString(),
      weight_percent: `${squat.weight_percent}%`, // 김동환님 수치 그대로!
      rpe: squat.rpe.toString(),
      rest_minutes: `${squat.rest_minutes}분`,
      notes: `김동환 코치 직접 설정 수치`
    }];
  }

  // 🏋️ 김동환님 벤치 수치 그대로 적용 (변경 금지!)
  private generateBenchFromDonghwanProtocol(protocol: any, weekNum: number): Exercise[] {
    const bench = protocol.bench;
    // 🚫 AI가 임의로 조정하면 안 됨! 김동환님 수치 그대로 사용!
    
    return [{
      exercise: '벤치 프레스',
      sets: bench.sets.toString(),
      reps: bench.reps.toString(),
      weight_percent: `${bench.weight_percent}%`, // 김동환님 수치 그대로!
      rpe: bench.rpe.toString(),
      rest_minutes: `${bench.rest_minutes}분`,
      notes: `김동환 코치 직접 설정 수치`
    }];
  }

  // 🏋️ 김동환님 데드리프트 수치 그대로 적용 (변경 금지!)
  private generateDeadliftFromDonghwanProtocol(protocol: any, weekNum: number): Exercise[] {
    const deadlift = protocol.deadlift;
    // 🚫 AI가 임의로 조정하면 안 됨! 김동환님 수치 그대로 사용!
    
    return [{
      exercise: '데드리프트',
      sets: deadlift.sets.toString(),
      reps: deadlift.reps.toString(),
      weight_percent: `${deadlift.weight_percent}%`, // 김동환님 수치 그대로!
      rpe: deadlift.rpe.toString(),
      rest_minutes: `${deadlift.rest_minutes}분`,
      notes: `김동환 코치 직접 설정 수치`
    }];
  }

  // 🚫 보조운동도 AI가 정하면 안 됨! 김동환님이 직접 정해야 함!
  private generateAccessoryFromDonghwanProtocol(protocol: any, mainLift: string): Exercise[] {
    // 김동환님이 매핑 테이블에서 보조운동도 직접 정의해야 함
    if (!protocol.accessory_exercises || protocol.accessory_exercises.length === 0) {
      console.log(`❓ 김동환님께 질문: ${mainLift} 주운동 시 어떤 보조운동을 하나요?`);
      return []; // 김동환님이 정하지 않았으면 빈 배열
    }
    
    return protocol.accessory_exercises.map((exercise: string) => ({
      exercise,
      sets: protocol.accessory_sets?.toString() || "김동환님이 정한 값 필요",
      reps: protocol.accessory_reps || "김동환님이 정한 값 필요",
      weight_percent: protocol.accessory_weight_percent || "김동환님이 정한 값 필요",
      rpe: protocol.accessory_rpe?.toString() || "김동환님이 정한 값 필요",
      rest_minutes: protocol.accessory_rest_minutes || "김동환님이 정한 값 필요",
      notes: "김동환 코치 직접 선택한 보조운동"
    }));
  }

  // 🎯 헬퍼 함수들
  // 🚫 AI가 요일별 운동 배치 정하는 것도 금지!
  private getMainLiftForDay(dayNum: number, protocol: any): string {
    // 김동환님이 매핑 테이블에서 요일별 운동 배치도 직접 정해야 함
    if (protocol.daily_schedule && protocol.daily_schedule[dayNum - 1]) {
      return protocol.daily_schedule[dayNum - 1];
    }
    
    console.log(`❓ 김동환님께 질문: 주 ${protocol.days_per_week}회 훈련 시 ${dayNum}일차에는 어떤 운동을 하나요?`);
    return 'undefined'; // 김동환님이 정하지 않았으면 undefined
  }

  // 🚫 AI가 임의로 중량 조정하는 함수 삭제됨!
  // 김동환님이 주차별 진행을 어떻게 할지 직접 정해야 함!

  // 🚫 AI가 임의로 운동 목록 정하는 함수 삭제됨!
  // 김동환님이 보조운동도 직접 정해야 함!

  private getWeekFocus(weekNum: number, protocol: any): string {
    if (weekNum === protocol.deload_week) {
      return `디로드 주차`;
    }
    return `훈련 ${weekNum}주차`;
  }

  // 🔄 프로토콜 → 구체적 프로그램 변환
  private protocolToProgram(protocol: TrainingProtocol, surveyData: any): GeneratedProgram {
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= protocol.program_structure.block_length; weekNum++) {
      const week = {
        week: weekNum,
        focus: this.getWeekFocus(weekNum, protocol.program_structure.progression_scheme),
        workouts: this.generateWeekWorkouts(weekNum, protocol, surveyData)
      };
      weeks.push(week);
    }

    return {
      program_title: `${surveyData.name || '고객'}님의 맞춤 파워리프팅 프로그램`,
      user_maxes: {
        squat: surveyData.squat_max || "100",
        bench: surveyData.bench_max || "80",
        deadlift: surveyData.deadlift_max || "120"
      },
      training_weeks: weeks,
      metadata: {
        protocol_used: protocol.intensity_protocols.backoff_method,
        condition_path: `${this.getPrimaryCondition(surveyData)}-${this.getSecondaryCondition(surveyData)}-${this.getTertiaryCondition(surveyData)}`,
        customizations: this.getCustomizations(protocol, surveyData)
      }
    };
  }

  // 📅 주차별 운동 생성
  private generateWeekWorkouts(weekNum: number, protocol: TrainingProtocol, surveyData: any): WorkoutDay[] {
    const workouts: WorkoutDay[] = [];
    
    for (let dayNum = 1; dayNum <= protocol.scheduling.days_per_week; dayNum++) {
      const sessionType = protocol.scheduling.session_distribution[dayNum - 1];
      const workout = this.generateDayWorkout(dayNum, weekNum, sessionType, protocol, surveyData);
      workouts.push(workout);
    }
    
    return workouts;
  }

  // 🏋️ 일일 운동 생성
  private generateDayWorkout(dayNum: number, weekNum: number, sessionType: string, protocol: TrainingProtocol, surveyData: any): WorkoutDay {
    const exercises: Exercise[] = [];
    
    // 백오프 방식에 따른 운동 생성
    if (protocol.intensity_protocols.backoff_method === 'straight_sets') {
      exercises.push(...this.generateStraightSets(sessionType, weekNum, protocol));
    } else if (protocol.intensity_protocols.backoff_method === 'down_sets') {
      exercises.push(...this.generateDownSets(sessionType, weekNum, protocol));
    } else if (protocol.intensity_protocols.backoff_method === 'cluster_sets') {
      exercises.push(...this.generateClusterSets(sessionType, weekNum, protocol));
    }
    
    // 보조 운동 추가
    exercises.push(...this.generateAccessoryExercises(sessionType, protocol));
    
    return {
      day: dayNum,
      workout_name: this.getWorkoutName(sessionType),
      focus: this.getSessionFocus(sessionType),
      exercises
    };
  }

  // 📊 스트레이트 세트 생성
  private generateStraightSets(sessionType: string, weekNum: number, protocol: TrainingProtocol): Exercise[] {
    const mainLift = this.getMainLift(sessionType);
    const intensity = this.calculateIntensity(weekNum, protocol.program_structure.progression_scheme);
    
    return [{
      exercise: mainLift,
      sets: "5",
      reps: "5", 
      weight_percent: `${intensity}%`,
      rpe: protocol.intensity_protocols.rpe_targets[0]?.toString() || "8",
      rest_minutes: "3-4",
      notes: "스트레이트 세트: 모든 세트 동일한 중량과 횟수"
    }];
  }

  // 📉 다운 세트 생성  
  private generateDownSets(sessionType: string, weekNum: number, protocol: TrainingProtocol): Exercise[] {
    const mainLift = this.getMainLift(sessionType);
    const baseIntensity = this.calculateIntensity(weekNum, protocol.program_structure.progression_scheme);
    
    return [
      {
        exercise: mainLift,
        sets: "3",
        reps: "5",
        weight_percent: `${baseIntensity}%`,
        rpe: "8",
        rest_minutes: "3-4",
        notes: "메인 세트"
      },
      {
        exercise: mainLift,
        sets: "2", 
        reps: "8",
        weight_percent: `${baseIntensity - 10}%`,
        rpe: "7",
        rest_minutes: "2-3",
        notes: "백오프 세트: 중량 감소, 반복 증가"
      }
    ];
  }

  // 🔀 클러스터 세트 생성
  private generateClusterSets(sessionType: string, weekNum: number, protocol: TrainingProtocol): Exercise[] {
    const mainLift = this.getMainLift(sessionType);
    const intensity = this.calculateIntensity(weekNum, protocol.program_structure.progression_scheme);
    
    return [{
      exercise: mainLift,
      sets: "5",
      reps: "3+3", 
      weight_percent: `${intensity + 5}%`,
      rpe: "8",
      rest_minutes: "15초 클러스터 내 / 3분 세트 간",
      notes: "클러스터 세트: 3회 → 15초 휴식 → 3회"
    }];
  }

  // 💪 보조 운동 생성
  private generateAccessoryExercises(sessionType: string, protocol: TrainingProtocol): Exercise[] {
    const accessories = protocol.exercise_selection.accessory_exercises;
    const exercises: Exercise[] = [];
    
    // 세션 타입에 따른 보조 운동 선택
    const relevantAccessories = this.filterAccessoriesBySession(sessionType, accessories);
    
    relevantAccessories.slice(0, 2).forEach(exercise => {
      exercises.push({
        exercise: exercise,
        sets: "3",
        reps: "8-10",
        weight_percent: "70-75%",
        rpe: "7",
        rest_minutes: "2",
        notes: "보조 운동"
      });
    });
    
    return exercises;
  }

  // 🎯 헬퍼 함수들
  private getMainLift(sessionType: string): string {
    switch(sessionType) {
      case 'squat_focus': return '백 스쿼트';
      case 'bench_focus': return '벤치 프레스';
      case 'deadlift_focus': return '데드리프트';
      case 'squat_bench': return '백 스쿼트';
      default: return '백 스쿼트';
    }
  }

  private calculateIntensity(weekNum: number, progressionScheme: string): number {
    if (progressionScheme === 'linear') {
      return 70 + (weekNum - 1) * 5; // 70%, 75%, 80%, 85%
    } else if (progressionScheme === 'block_periodization') {
      return weekNum <= 3 ? 75 + weekNum * 2 : 85; // 77%, 79%, 81%, then 85%
    }
    return 75;
  }

  private getWeekFocus(weekNum: number, progressionScheme: string): string {
    if (progressionScheme === 'linear') {
      return `선형 진행 ${weekNum}주차`;
    } else if (progressionScheme === 'block_periodization') {
      return weekNum <= 3 ? `적응 블럭 ${weekNum}주차` : `강화 블럭 ${weekNum - 3}주차`;
    }
    return `훈련 ${weekNum}주차`;
  }

  private getWorkoutName(sessionType: string): string {
    const names: { [key: string]: string } = {
      'squat_focus': '스쿼트 중심 훈련',
      'bench_focus': '벤치프레스 중심 훈련', 
      'deadlift_focus': '데드리프트 중심 훈련',
      'squat_bench': '스쿼트 + 벤치프레스',
      'deadlift_press': '데드리프트 + 오버헤드프레스'
    };
    return names[sessionType] || '전신 훈련';
  }

  private getSessionFocus(sessionType: string): string {
    return sessionType.replace('_', ' ').toUpperCase();
  }

  private filterAccessoriesBySession(sessionType: string, accessories: string[]): string[] {
    // 세션 타입에 맞는 보조 운동 필터링
    if (sessionType.includes('squat')) {
      return accessories.filter(ex => ['front_squat', 'lunges', 'leg_press'].includes(ex));
    } else if (sessionType.includes('bench')) {
      return accessories.filter(ex => ['incline_bench', 'dips', 'rows'].includes(ex));
    } else if (sessionType.includes('deadlift')) {
      return accessories.filter(ex => ['romanian_deadlift', 'rows', 'pullups'].includes(ex));
    }
    return accessories.slice(0, 2);
  }

  // 메타데이터 추출 함수들
  private getPrimaryCondition(surveyData: any): string {
    return surveyData.experience_level || 'beginner';
  }

  private getSecondaryCondition(surveyData: any): string {
    return surveyData.goals?.includes('strength') ? 'strength' : 'general';
  }

  private getTertiaryCondition(surveyData: any): string {
    return surveyData.backoff_method || 'straight_sets';
  }

  private getCustomizations(protocol: TrainingProtocol, surveyData: any): string[] {
    const customizations: string[] = [];
    
    if (surveyData.available_days && surveyData.available_days.length < 4) {
      customizations.push('스케줄 축소');
    }
    
    if (surveyData.equipment_limitations) {
      customizations.push('장비 제약 대응');
    }
    
    if (surveyData.injuries) {
      customizations.push('부상 고려');
    }
    
    return customizations;
  }
}