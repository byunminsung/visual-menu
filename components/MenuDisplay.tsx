'use client';

import { MenuItem } from '@/types/menu';
import Image from 'next/image';

interface MenuDisplayProps {
  menuItems: MenuItem[];
}

export default function MenuDisplay({ menuItems }: MenuDisplayProps) {
  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">메뉴 분석 결과</h2>
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* 음식 이미지 */}
              <div className="flex-shrink-0">
                {item.imageUrl ? (
                  <div className="relative w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.translatedText}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
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
                )}
              </div>

              {/* 메뉴 정보 */}
              <div className="flex-1 space-y-3">
                {/* 원본 중국어 */}
                <div>
                  <span className="text-sm text-gray-500 font-medium">원본</span>
                  <p className="text-2xl font-bold text-gray-800">{item.originalText}</p>
                </div>

                {/* 한국어 번역 */}
                <div>
                  <span className="text-sm text-gray-500 font-medium">한국어</span>
                  <p className="text-xl text-gray-700">{item.translatedText}</p>
                </div>

                {/* 발음 */}
                <div>
                  <span className="text-sm text-gray-500 font-medium">발음</span>
                  <p className="text-lg text-blue-600 font-medium">{item.pronunciation}</p>
                </div>

                {/* 설명 */}
                {item.description && (
                  <div>
                    <span className="text-sm text-gray-500 font-medium">설명</span>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                )}

                {/* 카테고리와 가격 */}
                <div className="flex gap-4 pt-2">
                  {item.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  )}
                  {item.price && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {item.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
