'use client';

import { createWorker } from 'tesseract.js';

export async function processImageWithOCR(file: File): Promise<string[]> {
  console.log('🔍 Starting client-side OCR...');
  
  const worker = await createWorker('chi_sim', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  console.log('✅ Worker initialized');

  const { data: { text } } = await worker.recognize(file);

  console.log('✅ OCR completed');
  console.log('📄 Extracted text preview:', text.substring(0, 200));

  await worker.terminate();
  console.log('🧹 Worker terminated');

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
    throw new Error('No Chinese text detected in the image');
  }

  return chineseLines.slice(0, 10); // 최대 10개 메뉴 항목
}

// Made with Bob
