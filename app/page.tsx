'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import MenuDisplay from '@/components/MenuDisplay';
import { MenuItem } from '@/types/menu';
import { analyzeMenuImage } from '@/services/menuAnalysis';

type ProcessingStep = 'idle' | 'ocr' | 'translate' | 'search' | 'complete';

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setMenuItems([]);
    setProcessingStep('ocr');

    try {
      console.log('🚀 Starting menu analysis...');
      
      // 이미지 분석 수행
      const items = await analyzeMenuImage(file);
      
      setProcessingStep('complete');
      setMenuItems(items);
      console.log('✅ Analysis complete!', items);
    } catch (err) {
      setError('메뉴 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('❌ Error analyzing menu:', err);
      setProcessingStep('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const getProcessingMessage = () => {
    switch (processingStep) {
      case 'ocr':
        return {
          icon: '🔍',
          title: 'OCR 처리 중...',
          message: '이미지에서 중국어 텍스트를 인식하고 있습니다. (5-10초 소요)',
        };
      case 'translate':
        return {
          icon: '🌐',
          title: '번역 중...',
          message: '중국어를 한국어로 번역하고 발음을 생성하고 있습니다.',
        };
      case 'search':
        return {
          icon: '🍽️',
          title: '이미지 검색 중...',
          message: '각 메뉴의 음식 사진을 찾고 있습니다.',
        };
      case 'complete':
        return {
          icon: '✅',
          title: '완료!',
          message: '메뉴 분석이 완료되었습니다.',
        };
      default:
        return null;
    }
  };

  const processingMessage = getProcessingMessage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              🍜 중국 메뉴판 번역기
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              메뉴판 사진을 업로드하면 한국어로 번역하고 발음을 알려드립니다
            </p>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 사용 방법 안내 */}
        <div className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">📱 사용 방법</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>중국 식당의 메뉴판 사진을 촬영하거나 준비합니다</li>
            <li>아래 영역에 이미지를 업로드합니다</li>
            <li>AI가 메뉴를 분석하고 한국어로 번역합니다 (약 10-20초 소요)</li>
            <li>각 메뉴의 발음과 설명, 실제 음식 사진을 확인합니다</li>
          </ol>
        </div>

        {/* 이미지 업로드 */}
        <ImageUpload onImageUpload={handleImageUpload} isProcessing={isProcessing} />

        {/* 처리 상태 메시지 */}
        {isProcessing && processingMessage && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="text-4xl animate-bounce">{processingMessage.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {processingMessage.title}
                  </h3>
                  <p className="text-blue-700">{processingMessage.message}</p>
                  
                  {/* 진행 바 */}
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className={`flex items-center ${processingStep === 'ocr' || processingStep === 'translate' || processingStep === 'search' || processingStep === 'complete' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${processingStep === 'ocr' || processingStep === 'translate' || processingStep === 'search' || processingStep === 'complete' ? 'bg-blue-600' : 'bg-gray-400'}`}></span>
                        OCR
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className={`flex items-center ${processingStep === 'translate' || processingStep === 'search' || processingStep === 'complete' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${processingStep === 'translate' || processingStep === 'search' || processingStep === 'complete' ? 'bg-blue-600' : 'bg-gray-400'}`}></span>
                        번역
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className={`flex items-center ${processingStep === 'search' || processingStep === 'complete' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${processingStep === 'search' || processingStep === 'complete' ? 'bg-blue-600' : 'bg-gray-400'}`}></span>
                        이미지
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className={`flex items-center ${processingStep === 'complete' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${processingStep === 'complete' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                        완료
                      </div>
                    </div>
                  </div>

                  {/* 로딩 애니메이션 */}
                  {processingStep !== 'complete' && (
                    <div className="mt-4">
                      <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메뉴 결과 표시 */}
        <MenuDisplay menuItems={menuItems} />

        {/* 기능 안내 */}
        {menuItems.length === 0 && !isProcessing && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">OCR 인식</h3>
              <p className="text-gray-600">
                이미지에서 중국어 텍스트를 자동으로 인식합니다
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">자동 번역</h3>
              <p className="text-gray-600">
                중국어를 한국어로 번역하고 발음을 표기합니다
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">음식 이미지</h3>
              <p className="text-gray-600">
                각 메뉴의 실제 음식 사진을 함께 보여드립니다
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>실제 OCR 및 번역 기능이 작동합니다!</strong>
            </p>
            <p className="text-sm">
              Tesseract.js (OCR) + MyMemory API (번역) + Unsplash (이미지)
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Made with Bob
