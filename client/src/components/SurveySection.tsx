import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const surveySchema = z.object({
  experience: z.string().min(1, "경험 수준을 선택해주세요"),
  squatMax: z.string().min(1, "스쿼트 최대중량을 입력해주세요"),
  benchMax: z.string().min(1, "벤치프레스 최대중량을 입력해주세요"), 
  deadliftMax: z.string().min(1, "데드리프트 최대중량을 입력해주세요"),
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

  const submitMutation = useMutation({
    mutationFn: async (data: SurveyForm) => {
      return apiRequest("POST", "/api/survey", data);
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

  const progress = (currentStep / totalSteps) * 100;

  if (currentStep === 8) {
    return (
      <section id="survey" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardContent className="p-12">
              {submitMutation.isPending ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    AI가 당신의 맞춤형 프로그램을 생성하고 있습니다
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    수천 가지 운동 변수를 분석하여 최적의 훈련 계획을 설계중입니다. 잠시만 기다려주세요...
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-check text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">프로그램 전송 완료!</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    <span className="font-medium">{form.getValues("email")}</span>로 맞춤형 파워리프팅 훈련 프로그램이 전송되었습니다. 
                    이메일을 확인하고 바로 훈련을 시작해보세요!
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    data-testid="button-new-program"
                    className="bg-accent hover:bg-orange-600"
                  >
                    새로운 프로그램 만들기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="survey" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardContent className="p-8 md:p-12">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">진행률</span>
                <span className="text-sm font-medium text-gray-600" data-testid="progress-text">
                  {currentStep} / {totalSteps}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Experience Level */}
              {currentStep === 1 && (
                <div data-testid="step-experience">
                  <h3 className="text-2xl font-bold text-primary mb-6">파워리프팅 경험 수준을 알려주세요</h3>
                  <div className="grid gap-4">
                    {[
                      { value: "beginner", title: "초보자 (0-6개월)", desc: "파워리프팅을 처음 시작하거나 6개월 미만의 경험" },
                      { value: "intermediate", title: "중급자 (6개월-2년)", desc: "기본 동작을 익혔고 꾸준히 중량을 늘려가고 있음" },
                      { value: "advanced", title: "고급자 (2년 이상)", desc: "2년 이상의 경험으로 고중량 운동이 가능하고 경기 참가 경험 있음" }
                    ].map((option) => (
                      <label 
                        key={option.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-accent transition-colors duration-200 ${
                          form.watch("experience") === option.value ? "border-accent bg-accent bg-opacity-5" : "border-gray-200"
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
                          <div className={`w-6 h-6 border-2 rounded-full mr-4 ${
                            form.watch("experience") === option.value ? "bg-accent border-accent" : "border-gray-300"
                          }`}></div>
                          <div>
                            <div className="font-semibold text-primary">{option.title}</div>
                            <div className="text-gray-600 text-sm">{option.desc}</div>
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
                  <h3 className="text-2xl font-bold text-primary mb-6">현재 1RM (최대 중량)을 입력해주세요</h3>
                  <p className="text-gray-600 mb-6">정확하지 않아도 괜찮습니다. 추정치를 입력해주세요.</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-primary font-medium">스쿼트 (kg)</Label>
                      <Input 
                        type="number" 
                        placeholder="예: 100"
                        data-testid="input-squat-max"
                        {...form.register("squatMax")}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-primary font-medium">벤치프레스 (kg)</Label>
                      <Input 
                        type="number" 
                        placeholder="예: 80"
                        data-testid="input-bench-max"
                        {...form.register("benchMax")}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-primary font-medium">데드리프트 (kg)</Label>
                      <Input 
                        type="number" 
                        placeholder="예: 120"
                        data-testid="input-deadlift-max"
                        {...form.register("deadliftMax")}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <div data-testid="step-goals">
                  <h3 className="text-2xl font-bold text-primary mb-6">주요 목표를 선택해주세요</h3>
                  <div className="grid gap-4">
                    {[
                      { value: "strength", title: "최대 근력 향상", desc: "1RM 기록을 늘리고 싶어요" },
                      { value: "muscle", title: "근육량 증가", desc: "근육을 키우면서 힘도 늘리고 싶어요" },
                      { value: "technique", title: "기술 향상", desc: "올바른 자세와 테크닉을 완성하고 싶어요" }
                    ].map((goal) => {
                      const isSelected = form.watch("goals")?.includes(goal.value);
                      return (
                        <label 
                          key={goal.value}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-accent transition-colors duration-200 ${
                            isSelected ? "border-accent bg-accent bg-opacity-5" : "border-gray-200"
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
                            <div className={`w-6 h-6 border-2 rounded-lg mr-4 flex items-center justify-center ${
                              isSelected ? "bg-accent border-accent" : "border-gray-300"
                            }`}>
                              {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                            </div>
                            <div>
                              <div className="font-semibold text-primary">{goal.title}</div>
                              <div className="text-gray-600 text-sm">{goal.desc}</div>
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
                  <h3 className="text-2xl font-bold text-primary mb-6">주에 몇 번 운동할 수 있나요?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {["2", "3", "4", "5", "6"].map((freq) => (
                      <label 
                        key={freq}
                        className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:border-accent transition-colors duration-200 ${
                          form.watch("frequency") === freq ? "border-accent bg-accent bg-opacity-5" : "border-gray-200"
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
                          <div className="text-2xl font-bold text-primary">{freq === "6" ? "6+" : freq}</div>
                          <div className="text-sm text-gray-600">주 {freq === "6" ? "6회 이상" : `${freq}회`}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Equipment */}
              {currentStep === 5 && (
                <div data-testid="step-equipment">
                  <h3 className="text-2xl font-bold text-primary mb-6">사용 가능한 장비를 모두 선택해주세요</h3>
                  <div className="grid md:grid-cols-2 gap-4">
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
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-accent transition-colors duration-200 ${
                            isSelected ? "border-accent bg-accent bg-opacity-5" : "border-gray-200"
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
                            <div className={`w-6 h-6 border-2 rounded-lg mr-4 flex items-center justify-center ${
                              isSelected ? "bg-accent border-accent" : "border-gray-300"
                            }`}>
                              {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                            </div>
                            <div className="font-semibold text-primary">{equipment.title}</div>
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
                  <h3 className="text-2xl font-bold text-primary mb-6">부상 이력이나 신체적 제약이 있나요?</h3>
                  <div className="space-y-4">
                    {[
                      { value: "none", title: "없음 - 건강한 상태입니다" },
                      { value: "minor", title: "경미한 부상 이력 (허리, 무릎, 어깨 등의 가벼운 불편함)" },
                      { value: "specific", title: "특정 부위 제약 (상세 내용을 아래에 입력)" }
                    ].map((injury) => (
                      <label 
                        key={injury.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-accent transition-colors duration-200 ${
                          form.watch("injuries") === injury.value ? "border-accent bg-accent bg-opacity-5" : "border-gray-200"
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
                          <div className={`w-6 h-6 border-2 rounded-full mr-4 ${
                            form.watch("injuries") === injury.value ? "bg-accent border-accent" : "border-gray-300"
                          }`}></div>
                          <div className="font-semibold text-primary">{injury.title}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {form.watch("injuries") === "specific" && (
                    <div className="mt-6">
                      <Label className="text-primary font-medium">부상 부위나 제약사항을 상세히 알려주세요</Label>
                      <Textarea 
                        placeholder="예: 허리디스크로 인한 무거운 데드리프트 제한, 어깨 회전근개 수술 이력 등"
                        data-testid="textarea-injury-details"
                        {...form.register("injuryDetails")}
                        className="mt-2 resize-none"
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 7: Email */}
              {currentStep === 7 && (
                <div data-testid="step-email">
                  <h3 className="text-2xl font-bold text-primary mb-6">훈련 프로그램을 받을 이메일 주소를 입력해주세요</h3>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-primary font-medium">이메일 주소 *</Label>
                      <Input 
                        type="email" 
                        placeholder="powerlifting@example.com"
                        data-testid="input-email"
                        {...form.register("email")}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-primary font-medium">이름 (선택사항)</Label>
                      <Input 
                        type="text" 
                        placeholder="홍길동"
                        data-testid="input-name"
                        {...form.register("name")}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">📧 곧 받게 될 훈련 프로그램에는 다음이 포함됩니다:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 주차별 상세 훈련 스케줄</li>
                        <li>• 운동별 세트/반복수/중량 가이드</li>
                        <li>• 점진적 과부하 계획</li>
                        <li>• 부상 예방을 위한 웜업/쿨다운 루틴</li>
                        <li>• 개인 목표에 맞는 보조운동 추천</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                <Button 
                  type="button" 
                  onClick={previousStep}
                  data-testid="button-previous"
                  variant="ghost" 
                  className={`text-gray-600 hover:text-primary ${currentStep === 1 ? "invisible" : ""}`}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  이전
                </Button>
                
                <div className="flex space-x-4 ml-auto">
                  {currentStep < totalSteps ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      data-testid="button-next"
                      className="bg-accent hover:bg-orange-600 text-white"
                    >
                      다음
                      <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      data-testid="button-submit"
                      className="bg-success hover:bg-green-600 text-white"
                      disabled={submitMutation.isPending}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      프로그램 생성하기
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
