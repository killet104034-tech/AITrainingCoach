export default function FeaturesSection() {
  const features = [
    {
      icon: "fas fa-robot",
      title: "AI 기반 분석",
      description: "최신 AI 기술로 당신의 경험 수준, 체력, 목표를 종합 분석하여 최적의 훈련 프로그램을 설계합니다.",
      bgColor: "bg-accent"
    },
    {
      icon: "fas fa-target",
      title: "개인 맞춤형 프로그램",
      description: "스쿼트, 벤치프레스, 데드리프트 현재 최대중량과 목표를 바탕으로 체계적인 점진적 과부하 계획을 제공합니다.",
      bgColor: "bg-electric"
    },
    {
      icon: "fas fa-calendar-alt",
      title: "유연한 스케줄링",
      description: "주 2회부터 6회까지, 당신의 라이프스타일에 맞는 훈련 빈도와 시간을 고려한 현실적인 계획을 수립합니다.",
      bgColor: "bg-success"
    },
    {
      icon: "fas fa-dumbbell",
      title: "장비별 최적화",
      description: "홈짐, 상업적 헬스장, 파워리프팅 전용 짐 등 사용 가능한 장비에 따라 운동 선택과 프로그래밍을 조정합니다.",
      bgColor: "bg-accent"
    },
    {
      icon: "fas fa-shield-alt",
      title: "부상 예방 중심",
      description: "기존 부상 이력과 신체적 제약사항을 고려하여 안전하면서도 효과적인 운동 선택과 볼륨을 제안합니다.",
      bgColor: "bg-electric"
    },
    {
      icon: "fas fa-envelope",
      title: "즉시 이메일 전송",
      description: "설문 완료 즉시 상세한 훈련 계획서를 이메일로 받아 바로 훈련을 시작할 수 있습니다.",
      bgColor: "bg-success"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            왜 AI 파워리프팅을 선택해야 할까요?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            과학적 근거와 AI 분석을 바탕으로 한 개인 맞춤형 훈련으로 더 빠르고 안전하게 목표를 달성하세요.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              data-testid={`feature-card-${index}`}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`w-12 h-12 ${feature.bgColor} text-white rounded-lg flex items-center justify-center mb-6`}>
                <i className={`${feature.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
