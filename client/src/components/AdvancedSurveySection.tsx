import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

// 확장된 설문 스키마 - 40+ 필드
const advancedSurveySchema = z.object({
  // 기본 정보
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  name: z.string().optional(),
  
  // 경험 및 현재 상태
  experience: z.string().min(1, "경험 수준을 선택해주세요"),
  squatMax: z.string().min(1, "스쿼트 최대중량을 입력해주세요"),
  benchMax: z.string().min(1, "벤치프레스 최대중량을 입력해주세요"),
  deadliftMax: z.string().min(1, "데드리프트 최대중량을 입력해주세요"),
  totalMax: z.string().optional(),
  bodyweight: z.string().optional(),
  competitionExperience: z.string().optional(),
  lastCompetition: z.string().optional(),
  
  // 목표 및 우선순위
  goals: z.array(z.string()).min(1, "최소 하나의 목표를 선택해주세요"),
  primaryGoal: z.string().optional(),
  timeframe: z.string().optional(),
  nextCompetition: z.string().optional(),
  
  // 훈련 빈도 및 구성
  frequency: z.string().min(1, "훈련 빈도를 선택해주세요"),
  sessionsPerWeek: z.string().optional(),
  trainingDuration: z.string().optional(),
  preferredTime: z.string().optional(),
  
  // 운동별 세부 선호도
  squatFrequency: z.string().optional(),
  benchFrequency: z.string().optional(),
  deadliftFrequency: z.string().optional(),
  accessoryPreference: z.string().optional(),
  
  // 훈련 블럭 선호도
  preferredBlocks: z.array(z.string()).optional(),
  blockDuration: z.string().optional(),
  peakingExperience: z.string().optional(),
  
  // 기술적 선호도
  squatStyle: z.string().optional(),
  squatStance: z.string().optional(),
  benchStyle: z.string().optional(),
  deadliftStyle: z.string().optional(),
  
  // 약점 및 강점
  weakestLift: z.string().optional(),
  strongestLift: z.string().optional(),
  techniqueIssues: z.array(z.string()).optional(),
  strengthIssues: z.array(z.string()).optional(),
  
  // 장비 및 환경
  equipment: z.array(z.string()).min(1, "최소 하나의 장비를 선택해주세요"),
  homeGym: z.string().optional(),
  spotterAvailable: z.string().optional(),
  preferredEquipment: z.array(z.string()).optional(),
  
  // 부상 이력
  injuries: z.string().min(1, "부상 이력을 선택해주세요"),
  injuryDetails: z.string().optional(),
  currentPain: z.array(z.string()).optional(),
  injuryHistory: z.array(z.string()).optional(),
  
  // 회복 및 라이프스타일
  sleepHours: z.string().optional(),
  stressLevel: z.string().optional(),
  nutrition: z.string().optional(),
  supplementation: z.array(z.string()).optional(),
  
  // 과거 프로그램 경험
  previousPrograms: z.array(z.string()).optional(),
  programPreference: z.string().optional(),
  volumeTolerance: z.string().optional(),
  intensityPreference: z.string().optional(),
  
  // 멘탈 및 동기
  motivation: z.string().optional(),
  mentalApproach: z.string().optional(),
  failureHandling: z.string().optional(),
  
  // 고급 설정
  periodization: z.string().optional(),
  autoregulation: z.string().optional(),
  testing: z.string().optional(),
  warmupPreference: z.string().optional(),
});

type AdvancedSurveyForm = z.infer<typeof advancedSurveySchema>;

