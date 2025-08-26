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
  const totalSteps = 2; // 🎯 디자인용 최소 단계 (2개만!)

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

  // 2단계: 이메일
  const renderStep2 = () => (
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