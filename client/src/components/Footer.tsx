export default function Footer() {
  return (
    <footer className="bg-black text-white py-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-light mb-6">Sinabro Strength</h3>
            <p className="text-gray-400 mb-6 font-light leading-relaxed">인공지능 기반 개인 맞춤형 파워리프팅 훈련 프로그램으로 더 강해지세요.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                <i className="fab fa-youtube text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                <i className="fab fa-facebook text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-6">프로그램 특징</h4>
            <ul className="space-y-3 text-gray-400 font-light">
              <li>AI 기반 개인 맞춤 분석</li>
              <li>과학적 근거 기반 프로그래밍</li>
              <li>부상 예방 중심 설계</li>
              <li>즉시 이메일 전송</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-6">문의하기</h4>
            <div className="space-y-4 text-gray-400 font-light">
              <div className="flex items-center">
                <span>support@sinabrostrength.com</span>
              </div>
              <div className="flex items-center">
                <span>24/7 자동 프로그램 생성</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-12 text-center text-gray-500 font-light">
          <p>&copy; 2024 Sinabro Strength. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
}
