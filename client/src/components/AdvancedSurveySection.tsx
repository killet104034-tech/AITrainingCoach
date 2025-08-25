import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';

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
  const totalSteps = 15; // 완전한 15단계 전문가 시스템

  // 1단계: 기본 정보
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">기본 정보</h2>
        <p className="text-gray-400">파워리프팅 맞춤 프로그램을 위한 기본 정보를 입력해주세요</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-white">이름 *</Label>
            <Input
              id="name"
              data-testid="input-name"
              {...form.register("name")}
              placeholder="김파워"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-white">이메일 *</Label>
            <Input
              id="email"
              data-testid="input-email"
              {...form.register("email")}
              placeholder="example@email.com"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age" className="text-white">나이</Label>
            <Input
              id="age"
              data-testid="input-age"
              {...form.register("age")}
              placeholder="25"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">성별</Label>
            <RadioGroup 
              value={form.watch("gender")} 
              onValueChange={(value) => form.setValue("gender", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <label htmlFor="male" className="text-gray-300">남성</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <label htmlFor="female" className="text-gray-300">여성</label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );

  // 2단계: 🚀 신체 특성 분석 (Distance Traveled Programming)
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🚀 신체 특성 분석</h2>
        <p className="text-gray-400">개인 최적화를 위한 핵심 신체 특성을 분석합니다</p>
        <p className="text-gray-300 text-sm mt-2">⚡ Distance Traveled Programming: 당신의 신체 구조에 맞춘 완전 개인화</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height" className="text-white">신장 (cm)</Label>
            <Input
              id="height"
              data-testid="input-height"
              {...form.register("height")}
              placeholder="175"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="armSpan" className="text-white">양팔 벌린 길이 (cm)</Label>
            <Input
              id="armSpan"
              data-testid="input-arm-span"
              {...form.register("armSpan")}
              placeholder="180"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="legLength" className="text-white">다리 길이 (바닥에서 엉덩이까지, cm)</Label>
            <Input
              id="legLength"
              data-testid="input-leg-length"
              {...form.register("legLength")}
              placeholder="90"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="torsoLength" className="text-white">상체 길이 (엉덩이에서 어깨까지, cm)</Label>
            <Input
              id="torsoLength"
              data-testid="input-torso-length"
              {...form.register("torsoLength")}
              placeholder="60"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-white">관절 가동 범위</Label>
          <RadioGroup 
            value={form.watch("flexibility")} 
            onValueChange={(value) => form.setValue("flexibility", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="flex-high" />
              <label htmlFor="flex-high" className="text-gray-300">높음 (유연함)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="flex-medium" />
              <label htmlFor="flex-medium" className="text-gray-300">보통</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="flex-low" />
              <label htmlFor="flex-low" className="text-gray-300">낮음 (뻣뻣함)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="flex-unknown" />
              <label htmlFor="flex-unknown" className="text-gray-300">모르겠음</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 3단계: 🧠 심리적 성향 분석 (Lifter Psychology)
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🧠 심리적 성향 분석</h2>
        <p className="text-gray-400">훈련 성향과 정신적 특성을 분석합니다</p>
        <p className="text-gray-300 text-sm mt-2">⚡ Lifter Psychology 6-Factor: 아드레날린, 자신감, 집중력, 스트레스, 동기, 습관</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">아드레날린 반응</Label>
          <RadioGroup 
            value={form.watch("adrenalineResponse")} 
            onValueChange={(value) => form.setValue("adrenalineResponse", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="adrenaline-high" />
              <label htmlFor="adrenaline-high" className="text-gray-300">높음 (긴장하면 더 강해짐)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="adrenaline-moderate" />
              <label htmlFor="adrenaline-moderate" className="text-gray-300">보통 (큰 변화 없음)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="adrenaline-low" />
              <label htmlFor="adrenaline-low" className="text-gray-300">낮음 (긴장하면 약해짐)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="adrenaline-unknown" />
              <label htmlFor="adrenaline-unknown" className="text-gray-300">모르겠음</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">자신감 수준</Label>
          <RadioGroup 
            value={form.watch("confidenceLevel")} 
            onValueChange={(value) => form.setValue("confidenceLevel", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="confidence-high" />
              <label htmlFor="confidence-high" className="text-gray-300">높음 (항상 도전적)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="confidence-moderate" />
              <label htmlFor="confidence-moderate" className="text-gray-300">보통 (상황에 따라)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="confidence-low" />
              <label htmlFor="confidence-low" className="text-gray-300">낮음 (보수적 성향)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="confidence-unknown" />
              <label htmlFor="confidence-unknown" className="text-gray-300">모르겠음</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">회복 속도</Label>
          <RadioGroup 
            value={form.watch("recoverySpeed")} 
            onValueChange={(value) => form.setValue("recoverySpeed", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fast" id="recovery-fast" />
              <label htmlFor="recovery-fast" className="text-gray-300">빠름 (다음날 바로 훈련 가능)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="recovery-moderate" />
              <label htmlFor="recovery-moderate" className="text-gray-300">보통 (2-3일 후 완전 회복)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="slow" id="recovery-slow" />
              <label htmlFor="recovery-slow" className="text-gray-300">느림 (4-5일 필요)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="recovery-unknown" />
              <label htmlFor="recovery-unknown" className="text-gray-300">모르겠음</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 4단계: ⚡ 볼륨 내성 테스트 (Magic Bullets)
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">💪 볼륨 내성 테스트</h2>
        <p className="text-gray-400">개인 최적화를 위한 핵심 지표입니다</p>
        <p className="text-gray-300 text-sm mt-2">⚡ Magic Bullets: 당신만의 특별한 훈련 처방을 찾습니다</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl text-blue-300 mb-4">🎯 70% 1RM 테스트</h3>
          <p className="text-gray-300 mb-4">각 운동별로 70% 1RM으로 최대한 많은 반복을 수행해보세요.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="squatReps70" className="text-white">스쿼트 70% 반복수</Label>
              <Input
                id="squatReps70"
                data-testid="input-squat-reps-70"
                {...form.register("squatReps70")}
                placeholder="예: 12"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="benchReps70" className="text-white">벤치프레스 70% 반복수</Label>
              <Input
                id="benchReps70"
                data-testid="input-bench-reps-70"
                {...form.register("benchReps70")}
                placeholder="예: 10"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="deadliftReps70" className="text-white">데드리프트 70% 반복수</Label>
              <Input
                id="deadliftReps70"
                data-testid="input-deadlift-reps-70"
                {...form.register("deadliftReps70")}
                placeholder="예: 8"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 5단계: 현재 수준
  const renderStep5 = () => (
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="experience-unknown" />
              <label htmlFor="experience-unknown" className="text-gray-300">모르겠음</label>
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
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unknown" id="comp-unknown" />
                <label htmlFor="comp-unknown" className="text-gray-300">모르겠음</label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );

  // 6단계: 목표 설정
  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">목표 설정</h2>
        <p className="text-gray-400">훈련 기간과 목표를 설정해주세요</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-white">훈련 기간 목표 *</Label>
          <RadioGroup 
            value={form.watch("trainingDuration")} 
            onValueChange={(value) => form.setValue("trainingDuration", value)}
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="duration-unknown" />
              <label htmlFor="duration-unknown" className="text-gray-300">모르겠음</label>
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

  // 7단계~15단계는 계속 추가될 예정
  const renderStepPlaceholder = (stepNumber: number, title: string) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">{title}</h2>
        <p className="text-gray-400">전문가 설문 시스템 구현 중...</p>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        className="border-gray-600 text-gray-300 hover:bg-gray-700"
        data-testid="button-previous"
      >
        이전
      </Button>
      
      <div className="text-sm text-gray-400">
        {currentStep} / {totalSteps}
      </div>
      
      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={() => setCurrentStep(currentStep + 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="button-next"
        >
          다음
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
          data-testid="button-submit"
        >
          {isSubmitting ? '생성 중...' : '프로그램 생성'}
        </Button>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();  // 🚀 신체 특성 분석 
      case 3: return renderStep3();  // 🧠 심리적 성향 분석 
      case 4: return renderStep4();  // ⚡ 볼륨 내성 테스트 
      case 5: return renderStep5();  // 현재 수준
      case 6: return renderStep6();  // 목표 설정
      case 7: return renderStepPlaceholder(7, "훈련 빈도 & 구성");
      case 8: return renderStepPlaceholder(8, "기술적 분석");
      case 9: return renderStepPlaceholder(9, "약점 & 강점 분석");
      case 10: return renderStepPlaceholder(10, "장비 & 환경");
      case 11: return renderStepPlaceholder(11, "부상 & 건강");
      case 12: return renderStepPlaceholder(12, "라이프스타일 & 회복");
      case 13: return renderStepPlaceholder(13, "과거 프로그램 경험");
      case 14: return renderStepPlaceholder(14, "멘탈 & 고급 설정");
      case 15: return renderStepPlaceholder(15, "최종 확인");
      default: return <div>단계 {currentStep} 준비중...</div>;
    }
  };

  if (currentStep === 16) {
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

export default AdvancedSurveySection;