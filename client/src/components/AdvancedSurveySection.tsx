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

  // 7단계: 훈련 빈도 및 구성
  const renderStep7 = () => (
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

  // 8단계: 훈련 블럭 선호도
  const renderStep8 = () => (
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

  // 9단계: 기술적 선호도
  const renderStep9 = () => (
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

  // 10단계: 약점 및 강점 분석
  const renderStep10 = () => (
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

  // 11단계: 장비 및 환경
  const renderStep11 = () => (
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

  // 13단계: 회복 및 라이프스타일
  const renderStep13 = () => (
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

  // 14단계: 과거 프로그램 경험
  const renderStep14 = () => (
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

  // 15단계: 멘탈 및 고급 설정
  const renderStep15 = () => (
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

  // Placeholder for any future steps
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
      case 7: return renderStep7();
      case 8: return renderStep8();
      case 9: return renderStep9();
      case 10: return renderStep10();
      case 11: return renderStep11();
      case 12: return renderStep12();
      case 13: return renderStep13();
      case 14: return renderStep14();
      case 15: return renderStep15();
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