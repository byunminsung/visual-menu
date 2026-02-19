import { NextRequest, NextResponse } from 'next/server';

// 무료 번역 API 사용 (MyMemory Translation API)
// 또는 Google Translate API를 사용하려면 API 키가 필요합니다
async function translateText(text: string, targetLang: string = 'ko'): Promise<string> {
  try {
    // MyMemory Translation API (무료, 하루 1000 단어 제한)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|${targetLang}`
    );
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    // 폴백: 원본 텍스트 반환
    return text;
  }
}

// 중국어를 한국어 발음으로 변환 (간단한 매핑)
function getKoreanPronunciation(chineseText: string): string {
  // 실제로는 pinyin을 한글로 변환하는 라이브러리를 사용해야 하지만
  // 여기서는 간단한 예시를 제공합니다
  // 실제 구현에서는 pinyin 라이브러리와 한글 변환 로직이 필요합니다
  
  // 일반적인 중국 요리 이름 매핑
  const commonDishes: { [key: string]: string } = {
    '宫保鸡丁': '궁바오지딩',
    '麻婆豆腐': '마파두부',
    '北京烤鸭': '베이징카오야',
    '小笼包': '샤오롱바오',
    '酸辣汤': '산라탕',
    '糖醋里脊': '탕추리지',
    '红烧肉': '홍샤오러우',
    '鱼香肉丝': '위샹러우쓰',
    '回锅肉': '후이궈러우',
    '水煮鱼': '수이주위',
    '担担面': '단단면',
    '炒饭': '차오판',
    '炒面': '차오면',
    '饺子': '자오즈',
    '包子': '바오즈',
    '馒头': '만터우',
    '春卷': '춘쥐안',
    '锅贴': '궈티에',
  };

  // 매핑된 발음이 있으면 반환
  if (commonDishes[chineseText]) {
    return commonDishes[chineseText];
  }

  // 없으면 간단한 음역 (실제로는 더 복잡한 로직 필요)
  return chineseText;
}

export async function POST(request: NextRequest) {
  try {
    const { text, texts } = await request.json();

    if (!text && !texts) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // 단일 텍스트 번역
    if (text) {
      const translated = await translateText(text);
      const pronunciation = getKoreanPronunciation(text);

      return NextResponse.json({
        success: true,
        original: text,
        translated,
        pronunciation,
      });
    }

    // 여러 텍스트 번역
    if (texts && Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map(async (t: string) => {
          const translated = await translateText(t);
          const pronunciation = getKoreanPronunciation(t);
          
          return {
            original: t,
            translated,
            pronunciation,
          };
        })
      );

      return NextResponse.json({
        success: true,
        results,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Made with Bob