export default function AdvancedSurveySection() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 12;
  const { toast } = useToast();

  const form = useForm<AdvancedSurveyForm>({
    resolver: zodResolver(advancedSurveySchema),
    defaultValues: {
      goals: [],
      equipment: [],
      preferredBlocks: [],
      techniqueIssues: [],
      strengthIssues: [],
      preferredEquipment: [],
      currentPain: [],
      injuryHistory: [],
      supplementation: [],
      previousPrograms: [],
    }
  });

  const submitMutation = useMutation<{
    success: boolean;
    message: string;
    surveyId: string;
    programUrl?: string;
    emailSent?: boolean;
  }, Error, AdvancedSurveyForm>({
    mutationFn: async (data: AdvancedSurveyForm) => {
      const response = await apiRequest("POST", "/api/survey", data);
      return await response.json();
    },
    onSuccess: () => {
      setCurrentStep(13); // Success state
      toast({
        title: "성공!",
        description: "맞춤형 파워리프팅 프로그램이 이메일로 전송되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "프로그램 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = (data: AdvancedSurveyForm) => {
    submitMutation.mutate(data);
  };

  // 1단계: 기본 정보
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">기본 정보</h2>
        <p className="text-gray-400">프로그램 전달을 위한 기본 정보를 입력해주세요</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white">이메일 주소 *</Label>
          <Input
            id="email"
            data-testid="input-email"
            {...form.register("email")}
            placeholder="your@email.com"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {form.formState.errors.email && (
            <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="name" className="text-white">이름 (선택사항)</Label>
          <Input
            id="name"
            data-testid="input-name"
            {...form.register("name")}
            placeholder="홍길동"
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>
    </div>
  );

  // 2단계: 현재 수준
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">현재 수준</h2>
        <p className="text-gray-400">현재 최대중량과 경험 수준을 알려주세요</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-white">경험 수준 *</Label>
          <RadioGroup 
            value={form.watch("experience")} 
            onValueChange={(value) => form.setValue("experience", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="beginner" />
              <label htmlFor="beginner" className="text-gray-300">초급 (3대 운동 경험 1년 미만)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <label htmlFor="intermediate" className="text-gray-300">중급 (3대 운동 경험 1-3년)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <label htmlFor="advanced" className="text-gray-300">고급 (3대 운동 경험 3년 이상)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="elite" id="elite" />
              <label htmlFor="elite" className="text-gray-300">엘리트 (국내외 대회 입상 경험)</label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="squatMax" className="text-white">스쿼트 1RM (kg) *</Label>
            <Input
              id="squatMax"
              data-testid="input-squat-max"
              {...form.register("squatMax")}
              placeholder="100"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="benchMax" className="text-white">벤치프레스 1RM (kg) *</Label>
            <Input
              id="benchMax"
              data-testid="input-bench-max"
              {...form.register("benchMax")}
              placeholder="80"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="deadliftMax" className="text-white">데드리프트 1RM (kg) *</Label>
            <Input
              id="deadliftMax"
              data-testid="input-deadlift-max"
              {...form.register("deadliftMax")}
              placeholder="120"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bodyweight" className="text-white">체중 (kg)</Label>
            <Input
              id="bodyweight"
              data-testid="input-bodyweight"
              {...form.register("bodyweight")}
              placeholder="70"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">대회 참가 경험</Label>
            <RadioGroup 
              value={form.watch("competitionExperience")} 
              onValueChange={(value) => form.setValue("competitionExperience", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="comp-none" />
                <label htmlFor="comp-none" className="text-gray-300">없음</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="comp-local" />
                <label htmlFor="comp-local" className="text-gray-300">지역 대회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="national" id="comp-national" />
                <label htmlFor="comp-national" className="text-gray-300">전국 대회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="international" id="comp-international" />
                <label htmlFor="comp-international" className="text-gray-300">국제 대회</label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );

  // 3단계: 목표 설정
  const renderStep3 = () => {
    const goalOptions = [
      { id: "strength", label: "최대근력 향상" },
      { id: "competition", label: "대회 준비" },
      { id: "technique", label: "기술 개선" },
      { id: "muscle", label: "근육량 증가" },
      { id: "conditioning", label: "체력 향상" },
      { id: "rehabilitation", label: "재활 및 부상 예방" }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-white mb-3">목표 설정</h2>
          <p className="text-gray-400">훈련 목표와 우선순위를 설정해주세요</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white">훈련 목표 (중복 선택 가능) *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {goalOptions.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal.id}
                    checked={form.watch("goals")?.includes(goal.id)}
                    onCheckedChange={(checked) => {
                      const currentGoals = form.watch("goals") || [];
                      if (checked) {
                        form.setValue("goals", [...currentGoals, goal.id]);
                      } else {
                        form.setValue("goals", currentGoals.filter(g => g !== goal.id));
                      }
                    }}
                  />
                  <label htmlFor={goal.id} className="text-gray-300">{goal.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white">가장 중요한 목표 1개</Label>
            <RadioGroup 
              value={form.watch("primaryGoal")} 
              onValueChange={(value) => form.setValue("primaryGoal", value)}
              className="mt-2"
            >
              {goalOptions.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={goal.id} id={`primary-${goal.id}`} />
                  <label htmlFor={`primary-${goal.id}`} className="text-gray-300">{goal.label}</label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">목표 달성 기간</Label>
            <RadioGroup 
              value={form.watch("timeframe")} 
              onValueChange={(value) => form.setValue("timeframe", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3months" id="3months" />
                <label htmlFor="3months" className="text-gray-300">3개월</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6months" id="6months" />
                <label htmlFor="6months" className="text-gray-300">6개월</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1year" id="1year" />
                <label htmlFor="1year" className="text-gray-300">1년</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="longterm" id="longterm" />
                <label htmlFor="longterm" className="text-gray-300">장기 (1년 이상)</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="nextCompetition" className="text-white">다음 대회 목표 (선택사항)</Label>
            <Input
              id="nextCompetition"
              {...form.register("nextCompetition")}
              placeholder="2025년 전국 파워리프팅 대회"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
      </div>
    );
  };

  // 4단계: 훈련 구성
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">훈련 구성</h2>
        <p className="text-gray-400">훈련 빈도와 블럭 구성을 설정해주세요</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-white">주간 훈련 빈도 *</Label>
          <RadioGroup 
            value={form.watch("frequency")} 
            onValueChange={(value) => form.setValue("frequency", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="freq-3" />
              <label htmlFor="freq-3" className="text-gray-300">주 3회</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="freq-4" />
              <label htmlFor="freq-4" className="text-gray-300">주 4회</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="freq-5" />
              <label htmlFor="freq-5" className="text-gray-300">주 5회</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6" id="freq-6" />
              <label htmlFor="freq-6" className="text-gray-300">주 6회</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">1회 훈련 시간</Label>
          <RadioGroup 
            value={form.watch("trainingDuration")} 
            onValueChange={(value) => form.setValue("trainingDuration", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="60min" id="60min" />
              <label htmlFor="60min" className="text-gray-300">60분</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="90min" id="90min" />
              <label htmlFor="90min" className="text-gray-300">90분</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="120min" id="120min" />
              <label htmlFor="120min" className="text-gray-300">120분</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="150min" id="150min" />
              <label htmlFor="150min" className="text-gray-300">150분 이상</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">선호하는 훈련 블럭 (중복 선택 가능)</Label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {[
              { id: "work_capacity", label: "Work Capacity 블럭 (작업용량 향상)" },
              { id: "strength", label: "Strength 블럭 (최대근력 집중)" },
              { id: "peaking", label: "Peaking 블럭 (대회 준비)" },
              { id: "technique", label: "Technique 블럭 (기술 개선)" },
              { id: "hypertrophy", label: "Hypertrophy 블럭 (근육량 증가)" }
            ].map((block) => (
              <div key={block.id} className="flex items-center space-x-2">
                <Checkbox
                  id={block.id}
                  checked={form.watch("preferredBlocks")?.includes(block.id)}
                  onCheckedChange={(checked) => {
                    const currentBlocks = form.watch("preferredBlocks") || [];
                    if (checked) {
                      form.setValue("preferredBlocks", [...currentBlocks, block.id]);
                    } else {
                      form.setValue("preferredBlocks", currentBlocks.filter(b => b !== block.id));
                    }
                  }}
                />
                <label htmlFor={block.id} className="text-gray-300">{block.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">블럭 기간</Label>
          <RadioGroup 
            value={form.watch("blockDuration")} 
            onValueChange={(value) => form.setValue("blockDuration", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3weeks" id="3weeks" />
              <label htmlFor="3weeks" className="text-gray-300">3주</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4weeks" id="4weeks" />
              <label htmlFor="4weeks" className="text-gray-300">4주</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6weeks" id="6weeks" />
              <label htmlFor="6weeks" className="text-gray-300">6주</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="8weeks" id="8weeks" />
              <label htmlFor="8weeks" className="text-gray-300">8주</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 5단계: 운동별 세부 선호도
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">운동별 선호도</h2>
        <p className="text-gray-400">각 운동의 주간 빈도와 스타일을 설정해주세요</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white">주간 스쿼트 빈도</Label>
            <RadioGroup 
              value={form.watch("squatFrequency")} 
              onValueChange={(value) => form.setValue("squatFrequency", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="squat-1" />
                <label htmlFor="squat-1" className="text-gray-300">주 1회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="squat-2" />
                <label htmlFor="squat-2" className="text-gray-300">주 2회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="squat-3" />
                <label htmlFor="squat-3" className="text-gray-300">주 3회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="squat-4" />
                <label htmlFor="squat-4" className="text-gray-300">주 4회</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">주간 벤치프레스 빈도</Label>
            <RadioGroup 
              value={form.watch("benchFrequency")} 
              onValueChange={(value) => form.setValue("benchFrequency", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="bench-1" />
                <label htmlFor="bench-1" className="text-gray-300">주 1회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="bench-2" />
                <label htmlFor="bench-2" className="text-gray-300">주 2회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="bench-3" />
                <label htmlFor="bench-3" className="text-gray-300">주 3회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="bench-4" />
                <label htmlFor="bench-4" className="text-gray-300">주 4회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="bench-5" />
                <label htmlFor="bench-5" className="text-gray-300">주 5회</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">주간 데드리프트 빈도</Label>
            <RadioGroup 
              value={form.watch("deadliftFrequency")} 
              onValueChange={(value) => form.setValue("deadliftFrequency", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="dead-1" />
                <label htmlFor="dead-1" className="text-gray-300">주 1회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="dead-2" />
                <label htmlFor="dead-2" className="text-gray-300">주 2회</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="dead-3" />
                <label htmlFor="dead-3" className="text-gray-300">주 3회</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">스쿼트 스타일</Label>
            <RadioGroup 
              value={form.watch("squatStyle")} 
              onValueChange={(value) => form.setValue("squatStyle", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high_bar" id="high-bar" />
                <label htmlFor="high-bar" className="text-gray-300">하이바</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low_bar" id="low-bar" />
                <label htmlFor="low-bar" className="text-gray-300">로우바</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="squat-both" />
                <label htmlFor="squat-both" className="text-gray-300">둘 다</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">데드리프트 스타일</Label>
            <RadioGroup 
              value={form.watch("deadliftStyle")} 
              onValueChange={(value) => form.setValue("deadliftStyle", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conventional" id="conventional" />
                <label htmlFor="conventional" className="text-gray-300">컨벤셔널</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sumo" id="sumo" />
                <label htmlFor="sumo" className="text-gray-300">스모</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="dead-both" />
                <label htmlFor="dead-both" className="text-gray-300">둘 다</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-white">보조운동 선호도</Label>
          <RadioGroup 
            value={form.watch("accessoryPreference")} 
            onValueChange={(value) => form.setValue("accessoryPreference", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="minimal" />
              <label htmlFor="minimal" className="text-gray-300">최소 (메인 운동 중심)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="moderate" />
              <label htmlFor="moderate" className="text-gray-300">보통 (균형)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <label htmlFor="high" className="text-gray-300">많음 (다양한 보조운동)</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 6단계: 약점 및 강점
  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">약점 & 강점 분석</h2>
        <p className="text-gray-400">현재 약점과 강점을 분석해주세요</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">가장 약한 운동</Label>
            <RadioGroup 
              value={form.watch("weakestLift")} 
              onValueChange={(value) => form.setValue("weakestLift", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="squat" id="weak-squat" />
                <label htmlFor="weak-squat" className="text-gray-300">스쿼트</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bench" id="weak-bench" />
                <label htmlFor="weak-bench" className="text-gray-300">벤치프레스</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deadlift" id="weak-deadlift" />
                <label htmlFor="weak-deadlift" className="text-gray-300">데드리프트</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">가장 강한 운동</Label>
            <RadioGroup 
              value={form.watch("strongestLift")} 
              onValueChange={(value) => form.setValue("strongestLift", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="squat" id="strong-squat" />
                <label htmlFor="strong-squat" className="text-gray-300">스쿼트</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bench" id="strong-bench" />
                <label htmlFor="strong-bench" className="text-gray-300">벤치프레스</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deadlift" id="strong-deadlift" />
                <label htmlFor="strong-deadlift" className="text-gray-300">데드리프트</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-white">기술적 문제점 (중복 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { id: "depth", label: "스쿼트 깊이 부족" },
              { id: "lockout", label: "락아웃 약함" },
              { id: "speed", label: "바 속도 부족" },
              { id: "grip", label: "그립 약함" },
              { id: "arch", label: "벤치 아치 불안정" },
              { id: "setup", label: "셋업 문제" }
            ].map((issue) => (
              <div key={issue.id} className="flex items-center space-x-2">
                <Checkbox
                  id={issue.id}
                  checked={form.watch("techniqueIssues")?.includes(issue.id)}
                  onCheckedChange={(checked) => {
                    const current = form.watch("techniqueIssues") || [];
                    if (checked) {
                      form.setValue("techniqueIssues", [...current, issue.id]);
                    } else {
                      form.setValue("techniqueIssues", current.filter(i => i !== issue.id));
                    }
                  }}
                />
                <label htmlFor={issue.id} className="text-gray-300">{issue.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">근력적 약점 (중복 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { id: "core", label: "코어 약함" },
              { id: "legs", label: "다리 근력 부족" },
              { id: "back", label: "등 근력 부족" },
              { id: "chest", label: "가슴 근력 부족" },
              { id: "shoulders", label: "어깨 약함" },
              { id: "glutes", label: "둔근 약함" }
            ].map((issue) => (
              <div key={issue.id} className="flex items-center space-x-2">
                <Checkbox
                  id={issue.id}
                  checked={form.watch("strengthIssues")?.includes(issue.id)}
                  onCheckedChange={(checked) => {
                    const current = form.watch("strengthIssues") || [];
                    if (checked) {
                      form.setValue("strengthIssues", [...current, issue.id]);
                    } else {
                      form.setValue("strengthIssues", current.filter(i => i !== issue.id));
                    }
                  }}
                />
                <label htmlFor={issue.id} className="text-gray-300">{issue.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 7단계: 장비 및 환경
  const renderStep7 = () => {
    const equipmentOptions = [
      { id: "barbell", label: "바벨" },
      { id: "rack", label: "파워랙/스쿼트랙" },
      { id: "bench", label: "벤치" },
      { id: "plates", label: "원판" },
      { id: "platform", label: "데드리프트 플랫폼" },
      { id: "belt", label: "역도벨트" },
      { id: "wraps", label: "무릎밴드/손목밴드" },
      { id: "shoes", label: "역도화" }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-white mb-3">장비 & 환경</h2>
          <p className="text-gray-400">사용 가능한 장비와 훈련 환경을 알려주세요</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white">사용 가능한 장비 *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {equipmentOptions.map((equipment) => (
                <div key={equipment.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment.id}
                    checked={form.watch("equipment")?.includes(equipment.id)}
                    onCheckedChange={(checked) => {
                      const currentEquipment = form.watch("equipment") || [];
                      if (checked) {
                        form.setValue("equipment", [...currentEquipment, equipment.id]);
                      } else {
                        form.setValue("equipment", currentEquipment.filter(e => e !== equipment.id));
                      }
                    }}
                  />
                  <label htmlFor={equipment.id} className="text-gray-300">{equipment.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white">홈짐 보유</Label>
            <RadioGroup 
              value={form.watch("homeGym")} 
              onValueChange={(value) => form.setValue("homeGym", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="home-yes" />
                <label htmlFor="home-yes" className="text-gray-300">있음</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="home-no" />
                <label htmlFor="home-no" className="text-gray-300">없음 (헬스장 이용)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="home-sometimes" />
                <label htmlFor="home-sometimes" className="text-gray-300">가끔 (상황에 따라)</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">스포터 이용 가능성</Label>
            <RadioGroup 
              value={form.watch("spotterAvailable")} 
              onValueChange={(value) => form.setValue("spotterAvailable", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="spotter-always" />
                <label htmlFor="spotter-always" className="text-gray-300">항상 가능</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="spotter-sometimes" />
                <label htmlFor="spotter-sometimes" className="text-gray-300">가끔 가능</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="spotter-never" />
                <label htmlFor="spotter-never" className="text-gray-300">불가능</label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  };

  // 8단계: 부상 및 건강
  const renderStep8 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">부상 이력 & 건강</h2>
        <p className="text-gray-400">현재 부상 상태와 과거 이력을 알려주세요</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-white">현재 부상 상태 *</Label>
          <RadioGroup 
            value={form.watch("injuries")} 
            onValueChange={(value) => form.setValue("injuries", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="injury-none" />
              <label htmlFor="injury-none" className="text-gray-300">없음</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minor" id="injury-minor" />
              <label htmlFor="injury-minor" className="text-gray-300">경미한 불편함</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="injury-specific" />
              <label htmlFor="injury-specific" className="text-gray-300">특정 부위 부상</label>
            </div>
          </RadioGroup>
        </div>

        {form.watch("injuries") !== "none" && (
          <div>
            <Label htmlFor="injuryDetails" className="text-white">부상 세부사항</Label>
            <Textarea
              id="injuryDetails"
              {...form.register("injuryDetails")}
              placeholder="부상 부위, 증상, 언제부터인지 등을 자세히 적어주세요"
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
            />
          </div>
        )}

        <div>
          <Label className="text-white">현재 통증 부위 (중복 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { id: "lower_back", label: "허리" },
              { id: "knee", label: "무릎" },
              { id: "shoulder", label: "어깨" },
              { id: "wrist", label: "손목" },
              { id: "hip", label: "엉덩이" },
              { id: "ankle", label: "발목" }
            ].map((pain) => (
              <div key={pain.id} className="flex items-center space-x-2">
                <Checkbox
                  id={pain.id}
                  checked={form.watch("currentPain")?.includes(pain.id)}
                  onCheckedChange={(checked) => {
                    const current = form.watch("currentPain") || [];
                    if (checked) {
                      form.setValue("currentPain", [...current, pain.id]);
                    } else {
                      form.setValue("currentPain", current.filter(p => p !== pain.id));
                    }
                  }}
                />
                <label htmlFor={pain.id} className="text-gray-300">{pain.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 9단계: 라이프스타일
  const renderStep9 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">라이프스타일 & 회복</h2>
        <p className="text-gray-400">일상 생활과 회복에 영향을 주는 요소들을 알려주세요</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">평균 수면 시간</Label>
            <RadioGroup 
              value={form.watch("sleepHours")} 
              onValueChange={(value) => form.setValue("sleepHours", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="sleep-5" />
                <label htmlFor="sleep-5" className="text-gray-300">5시간 이하</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6" id="sleep-6" />
                <label htmlFor="sleep-6" className="text-gray-300">6시간</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7" id="sleep-7" />
                <label htmlFor="sleep-7" className="text-gray-300">7시간</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="8" id="sleep-8" />
                <label htmlFor="sleep-8" className="text-gray-300">8시간</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9" id="sleep-9" />
                <label htmlFor="sleep-9" className="text-gray-300">9시간 이상</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">스트레스 수준</Label>
            <RadioGroup 
              value={form.watch("stressLevel")} 
              onValueChange={(value) => form.setValue("stressLevel", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="stress-low" />
                <label htmlFor="stress-low" className="text-gray-300">낮음</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="stress-medium" />
                <label htmlFor="stress-medium" className="text-gray-300">보통</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="stress-high" />
                <label htmlFor="stress-high" className="text-gray-300">높음</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-white">영양 관리 수준</Label>
          <RadioGroup 
            value={form.watch("nutrition")} 
            onValueChange={(value) => form.setValue("nutrition", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poor" id="nutrition-poor" />
              <label htmlFor="nutrition-poor" className="text-gray-300">부족 (불규칙한 식사)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="average" id="nutrition-average" />
              <label htmlFor="nutrition-average" className="text-gray-300">보통 (일반적인 식사)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="nutrition-good" />
              <label htmlFor="nutrition-good" className="text-gray-300">좋음 (균형잡힌 식사)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excellent" id="nutrition-excellent" />
              <label htmlFor="nutrition-excellent" className="text-gray-300">매우 좋음 (계획적 영양관리)</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">복용 중인 보충제 (중복 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { id: "protein", label: "단백질 파우더" },
              { id: "creatine", label: "크레아틴" },
              { id: "vitamins", label: "종합비타민" },
              { id: "omega3", label: "오메가3" },
              { id: "preworkout", label: "프리워크아웃" },
              { id: "none", label: "없음" }
            ].map((supplement) => (
              <div key={supplement.id} className="flex items-center space-x-2">
                <Checkbox
                  id={supplement.id}
                  checked={form.watch("supplementation")?.includes(supplement.id)}
                  onCheckedChange={(checked) => {
                    const current = form.watch("supplementation") || [];
                    if (checked) {
                      form.setValue("supplementation", [...current, supplement.id]);
                    } else {
                      form.setValue("supplementation", current.filter(s => s !== supplement.id));
                    }
                  }}
                />
                <label htmlFor={supplement.id} className="text-gray-300">{supplement.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 10단계: 프로그램 경험
  const renderStep10 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">프로그램 경험</h2>
        <p className="text-gray-400">과거 사용한 프로그램과 선호도를 알려주세요</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-white">과거 사용 프로그램 (중복 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { id: "531", label: "5/3/1" },
              { id: "sheiko", label: "쉐이코" },
              { id: "westside", label: "웨스트사이드" },
              { id: "smolov", label: "스몰로프" },
              { id: "madcow", label: "매드카우" },
              { id: "stronglifts", label: "스트롱리프트" },
              { id: "starting_strength", label: "스타팅 스트렝스" },
              { id: "linear", label: "선형 진행" },
              { id: "custom", label: "개인 맞춤" },
              { id: "none", label: "체계적 프로그램 없음" }
            ].map((program) => (
              <div key={program.id} className="flex items-center space-x-2">
                <Checkbox
                  id={program.id}
                  checked={form.watch("previousPrograms")?.includes(program.id)}
                  onCheckedChange={(checked) => {
                    const current = form.watch("previousPrograms") || [];
                    if (checked) {
                      form.setValue("previousPrograms", [...current, program.id]);
                    } else {
                      form.setValue("previousPrograms", current.filter(p => p !== program.id));
                    }
                  }}
                />
                <label htmlFor={program.id} className="text-gray-300">{program.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">선호하는 프로그램 구조</Label>
          <RadioGroup 
            value={form.watch("programPreference")} 
            onValueChange={(value) => form.setValue("programPreference", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="linear" id="prog-linear" />
              <label htmlFor="prog-linear" className="text-gray-300">선형 진행 (매주 증가)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="block" id="prog-block" />
              <label htmlFor="prog-block" className="text-gray-300">블럭 피리어다이제이션</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="conjugate" id="prog-conjugate" />
              <label htmlFor="prog-conjugate" className="text-gray-300">콘쥬게이트 (웨스트사이드)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily_undulating" id="prog-dup" />
              <label htmlFor="prog-dup" className="text-gray-300">일일 언듈레이팅</label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">볼륨 견딤력</Label>
            <RadioGroup 
              value={form.watch("volumeTolerance")} 
              onValueChange={(value) => form.setValue("volumeTolerance", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="volume-low" />
                <label htmlFor="volume-low" className="text-gray-300">낮음</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="volume-medium" />
                <label htmlFor="volume-medium" className="text-gray-300">보통</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="volume-high" />
                <label htmlFor="volume-high" className="text-gray-300">높음</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">강도 선호도</Label>
            <RadioGroup 
              value={form.watch("intensityPreference")} 
              onValueChange={(value) => form.setValue("intensityPreference", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="intensity-low" />
                <label htmlFor="intensity-low" className="text-gray-300">낮음 (60-75%)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="intensity-medium" />
                <label htmlFor="intensity-medium" className="text-gray-300">보통 (75-85%)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="intensity-high" />
                <label htmlFor="intensity-high" className="text-gray-300">높음 (85%+)</label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );

  // 11단계: 멘탈 & 고급 설정
  const renderStep11 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">멘탈 & 고급 설정</h2>
        <p className="text-gray-400">훈련 접근법과 정신적 측면을 설정해주세요</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-white">훈련 동기</Label>
          <RadioGroup 
            value={form.watch("motivation")} 
            onValueChange={(value) => form.setValue("motivation", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="competition" id="mot-competition" />
              <label htmlFor="mot-competition" className="text-gray-300">대회 목표</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal" id="mot-personal" />
              <label htmlFor="mot-personal" className="text-gray-300">개인 기록 향상</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="health" id="mot-health" />
              <label htmlFor="mot-health" className="text-gray-300">건강 유지</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="strength" id="mot-strength" />
              <label htmlFor="mot-strength" className="text-gray-300">순수 근력 추구</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">정신적 접근법</Label>
          <RadioGroup 
            value={form.watch("mentalApproach")} 
            onValueChange={(value) => form.setValue("mentalApproach", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aggressive" id="mental-aggressive" />
              <label htmlFor="mental-aggressive" className="text-gray-300">공격적 (한계 도전)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="steady" id="mental-steady" />
              <label htmlFor="mental-steady" className="text-gray-300">꾸준함 (점진적 향상)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cautious" id="mental-cautious" />
              <label htmlFor="mental-cautious" className="text-gray-300">신중함 (부상 예방 중시)</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">오토레귤레이션 사용</Label>
          <RadioGroup 
            value={form.watch("autoregulation")} 
            onValueChange={(value) => form.setValue("autoregulation", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="auto-none" />
              <label htmlFor="auto-none" className="text-gray-300">사용 안함</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rpe" id="auto-rpe" />
              <label htmlFor="auto-rpe" className="text-gray-300">RPE 사용</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rir" id="auto-rir" />
              <label htmlFor="auto-rir" className="text-gray-300">RIR 사용</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="auto-percentage" />
              <label htmlFor="auto-percentage" className="text-gray-300">퍼센테지만 사용</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">웜업 선호도</Label>
          <RadioGroup 
            value={form.watch("warmupPreference")} 
            onValueChange={(value) => form.setValue("warmupPreference", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="warmup-minimal" />
              <label htmlFor="warmup-minimal" className="text-gray-300">최소 (빠른 시작)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="warmup-moderate" />
              <label htmlFor="warmup-moderate" className="text-gray-300">보통 (표준)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="extensive" id="warmup-extensive" />
              <label htmlFor="warmup-extensive" className="text-gray-300">충분함 (철저한 준비)</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 12단계: 최종 확인
  const renderStep12 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">최종 확인</h2>
        <p className="text-gray-400">입력하신 정보를 확인하고 프로그램을 생성하세요</p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">이메일:</span>
            <span className="text-white ml-2">{form.watch("email")}</span>
          </div>
          <div>
            <span className="text-gray-400">경험 수준:</span>
            <span className="text-white ml-2">{form.watch("experience")}</span>
          </div>
          <div>
            <span className="text-gray-400">스쿼트 1RM:</span>
            <span className="text-white ml-2">{form.watch("squatMax")}kg</span>
          </div>
          <div>
            <span className="text-gray-400">벤치 1RM:</span>
            <span className="text-white ml-2">{form.watch("benchMax")}kg</span>
          </div>
          <div>
            <span className="text-gray-400">데드리프트 1RM:</span>
            <span className="text-white ml-2">{form.watch("deadliftMax")}kg</span>
          </div>
          <div>
            <span className="text-gray-400">주간 빈도:</span>
            <span className="text-white ml-2">주 {form.watch("frequency")}회</span>
          </div>
          <div>
            <span className="text-gray-400">주요 목표:</span>
            <span className="text-white ml-2">{form.watch("primaryGoal")}</span>
          </div>
          <div>
            <span className="text-gray-400">벤치 주간 빈도:</span>
            <span className="text-white ml-2">주 {form.watch("benchFrequency")}회</span>
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-4">
          <p className="text-gray-300 text-sm">
            이 정보를 바탕으로 개인 맞춤형 파워리프팅 프로그램을 생성합니다.
            프로그램은 이메일로 전송되며, 실제 편집 가능한 구글 스프레드시트 형태로 제공됩니다.
          </p>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-8">
      <Button
        onClick={prevStep}
        disabled={currentStep === 1}
        variant="outline"
        className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        이전
      </Button>

      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < currentStep ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {currentStep < totalSteps ? (
        <Button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          다음
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={submitMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {submitMutation.isPending ? "생성 중..." : "프로그램 생성"}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      case 9: return renderStep9();
      case 10: return renderStep10();
      case 11: return renderStep11();
      case 12: return renderStep12();
      default: return <div>단계 {currentStep} 준비중...</div>;
    }
  };

  if (currentStep === 13) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
          <h2 className="text-3xl font-light text-white mb-4">프로그램 생성 완료!</h2>
          <p className="text-gray-400 mb-8">
            맞춤형 파워리프팅 프로그램이 이메일로 전송되었습니다.<br />
            몇 분 내로 이메일을 확인해보세요.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">
              단계 {currentStep} / {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round((currentStep / totalSteps) * 100)}% 완료
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {renderCurrentStep()}
        {renderNavigation()}
      </div>
    </div>
  );
}