export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Sinabro Strength</h3>
            <p className="text-gray-300 mb-4">인공지능 기반 개인 맞춤형 파워리프팅 훈련 프로그램으로 더 강해지세요.</p>
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
            <h4 className="font-semibold mb-4">프로그램 특징</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• AI 기반 개인 맞춤 분석</li>
              <li>• 과학적 근거 기반 프로그래밍</li>
              <li>• 부상 예방 중심 설계</li>
              <li>• 즉시 이메일 전송</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">문의하기</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <i className="fas fa-envelope mr-3"></i>
                <span>support@aipowerlifting.com</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock mr-3"></i>
                <span>24/7 자동 프로그램 생성</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Sinabro Strength. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
}
