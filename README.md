# 🍜 중국 메뉴판 번역기 (Visual Menu Translator)

중국 식당에서 메뉴를 이해하기 어려울 때 사용하는 웹 애플리케이션입니다. 메뉴판 사진을 업로드하면 중국어를 한국어로 번역하고, 발음을 표기하며, 실제 음식 사진을 보여줍니다.

## ✨ 주요 기능

- 📸 **이미지 업로드**: 드래그 앤 드롭 또는 클릭으로 메뉴판 사진 업로드
- 🔍 **OCR 인식**: Tesseract.js로 이미지에서 중국어 텍스트 자동 인식
- 🌐 **자동 번역**: MyMemory API로 중국어를 한국어로 번역
- 🗣️ **발음 표기**: 한국어 발음 제공
- 🍽️ **음식 이미지**: Unsplash API로 각 메뉴의 실제 음식 사진 표시
- 📝 **메뉴 설명**: 음식에 대한 간단한 설명 제공

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.17.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 저장소 클론 또는 다운로드

2. 의존성 설치:
```bash
npm install
```

3. 환경 변수 설정 (선택사항):
```bash
cp .env.local.example .env.local
# .env.local 파일을 열어서 API 키 입력
```

4. 개발 서버 실행:
```bash
npm run dev
```

5. 브라우저에서 열기:
```
http://localhost:3000
```

## 📁 프로젝트 구조

```
visual-menu/
├── app/
│   ├── api/                   # API 라우트
│   │   ├── analyze/          # OCR 처리
│   │   ├── translate/        # 번역 처리
│   │   └── search-image/     # 이미지 검색
│   ├── page.tsx              # 메인 페이지
│   ├── layout.tsx            # 레이아웃
│   └── globals.css           # 전역 스타일
├── components/               # React 컴포넌트
│   ├── ImageUpload.tsx       # 이미지 업로드
│   └── MenuDisplay.tsx       # 메뉴 표시
├── services/                 # 비즈니스 로직
│   └── menuAnalysis.ts       # 메뉴 분석 통합
├── types/                    # TypeScript 타입
│   └── menu.ts              # 메뉴 관련 타입
└── lib/                      # 유틸리티 함수
```

## 🛠️ 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: TailwindCSS
- **이미지 처리**: Next.js Image Optimization

### 백엔드 & AI
- **OCR**: Tesseract.js (중국어 간체 인식)
- **번역**: MyMemory Translation API (무료)
- **이미지 검색**: Unsplash API (선택사항)

## 🔧 실제 구현 상태

### ✅ 구현 완료
- OCR (Tesseract.js) - 중국어 텍스트 인식
- 번역 (MyMemory API) - 중국어 → 한국어
- 이미지 검색 (Unsplash API 또는 폴백)
- 한국어 발음 표기 (일반적인 요리 이름)
- 반응형 UI
- 에러 처리

### 🔄 작동 방식

1. **이미지 업로드**: 사용자가 메뉴판 사진 업로드
2. **OCR 처리**: `/api/analyze` 엔드포인트에서 Tesseract.js로 중국어 텍스트 추출
3. **번역**: `/api/translate` 엔드포인트에서 MyMemory API로 한국어 번역
4. **이미지 검색**: `/api/search-image` 엔드포인트에서 음식 사진 검색
5. **결과 표시**: 번역, 발음, 이미지, 설명을 함께 표시

## 🔐 환경 변수 설정

`.env.local` 파일 생성 (선택사항):

```env
# Unsplash API Key (선택사항)
# https://unsplash.com/developers 에서 무료로 발급
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**참고**: Unsplash API 키가 없어도 플레이스홀더 이미지로 작동합니다.

## 📱 사용 방법

1. 중국 식당에서 메뉴판 사진을 촬영합니다
2. 웹사이트에 접속하여 이미지를 업로드합니다
3. OCR이 중국어 텍스트를 인식합니다 (약 5-10초 소요)
4. 자동으로 번역되고 음식 사진이 표시됩니다
5. 번역된 메뉴, 발음, 설명을 확인합니다
6. 원하는 메뉴를 선택하여 주문합니다!

## ⚠️ 제한사항

### OCR 정확도
- Tesseract.js는 클라이언트 사이드에서 실행되어 속도가 느릴 수 있습니다
- 손글씨나 특수 폰트는 인식률이 낮을 수 있습니다
- 이미지 품질이 좋을수록 인식률이 높아집니다

### 번역 API
- MyMemory API는 무료이지만 하루 1000 단어 제한이 있습니다
- 전문 용어나 지역 방언은 정확하지 않을 수 있습니다

### 발음 표기
- 일반적인 중국 요리 이름만 한국어 발음으로 매핑되어 있습니다
- 새로운 요리는 원본 중국어로 표시될 수 있습니다

## 🚀 성능 최적화 팁

1. **이미지 크기**: 업로드 전에 이미지를 적절한 크기로 조정 (권장: 1000x1000px 이하)
2. **이미지 품질**: 밝고 선명한 사진을 사용
3. **텍스트 각도**: 메뉴판이 정면에서 촬영된 사진 사용

## 🔮 향후 개선 사항

- [ ] Google Cloud Vision API 통합 (더 빠르고 정확한 OCR)
- [ ] 실시간 카메라 촬영 기능
- [ ] 메뉴 히스토리 저장
- [ ] 다국어 지원 (일본어, 영어 등)
- [ ] 음성 발음 재생
- [ ] 가격 정보 추출
- [ ] 알레르기 정보 표시
- [ ] PWA (Progressive Web App) 지원

## 🤝 기여하기

이 프로젝트는 오픈소스입니다. 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 알려진 이슈

- Tesseract.js 초기 로딩 시간이 길 수 있습니다 (첫 실행 시)
- 일부 Unsplash 이미지 URL이 만료될 수 있습니다
- Node.js 18.17.0에서 일부 ESLint 경고가 발생할 수 있습니다

## 📄 라이선스

MIT License

## 👨‍💻 개발자

프로젝트 문의: [GitHub Issues](https://github.com/minsung/visual-menu/issues)

## 🙏 감사의 말

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR 엔진
- [MyMemory Translation API](https://mymemory.translated.net/) - 무료 번역 서비스
- [Unsplash](https://unsplash.com/) - 고품질 이미지 제공
- Next.js 팀
- TailwindCSS 팀
- 모든 오픈소스 기여자들

## 📊 API 사용량 및 비용

### 무료 티어
- **Tesseract.js**: 완전 무료 (클라이언트 사이드)
- **MyMemory API**: 하루 1000 단어 무료
- **Unsplash API**: 시간당 50 요청 무료

### 유료 업그레이드 옵션
- **Google Cloud Vision**: 월 1,000건 무료, 이후 $1.50/1,000건
- **Google Translate**: 월 500,000자 무료, 이후 $20/1M자
- **Unsplash API+**: 무제한 요청

---

**참고**: 이 프로젝트는 실제로 작동하는 프로토타입입니다. 프로덕션 환경에서 사용하려면 추가적인 보안, 에러 처리, 최적화가 필요합니다.
