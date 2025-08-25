import SurveySection from '@/components/SurveySection';

export default function Survey() {
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

      <SurveySection />
    </div>
  );
}