import { createWorkoutSheet, type WorkoutProgram } from './services/sheetsService.js';

// 🎯 전문 파워리프팅 템플릿 데이터
const TEMPLATE_PROGRAM: WorkoutProgram = {
  program_title: "SINABRO STRENGTH 템플릿 v1.0",
  user_maxes: {
    squat: "[SQUAT_MAX]",      // 템플릿 플레이스홀더
    bench: "[BENCH_MAX]",      // 복사 시 실제 값으로 교체
    deadlift: "[DEADLIFT_MAX]" // 복사 시 실제 값으로 교체
  },
  training_weeks: [
    {
      week: 1,
      focus: "Work Capacity & Movement Quality",
      workouts: [
        {
          day: 1,
          workout_name: "Lower Body Power",
          exercises: [
            {
              exercise: "Back Squat (Competition Style)",
              sets: "4",
              reps: "5",
              weight_percent: "75%",
              rest_minutes: "3-4분",
              rpe: "7-8",
              notes: "Competition tempo, focus on depth"
            },
            {
              exercise: "Romanian Deadlift",
              sets: "3",
              reps: "8",
              weight_percent: "65%",
              rest_minutes: "2-3분",
              rpe: "7",
              notes: "Hip hinge pattern, hamstring focus"
            },
            {
              exercise: "Bulgarian Split Squat",
              sets: "3",
              reps: "10 each",
              weight_percent: "Body weight",
              rest_minutes: "90초",
              rpe: "6-7",
              notes: "Unilateral strength, balance"
            }
          ]
        },
        {
          day: 2,
          workout_name: "Upper Body Power",
          exercises: [
            {
              exercise: "Bench Press (Competition Style)",
              sets: "4",
              reps: "5",
              weight_percent: "75%",
              rest_minutes: "3-4분",
              rpe: "7-8",
              notes: "Competition arch, pause 1 sec"
            },
            {
              exercise: "Bent Over Row",
              sets: "4",
              reps: "8",
              weight_percent: "70%",
              rest_minutes: "2-3분",
              rpe: "7",
              notes: "Barbell row, back development"
            },
            {
              exercise: "Overhead Press",
              sets: "3",
              reps: "8",
              weight_percent: "Body weight",
              rest_minutes: "2분",
              rpe: "6-7",
              notes: "Shoulder stability, core engagement"
            }
          ]
        },
        {
          day: 3,
          workout_name: "Deadlift Focus",
          exercises: [
            {
              exercise: "Conventional Deadlift",
              sets: "4",
              reps: "3",
              weight_percent: "80%",
              rest_minutes: "4-5분",
              rpe: "8-9",
              notes: "Competition style, perfect form"
            },
            {
              exercise: "Deficit Deadlift",
              sets: "3",
              reps: "5",
              weight_percent: "70%",
              rest_minutes: "3분",
              rpe: "7",
              notes: "2-inch deficit, range of motion"
            },
            {
              exercise: "Barbell Hip Thrust",
              sets: "3",
              reps: "12",
              weight_percent: "60%",
              rest_minutes: "90초",
              rpe: "6-7",
              notes: "Glute activation, lockout strength"
            }
          ]
        }
      ]
    },
    {
      week: 2,
      focus: "Strength Building Phase",
      workouts: [
        {
          day: 1,
          workout_name: "Squat Volume",
          exercises: [
            {
              exercise: "Back Squat (High Bar)",
              sets: "5",
              reps: "3",
              weight_percent: "82%",
              rest_minutes: "4분",
              rpe: "8-9",
              notes: "Heavier load, maintain technique"
            },
            {
              exercise: "Pause Squat (2-sec)",
              sets: "3",
              reps: "6",
              weight_percent: "70%",
              rest_minutes: "3분",
              rpe: "7",
              notes: "Bottom position control"
            },
            {
              exercise: "Walking Lunges",
              sets: "3",
              reps: "12 each",
              weight_percent: "Body weight + 20kg",
              rest_minutes: "2분",
              rpe: "6-7",
              notes: "Functional strength pattern"
            }
          ]
        },
        {
          day: 2,
          workout_name: "Bench Volume", 
          exercises: [
            {
              exercise: "Competition Bench Press",
              sets: "5",
              reps: "3",
              weight_percent: "82%",
              rest_minutes: "4분",
              rpe: "8-9",
              notes: "Competition commands practice"
            },
            {
              exercise: "Close Grip Bench Press",
              sets: "4",
              reps: "6",
              weight_percent: "75%",
              rest_minutes: "3분",
              rpe: "7-8",
              notes: "Tricep emphasis, lockout strength"
            },
            {
              exercise: "Weighted Dips",
              sets: "3",
              reps: "10",
              weight_percent: "Body weight + 10kg",
              rest_minutes: "90초",
              rpe: "7",
              notes: "Chest and tricep development"
            }
          ]
        },
        {
          day: 3,
          workout_name: "Deadlift Volume",
          exercises: [
            {
              exercise: "Competition Deadlift",
              sets: "5",
              reps: "2",
              weight_percent: "85%",
              rest_minutes: "5분",
              rpe: "9",
              notes: "Heavy singles, competition prep"
            },
            {
              exercise: "Stiff Leg Deadlift",
              sets: "3",
              reps: "8",
              weight_percent: "65%",
              rest_minutes: "2-3분",
              rpe: "7",
              notes: "Hamstring and lower back strength"
            },
            {
              exercise: "Rack Pulls (Below Knee)",
              sets: "3",
              reps: "5",
              weight_percent: "90%",
              rest_minutes: "3-4분",
              rpe: "8",
              notes: "Lockout strength development"
            }
          ]
        }
      ]
    },
    {
      week: 3,
      focus: "Peak Strength & Competition Prep",
      workouts: [
        {
          day: 1,
          workout_name: "Squat Peak",
          exercises: [
            {
              exercise: "Competition Squat",
              sets: "6",
              reps: "1",
              weight_percent: "90-95%",
              rest_minutes: "5분",
              rpe: "9-10",
              notes: "Opener, 2nd, 3rd attempt practice"
            },
            {
              exercise: "Box Squat",
              sets: "3",
              reps: "5",
              weight_percent: "70%",
              rest_minutes: "3분",
              rpe: "6-7",
              notes: "Speed and explosion focus"
            }
          ]
        },
        {
          day: 2,
          workout_name: "Bench Peak",
          exercises: [
            {
              exercise: "Competition Bench",
              sets: "6",
              reps: "1",
              weight_percent: "90-95%",
              rest_minutes: "5분",
              rpe: "9-10",
              notes: "Competition commands, timing"
            },
            {
              exercise: "Speed Bench",
              sets: "8",
              reps: "3",
              weight_percent: "60%",
              rest_minutes: "60초",
              rpe: "5-6",
              notes: "Speed and power development"
            }
          ]
        },
        {
          day: 3,
          workout_name: "Deadlift Peak",
          exercises: [
            {
              exercise: "Competition Deadlift",
              sets: "6",
              reps: "1",
              weight_percent: "90-95%",
              rest_minutes: "5분",
              rpe: "9-10",
              notes: "Competition timing and setup"
            },
            {
              exercise: "Speed Deadlift",
              sets: "6",
              reps: "2",
              weight_percent: "65%",
              rest_minutes: "90초",
              rpe: "6-7",
              notes: "Explosive power off the floor"
            }
          ]
        }
      ]
    }
  ]
};

// 템플릿 생성 실행
async function createTemplate() {
  try {
    console.log('🎯 SINABRO STRENGTH 전문 템플릿 생성 중...');
    
    const templateUrl = await createWorkoutSheet(TEMPLATE_PROGRAM);
    
    console.log('✅ 템플릿 생성 완료!');
    console.log('📋 템플릿 URL:', templateUrl);
    
    // URL에서 스프레드시트 ID 추출
    const matches = templateUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
      const templateId = matches[1];
      console.log('🔑 템플릿 ID:', templateId);
      console.log('');
      console.log('🚀 이제 이 ID를 SHEET_TEMPLATE_ID 환경변수로 설정하세요:');
      console.log(`SHEET_TEMPLATE_ID=${templateId}`);
    }
    
    return templateUrl;
  } catch (error) {
    console.error('❌ 템플릿 생성 실패:', error);
    throw error;
  }
}

// 스크립트로 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  createTemplate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createTemplate, TEMPLATE_PROGRAM };