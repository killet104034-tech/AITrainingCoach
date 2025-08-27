# Environment Variables Guide

이 문서는 AITrainingCoach 애플리케이션에 필요한 환경변수들을 설명합니다.

## 🔧 환경변수 테스트

현재 설정된 환경변수의 상태를 확인하려면:

```bash
# 서버 실행 후
curl http://localhost:5000/api/debug-env
```

또는 웹 브라우저에서 `http://localhost:5000/api/debug-env` 접속

## 📋 필수 환경변수

### 🗄️ 데이터베이스
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```
- **설명**: Neon PostgreSQL serverless 데이터베이스 연결 문자열
- **예시**: `postgresql://user:pass@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb`
- **검증**: 실제 데이터베이스 연결 테스트 수행

### 🤖 AI 서비스
```bash
OPENAI_API_KEY=sk-your-openai-api-key
```
- **설명**: OpenAI GPT API 키 (훈련 프로그램 생성용)
- **형식**: `sk-`로 시작하는 문자열
- **검증**: OpenAI API 연결 및 모델 목록 조회 테스트

### 🔐 Google Services (Google Sheets & Drive)
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```
- **설명**: Google 서비스 계정 인증 정보
- **형식 검증**: 이메일은 `.iam.gserviceaccount.com` 도메인, 키는 PEM 형식
- **용도**: Google Sheets 템플릿 복사 및 Drive 권한 설정

```bash
SHEET_TEMPLATE_ID=1Oj-c6pIjOsaHMFiTRaZIfAoS6p-5PhwWZUaMxwvFoQo
SHARED_FOLDER_ID=your-google-drive-folder-id
```
- **설명**: Google Sheets 템플릿 ID와 Drive 폴더 ID
- **형식**: Google의 파일/폴더 ID (문자열)

## 📧 선택 환경변수

### 📬 이메일 서비스 (SMTP)
```bash
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com  # 선택사항
```
- **설명**: 이메일 전송 서비스 설정
- **참고**: 설정하지 않으면 이메일 전송 기능이 비활성화됩니다
- **Gmail**: 앱 비밀번호 사용 권장

### ⚙️ 시스템 설정
```bash
PORT=5000                    # 기본값: 5000
NODE_ENV=development         # development/production
REPL_ID=your-replit-id      # Replit 환경에서만 필요
```

## 📊 환경변수 상태 예시

```json
{
  "timestamp": "2025-08-27T05:21:30.400Z",
  "overall_status": "❌ 일부 환경변수에 문제 있음",
  "environment_variables": {
    "DATABASE_URL": {
      "isValid": true,
      "status": "✅ 연결 성공",
      "description": "데이터베이스 연결 테스트 성공",
      "host": "ep-cool-darkness-123456.us-east-1.aws.neon.tech"
    },
    "OPENAI_API_KEY": {
      "isValid": false,
      "status": "❌ API 연결 실패", 
      "description": "OpenAI API 연결 실패: Invalid API key",
      "recommendation": "API 키가 유효한지 확인하세요"
    }
  },
  "summary": {
    "total_variables": 12,
    "valid_variables": 8,
    "critical_issues": 1
  },
  "recommendations": [
    "1개의 중요한 환경변수에 문제가 있습니다."
  ]
}
```

## 🚀 빠른 설정

1. `.env` 파일 생성:
```bash
cp .env.example .env  # 예시 파일이 있는 경우
```

2. 필수 환경변수 설정:
- Neon PostgreSQL DATABASE_URL
- OpenAI API 키 
- Google Service Account 인증 정보

3. 설정 검증:
```bash
npm run dev
curl http://localhost:5000/api/debug-env | jq '.overall_status'
```

## 🔍 문제해결

### 데이터베이스 연결 실패
- URL 형식 확인: `postgresql://user:pass@host:port/db`
- Neon 대시보드에서 연결 문자열 확인
- 방화벽/네트워크 설정 확인

### OpenAI API 오류
- API 키가 `sk-`로 시작하는지 확인
- OpenAI 계정의 잔액 및 사용량 한도 확인
- API 키 권한 확인

### Google Services 오류
- 서비스 계정 이메일 형식: `*@*.iam.gserviceaccount.com`
- Private Key PEM 형식 확인
- Google Cloud Console에서 API 활성화 확인 (Sheets, Drive)

---

💡 **팁**: `/api/debug-env` 엔드포인트를 정기적으로 확인하여 환경변수 상태를 모니터링하세요.