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

// 🎯 디자인용 최소 스키마 (2개 필드만!)
const surveySchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  name: z.string().min(1, "이름을 입력해주세요")
});

type SurveyForm = z.infer<typeof surveySchema>;

export default function SurveySection() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // 🎯 디자인용 2단계만!
  const { toast } = useToast();

  const form = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      name: "",
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
      setCurrentStep(3); // Success state
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
    setCurrentStep(3); // Loading state
    submitMutation.mutate(data);
  };

  if (currentStep === 3) {
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

            {/* Step 2: 이메일 */}
            {currentStep === 2 && (
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