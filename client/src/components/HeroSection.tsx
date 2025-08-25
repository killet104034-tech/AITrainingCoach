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
    <section className="relative bg-gradient-to-r from-gray-900 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="absolute inset-0">
        <img 
          src="/api/assets/generated_images/Dark_powerlifting_gym_background_7aee09a3.png" 
          alt="Powerlifting gym interior" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            AI가 설계한<br />
            <span className="text-accent">맞춤형 파워리프팅</span><br />
            훈련 프로그램
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            당신의 현재 수준, 목표, 환경을 분석하여 최적화된 개인별 훈련 계획을 제공합니다. 
            스쿼트, 벤치프레스, 데드리프트 기록을 체계적으로 향상시키세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={openSurvey} 
              data-testid="button-hero-start"
              className="bg-accent hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-chart-line mr-2"></i>
              무료 훈련 프로그램 받기
            </button>
            <button 
              onClick={scrollToFeatures} 
              data-testid="button-hero-learn"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              <i className="fas fa-play mr-2"></i>
              작동 방식 보기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
