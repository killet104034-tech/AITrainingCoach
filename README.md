# AITrainingCoach - 개인화 훈련 코치 시스템

## 🧠 룰 엔진 시스템 (Rule Engine)

### 개요
AITrainingCoach에는 설문 응답, 환경변수, 외부 소스 입력을 기반으로 무한 확장 가능한 규칙을 평가하여 개인화된 결과를 도출하는 범용 룰 엔진이 구현되어 있습니다.

### 주요 기능
- **JSONLogic 기반**: 강력하고 유연한 조건부 로직 처리
- **다중 소스 지원**: JSON 파일, Google Sheets 등 다양한 룰 소스
- **우선순위 처리**: 룰 충돌 시 우선순위에 따른 처리
- **전략 지원**: first-match, collect-all 전략 선택 가능
- **Zod 검증**: 입력 스키마 자동 검증
- **확장 가능**: 새로운 룰 소스와 조건 쉽게 추가

## 🎯 룰 작성 가이드

### 기본 룰 구조

```json
{
  "id": "rule-unique-id",
  "name": "룰 이름",
  "description": "룰 설명 (선택사항)",
  "condition": {
    "JSONLogic 조건": "여기에 작성"
  },
  "result": {
    "planId": "training-plan-id",
    "emailTemplateId": "email-template-id",
    "customData": "원하는 결과 데이터"
  },
  "priority": 100,
  "enabled": true,
  "tags": ["tag1", "tag2"]
}
```

### JSONLogic 조건 예시

#### 1. 기본 비교 조건
```json
{
  "condition": {
    "==": [{"var": "survey.experience_level"}, "beginner"]
  }
}
```

#### 2. 복합 조건 (AND)
```json
{
  "condition": {
    "and": [
      {"==": [{"var": "survey.experience_level"}, "beginner"]},
      {"includes": [{"var": "survey.goals"}, "strength"]}
    ]
  }
}
```

#### 3. 복합 조건 (OR)
```json
{
  "condition": {
    "or": [
      {"includes": [{"var": "survey.goals"}, "health"]},
      {">": [{"var": "survey.age"}, 45]}
    ]
  }
}
```

#### 4. 배열 포함 확인
```json
{
  "condition": {
    "includes": [{"var": "survey.goals"}, "muscle"]
  }
}
```

#### 5. 숫자 비교
```json
{
  "condition": {
    "and": [
      {">": [{"var": "survey.age"}, 18]},
      {"<": [{"var": "survey.age"}, 65]}
    ]
  }
}
```

#### 6. 문자열 포함 확인
```json
{
  "condition": {
    "contains": [{"var": "survey.notes"}, "부상"]
  }
}
```

### 사용 가능한 컨텍스트 변수

#### 설문 데이터 (survey)
- `survey.name`: 사용자 이름
- `survey.email`: 이메일
- `survey.age`: 나이
- `survey.experience_level`: 경험 수준 ("beginner", "intermediate", "advanced")
- `survey.goals`: 운동 목표 배열 (["strength", "muscle", "health", "competition"])
- `survey.injury_history`: 부상 이력 (true/false)
- `survey.notes`: 기타 메모

#### 사용자 정보 (user)
- `user.id`: 사용자 ID
- `user.email`: 사용자 이메일
- `user.name`: 사용자 이름

#### 환경 변수 (environment)
- `environment.season`: 계절
- `environment.gym_type`: 헬스장 타입

#### 외부 데이터 (external)
- 외부 시스템에서 제공되는 데이터

#### 런타임 정보 (runtime)
- `runtime.timestamp`: 요청 시각
- `runtime.requestId`: 요청 ID

### 커스텀 JSONLogic 오퍼레이터

#### includes
배열에 특정 값이 포함되어 있는지 확인
```json
{"includes": [{"var": "survey.goals"}, "strength"]}
```

