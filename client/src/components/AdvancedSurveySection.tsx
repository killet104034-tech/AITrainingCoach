import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdvancedSurveySectionProps {
  form: UseFormReturn<any>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AdvancedSurveySection({ 
  form, 
  currentStep, 
  setCurrentStep, 
  onSubmit, 
  isSubmitting 
}: AdvancedSurveySectionProps) {
  const totalSteps = 3; // 🎯 3단계 (이름 + 체크박스 + 이메일)

  // 1단계: 이름
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-light text-white mb-3">이름을 알려주세요</h2>
        <p className="text-gray-400">맞춤형 프로그램 제작을 위해 필요합니다</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Label htmlFor="name" className="text-white text-lg block mb-4">이름 *</Label>
        <Input
          id="name"
          data-testid="input-name"
          {...form.register("name")}
          placeholder="김파워"
          className="bg-black/40 border-gray-600/50 text-white backdrop-blur-sm text-lg p-4 text-center rounded-lg focus:border-white/50 transition-colors duration-200"
        />
      </div>
    </div>
  );

  // 2단계: 운동 목표 (체크박스)
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-light text-white mb-3">운동 목표를 선택해주세요</h2>
        <p className="text-gray-400">여러 개를 선택할 수 있어요</p>
      </div>
      
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
              className={`flex items-center p-6 border border-gray-600/50 rounded-lg cursor-pointer hover:border-white/50 transition-all duration-200 backdrop-blur-sm ${
                isSelected ? "border-white/70 bg-white/10 shadow-lg" : "border-gray-600/50"
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
  );

  // 3단계: 이메일
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-light text-white mb-3">이메일 주소</h2>
        <p className="text-gray-400">완성된 프로그램을 이메일로 보내드려요</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Label htmlFor="email" className="text-white text-lg block mb-4">이메일 *</Label>
        <Input
          id="email"
          data-testid="input-email"
          {...form.register("email")}
          placeholder="example@email.com"
          className="bg-black/40 border-gray-600/50 text-white backdrop-blur-sm text-lg p-4 text-center rounded-lg focus:border-white/50 transition-colors duration-200"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-12">
      <Button
        type="button"
        variant="ghost" 
        data-testid="button-previous"
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
      >
        ← 이전
      </Button>

      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i + 1 <= currentStep 
                ? 'bg-white' 
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {currentStep < totalSteps ? (
        <Button
          type="button"
          data-testid="button-next"
          onClick={() => setCurrentStep(currentStep + 1)}
          className="bg-white text-black hover:bg-gray-200 transition-all duration-200"
        >
          다음 →
        </Button>
      ) : (
        <Button
          type="button"
          data-testid="button-submit"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200 min-w-[120px]"
        >
          {isSubmitting ? '제출 중...' : '완료 →'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-[url('/gym-bg.jpg')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 프로그레스 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-light text-white/80 mb-2">
              {currentStep}/{totalSteps}단계
            </h1>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {renderCurrentStep()}
          {renderNavigation()}
        </div>
      </div>
    </div>
  );
}

export default AdvancedSurveySection;