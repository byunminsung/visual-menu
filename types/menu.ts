// 메뉴 아이템 타입 정의
export interface MenuItem {
  id: string;
  originalText: string; // 원본 중국어 텍스트
  translatedText: string; // 한국어 번역
  pronunciation: string; // 한국어 발음
  description?: string; // 메뉴 설명
  imageUrl?: string; // 음식 이미지 URL
  category?: string; // 카테고리 (예: 볶음, 찜, 국물 등)
  price?: string; // 가격 (있는 경우)
}

// OCR 결과 타입
export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 번역 결과 타입
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  pronunciation: string;
  detectedLanguage?: string;
}

// API 응답 타입
export interface MenuAnalysisResponse {
  success: boolean;
  menuItems: MenuItem[];
  error?: string;
}

// Made with Bob
