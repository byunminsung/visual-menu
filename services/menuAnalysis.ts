import { MenuItem } from '@/types/menu';

/**
 * 이미지에서 메뉴를 분석하는 함수 (서버 사이드 OCR 사용)
 * OCR, 번역, 이미지 검색 API를 통합하여 사용합니다.
 */
export async function analyzeMenuImage(file: File): Promise<MenuItem[]> {
  try {
    // 1단계: 서버 사이드 API를 통한 OCR 텍스트 추출
    console.log('📸 Step 1/3: Performing OCR (server-side)...');

    const formData = new FormData();
    formData.append('image', file);

    const ocrResponse = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!ocrResponse.ok) {
      const errorData = await ocrResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to analyze image on the server');
    }

    const { menuItems: menuTexts } = await ocrResponse.json();

    if (!menuTexts || menuTexts.length === 0) {
      throw new Error('No menu items detected');
    }

    console.log(`✅ OCR completed. Found ${menuTexts.length} menu items:`, menuTexts);

    // 2단계: 번역 및 발음 가져오기
    console.log('🌐 Step 2/3: Translating menu items...');

    const translateResponse = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts: menuTexts }),
    });

    if (!translateResponse.ok) {
      throw new Error('Translation failed');
    }

    const translateData = await translateResponse.json();
    const translations = translateData.results;

    console.log('✅ Translation completed');

    // 3단계: 각 메뉴에 대한 이미지 검색
    console.log('🍽️ Step 3/3: Searching for food images...');

    const imageSearchResponse = await fetch('/api/search-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queries: translations.map((t: any) => t.original)
      }),
    });

    let imageResults: any[] = [];
    if (imageSearchResponse.ok) {
      const imageData = await imageSearchResponse.json();
      imageResults = imageData.results || [];
    }

    console.log('✅ Image search completed');

    // 4단계: 결과 조합
    console.log('🎉 Combining results...');
    const menuItems: MenuItem[] = translations.map((translation: any, index: number) => {
      const imageUrl = imageResults[index]?.imageUrl || null;

      return {
        id: `menu-${index + 1}`,
        originalText: translation.original,
        translatedText: translation.translated,
        pronunciation: translation.pronunciation,
        description: translation.description,
        imageUrl: imageUrl,
        category: categorizeMenu(translation.translated),
      };
    });

    console.log(`✅ Analysis complete! Generated ${menuItems.length} menu items`);

    return menuItems;

  } catch (error) {
    console.error('❌ Menu analysis error:', error);
    throw error;
  }
}

/**
 * 메뉴를 카테고리로 분류
 */
function categorizeMenu(menuName: string): string {
  if (menuName.includes('볶음') || menuName.includes('지딩') || menuName.includes('두부') || menuName.includes('러우쓰')) {
    return '볶음';
  }
  if (menuName.includes('구이') || menuName.includes('카오')) {
    return '구이';
  }
  if (menuName.includes('바오') || menuName.includes('만두') || menuName.includes('자오즈')) {
    return '딤섬';
  }
  if (menuName.includes('탕') || menuName.includes('국') || menuName.includes('수프')) {
    return '국물';
  }
  if (menuName.includes('면')) {
    return '면';
  }
  if (menuName.includes('밥') || menuName.includes('판')) {
    return '밥';
  }
  if (menuName.includes('튀김') || menuName.includes('리지')) {
    return '튀김';
  }
  return '기타';
}

// Made with Bob
