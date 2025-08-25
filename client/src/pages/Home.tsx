import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SurveySection from "@/components/SurveySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/api/assets/generated_images/Sinabro_Strength_powerlifting_logo_eb6c26a6.png" 
                  alt="Sinabro Strength" 
                  className="h-12 w-auto"
                />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a 
                  href="#features" 
                  data-testid="link-features"
                  className="text-gray-300 hover:text-accent transition-colors duration-200"
                >
                  특징
                </a>
                <a 
                  href="#how-it-works" 
                  data-testid="link-how-it-works"
                  className="text-gray-300 hover:text-accent transition-colors duration-200"
                >
                  작동 방식
                </a>
                <button 
                  onClick={() => window.open('/survey', '_blank')}
                  data-testid="button-nav-start"
                  className="bg-accent hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  지금 시작하기
                </button>
              </div>
            </div>
            <div className="md:hidden">
              <button 
                data-testid="button-mobile-menu"
                className="text-gray-300 hover:text-accent"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SurveySection />
      <Footer />
    </div>
  );
}
