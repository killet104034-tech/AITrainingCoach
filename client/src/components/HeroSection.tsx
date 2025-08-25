export default function HeroSection() {
  const openSurvey = () => {
    window.open('/survey', '_blank');
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative bg-black text-white overflow-hidden min-h-screen flex items-center">
      
      <div className="w-full max-w-4xl mx-auto px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-light leading-tight mb-8">
          AI가 설계한<br />
          <span className="text-white">맞춤형 훈련</span><br />
          프로그램
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
          파워리프팅, 근비대, 다이어트, 대회준비까지. 
          당신의 목표와 환경을 분석하여 최적화된 개인별 훈련 계획을 제공합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={openSurvey} 
            data-testid="button-hero-start"
            className="bg-white text-black px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 hover:bg-gray-200"
          >
            무료 훈련 프로그램 받기
          </button>
          <button 
            onClick={scrollToFeatures} 
            data-testid="button-hero-learn"
            className="border border-gray-600 text-white hover:border-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300"
          >
            작동 방식 보기
          </button>
        </div>
      </div>
    </section>
  );
}
