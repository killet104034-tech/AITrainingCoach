export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "설문 작성",
      description: "현재 수준, 목표, 사용 가능한 장비, 훈련 가능한 시간 등을 간단한 설문으로 입력합니다.",
      bgColor: "bg-accent"
    },
    {
      number: "2", 
      title: "AI 분석 및 생성",
      description: "고급 AI 알고리즘이 당신의 정보를 분석하여 최적화된 개인 맞춤형 훈련 프로그램을 생성합니다.",
      bgColor: "bg-electric"
    },
    {
      number: "3",
      title: "프로그램 수령", 
      description: "상세한 훈련 계획서가 이메일로 즉시 전송됩니다. 바로 체계적인 파워리프팅 훈련을 시작하세요!",
      bgColor: "bg-success"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            3단계로 시작하는 맞춤형 훈련
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            복잡한 과정 없이 간단한 설문만으로 전문가 수준의 파워리프팅 프로그램을 받아보세요.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="text-center relative">
                <div className={`w-16 h-16 ${step.bgColor} text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-primary mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center mt-8">
                  <i className="fas fa-arrow-right text-3xl text-gray-300 absolute right-0 top-1/2 transform translate-x-6 -translate-y-1/2"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
