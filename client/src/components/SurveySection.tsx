import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// 🎯 디자인용 스키마 (체크박스 포함!)
const surveySchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  goals: z.array(z.string()).min(1, "최소 하나의 목표를 선택해주세요"),
  email: z.string().email("올바른 이메일 주소를 입력해주세요")
});

type SurveyForm = z.infer<typeof surveySchema>;

export default function SurveySection() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3; // 🎯 디자인용 3단계 (체크박스 포함!)
  const { toast } = useToast();

  const form = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      name: "",
      goals: [],
      email: ""
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
      setCurrentStep(4); // Success state
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
    setCurrentStep(4); // Loading state
    submitMutation.mutate(data);
  };

  if (currentStep === 4) {
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
                    <span className="font-medium text-white">{form.getValues("email")}</span>로 맞춤형 훈련 프로그램이 전송되었습니다.
                  </p>
                ) : (
                  <p className="text-gray-400 max-w-md mx-auto">
                    맞춤형 훈련 프로그램이 생성되었습니다. 아래 버튼을 클릭해서 프로그램을 확인하세요.
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
            {/* Step 1: 이름 */}
            {currentStep === 1 && (
              <div data-testid="step-name">
                <h3 className="text-3xl font-light text-white mb-12">이름을 알려주세요</h3>
                <p className="text-gray-400 mb-8">맞춤형 프로그램 제작을 위해 필요합니다</p>
                <div className="max-w-md mx-auto">
                  <Label className="text-gray-300 text-lg font-light mb-4 block">이름 *</Label>
                  <Input 
                    type="text" 
                    placeholder="김파워"
                    data-testid="input-name"
                    {...form.register("name")}
                    className="bg-transparent border-gray-600 text-white text-xl p-4 h-14 focus:border-white transition-colors text-center"
                  />
                </div>
              </div>
            )}

            {/* Step 2: 운동 목표 (체크박스) */}
            {currentStep === 2 && (
              <div data-testid="step-goals">
                <h3 className="text-3xl font-light text-white mb-12">운동 목표를 선택해주세요</h3>
                <p className="text-gray-400 mb-8">여러 개를 선택할 수 있어요</p>
                
                <div className="space-y-4 max-w-lg mx-auto">
                  {[
                    { value: "strength", title: "💪 근력 향상", desc: "더 무거운 중량을 들고 싶어요" },
                    { value: "muscle", title: "🏋️ 근육량 증가", desc: "몸을 더 크고 탄탄하게 만들고 싶어요" },
                    { value: "health", title: "🌟 건강 관리", desc: "전반적인 체력과 건강을 개선하고 싶어요" },
                    { value: "competition", title: "🏆 대회 준비", desc: "파워리프팅 대회에 참가하고 싶어요" },
                    { value: "technique", title: "⚙️ 기술 향상", desc: "올바른 자세와 테크닉을 배우고 싶어요" }
                  ].map((goal) => {
                    const isSelected = form.watch("goals")?.includes(goal.value);
                    return (
                      <label 
                        key={goal.value}
                        className={`flex items-center p-6 border border-gray-600 rounded-lg cursor-pointer hover:border-white transition-all duration-200 ${
                          isSelected ? "border-white bg-gray-900/50 shadow-lg" : "border-gray-600"
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
                          <div className={`w-6 h-6 border-2 rounded-md mr-4 flex items-center justify-center transition-all duration-200 ${
                            isSelected ? "bg-white border-white" : "border-gray-500"
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white text-lg">{goal.title}</div>
                            <div className="text-gray-400 text-sm mt-1">{goal.desc}</div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: 이메일 */}
            {currentStep === 3 && (
              <div data-testid="step-email">
                <h3 className="text-3xl font-light text-white mb-12">이메일 주소</h3>
                <p className="text-gray-400 mb-8">완성된 프로그램을 이메일로 보내드려요</p>
                <div className="max-w-md mx-auto">
                  <Label className="text-gray-300 text-lg font-light mb-4 block">이메일 *</Label>
                  <Input 
                    type="email" 
                    placeholder="example@email.com"
                    data-testid="input-email"
                    {...form.register("email")}
                    className="bg-transparent border-gray-600 text-white text-xl p-4 h-14 focus:border-white transition-colors text-center"
                  />
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
                ← 이전
              </button>
              
              <div className="flex space-x-3">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full ${i + 1 === currentStep ? "bg-white" : "bg-gray-600"}`}
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
                    다음 →
                  </button>
                ) : (
                  <button 
                    type="submit"
                    data-testid="button-submit"
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? '제출 중...' : '완료 →'}
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