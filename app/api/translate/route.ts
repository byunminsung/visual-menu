import { NextRequest, NextResponse } from 'next/server';

// 무료 번역 API (MyMemory)는 간단한 번역만 제공하므로,
// 프롬프트를 통해 직역, 자연스러운 설명, 발음을 한 번에 Gemini에서 가져오도록 변경합니다.
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TranslationData {
  originalText: string;
  literalTranslation: string;
  description: string;
  pronunciation: string;
}

// 중국어를 한국어 직역, 설명, 발음으로 변환 (Gemini API 사용)
async function getFullTranslationWithGemini(chineseText: string): Promise<TranslationData> {
  const apiKey = process.env.GEMINI_API_KEY;
  // 기본 폴백 데이터
  const fallback: TranslationData = {
    originalText: chineseText,
    literalTranslation: chineseText,
    description: '설명을 가져올 수 없습니다.',
    pronunciation: chineseText
  };

  if (!apiKey) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert bilingual Chinese-Korean food translator.
      I will provide you with a Chinese dish name.
      Provide the following three pieces of information formatted EXACTLY as a JSON object, with no other text:
      
      1. "literalTranslation": A word-by-word literal translation of the Chinese characters into Korean. (e.g. 鱼香肉丝 -> 물고기 향 고기 채)
      2. "description": A natural, appetizing description of what the dish actually is in Korean. (e.g. 매콤달콤한 어향 소스에 볶은 돼지고기 채 요리)
      3. "pronunciation": The phonetic Korean Hangul pronunciation of the Chinese characters. (e.g. 위샹러우쓰)
      
      Chinese Dish Name: ${chineseText}
      
      Return ONLY valid JSON.
      Format:
      {
        "literalTranslation": "...",
        "description": "...",
        "pronunciation": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    // 마크다운 흔적 제거
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json\n/g, '').replace(/\n\`\`\`$/g, '');
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/^\`\`\`\n/g, '').replace(/\n\`\`\`$/g, '');
    }

    const parsedData = JSON.parse(responseText);

    return {
      originalText: chineseText,
      literalTranslation: parsedData.literalTranslation || chineseText,
      description: parsedData.description || '음식 설명',
      pronunciation: parsedData.pronunciation || chineseText,
    };
  } catch (error) {
    console.error('Gemini Translation Error:', error);
    return fallback;
  }
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
      const data = await getFullTranslationWithGemini(text);

      return NextResponse.json({
        success: true,
        original: data.originalText,
        translated: data.literalTranslation,
        description: data.description,
        pronunciation: data.pronunciation,
      });
    }

    // 여러 텍스트 번역
    if (texts && Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map(async (t: string) => {
          const data = await getFullTranslationWithGemini(t);

          return {
            original: data.originalText,
            translated: data.literalTranslation, // 직역을 번역 결과로 전달
            description: data.description,
            pronunciation: data.pronunciation,
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
