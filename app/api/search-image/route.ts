import { NextRequest, NextResponse } from 'next/server';

/**
 * 이미지 검색 API
 * 
 * 사용 가능한 대안들:
 * 1. Pexels API - 무료, 시간당 200 요청
 * 2. Pixabay API - 무료, 시간당 100 요청, 5000/일
 * 3. Unsplash API - 무료, 시간당 50 요청
 * 4. Google Custom Search API - 하루 100 요청 무료
 * 5. Bing Image Search API - 월 1000 트랜잭션 무료
 */

// 환경 변수에서 API 키 가져오기
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

import * as cheerio from 'cheerio';

// 직접 구글 이미지 검색 스크래핑을 통한 결과 가져오기 (API 제한 우회)
async function scrapeGoogleImage(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' chinese dish')}&udm=2`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Scraper HTTP error! Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Google 이미지 검색 결과 HTML 구조에서 이미지 URL 추출 시도
    let imageUrl: string | null = null;

    // 정규식을 사용하여 첫 번째 진짜 이미지 URL 찾기 시도
    // 구글 이미지 스크립트 내부에서 url 찾아내기
    const urls = html.match(/\["([^"]+\.(?:jpg|jpeg|png|webp))",\d+,\d+\]/i);
    if (urls && urls[1]) {
      // url 디코딩 처리 (\u003d -> =)
      imageUrl = urls[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
    }

    if (imageUrl) {
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.error('Google scraping error:', error);
    return null;
  }
}

// Pexels API로 이미지 검색
async function searchPexelsImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    console.log('⚠️ Pexels API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' chinese food')}&per_page=1&orientation=square`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium;
    }

    return null;
  } catch (error) {
    console.error('Pexels search error:', error);
    return null;
  }
}

// Pixabay API로 이미지 검색
async function searchPixabayImage(query: string): Promise<string | null> {
  if (!PIXABAY_API_KEY) {
    console.log('⚠️ Pixabay API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query + ' chinese food')}&image_type=photo&per_page=3&safesearch=true`
    );

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      return data.hits[0].webformatURL;
    }

    return null;
  } catch (error) {
    console.error('Pixabay search error:', error);
    return null;
  }
}

// Unsplash API로 이미지 검색
async function searchUnsplashImage(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('⚠️ Unsplash API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' chinese food')}&per_page=1&orientation=squarish`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Unsplash search error:', error);
    return null;
  }
}

// 폴백 이미지 매핑 (API가 없을 때 사용)
function getFallbackImage(dishName: string): string {
  // 일반적인 중국 음식 카테고리별 플레이스홀더
  const fallbackImages: { [key: string]: string } = {
    '궁바오지딩': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    '마파두부': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop',
    '베이징카오야': 'https://images.unsplash.com/photo-1583935909166-6d14a6b5e1c0?w=400&h=400&fit=crop',
    '샤오롱바오': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop',
    '산라탕': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
  };

  // 부분 매칭
  for (const [key, value] of Object.entries(fallbackImages)) {
    if (dishName.includes(key) || key.includes(dishName)) {
      return value;
    }
  }

  // 기본 중국 음식 이미지
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop';
}

// 우선순위에 따라 이미지 검색 (Google → Pixabay → Unsplash → Fallback)
async function searchImage(query: string): Promise<string> {
  console.log(`🔍 Searching image for: ${query}`);

  // 1순위: Google 직접 스크래핑 검색
  let imageUrl = await scrapeGoogleImage(query);
  if (imageUrl) {
    console.log('✅ Found image from Google Scraper');
    return imageUrl;
  }

  // 2순위: Pixabay
  imageUrl = await searchPixabayImage(query);
  if (imageUrl) {
    console.log('✅ Found image from Pixabay');
    return imageUrl;
  }

  // 3순위: Unsplash (시간당 50 요청)
  imageUrl = await searchUnsplashImage(query);
  if (imageUrl) {
    console.log('✅ Found image from Unsplash');
    return imageUrl;
  }

  // 폴백: 미리 정의된 이미지
  console.log('⚠️ Using fallback image');
  return getFallbackImage(query);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(`🔍 [API:SearchImage] Received request with body keys:`, Object.keys(body));
    const { query, queries } = body;

    if (!query && !queries) {
      return NextResponse.json(
        { error: 'No query provided' },
        { status: 400 }
      );
    }

    // 단일 검색
    if (query) {
      console.log(`🔍 [API:SearchImage] Processing single query: "${query}"`);
      const imageUrl = await searchImage(query);

      return NextResponse.json({
        success: true,
        query,
        imageUrl,
      });
    }

    // 여러 검색
    if (queries && Array.isArray(queries)) {
      console.log(`🔍 [API:SearchImage] Processing ${queries.length} multiple queries...`);
      const results = await Promise.all(
        queries.map(async (q: string) => {
          const imageUrl = await searchImage(q);
          return {
            query: q,
            imageUrl,
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
    console.error('Image search API Error:', error);
    return NextResponse.json(
      { error: 'Image search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Made with Bob