#### contains
문자열에 특정 부분 문자열이 포함되어 있는지 확인
```json
{"contains": [{"var": "survey.notes"}, "부상"]}
```

#### regex
정규식 매칭
```json
{"regex": [{"var": "user.email"}, ".*@company\\.com$"]}
```

#### age
생년월일로부터 나이 계산
```json
{">": [{"age": [{"var": "user.birthDate"}]}, 25]}
```

### 룰셋 예시

```json
{
  "id": "training-rules",
  "name": "훈련 프로그램 룰셋",
  "version": "1.0.0",
  "description": "설문 기반 훈련 프로그램 추천",
  "strategy": "first-match",
  "rules": [
    {
      "id": "beginner-strength",
      "name": "초보자 근력 프로그램",
      "condition": {
        "and": [
          {"==": [{"var": "survey.experience_level"}, "beginner"]},
          {"includes": [{"var": "survey.goals"}, "strength"]}
        ]
      },
      "result": {
        "planId": "beginner-strength-plan",
        "emailTemplateId": "beginner-welcome",
        "duration": "12-weeks",
        "frequency": "3-days-week"
      },
      "priority": 100,
      "enabled": true,
      "tags": ["beginner", "strength"]
    }
  ]
}
```

## 🔧 API 사용법

### POST /api/evaluate
룰 평가 실행

```json
{
  "context": {
    "survey": {
      "experience_level": "beginner",
      "goals": ["strength", "muscle"],
      "age": 25
    },
    "user": {
      "email": "user@example.com",
      "name": "홍길동"
    }
  },
  "strategy": "first-match",
  "options": {
    "includeDebugInfo": false,
    "timeout": 5000
  }
}
```

### 응답 예시

```json
{
  "success": true,
  "results": [
    {
      "ruleId": "beginner-strength",
      "ruleName": "초보자 근력 프로그램",
      "priority": 100,
      "result": {
        "planId": "beginner-strength-plan",
        "emailTemplateId": "beginner-welcome",
        "duration": "12-weeks",
        "frequency": "3-days-week"
      }
    }
  ],
  "meta": {
    "strategy": "first-match",
    "totalRulesEvaluated": 8,
    "matchedRulesCount": 1,
    "executionTimeMs": 15
  }
}
```

### 기타 엔드포인트

- `GET /api/evaluate/health` - 헬스체크
- `GET /api/evaluate/stats` - 통계 정보
- `POST /api/evaluate/reload` - 룰 리로드
- `POST /api/evaluate/test` - 테스트

## 📁 파일 구조

```
server/rules/
├── evaluator.ts          # 메인 룰 평가 엔진
├── schemas.ts            # Zod 스키마 정의
├── sources/
│   └── index.ts         # 룰 소스 로더 (JSON, Sheets)
├── routes/
│   └── evaluate.ts      # API 라우트
└── rules.default.json   # 기본 룰셋
```

## 🧪 테스트

테스트 실행:
```bash
npm test server/tests/evaluator.test.ts
```

## 🔄 룰 확장 방법

### 1. 새로운 룰 추가
`server/rules/rules.default.json`에 새로운 룰 추가

### 2. 커스텀 JSONLogic 오퍼레이터 추가
`evaluator.ts`의 `registerCustomOperators()` 메소드에 추가

### 3. 새로운 룰 소스 타입 추가
`sources/index.ts`에 새로운 `RuleSourceLoader` 구현

### 4. 스키마 확장
`schemas.ts`에서 컨텍스트나 결과 스키마 확장

## ⚡ 성능 고려사항

- 룰 캐싱: 5분 기본 TTL
- 평가 타임아웃: 기본 5초
- 우선순위 정렬로 효율적 매칭
- first-match 전략으로 조기 종료 최적화

## 🛡️ 보안 고려사항

- Zod를 통한 입력 검증
- JSONLogic 조건 안전 평가
- 에러 핸들링으로 시스템 안정성 확보