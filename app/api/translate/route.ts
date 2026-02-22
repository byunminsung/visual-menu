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

// 원본 언어를 대상 언어로 번역, 설명, 발음으로 변환 (Gemini API 사용)
async function getFullTranslationWithGemini(originalText: string, sourceLang: string, targetLang: string): Promise<TranslationData> {
  const apiKey = process.env.GEMINI_API_KEY;
  // 기본 폴백 데이터
  const fallback: TranslationData = {
    originalText: originalText,
    literalTranslation: originalText,
    description: '설명을 가져올 수 없습니다.',
    pronunciation: originalText
  };

  if (!apiKey) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert bilingual ${sourceLang}-${targetLang} food translator.
      I will provide you with a ${sourceLang} dish name.
      Provide the following three pieces of information formatted EXACTLY as a JSON object, with no other text:
      
      1. "literalTranslation": A literal translation or the closest equivalent name of the dish into ${targetLang}.
      2. "description": A natural, appetizing description of what the dish actually is, written in ${targetLang}.
      3. "pronunciation": The phonetic pronunciation of the original ${sourceLang} dish name, written using the alphabet or phonetic system of ${targetLang} (e.g., Hangul if target is Korean, alphabet if target is English).
      
      ${sourceLang} Dish Name: ${originalText}
      
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
      originalText: originalText,
      literalTranslation: parsedData.literalTranslation || originalText,
      description: parsedData.description || '음식 설명',
      pronunciation: parsedData.pronunciation || originalText,
    };
  } catch (error) {
    console.error('Gemini Translation Error:', error);
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, texts, sourceLanguage, targetLanguage } = await request.json();

    const srcLang = sourceLanguage || 'Unknown';
    const tgtLang = targetLanguage || 'Korean';

    if (!text && !texts) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // 단일 텍스트 번역
    if (text) {
      const data = await getFullTranslationWithGemini(text, srcLang, tgtLang);

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
          const data = await getFullTranslationWithGemini(t, srcLang, tgtLang);

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
