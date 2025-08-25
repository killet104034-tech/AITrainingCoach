// 📋 설문 페이지 (Survey Page)
// ✨ 기능: 전문가급 파워리프팅 설문 실행 및 프로그램 생성 요청
// 🔄 흐름: 20단계 설문 → API 전송 → Google Sheets 18주 프로그램 생성 → 이메일 발송
// 🎯 목표: 최고의 개인화된 파워리프팅 훈련 제공

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdvancedSurveySection } from '@/components/AdvancedSurveySection';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm();
  const { toast } = useToast();

  const submitSurvey = useMutation({
    mutationFn: (data) => apiRequest("POST", "/api/surveys?kind=advanced_v1", data),
    onSuccess: (response) => {
      toast({
        title: "🔥 파워리프팅 프로그램 생성 완료!",
        description: "최고의 개인화된 훈련이 이메일로 전송되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "프로그램 생성 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    const formData = form.getValues();
    submitSurvey.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Dark Navigation */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-light text-white">SINABRO STRENGTH</h1>
              </div>
            </div>
            <div className="flex items-center">
              <a 
                href="/" 
                data-testid="button-back-home"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-light"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      <AdvancedSurveySection 
        form={form}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSubmit={handleSubmit}
        isSubmitting={submitSurvey.isPending}
      />
    </div>
  );
}