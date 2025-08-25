import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-light text-white">SINABRO STRENGTH</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-12">
                <a 
                  href="#features" 
                  data-testid="link-features"
                  className="text-gray-400 hover:text-white transition-colors duration-200 font-light"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  data-testid="link-how-it-works"
                  className="text-gray-400 hover:text-white transition-colors duration-200 font-light"
                >
                  How it Works
                </a>
                <button 
                  onClick={() => window.open('/survey', '_blank')}
                  data-testid="button-nav-start"
                  className="bg-white text-black px-6 py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-gray-200"
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="md:hidden">
              <button 
                data-testid="button-mobile-menu"
                className="text-gray-400 hover:text-white"
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
      <Footer />
    </div>
  );
}
