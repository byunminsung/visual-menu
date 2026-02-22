import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is not configured in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: GEMINI_API_KEY is missing.' },
        { status: 500 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`� [API:Analyze] Starting Gemini Vision analysis for ${file.name} (${bytes.byteLength} bytes)...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Define JSON Schema for the extraction
    const schema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        detectedLanguage: {
          type: SchemaType.STRING,
          description: "The primary language the menu items are written in (e.g., 'Chinese', 'French', 'Japanese', 'English')",
        },
        menuItems: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: "The extracted original names of the food dishes in the detected language",
        },
      },
      required: ["detectedLanguage", "menuItems"],
    };

    const prompt = `
      You are an expert at parsing noisy OCR text and reading restaurant menus from anywhere in the world.
      I am providing you with an image of a restaurant menu. Your task is to detect the primary language of the menu, and extract ALL the names of the food dishes you can find in the image in that original language.
      
      Rules:
      - Detect the primary language of the dish names (e.g., 'Chinese', 'Korean', 'Japanese', 'French', 'Spanish', etc.).
      - Extract strings that are clearly food dish names in the detected language.
      - EXHAUSTIVE EXTRACTION: Do NOT stop at 10 items. You MUST extract EVERY SINGLE legitimate dish name present in the menu.
      - IGNORE prices (like 12.95, $5, 1500¥, etc).
      - IGNORE translations if the menu is bilingual (extract the primary original language dish names).
      - IGNORE single random characters or non-food items.
      - Clean up any obvious typos if you recognize the dish name.
      - Do NOT include any explanations, Markdown formatting, or extra text.
    `;

    // Construct image payload for Gemini
    const imageParts = [
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: file.type || 'image/jpeg',
        },
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);
    const primaryLanguage = parsedData.detectedLanguage;
    const extractedLines: string[] = parsedData.menuItems || [];

    console.log(`🤖 Gemini extracted ${extractedLines.length} menu items in ${primaryLanguage}:`, extractedLines);

    if (!extractedLines || extractedLines.length === 0) {
      console.warn('⚠️ [API:Analyze] No dish names detected in the image');
      return NextResponse.json(
        { error: 'No menu items detected in the image. Please upload a clearer image.' },
        { status: 400 }
      );
    }

    console.log(`✅ [API:Analyze] Returning ${extractedLines.length} menu items to client`);
    return NextResponse.json({
      success: true,
      detectedLanguage: primaryLanguage,
      text: extractedLines.join(', '), // fallback raw text representation
      menuItems: extractedLines, // Return all parsed items
    });

  } catch (error) {
    console.error('❌ Vision API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Please try with a clearer image or check if the image contains menu items'
      },
      { status: 500 }
    );
  }
}
