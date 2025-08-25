import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const surveySchema = z.object({
  experience: z.string().min(1, "경험 수준을 선택해주세요"),
  squatMax: z.string().min(1, "스쿼트 최대중량을 입력해주세요"),
  benchMax: z.string().min(1, "벤치프레스 최대중량을 입력해주세요"), 
  deadliftMax: z.string().min(1, "데드리프트 최대중량을 입력해주세요"),
  bodyweight: z.string().optional(),
  goals: z.array(z.string()).min(1, "최소 하나의 목표를 선택해주세요"),
  frequency: z.string().min(1, "훈련 빈도를 선택해주세요"),
  equipment: z.array(z.string()).min(1, "최소 하나의 장비를 선택해주세요"),
  injuries: z.string().min(1, "부상 이력을 선택해주세요"),
  injuryDetails: z.string().optional(),
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  name: z.string().optional()
});

type SurveyForm = z.infer<typeof surveySchema>;

export default function SurveySection() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const { toast } = useToast();

  const form = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      goals: [],
      equipment: [],
      injuryDetails: ""
    }
  });

  const submitMutation = useMutation<{
    success: boolean;
    message: string;
    surveyId: string;
    programUrl?: string;
    emailSent?: boolean;
  }, Error, SurveyForm>({
    mutationFn: async (data: SurveyForm) => {
      const response = await apiRequest("POST", "/api/surveys?kind=basic_v1", data);
      return await response.json();
    },
    onSuccess: () => {
      setCurrentStep(8); // Success state
      toast({
        title: "성공!",
        description: "훈련 프로그램이 이메일로 전송되었습니다.",
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

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = (data: SurveyForm) => {
    setCurrentStep(8); // Loading state
    submitMutation.mutate(data);
  };

  if (currentStep === 8) {
    return (
      <section className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-2xl px-8 text-center">
          {submitMutation.isPending ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-8"></div>
              <h3 className="text-3xl font-light text-white mb-6">
                AI가 당신의 맞춤형 프로그램을 생성하고 있습니다
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                수천 가지 운동 변수를 분석하여 최적의 훈련 계획을 설계중입니다. 잠시만 기다려주세요...
              </p>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8">
                <i className="fas fa-check text-lg"></i>
              </div>
              <h3 className="text-3xl font-light text-white mb-6">프로그램 생성 완료!</h3>
              <div className="space-y-6">
                {submitMutation.data?.emailSent ? (
                  <p className="text-gray-400 max-w-md mx-auto">
                    <span className="font-medium text-white">{form.getValues("email")}</span>로 맞춤형 파워리프팅 훈련 프로그램이 전송되었습니다.
                  </p>
                ) : (
                  <p className="text-gray-400 max-w-md mx-auto">
                    맞춤형 파워리프팅 훈련 프로그램이 생성되었습니다. 아래 버튼을 클릭해서 프로그램을 확인하세요.
                  </p>
                )}
                
                {submitMutation.data?.programUrl && (
                  <button 
                    onClick={() => window.open(submitMutation.data.programUrl, '_blank')}
                    data-testid="button-view-program"
                    className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium mr-4"
                  >
                    훈련 프로그램 보기
                  </button>
                )}
                
                <button 
                  onClick={() => window.location.reload()} 
                  data-testid="button-new-program"
                  className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  새로운 프로그램 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-2xl px-8">
        <div className="text-center">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {/* Step 1: Experience Level */}
            {currentStep === 1 && (
              <div data-testid="step-experience">
                <h3 className="text-3xl font-light text-white mb-12">파워리프팅 경험 수준을 알려주세요</h3>
                <div className="space-y-4">
                  {[
                    { value: "beginner", title: "초보자 (0-6개월)", desc: "파워리프팅을 처음 시작하거나 6개월 미만의 경험" },
                    { value: "intermediate", title: "중급자 (6개월-2년)", desc: "기본 동작을 익혔고 꾸준히 중량을 늘려가고 있음" },
                    { value: "advanced", title: "고급자 (2년 이상)", desc: "2년 이상의 경험으로 고중량 운동이 가능하고 경기 참가 경험 있음" }
                  ].map((option) => (
                    <label 
                      key={option.value}
                      className={`flex items-center p-6 border border-gray-600 rounded-lg cursor-pointer hover:border-white transition-colors duration-200 ${
                        form.watch("experience") === option.value ? "border-white bg-gray-900" : "border-gray-600"
                      }`}
                    >
                      <input 
                        type="radio" 
                        data-testid={`radio-experience-${option.value}`}
                        value={option.value}
                        {...form.register("experience")}
                        className="sr-only" 
                      />
                      <div className="flex items-center w-full">
                        <div className={`w-5 h-5 border-2 rounded-full mr-4 ${
                          form.watch("experience") === option.value ? "bg-white border-white" : "border-gray-500"
                        }`}></div>
                        <div className="text-left">
                          <div className="font-medium text-white">{option.title}</div>
                          <div className="text-gray-400 text-sm mt-1">{option.desc}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Current Maxes */}
            {currentStep === 2 && (
              <div data-testid="step-maxes">
                <h3 className="text-3xl font-light text-white mb-12">현재 1RM (최대 중량)을 입력해주세요</h3>
                <p className="text-gray-400 mb-8">정확하지 않아도 괜찮습니다. 추정치를 입력해주세요.</p>
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-300 text-lg font-light mb-2 block">스쿼트 (kg)</Label>
                    <Input 
                      type="number" 
                      placeholder="100"
                      data-testid="input-squat-max"
                      {...form.register("squatMax")}
                      className="bg-transparent border-gray-600 text-white text-xl p-4 h-14 focus:border-white transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-lg font-light mb-2 block">벤치프레스 (kg)</Label>
                    <Input 
                      type="number" 
                      placeholder="80"
                      data-testid="input-bench-max"
                      {...form.register("benchMax")}
                      className="bg-transparent border-gray-600 text-white text-xl p-4 h-14 focus:border-white transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-lg font-light mb-2 block">데드리프트 (kg)</Label>
                    <Input 
                      type="number" 
                      placeholder="120"
                      data-testid="input-deadlift-max"
                      {...form.register("deadliftMax")}
                      className="bg-transparent border-gray-600 text-white text-xl p-4 h-14 focus:border-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <div data-testid="step-goals">
                <h3 className="text-3xl font-light text-white mb-12">주요 목표를 선택해주세요</h3>
                <div className="space-y-4">
                  {[
                    { value: "strength", title: "최대 근력 향상", desc: "1RM 기록을 늘리고 싶어요" },
                    { value: "muscle", title: "근육량 증가", desc: "근육을 키우면서 힘도 늘리고 싶어요" },
                    { value: "technique", title: "기술 향상", desc: "올바른 자세와 테크닉을 완성하고 싶어요" }
                  ].map((goal) => {
                    const isSelected = form.watch("goals")?.includes(goal.value);
                    return (
                      <label 
                        key={goal.value}
                        className={`flex items-center p-6 border border-gray-600 rounded-lg cursor-pointer hover:border-white transition-colors duration-200 ${
                          isSelected ? "border-white bg-gray-900" : "border-gray-600"
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          value={goal.value}
                          data-testid={`checkbox-goal-${goal.value}`}
                          checked={isSelected}
                          onChange={(e) => {
                            const currentGoals = form.getValues("goals") || [];
                            if (e.target.checked) {
                              form.setValue("goals", [...currentGoals, goal.value]);
                            } else {
                              form.setValue("goals", currentGoals.filter(g => g !== goal.value));
                            }
                          }}
                          className="sr-only" 
                        />
                        <div className="flex items-center w-full">
                          <div className={`w-5 h-5 border-2 rounded mr-4 flex items-center justify-center ${
                            isSelected ? "bg-white border-white" : "border-gray-500"
                          }`}>
                            {isSelected && <i className="fas fa-check text-black text-xs"></i>}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white">{goal.title}</div>
                            <div className="text-gray-400 text-sm mt-1">{goal.desc}</div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Training Frequency */}
            {currentStep === 4 && (
              <div data-testid="step-frequency">
                <h3 className="text-3xl font-light text-white mb-12">주에 몇 번 운동할 수 있나요?</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {["2", "3", "4", "5", "6"].map((freq) => (
                    <label 
                      key={freq}
                      className={`flex items-center justify-center p-6 border border-gray-600 rounded-lg cursor-pointer hover:border-white transition-colors duration-200 ${
                        form.watch("frequency") === freq ? "border-white bg-gray-900" : "border-gray-600"
                      }`}
                    >
                      <input 
                        type="radio" 
                        value={freq}
                        data-testid={`radio-frequency-${freq}`}
                        {...form.register("frequency")}
                        className="sr-only" 
                      />
                      <div className="text-center">
                        <div className="text-2xl font-light text-white">{freq === "6" ? "6+" : freq}</div>
                        <div className="text-sm text-gray-400 mt-1">주 {freq === "6" ? "6회 이상" : `${freq}회`}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Equipment */}
            {currentStep === 5 && (
              <div data-testid="step-equipment">
                <h3 className="text-3xl font-light text-white mb-12">사용 가능한 장비를 모두 선택해주세요</h3>
                <div className="space-y-4">
                  {[
                    { value: "barbell", title: "바벨 & 프리웨이트" },
                    { value: "rack", title: "스쿼트 랙 / 파워 랙" },
                    { value: "bench", title: "벤치 (플랫/인클라인)" },
                    { value: "dumbbells", title: "덤벨" },
                    { value: "cables", title: "케이블 머신" },
                    { value: "machines", title: "보조 머신류" }
                  ].map((equipment) => {
                    const isSelected = form.watch("equipment")?.includes(equipment.value);
                    return (
                      <label 
                        key={equipment.value}
                        className={`flex items-center p-6 border border-gray-600 rounded-lg cursor-pointer hover:border-white transition-colors duration-200 ${
                          isSelected ? "border-white bg-gray-900" : "border-gray-600"
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          value={equipment.value}
                          data-testid={`checkbox-equipment-${equipment.value}`}
                          checked={isSelected}
                          onChange={(e) => {
                            const currentEquipment = form.getValues("equipment") || [];
                            if (e.target.checked) {
                              form.setValue("equipment", [...currentEquipment, equipment.value]);
                            } else {
                              form.setValue("equipment", currentEquipment.filter(eq => eq !== equipment.value));
                            }
                          }}
                          className="sr-only" 
                        />
                        <div className="flex items-center w-full">
                          <div className={`w-5 h-5 border-2 rounded mr-4 flex items-center justify-center ${
                            isSelected ? "bg-white border-white" : "border-gray-500"
                          }`}>
                            {isSelected && <i className="fas fa-check text-black text-xs"></i>}
                          </div>
                          <div className="font-medium text-white">{equipment.title}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Injury History */}
            {currentStep === 6 && (
              <div data-testid="step-injuries">
                <h3 className="text-3xl font-light text-white mb-12">부상 이력이나 신체적 제약이 있나요?</h3>
                <div className="space-y-4">
                  {[
                    { value: "none", title: "없음 - 건강한 상태입니다" },
                    { value: "minor", title: "경미한 부상 이력 (허리, 무릎, 어깨 등의 가벼운 불편함)" },
                    { value: "specific", title: "특정 부위 제약 (상세 내용을 아래에 입력)" }
                  ].map((injury) => (
                    <label 
                      key={injury.value}
                      className={`flex items-center p-6 border border-gray-600 rounded-lg cursor-pointer hover:border-white transition-colors duration-200 ${
                        form.watch("injuries") === injury.value ? "border-white bg-gray-900" : "border-gray-600"
                      }`}
                    >
                      <input 
                        type="radio" 
                        value={injury.value}
                        data-testid={`radio-injury-${injury.value}`}
                        {...form.register("injuries")}
                        className="sr-only" 
                      />
                      <div className="flex items-center w-full">
                        <div className={`w-5 h-5 border-2 rounded-full mr-4 ${
                          form.watch("injuries") === injury.value ? "bg-white border-white" : "border-gray-500"
                        }`}></div>
                        <div className="font-medium text-white text-left">{injury.title}</div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {form.watch("injuries") === "specific" && (
                  <div className="mt-8">
                    <Label className="text-gray-300 text-lg font-light mb-2 block">부상 부위나 제약사항을 상세히 알려주세요</Label>
                    <Textarea 
                      placeholder="예: 허리디스크로 인한 무거운 데드리프트 제한, 어깨 회전근개 수술 이력 등"
                      data-testid="textarea-injury-details"
                      {...form.register("injuryDetails")}
                      className="bg-transparent border-gray-600 text-white p-4 focus:border-white transition-colors resize-none"
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Email */}
            {currentStep === 7 && (
              <div data-testid="step-email">
                <h3 className="text-3xl font-light text-white mb-12">훈련 프로그램을 받을 이메일 주소를 입력해주세요</h3>
                <div className="space-y-8">
                  <div>
                    <Label className="text-gray-300 text-lg font-light mb-2 block">이메일 주소 *</Label>
                    <Input 
                      type="email" 
                      placeholder="powerlifting@example.com"
                      data-testid="input-email"
                      {...form.register("email")}
                      className="bg-transparent border-gray-600 text-white text-xl p-4 h-14 focus:border-white transition-colors"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-lg font-light mb-2 block">이름 (선택사항)</Label>
                    <Input 
                      type="text" 
                      placeholder="홍길동"
                      data-testid="input-name"
                      {...form.register("name")}
                      className="bg-transparent border-gray-600 text-white text-xl p-4 h-14 focus:border-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-12">
              <button 
                type="button" 
                onClick={previousStep}
                data-testid="button-previous"
                className={`px-6 py-3 text-gray-400 hover:text-white transition-colors ${currentStep === 1 ? "invisible" : ""}`}
              >
                Back
              </button>
              
              <div className="flex space-x-3">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i + 1 === currentStep ? "bg-white" : "bg-gray-600"}`}
                  />
                ))}
              </div>
              
              <div>
                {currentStep < totalSteps ? (
                  <button 
                    type="button" 
                    onClick={nextStep}
                    data-testid="button-next"
                    className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    type="submit"
                    data-testid="button-submit"
                    className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    disabled={submitMutation.isPending}
                  >
                    프로그램 생성하기
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}