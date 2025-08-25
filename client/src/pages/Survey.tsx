import SurveySection from "@/components/SurveySection";

export default function Survey() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Dark Navigation */}
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
            <div className="flex items-center">
              <a 
                href="/" 
                data-testid="button-back-home"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </nav>

      <SurveySection />
    </div>
  );
}