import { MenuItem } from '@/types/menu';
import { processImageWithOCR } from '@/components/OCRProcessor';

/**
 * 이미지에서 메뉴를 분석하는 함수 (클라이언트 사이드 OCR 사용)
 * OCR, 번역, 이미지 검색 API를 통합하여 사용합니다.
 */
export async function analyzeMenuImage(file: File): Promise<MenuItem[]> {
  try {
    // 1단계: 클라이언트 사이드 OCR로 중국어 텍스트 추출
    console.log('📸 Step 1/3: Performing OCR (client-side)...');
    
    const menuTexts = await processImageWithOCR(file);

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
        queries: translations.map((t: any) => t.translated) 
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
        description: generateDescription(translation.translated),
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
 * 메뉴 이름을 기반으로 간단한 설명 생성
 */
function generateDescription(menuName: string): string {
  const descriptions: { [key: string]: string } = {
    '궁바오지딩': '매콤한 소스에 볶은 닭고기와 땅콩 요리. 쓰촨 지방의 대표적인 요리입니다.',
    '마파두부': '매콤한 고추기름과 두반장으로 만든 두부 요리. 쓰촨 요리의 대표 메뉴입니다.',
    '베이징카오야': '바삭하게 구운 오리 요리. 베이징의 대표적인 요리로 얇은 전병에 싸서 먹습니다.',
    '샤오롱바오': '육즙이 가득한 작은 찐빵. 상하이의 대표적인 딤섬입니다.',
    '산라탕': '새콤하고 매콤한 국물 요리. 식초와 후추로 맛을 낸 전통 수프입니다.',
    '탕추리지': '새콤달콤한 소스에 튀긴 돼지고기 요리입니다.',
    '홍샤오러우': '간장과 설탕으로 조린 돼지고기 요리입니다.',
    '위샹러우쓰': '생선 향이 나는 매콤한 돼지고기 볶음입니다.',
    '후이궈러우': '두 번 조리한 돼지고기 볶음 요리입니다.',
    '수이주위': '매운 국물에 삶은 생선 요리입니다.',
  };

  // 부분 매칭 시도
  for (const [key, value] of Object.entries(descriptions)) {
    if (menuName.includes(key) || key.includes(menuName)) {
      return value;
    }
  }

  return '중국 전통 요리입니다.';
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
