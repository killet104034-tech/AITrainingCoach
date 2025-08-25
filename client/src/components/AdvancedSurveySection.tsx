// 📝 고급 설문 컴포넌트 (AdvancedSurveySection)
// ✨ 기능: 20단계 전문가급 파워리프팅 설문 UI (40-50개 상세 질문)
// 🧠 분석: 신체구조/영양/회복/프로그램선호도 등 종합 분석
// 🎯 목표: 진짜 최고의 개인화된 18주 파워리프팅 프로그램 생성

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
  const totalSteps = 50; // 한 창에 질문 하나씩! (50개 질문)

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
          className="bg-gray-800 border-gray-600 text-white text-lg p-4 text-center"
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
          className="bg-gray-800 border-gray-600 text-white text-lg p-4 text-center"
        />
      </div>
    </div>
  );

  // 3단계: 나이
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-light text-white mb-3">나이</h2>
        <p className="text-gray-400">연령에 맞는 훈련 강도 조절을 위해 필요해요</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Label htmlFor="age" className="text-white text-lg block mb-4">나이 *</Label>
        <Input
          id="age"
          data-testid="input-age"
          {...form.register("age")}
          placeholder="25"
          className="bg-gray-800 border-gray-600 text-white text-lg p-4 text-center"
        />
      </div>
    </div>
  );

  // 4단계: 성별
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-light text-white mb-3">성별</h2>
        <p className="text-gray-400">성별에 따른 훈련 특성을 고려해요</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Label className="text-white text-lg block mb-6">성별 *</Label>
        <RadioGroup 
          value={form.watch("gender")} 
          onValueChange={(value) => form.setValue("gender", value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors">
            <RadioGroupItem value="male" id="male" />
            <label htmlFor="male" className="text-gray-300 text-lg cursor-pointer">남성</label>
          </div>
          <div className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors">
            <RadioGroupItem value="female" id="female" />
            <label htmlFor="female" className="text-gray-300 text-lg cursor-pointer">여성</label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  // 5단계: 🚀 신체 특성 분석 (Distance Traveled Programming)
  const renderStep5 = () => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shoulderWidth" className="text-white">어깨 너비 (cm)</Label>
            <Input
              id="shoulderWidth"
              data-testid="input-shoulder-width"
              {...form.register("shoulderWidth")}
              placeholder="45"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="hipWidth" className="text-white">골반 너비 (cm)</Label>
            <Input
              id="hipWidth"
              data-testid="input-hip-width"
              {...form.register("hipWidth")}
              placeholder="40"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">발목 유연성</Label>
            <RadioGroup 
              value={form.watch("ankleFlexibility")} 
              onValueChange={(value) => form.setValue("ankleFlexibility", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="ankle-poor" />
                <label htmlFor="ankle-poor" className="text-gray-300">나쁨 (스쿼트 시 뒷꿈치 들림)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="average" id="ankle-average" />
                <label htmlFor="ankle-average" className="text-gray-300">보통</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="ankle-good" />
                <label htmlFor="ankle-good" className="text-gray-300">좋음 (깊게 스쿼트 가능)</label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-white">엉덩이 유연성</Label>
            <RadioGroup 
              value={form.watch("hipFlexibility")} 
              onValueChange={(value) => form.setValue("hipFlexibility", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="hip-poor" />
                <label htmlFor="hip-poor" className="text-gray-300">나쁨 (앉았다 일어나기 힘듦)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="average" id="hip-average" />
                <label htmlFor="hip-average" className="text-gray-300">보통</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="hip-good" />
                <label htmlFor="hip-good" className="text-gray-300">좋음 (깊은 스쿼트 편함)</label>
              </div>
            </RadioGroup>
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

  // 6단계: 🧠 심리적 성향 분석 (Lifter Psychology)
  const renderStep6 = () => (
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
  const renderStep7 = () => (
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
  const renderStep8 = () => (
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

  // 9단계: 목표 설정
  const renderStep9 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🎯 목표 설정</h2>
        <p className="text-gray-400">훈련 목표와 기간을 설정해주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">훈련 목표 (복수 선택 가능) *</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "strength", label: "근력 향상" },
              { value: "powerlifting", label: "파워리프팅 대회 준비" },
              { value: "muscle", label: "근육량 증가" },
              { value: "technique", label: "기술 개선" },
              { value: "endurance", label: "지구력 향상" },
              { value: "rehabilitation", label: "재활 및 부상 예방" },
              { value: "weight_loss", label: "체중 감량" },
              { value: "general_fitness", label: "전반적인 건강" }
            ].map((goal) => (
              <div key={goal.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${goal.value}`}
                  checked={form.watch("goals")?.includes(goal.value) || false}
                  onCheckedChange={(checked) => {
                    const currentGoals = form.watch("goals") || [];
                    if (checked) {
                      form.setValue("goals", [...currentGoals, goal.value]);
                    } else {
                      form.setValue("goals", currentGoals.filter(g => g !== goal.value));
                    }
                  }}
                />
                <label htmlFor={`goal-${goal.value}`} className="text-gray-300">{goal.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">훈련 기간 목표</Label>
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

  // 10단계: 훈련 빈도 및 구성
  const renderStep10 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">📅 훈련 빈도 및 구성</h2>
        <p className="text-gray-400">주간 훈련 스케줄과 선호도를 설정해주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">주간 훈련 븈도 *</Label>
          <RadioGroup 
            value={form.watch("frequency")} 
            onValueChange={(value) => form.setValue("frequency", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="freq-3" />
              <label htmlFor="freq-3" className="text-gray-300">3일 (주 3회)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="freq-4" />
              <label htmlFor="freq-4" className="text-gray-300">4일 (주 4회)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="freq-5" />
              <label htmlFor="freq-5" className="text-gray-300">5일 (주 5회)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6" id="freq-6" />
              <label htmlFor="freq-6" className="text-gray-300">6일 (주 6회)</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">한 번 훈련 시간</Label>
          <Select value={form.watch("trainingDuration")} onValueChange={(value) => form.setValue("trainingDuration", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="훈련 시간을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60min">60분</SelectItem>
              <SelectItem value="90min">90분</SelectItem>
              <SelectItem value="120min">120분</SelectItem>
              <SelectItem value="150min">150분 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white">선호하는 훈련 시간대</Label>
          <RadioGroup 
            value={form.watch("preferredTime")} 
            onValueChange={(value) => form.setValue("preferredTime", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="morning" id="time-morning" />
              <label htmlFor="time-morning" className="text-gray-300">오전 (6-12시)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="afternoon" id="time-afternoon" />
              <label htmlFor="time-afternoon" className="text-gray-300">오후 (12-18시)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="evening" id="time-evening" />
              <label htmlFor="time-evening" className="text-gray-300">저녁 (18-24시)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flexible" id="time-flexible" />
              <label htmlFor="time-flexible" className="text-gray-300">유동적</label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white">스쿼트 빈도 (주간)</Label>
            <Select value={form.watch("squatFrequency")} onValueChange={(value) => form.setValue("squatFrequency", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="빈도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1회</SelectItem>
                <SelectItem value="2">2회</SelectItem>
                <SelectItem value="3">3회</SelectItem>
                <SelectItem value="4">4회</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">벤치 빈도 (주간)</Label>
            <Select value={form.watch("benchFrequency")} onValueChange={(value) => form.setValue("benchFrequency", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="빈도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1회</SelectItem>
                <SelectItem value="2">2회</SelectItem>
                <SelectItem value="3">3회</SelectItem>
                <SelectItem value="4">4회</SelectItem>
                <SelectItem value="5">5회</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">데드리프트 빈도 (주간)</Label>
            <Select value={form.watch("deadliftFrequency")} onValueChange={(value) => form.setValue("deadliftFrequency", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="빈도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1회</SelectItem>
                <SelectItem value="2">2회</SelectItem>
                <SelectItem value="3">3회</SelectItem>
              </SelectContent>
            </Select>
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
              <RadioGroupItem value="minimal" id="acc-minimal" />
              <label htmlFor="acc-minimal" className="text-gray-300">최소한 (3대 운동만)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="acc-moderate" />
              <label htmlFor="acc-moderate" className="text-gray-300">적당히 (2-3개 보조운동)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="acc-high" />
              <label htmlFor="acc-high" className="text-gray-300">많이 (4-6개 보조운동)</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 11단계: 훈련 블럭 선호도
  const renderStep11 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">📋 훈련 블럭 선호도</h2>
        <p className="text-gray-400">주기화 방식과 블럭 구성을 선택해주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">선호하는 훈련 블럭 (복수 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "work_capacity", label: "워크 캐파시티 (기초체력)" },
              { value: "strength", label: "스트렝스 (규력향상)" },
              { value: "peaking", label: "피킹 (대회준비)" },
              { value: "technique", label: "테크닉 (기술향상)" },
              { value: "hypertrophy", label: "하이퍼트로피 (근비대)" },
              { value: "recovery", label: "리커버리 (회복)" }
            ].map((block) => (
              <div key={block.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`block-${block.value}`}
                  checked={form.watch("preferredBlocks")?.includes(block.value) || false}
                  onCheckedChange={(checked) => {
                    const currentBlocks = form.watch("preferredBlocks") || [];
                    if (checked) {
                      form.setValue("preferredBlocks", [...currentBlocks, block.value]);
                    } else {
                      form.setValue("preferredBlocks", currentBlocks.filter(b => b !== block.value));
                    }
                  }}
                />
                <label htmlFor={`block-${block.value}`} className="text-gray-300">{block.label}</label>
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
              <RadioGroupItem value="3weeks" id="block-3weeks" />
              <label htmlFor="block-3weeks" className="text-gray-300">3주</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4weeks" id="block-4weeks" />
              <label htmlFor="block-4weeks" className="text-gray-300">4주</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6weeks" id="block-6weeks" />
              <label htmlFor="block-6weeks" className="text-gray-300">6주</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="8weeks" id="block-8weeks" />
              <label htmlFor="block-8weeks" className="text-gray-300">8주</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">피킹 경험 수준</Label>
          <RadioGroup 
            value={form.watch("peakingExperience")} 
            onValueChange={(value) => form.setValue("peakingExperience", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="peak-none" />
              <label htmlFor="peak-none" className="text-gray-300">없음 (전혀 경험 없음)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="peak-basic" />
              <label htmlFor="peak-basic" className="text-gray-300">기초 (대회 1-2회 참가)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="experienced" id="peak-experienced" />
              <label htmlFor="peak-experienced" className="text-gray-300">숙련 (대회 3회 이상)</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 12단계: 기술적 선호도
  const renderStep12 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🎯 기술적 선호도</h2>
        <p className="text-gray-400">각 운동의 선호 스타일과 자세를 설정해주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">스쿼트 스타일</Label>
          <RadioGroup 
            value={form.watch("squatStyle")} 
            onValueChange={(value) => form.setValue("squatStyle", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high_bar" id="squat-high-bar" />
              <label htmlFor="squat-high-bar" className="text-gray-300">하이바 스쿼트</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low_bar" id="squat-low-bar" />
              <label htmlFor="squat-low-bar" className="text-gray-300">로우바 스쿼트</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="squat-both" />
              <label htmlFor="squat-both" className="text-gray-300">둘 다 사용</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">스쿼트 스탠스</Label>
          <RadioGroup 
            value={form.watch("squatStance")} 
            onValueChange={(value) => form.setValue("squatStance", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="narrow" id="stance-narrow" />
              <label htmlFor="stance-narrow" className="text-gray-300">좌은 스탠스</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="stance-medium" />
              <label htmlFor="stance-medium" className="text-gray-300">보통 스탠스</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="wide" id="stance-wide" />
              <label htmlFor="stance-wide" className="text-gray-300">넓은 스탠스</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">벤치프레스 스타일</Label>
          <RadioGroup 
            value={form.watch("benchStyle")} 
            onValueChange={(value) => form.setValue("benchStyle", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="close_grip" id="bench-close" />
              <label htmlFor="bench-close" className="text-gray-300">클로즈 그립</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="bench-medium" />
              <label htmlFor="bench-medium" className="text-gray-300">미디엄 그립</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="wide" id="bench-wide" />
              <label htmlFor="bench-wide" className="text-gray-300">와이드 그립</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="arch" id="bench-arch" />
              <label htmlFor="bench-arch" className="text-gray-300">아치 벤치</label>
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
              <RadioGroupItem value="conventional" id="dead-conventional" />
              <label htmlFor="dead-conventional" className="text-gray-300">컨벤셔널</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sumo" id="dead-sumo" />
              <label htmlFor="dead-sumo" className="text-gray-300">스모</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="dead-both" />
              <label htmlFor="dead-both" className="text-gray-300">둘 다 사용</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 13단계: 약점 및 강점 분석
  const renderStep13 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">📊 약점 및 강점 분석</h2>
        <p className="text-gray-400">개인별 약점과 강점을 파악하여 맞춤 프로그램을 설계합니다</p>
      </div>
      
      <div className="space-y-6">
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

        <div>
          <Label className="text-white">기술적 문제 (복수 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "depth", label: "깊이 부족" },
              { value: "lockout", label: "락아웃 약함" },
              { value: "speed", label: "속도 부족" },
              { value: "setup", label: "셋업 불안정" },
              { value: "timing", label: "타이밍 문제" },
              { value: "balance", label: "균형 부족" }
            ].map((issue) => (
              <div key={issue.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`tech-${issue.value}`}
                  checked={form.watch("techniqueIssues")?.includes(issue.value) || false}
                  onCheckedChange={(checked) => {
                    const currentIssues = form.watch("techniqueIssues") || [];
                    if (checked) {
                      form.setValue("techniqueIssues", [...currentIssues, issue.value]);
                    } else {
                      form.setValue("techniqueIssues", currentIssues.filter(i => i !== issue.value));
                    }
                  }}
                />
                <label htmlFor={`tech-${issue.value}`} className="text-gray-300">{issue.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">근력 부족 부위 (복수 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "core", label: "코어" },
              { value: "legs", label: "다리" },
              { value: "back", label: "등" },
              { value: "chest", label: "가슴" },
              { value: "shoulders", label: "어깨" },
              { value: "grip", label: "그립" }
            ].map((area) => (
              <div key={area.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`strength-${area.value}`}
                  checked={form.watch("strengthIssues")?.includes(area.value) || false}
                  onCheckedChange={(checked) => {
                    const currentIssues = form.watch("strengthIssues") || [];
                    if (checked) {
                      form.setValue("strengthIssues", [...currentIssues, area.value]);
                    } else {
                      form.setValue("strengthIssues", currentIssues.filter(i => i !== area.value));
                    }
                  }}
                />
                <label htmlFor={`strength-${area.value}`} className="text-gray-300">{area.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 14단계: 장비 및 환경
  const renderStep14 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🏋️ 장비 및 환경</h2>
        <p className="text-gray-400">사용 가능한 장비와 훈련 환경을 알려주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">사용 가능한 장비 (복수 선택 가능) *</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "powerlifting_bar", label: "파워리프팅 바" },
              { value: "olympic_bar", label: "올림픽 바" },
              { value: "squat_rack", label: "스쿼트 랭" },
              { value: "bench_press", label: "벤치프레스 대" },
              { value: "plates", label: "플레이트 (원판)" },
              { value: "dumbbells", label: "덤벨" },
              { value: "safety_bars", label: "세이티 바" },
              { value: "resistance_bands", label: "레지스턴스 밴드" }
            ].map((equip) => (
              <div key={equip.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`equip-${equip.value}`}
                  checked={form.watch("equipment")?.includes(equip.value) || false}
                  onCheckedChange={(checked) => {
                    const currentEquip = form.watch("equipment") || [];
                    if (checked) {
                      form.setValue("equipment", [...currentEquip, equip.value]);
                    } else {
                      form.setValue("equipment", currentEquip.filter(e => e !== equip.value));
                    }
                  }}
                />
                <label htmlFor={`equip-${equip.value}`} className="text-gray-300">{equip.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">홈짐 사용 여부</Label>
          <RadioGroup 
            value={form.watch("homeGym")} 
            onValueChange={(value) => form.setValue("homeGym", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="home-yes" />
              <label htmlFor="home-yes" className="text-gray-300">예 (홈짐 주로 사용)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="home-no" />
              <label htmlFor="home-no" className="text-gray-300">아니오 (상업 짐 주로 사용)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sometimes" id="home-sometimes" />
              <label htmlFor="home-sometimes" className="text-gray-300">가끔 (하이브리드)</label>
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

  // 12단계: 부상 이력
  const renderStep12 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🎯 부상 이력 및 건강 상태</h2>
        <p className="text-gray-400">안전한 훈련을 위해 부상 이력과 현재 상태를 알려주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">부상 이력 *</Label>
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
              <label htmlFor="injury-minor" className="text-gray-300">경미한 부상 이력</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="injury-specific" />
              <label htmlFor="injury-specific" className="text-gray-300">특정 부상 이력 있음</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="injuryDetails" className="text-white">부상 상세 내용 (선택사항)</Label>
          <Input
            id="injuryDetails"
            {...form.register("injuryDetails")}
            placeholder="예: 2023년 허리 디스크, 어깨 충돌 증후군 등"
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>

        <div>
          <Label className="text-white">현재 통증 부위 (복수 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "lower_back", label: "허리" },
              { value: "knee", label: "무릎" },
              { value: "shoulder", label: "어깨" },
              { value: "wrist", label: "손목" },
              { value: "hip", label: "골반" },
              { value: "ankle", label: "발목" },
              { value: "neck", label: "목" },
              { value: "elbow", label: "팔꿈치" }
            ].map((pain) => (
              <div key={pain.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`pain-${pain.value}`}
                  checked={form.watch("currentPain")?.includes(pain.value) || false}
                  onCheckedChange={(checked) => {
                    const currentPain = form.watch("currentPain") || [];
                    if (checked) {
                      form.setValue("currentPain", [...currentPain, pain.value]);
                    } else {
                      form.setValue("currentPain", currentPain.filter(p => p !== pain.value));
                    }
                  }}
                />
                <label htmlFor={`pain-${pain.value}`} className="text-gray-300">{pain.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 15단계: 회복 및 라이프스타일
  const renderStep15 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">😴 회복 및 라이프스타일</h2>
        <p className="text-gray-400">회복과 생활 패턴을 고려한 훈련 설계를 위해 알려주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">평균 수면 시간</Label>
          <Select value={form.watch("sleepHours")} onValueChange={(value) => form.setValue("sleepHours", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="수면 시간을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5시간 이하</SelectItem>
              <SelectItem value="6">6시간</SelectItem>
              <SelectItem value="7">7시간</SelectItem>
              <SelectItem value="8">8시간</SelectItem>
              <SelectItem value="9">9시간 이상</SelectItem>
            </SelectContent>
          </Select>
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

        <div>
          <Label className="text-white">영양 상태</Label>
          <RadioGroup 
            value={form.watch("nutrition")} 
            onValueChange={(value) => form.setValue("nutrition", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poor" id="nutrition-poor" />
              <label htmlFor="nutrition-poor" className="text-gray-300">부족</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="average" id="nutrition-average" />
              <label htmlFor="nutrition-average" className="text-gray-300">보통</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="nutrition-good" />
              <label htmlFor="nutrition-good" className="text-gray-300">좋음</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excellent" id="nutrition-excellent" />
              <label htmlFor="nutrition-excellent" className="text-gray-300">우수</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">보충제 섭취 (복수 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "protein", label: "단백질 분말" },
              { value: "creatine", label: "크리아틴" },
              { value: "caffeine", label: "카페인" },
              { value: "multivitamin", label: "멀티비타민" },
              { value: "bcaa", label: "BCAA" },
              { value: "fish_oil", label: "오메가-3" }
            ].map((supplement) => (
              <div key={supplement.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`supp-${supplement.value}`}
                  checked={form.watch("supplementation")?.includes(supplement.value) || false}
                  onCheckedChange={(checked) => {
                    const currentSupps = form.watch("supplementation") || [];
                    if (checked) {
                      form.setValue("supplementation", [...currentSupps, supplement.value]);
                    } else {
                      form.setValue("supplementation", currentSupps.filter(s => s !== supplement.value));
                    }
                  }}
                />
                <label htmlFor={`supp-${supplement.value}`} className="text-gray-300">{supplement.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 16단계: 과거 프로그램 경험
  const renderStep16 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">📈 과거 프로그램 경험</h2>
        <p className="text-gray-400">이전 훈련 경험을 바탕으로 최적화된 프로그램을 설계합니다</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">이전에 사용한 프로그램 (복수 선택 가능)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "5_3_1", label: "5/3/1" },
              { value: "sheiko", label: "쉐이코" },
              { value: "westside", label: "웨스트사이드" },
              { value: "candito", label: "칸디토" },
              { value: "madcow", label: "매드카우" },
              { value: "stronglifts", label: "스트롱리프트" },
              { value: "starting_strength", label: "스타팅 스트렝스" },
              { value: "custom", label: "커스텀 프로그램" }
            ].map((program) => (
              <div key={program.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`prog-${program.value}`}
                  checked={form.watch("previousPrograms")?.includes(program.value) || false}
                  onCheckedChange={(checked) => {
                    const currentProgs = form.watch("previousPrograms") || [];
                    if (checked) {
                      form.setValue("previousPrograms", [...currentProgs, program.value]);
                    } else {
                      form.setValue("previousPrograms", currentProgs.filter(p => p !== program.value));
                    }
                  }}
                />
                <label htmlFor={`prog-${program.value}`} className="text-gray-300">{program.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">선호하는 프로그램 스타일</Label>
          <RadioGroup 
            value={form.watch("programPreference")} 
            onValueChange={(value) => form.setValue("programPreference", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="linear" id="prog-linear" />
              <label htmlFor="prog-linear" className="text-gray-300">리니어 (점진적 중량 증가)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="block" id="prog-block" />
              <label htmlFor="prog-block" className="text-gray-300">블럭 주기화</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="conjugate" id="prog-conjugate" />
              <label htmlFor="prog-conjugate" className="text-gray-300">컨주게이트 (웨스트사이드 스타일)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily_undulating" id="prog-dup" />
              <label htmlFor="prog-dup" className="text-gray-300">데일리 언돈레이팅</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">볼륨 내성</Label>
          <RadioGroup 
            value={form.watch("volumeTolerance")} 
            onValueChange={(value) => form.setValue("volumeTolerance", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="vol-low" />
              <label htmlFor="vol-low" className="text-gray-300">낮음 (적은 볼륨 선호)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="vol-medium" />
              <label htmlFor="vol-medium" className="text-gray-300">보통</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="vol-high" />
              <label htmlFor="vol-high" className="text-gray-300">높음 (많은 볼륨 선호)</label>
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
              <RadioGroupItem value="low" id="int-low" />
              <label htmlFor="int-low" className="text-gray-300">낮음 (60-80%)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="int-medium" />
              <label htmlFor="int-medium" className="text-gray-300">보통 (70-90%)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="int-high" />
              <label htmlFor="int-high" className="text-gray-300">높음 (80-100%)</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 17단계: 멘탈 및 고급 설정
  const renderStep17 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🧠 멘탈 및 고급 설정</h2>
        <p className="text-gray-400">마지막 단계입니다. 세밀한 개인화를 위한 고급 설정을 완료해주세요</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">훈련 동기</Label>
          <RadioGroup 
            value={form.watch("motivation")} 
            onValueChange={(value) => form.setValue("motivation", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="competition" id="mot-competition" />
              <label htmlFor="mot-competition" className="text-gray-300">대회 입상</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal" id="mot-personal" />
              <label htmlFor="mot-personal" className="text-gray-300">개인 기록 향상</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="health" id="mot-health" />
              <label htmlFor="mot-health" className="text-gray-300">건강 증진</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="strength" id="mot-strength" />
              <label htmlFor="mot-strength" className="text-gray-300">순수 근력 증가</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">멘탈 접근법</Label>
          <RadioGroup 
            value={form.watch("mentalApproach")} 
            onValueChange={(value) => form.setValue("mentalApproach", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aggressive" id="mental-aggressive" />
              <label htmlFor="mental-aggressive" className="text-gray-300">공격적 (항상 도전)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="steady" id="mental-steady" />
              <label htmlFor="mental-steady" className="text-gray-300">착실함 (계획적 진행)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cautious" id="mental-cautious" />
              <label htmlFor="mental-cautious" className="text-gray-300">신중함 (안전 중심)</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">실패 대응법</Label>
          <RadioGroup 
            value={form.watch("failureHandling")} 
            onValueChange={(value) => form.setValue("failureHandling", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="push_through" id="fail-push" />
              <label htmlFor="fail-push" className="text-gray-300">밀어붙이기 (계속 도전)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deload" id="fail-deload" />
              <label htmlFor="fail-deload" className="text-gray-300">디로드 (중량 감소)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="technique_focus" id="fail-technique" />
              <label htmlFor="fail-technique" className="text-gray-300">기술 집중 (템 수정)</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">선호하는 주기화 방식</Label>
          <RadioGroup 
            value={form.watch("periodization")} 
            onValueChange={(value) => form.setValue("periodization", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="linear" id="period-linear" />
              <label htmlFor="period-linear" className="text-gray-300">리니어</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="block" id="period-block" />
              <label htmlFor="period-block" className="text-gray-300">블럭</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="conjugate" id="period-conjugate" />
              <label htmlFor="period-conjugate" className="text-gray-300">컨주게이트</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="undulating" id="period-undulating" />
              <label htmlFor="period-undulating" className="text-gray-300">언돈레이팅</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">자동 조절 선호도</Label>
          <RadioGroup 
            value={form.watch("autoregulation")} 
            onValueChange={(value) => form.setValue("autoregulation", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="auto-none" />
              <label htmlFor="auto-none" className="text-gray-300">없음 (고정 프로그램)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rpe" id="auto-rpe" />
              <label htmlFor="auto-rpe" className="text-gray-300">RPE 기반</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rir" id="auto-rir" />
              <label htmlFor="auto-rir" className="text-gray-300">RIR 기반</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="auto-percentage" />
              <label htmlFor="auto-percentage" className="text-gray-300">퍼센트 기반</label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">워업 선호도</Label>
          <RadioGroup 
            value={form.watch("warmupPreference")} 
            onValueChange={(value) => form.setValue("warmupPreference", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="warmup-minimal" />
              <label htmlFor="warmup-minimal" className="text-gray-300">최소한 (5-10분)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="warmup-moderate" />
              <label htmlFor="warmup-moderate" className="text-gray-300">보통 (10-15분)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="extensive" id="warmup-extensive" />
              <label htmlFor="warmup-extensive" className="text-gray-300">충분히 (15-20분)</label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // 18단계: 수면 및 회복 패턴
  const renderStep18 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">😴 수면 및 회복 패턴</h2>
        <p className="text-gray-400">회복 능력은 훈련 성과에 직접적인 영향을 미칩니다</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sleepHours" className="text-white">평균 수면시간 (시간/일)</Label>
            <Input
              id="sleepHours"
              data-testid="input-sleep-hours"
              {...form.register("sleepHours")}
              placeholder="7.5"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">수면 품질</Label>
            <RadioGroup 
              value={form.watch("sleepQuality")} 
              onValueChange={(value) => form.setValue("sleepQuality", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="sleep-poor" />
                <label htmlFor="sleep-poor" className="text-gray-300">나쁨 (자주 깸, 피곤함)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="sleep-fair" />
                <label htmlFor="sleep-fair" className="text-gray-300">보통</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="sleep-good" />
                <label htmlFor="sleep-good" className="text-gray-300">좋음 (푹 잠, 상쾌함)</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">일상 스트레스 수준</Label>
            <RadioGroup 
              value={form.watch("stressLevel")} 
              onValueChange={(value) => form.setValue("stressLevel", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="stress-low" />
                <label htmlFor="stress-low" className="text-gray-300">낮음 (여유로움)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="stress-moderate" />
                <label htmlFor="stress-moderate" className="text-gray-300">보통 (약간 바쁨)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="stress-high" />
                <label htmlFor="stress-high" className="text-gray-300">높음 (매우 바쁘고 스트레스)</label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-white">카페인 섭취량</Label>
            <RadioGroup 
              value={form.watch("caffeineIntake")} 
              onValueChange={(value) => form.setValue("caffeineIntake", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="caffeine-none" />
                <label htmlFor="caffeine-none" className="text-gray-300">안 마심</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="caffeine-light" />
                <label htmlFor="caffeine-light" className="text-gray-300">가끔 (주 1-3회)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="caffeine-moderate" />
                <label htmlFor="caffeine-moderate" className="text-gray-300">보통 (매일 1-2잔)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="caffeine-high" />
                <label htmlFor="caffeine-high" className="text-gray-300">많음 (매일 3잔+)</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-white">사용하는 회복 방법 (복수 선택)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "massage", label: "마사지" },
              { value: "stretching", label: "스트레칭" },
              { value: "sauna", label: "사우나" },
              { value: "cold_bath", label: "냉찜질/얼음목욕" },
              { value: "meditation", label: "명상/요가" },
              { value: "foam_rolling", label: "폼롤링" },
              { value: "rest_days", label: "충분한 휴식일" },
              { value: "none", label: "특별한 방법 없음" }
            ].map((method) => (
              <div key={method.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`recovery-${method.value}`}
                  checked={form.watch("recoveryMethods")?.includes(method.value) || false}
                  onCheckedChange={(checked) => {
                    const currentMethods = form.watch("recoveryMethods") || [];
                    if (checked) {
                      form.setValue("recoveryMethods", [...currentMethods, method.value]);
                    } else {
                      form.setValue("recoveryMethods", currentMethods.filter(m => m !== method.value));
                    }
                  }}
                />
                <label htmlFor={`recovery-${method.value}`} className="text-gray-300">{method.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 17단계: 영양 및 보충제
  const renderStep17 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🥗 영양 및 보충제</h2>
        <p className="text-gray-400">영양 상태는 근력 향상과 회복에 핵심적입니다</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">영양 지식 수준</Label>
            <RadioGroup 
              value={form.watch("nutritionKnowledge")} 
              onValueChange={(value) => form.setValue("nutritionKnowledge", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="nutrition-beginner" />
                <label htmlFor="nutrition-beginner" className="text-gray-300">초보 (칼로리, 단백질 잘 모름)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="nutrition-intermediate" />
                <label htmlFor="nutrition-intermediate" className="text-gray-300">중급 (기본적인 영양 관리)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="nutrition-advanced" />
                <label htmlFor="nutrition-advanced" className="text-gray-300">고급 (매크로 추적, 세밀한 관리)</label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="dailyProtein" className="text-white">일일 단백질 섭취량 (g, 대략)</Label>
            <Input
              id="dailyProtein"
              data-testid="input-daily-protein"
              {...form.register("dailyProteinGrams")}
              placeholder="120"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-white">식단 제한사항 (복수 선택)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "none", label: "제한사항 없음" },
              { value: "vegetarian", label: "채식주의" },
              { value: "vegan", label: "비건" },
              { value: "lactose_intolerant", label: "유당불내증" },
              { value: "gluten_free", label: "글루텐 프리" },
              { value: "low_carb", label: "저탄수화물" },
              { value: "halal", label: "할랄" },
              { value: "budget_limited", label: "예산 제한" }
            ].map((diet) => (
              <div key={diet.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`diet-${diet.value}`}
                  checked={form.watch("dietaryRestrictions")?.includes(diet.value) || false}
                  onCheckedChange={(checked) => {
                    const currentDiets = form.watch("dietaryRestrictions") || [];
                    if (checked) {
                      form.setValue("dietaryRestrictions", [...currentDiets, diet.value]);
                    } else {
                      form.setValue("dietaryRestrictions", currentDiets.filter(d => d !== diet.value));
                    }
                  }}
                />
                <label htmlFor={`diet-${diet.value}`} className="text-gray-300">{diet.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">복용 중인 보충제 (복수 선택)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "none", label: "복용 안 함" },
              { value: "whey_protein", label: "웨이 프로틴" },
              { value: "creatine", label: "크레아틴" },
              { value: "bcaa", label: "BCAA" },
              { value: "pre_workout", label: "프리워크아웃" },
              { value: "multivitamin", label: "종합비타민" },
              { value: "omega3", label: "오메가3" },
              { value: "vitamin_d", label: "비타민D" }
            ].map((supplement) => (
              <div key={supplement.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`supplement-${supplement.value}`}
                  checked={form.watch("supplementUsage")?.includes(supplement.value) || false}
                  onCheckedChange={(checked) => {
                    const currentSupplements = form.watch("supplementUsage") || [];
                    if (checked) {
                      form.setValue("supplementUsage", [...currentSupplements, supplement.value]);
                    } else {
                      form.setValue("supplementUsage", currentSupplements.filter(s => s !== supplement.value));
                    }
                  }}
                />
                <label htmlFor={`supplement-${supplement.value}`} className="text-gray-300">{supplement.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 18단계: 프로그램 선호도
  const renderStep18 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">⚙️ 프로그램 선호도</h2>
        <p className="text-gray-400">당신에게 맞는 훈련 스타일을 찾아보겠습니다</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">자동조절 방식 선호도</Label>
            <RadioGroup 
              value={form.watch("autoregulationPreference")} 
              onValueChange={(value) => form.setValue("autoregulationPreference", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="auto-percentage" />
                <label htmlFor="auto-percentage" className="text-gray-300">% 기반 (정확한 퍼센트 선호)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rpe" id="auto-rpe" />
                <label htmlFor="auto-rpe" className="text-gray-300">RPE 기반 (체감도 기준)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hybrid" id="auto-hybrid" />
                <label htmlFor="auto-hybrid" className="text-gray-300">혼합 (둘 다 사용)</label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-white">운동 변화 빈도</Label>
            <RadioGroup 
              value={form.watch("variationFrequency")} 
              onValueChange={(value) => form.setValue("variationFrequency", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="variation-low" />
                <label htmlFor="variation-low" className="text-gray-300">낮음 (기본 동작 위주)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="variation-moderate" />
                <label htmlFor="variation-moderate" className="text-gray-300">보통 (가끔 변형 동작)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="variation-high" />
                <label htmlFor="variation-high" className="text-gray-300">높음 (다양한 변형 선호)</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">주기화 스타일 선호도</Label>
            <RadioGroup 
              value={form.watch("periodizationStyle")} 
              onValueChange={(value) => form.setValue("periodizationStyle", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="linear" id="period-linear" />
                <label htmlFor="period-linear" className="text-gray-300">선형 (점진적 강도 증가)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conjugate" id="period-conjugate" />
                <label htmlFor="period-conjugate" className="text-gray-300">컨주게이트 (다양한 강도 병행)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily_undulating" id="period-du" />
                <label htmlFor="period-du" className="text-gray-300">일일변동 (매일 다른 강도)</label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-white">볼륨 선호도</Label>
            <RadioGroup 
              value={form.watch("volumePreference")} 
              onValueChange={(value) => form.setValue("volumePreference", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="volume-low" />
                <label htmlFor="volume-low" className="text-gray-300">낮음 (적은 세트, 고강도)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="volume-moderate" />
                <label htmlFor="volume-moderate" className="text-gray-300">보통 (균형잡힌 볼륨)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="volume-high" />
                <label htmlFor="volume-high" className="text-gray-300">높음 (많은 세트, 다양한 운동)</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-white">경험해본 프로그램들 (복수 선택)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "5x5", label: "5x5 프로그램" },
              { value: "531", label: "5/3/1" },
              { value: "linear_progression", label: "선형 진행" },
              { value: "upper_lower", label: "상체/하체 분할" },
              { value: "ppl", label: "Push/Pull/Legs" },
              { value: "westside", label: "웨스트사이드" },
              { value: "sheiko", label: "쉐이코" },
              { value: "none", label: "체계적 프로그램 경험 없음" }
            ].map((program) => (
              <div key={program.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`program-${program.value}`}
                  checked={form.watch("pastPrograms")?.includes(program.value) || false}
                  onCheckedChange={(checked) => {
                    const currentPrograms = form.watch("pastPrograms") || [];
                    if (checked) {
                      form.setValue("pastPrograms", [...currentPrograms, program.value]);
                    } else {
                      form.setValue("pastPrograms", currentPrograms.filter(p => p !== program.value));
                    }
                  }}
                />
                <label htmlFor={`program-${program.value}`} className="text-gray-300">{program.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 19단계: 추가 운동 및 활동
  const renderStep19 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🏃 추가 운동 및 활동</h2>
        <p className="text-gray-400">다른 운동들이 파워리프팅에 미치는 영향을 고려합니다</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-white">하는 다른 스포츠 (복수 선택)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "none", label: "파워리프팅만" },
              { value: "running", label: "달리기" },
              { value: "cycling", label: "자전거" },
              { value: "swimming", label: "수영" },
              { value: "martial_arts", label: "격투기/무술" },
              { value: "team_sports", label: "팀 스포츠 (축구, 농구 등)" },
              { value: "rock_climbing", label: "클라이밍" },
              { value: "crossfit", label: "크로스핏" }
            ].map((sport) => (
              <div key={sport.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`sport-${sport.value}`}
                  checked={form.watch("otherSports")?.includes(sport.value) || false}
                  onCheckedChange={(checked) => {
                    const currentSports = form.watch("otherSports") || [];
                    if (checked) {
                      form.setValue("otherSports", [...currentSports, sport.value]);
                    } else {
                      form.setValue("otherSports", currentSports.filter(s => s !== sport.value));
                    }
                  }}
                />
                <label htmlFor={`sport-${sport.value}`} className="text-gray-300">{sport.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">유산소 운동 빈도</Label>
            <RadioGroup 
              value={form.watch("cardioPreference")} 
              onValueChange={(value) => form.setValue("cardioPreference", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="cardio-none" />
                <label htmlFor="cardio-none" className="text-gray-300">안 함</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="cardio-light" />
                <label htmlFor="cardio-light" className="text-gray-300">가끔 (주 1-2회)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="cardio-moderate" />
                <label htmlFor="cardio-moderate" className="text-gray-300">보통 (주 3-4회)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="cardio-high" />
                <label htmlFor="cardio-high" className="text-gray-300">많이 (주 5회+)</label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-white">유연성/모빌리티 운동</Label>
            <RadioGroup 
              value={form.watch("mobilityWork")} 
              onValueChange={(value) => form.setValue("mobilityWork", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="mobility-none" />
                <label htmlFor="mobility-none" className="text-gray-300">안 함</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="mobility-light" />
                <label htmlFor="mobility-light" className="text-gray-300">가끔 (주 1-2회)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="mobility-moderate" />
                <label htmlFor="mobility-moderate" className="text-gray-300">보통 (거의 매일)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="mobility-high" />
                <label htmlFor="mobility-high" className="text-gray-300">많이 (매일 30분+)</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label htmlFor="cardioDetails" className="text-white">유산소 운동 세부사항 (선택사항)</Label>
          <Textarea
            id="cardioDetails"
            data-testid="textarea-cardio-details"
            {...form.register("cardioDetails")}
            placeholder="예: 주 2회 30분 조깅, HIIT 주 1회 등"
            className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );

  // 20단계: 최종 정보 및 목표
  const renderStep20 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-white mb-3">🎯 최종 정보 및 목표</h2>
        <p className="text-gray-400">마지막으로 추가 정보와 세부 목표를 설정해주세요</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">원하는 프로그램 기간</Label>
            <RadioGroup 
              value={form.watch("programLength")} 
              onValueChange={(value) => form.setValue("programLength", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="8" id="length-8" />
                <label htmlFor="length-8" className="text-gray-300">8주 (단기 집중)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="12" id="length-12" />
                <label htmlFor="length-12" className="text-gray-300">12주 (표준)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="16" id="length-16" />
                <label htmlFor="length-16" className="text-gray-300">16주 (심화)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="length-20" />
                <label htmlFor="length-20" className="text-gray-300">20주 (장기)</label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-white">설명 방식 선호도</Label>
            <RadioGroup 
              value={form.watch("communicationPreference")} 
              onValueChange={(value) => form.setValue("communicationPreference", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id="comm-simple" />
                <label htmlFor="comm-simple" className="text-gray-300">간단히 (운동, 세트, 횟수만)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="detailed" id="comm-detailed" />
                <label htmlFor="comm-detailed" className="text-gray-300">상세히 (원리, 주의사항 포함)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="comm-email" />
                <label htmlFor="comm-email" className="text-gray-300">이메일로 추가 설명</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label htmlFor="specificGoals" className="text-white">구체적인 목표 중량 (선택사항)</Label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <Label htmlFor="squatGoal" className="text-gray-300 text-sm">스쿼트 목표 (kg)</Label>
              <Input
                id="squatGoal"
                data-testid="input-squat-goal"
                {...form.register("squatGoal")}
                placeholder="120"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="benchGoal" className="text-gray-300 text-sm">벤치프레스 목표 (kg)</Label>
              <Input
                id="benchGoal"
                data-testid="input-bench-goal"
                {...form.register("benchGoal")}
                placeholder="100"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="deadliftGoal" className="text-gray-300 text-sm">데드리프트 목표 (kg)</Label>
              <Input
                id="deadliftGoal"
                data-testid="input-deadlift-goal"
                {...form.register("deadliftGoal")}
                placeholder="150"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="targetDate" className="text-white">목표 달성 희망 시기 (선택사항)</Label>
          <Input
            id="targetDate"
            data-testid="input-target-date"
            {...form.register("targetCompetitionDate")}
            placeholder="2025년 12월"
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="additionalInfo" className="text-white">추가로 알려주고 싶은 정보</Label>
          <Textarea
            id="additionalInfo"
            data-testid="textarea-additional-info"
            {...form.register("additionalInfo")}
            placeholder="예: 특별한 제약사항, 개인적인 선호도, 과거 경험 등 프로그램 설계에 도움이 될 만한 정보를 자유롭게 작성해주세요."
            className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
          />
        </div>
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
      case 1: return renderStep1();   // 이름
      case 2: return renderStep2();   // 이메일
      case 3: return renderStep3();   // 나이
      case 4: return renderStep4();   // 성별
      case 5: return renderStep5();   // 🚀 신체 특성 분석 
      case 6: return renderStep6();   // 🧠 심리적 성향 분석 
      case 7: return renderStep7();   // ⚡ 볼륨 내성 테스트 
      case 8: return renderStep8();   // 현재 수준
      case 9: return renderStep9();   // 목표 설정
      case 10: return renderStep10();
      case 11: return renderStep11();
      case 12: return renderStep12();
      case 13: return renderStep13();
      case 14: return renderStep14();
      case 15: return renderStep15();
      case 16: return renderStep16();
      case 17: return renderStep17();
      case 18: return renderStep18();
      case 19: return renderStep19();
      case 20: return renderStep20();
      default: return <div>단계 {currentStep} 준비중...</div>;
    }
  };

  if (currentStep === 21) {
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