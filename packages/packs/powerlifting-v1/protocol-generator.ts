// 🏋️ 파워리프팅 v1 프로토콜 생성기
// 📋 사용자 정의 조건매핑 → 구체적 운동프로그램 변환

import { UserDefinedMapper } from '@sinabro/core/user-defined-mapping';

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

export class PowerliftingProtocolGenerator {
  private userMapper: UserDefinedMapper;
  
  constructor() {
    this.userMapper = new UserDefinedMapper();
  }

  // 🎯 메인 프로그램 생성 함수 - 사용자 정의 수치 사용
  public generateProgram(surveyData: any): GeneratedProgram {
    // 1. 사용자 정의 매핑으로 정확한 수치 찾기
    const userProtocol = this.userMapper.mapToUserDefinedProtocol(surveyData);
    
    if (!userProtocol) {
      throw new Error(`조건에 맞는 프로토콜을 찾을 수 없습니다. 사용 가능한 조건: ${this.userMapper.getAvailableConditions().join(', ')}`);
    }
    
    // 2. 사용자 정의 수치를 실제 운동 프로그램으로 변환
    const program = this.userProtocolToProgram(userProtocol, surveyData);
    
    return program;
  }

  // 🔄 사용자 정의 프로토콜 → 구체적 프로그램 변환
  private userProtocolToProgram(userProtocol: any, surveyData: any): GeneratedProgram {
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= userProtocol.protocol.block_length_weeks; weekNum++) {
      const week = {
        week: weekNum,
        focus: this.getWeekFocus(weekNum, userProtocol.protocol),
        workouts: this.generateWeekWorkoutsFromUserProtocol(weekNum, userProtocol.protocol, surveyData)
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
        protocol_used: userProtocol.condition_key,
        condition_path: userProtocol.condition_key,
        customizations: []
      }
    };
  }

  // 📅 사용자 정의 수치로 주차별 운동 생성
  private generateWeekWorkoutsFromUserProtocol(weekNum: number, protocol: any, surveyData: any): WorkoutDay[] {
    const workouts: WorkoutDay[] = [];
    
    for (let dayNum = 1; dayNum <= protocol.days_per_week; dayNum++) {
      const workout = this.generateDayWorkoutFromUserProtocol(dayNum, weekNum, protocol, surveyData);
      workouts.push(workout);
    }
    
    return workouts;
  }

  // 🏋️ 사용자 정의 수치로 일일 운동 생성
  private generateDayWorkoutFromUserProtocol(dayNum: number, weekNum: number, protocol: any, surveyData: any): WorkoutDay {
    const exercises: Exercise[] = [];
    
    // 요일별 메인 운동 배치
    const mainLift = this.getMainLiftForDay(dayNum, protocol.days_per_week);
    
    if (mainLift === 'squat') {
      exercises.push(...this.generateSquatFromUserProtocol(protocol, weekNum));
    } else if (mainLift === 'bench') {
      exercises.push(...this.generateBenchFromUserProtocol(protocol, weekNum));
    } else if (mainLift === 'deadlift') {
      exercises.push(...this.generateDeadliftFromUserProtocol(protocol, weekNum));
    }
    
    // 보조 운동 추가 (사용자 정의 수치)
    exercises.push(...this.generateAccessoryFromUserProtocol(protocol, mainLift));
    
    return {
      day: dayNum,
      workout_name: `${mainLift} 중심 훈련`,
      focus: mainLift.toUpperCase(),
      exercises
    };
  }

  // 🏋️ 사용자 정의 스쿼트 운동 생성
  private generateSquatFromUserProtocol(protocol: any, weekNum: number): Exercise[] {
    const squat = protocol.squat;
    const adjustedWeight = this.adjustWeightByWeek(squat.weight_percent, weekNum);
    
    return [{
      exercise: '백 스쿼트',
      sets: squat.sets.toString(),
      reps: squat.reps.toString(),
      weight_percent: `${adjustedWeight}%`,
      rpe: squat.rpe.toString(),
      rest_minutes: `${squat.rest_minutes}분`,
      notes: `사용자 정의 프로토콜 적용`
    }];
  }

  // 🏋️ 사용자 정의 벤치 운동 생성
  private generateBenchFromUserProtocol(protocol: any, weekNum: number): Exercise[] {
    const bench = protocol.bench;
    const adjustedWeight = this.adjustWeightByWeek(bench.weight_percent, weekNum);
    
    return [{
      exercise: '벤치 프레스',
      sets: bench.sets.toString(),
      reps: bench.reps.toString(),
      weight_percent: `${adjustedWeight}%`,
      rpe: bench.rpe.toString(),
      rest_minutes: `${bench.rest_minutes}분`,
      notes: `사용자 정의 프로토콜 적용`
    }];
  }

  // 🏋️ 사용자 정의 데드리프트 운동 생성
  private generateDeadliftFromUserProtocol(protocol: any, weekNum: number): Exercise[] {
    const deadlift = protocol.deadlift;
    const adjustedWeight = this.adjustWeightByWeek(deadlift.weight_percent, weekNum);
    
    return [{
      exercise: '데드리프트',
      sets: deadlift.sets.toString(),
      reps: deadlift.reps.toString(),
      weight_percent: `${adjustedWeight}%`,
      rpe: deadlift.rpe.toString(),
      rest_minutes: `${deadlift.rest_minutes}분`,
      notes: `사용자 정의 프로토콜 적용`
    }];
  }

  // 💪 사용자 정의 보조운동 생성
  private generateAccessoryFromUserProtocol(protocol: any, mainLift: string): Exercise[] {
    const accessories = this.getAccessoryExercises(mainLift);
    
    return accessories.map(exercise => ({
      exercise,
      sets: protocol.accessory_sets.toString(),
      reps: protocol.accessory_reps,
      weight_percent: "70-75%",
      rpe: protocol.accessory_rpe.toString(),
      rest_minutes: "2분",
      notes: "보조 운동"
    }));
  }

  // 🎯 헬퍼 함수들
  private getMainLiftForDay(dayNum: number, daysPerWeek: number): string {
    if (daysPerWeek === 3) {
      const lifts = ['squat', 'bench', 'deadlift'];
      return lifts[dayNum - 1];
    } else if (daysPerWeek === 4) {
      const lifts = ['squat', 'bench', 'deadlift', 'squat'];
      return lifts[dayNum - 1];
    }
    return 'squat';
  }

  private adjustWeightByWeek(baseWeight: number, weekNum: number): number {
    // 주차별 2.5% 증가
    return baseWeight + (weekNum - 1) * 2.5;
  }

  private getAccessoryExercises(mainLift: string): string[] {
    const accessories: { [key: string]: string[] } = {
      'squat': ['프론트 스쿼트', '불가리안 스플릿 스쿼트'],
      'bench': ['인클라인 벤치프레스', '딥스'],
      'deadlift': ['루마니안 데드리프트', '벤트오버 로우']
    };
    return accessories[mainLift] || [];
  }

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