import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export async function POST(request: NextRequest) {
  let worker = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('🔍 Starting OCR recognition...');

    // Tesseract.js Worker 생성 및 설정
    // workerPath를 명시적으로 설정하여 Next.js와의 호환성 문제 해결
    worker = await createWorker('chi_sim', 1, {
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
        } else if (m.status) {
          console.log(`📝 ${m.status}`);
        }
      },
    });

    console.log('✅ Worker initialized');

    // OCR 수행
    const { data: { text } } = await worker.recognize(buffer);

    console.log('✅ OCR completed');
    console.log('📄 Extracted text preview:', text.substring(0, 200));

    // 텍스트를 줄 단위로 분리하고 빈 줄 제거
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // 중국어 문자가 포함된 줄만 필터링
    const chineseLines = lines.filter(line => 
      /[\u4e00-\u9fa5]/.test(line)
    );

    console.log(`📝 Found ${chineseLines.length} lines with Chinese characters`);

    if (chineseLines.length === 0) {
      return NextResponse.json(
        { error: 'No Chinese text detected in the image. Please upload an image with Chinese text.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: text,
      menuItems: chineseLines.slice(0, 10), // 최대 10개 메뉴 항목
    });

  } catch (error) {
    console.error('❌ OCR Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image', 
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Please try with a clearer image or check if the image contains Chinese text'
      },
      { status: 500 }
    );
  } finally {
    // Worker 종료 (메모리 누수 방지)
    if (worker) {
      try {
        await worker.terminate();
        console.log('🧹 Worker terminated');
      } catch (e) {
        console.error('Warning: Failed to terminate worker:', e);
      }
    }
  }
}

// Made with Bob
