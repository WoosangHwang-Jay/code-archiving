import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Minhwa Symbolism Expert Personality: Jay Dosa
const expertSystem = `
  당신은 천 년의 지혜로 길을 비추는 운명의 조력자, 'Jay 도사(道士)'입니다. 
  전설적인 도사 전우치처럼 자신감 넘치고, 재치가 있으며, 때로는 익살스러운 말투를 사용합니다. 
  타로와 민화 상징을 자유자재로 다루며 사용자의 천명을 읽어주세요.
  말투는 "어허, 자네의 운명이 참으로 기운차구만!", "허허, 이 Jay 도사가 해결해주지!"와 같이 자신감 있고 역동적인 도사의 말투를 사용하세요.
  
  [민화 상징 가이드]
  - 호랑이: 액운을 막아주는 영물 (The Fool, Strength 등에 등장)
  - 소나무 & 학: 장수와 지조, 변치 않는 행운 (The Hermit, The Sun 등에 등장)
  - 모란꽃: 부귀영화와 풍요 (The Empress, The Sun에 등장)
  - 도깨비: 해학적 풍자와 금전적 행운 (The Devil에 등장)
  - 해와 달: 우주의 섭리와 직관 (The Moon, The Sun, The Emperor의 일월오봉도)
  - 저승사자: 새로운 시작을 위한 종결 (Death에 등장)
`;

export async function POST(req: Request) {
  try {
    const { mode, saju_data, tarot_cards, currentDateStr } = await req.json();

    if (!genAI) {
      return NextResponse.json({ error: 'API_KEY_MISSING' }, { status: 500 });
    }

    let prompt = "";

    if (mode === 'saju_only') {
      prompt = `
        ${expertSystem}
        사용자의 사주 오행 분포와 (${currentDateStr}) 기준의 운세를 분석해주세요.

        [사용자 사주 데이터]
        오행 분포: ${JSON.stringify(saju_data.elements)}
        팔자: ${saju_data.palja.join(', ')}

        보고서 지침:
        1. 오행의 세기를 바탕으로 현재 사용자가 보완해야 할 '색상'이나 '방향'을 민화적 감성으로 조언하세요.
        2. 연/월/일 운세를 명확히 나누어 작성하세요.
        3. 신비롭고 친절한 말투를 사용하세요.
      `;
    } else {
      prompt = `
        ${expertSystem}
        사용자의 사주와 직접 선택한 '민화 타로 카드' 3장을 결합하여 최종 예언을 작성해주세요.

        [사주 데이터]
        팔자: ${saju_data.palja.join(', ')}
        오행: ${JSON.stringify(saju_data.elements)}

        [선택된 민화 타로 카드]
        1. ${tarot_cards?.[0]?.name} (${tarot_cards?.[0]?.meaning})
        2. ${tarot_cards?.[1]?.name} (${tarot_cards?.[1]?.meaning})
        3. ${tarot_cards?.[2]?.name} (${tarot_cards?.[2]?.meaning})

        보고서 지침:
        1. 카드의 서양적 의미와 함께, 그림 속에 담긴 민화적 상징물(예: Tiger=Protection, Peony=Wealth 등)을 언급하며 해석의 깊이를 더해주세요.
        2. "민화가 들려주는 오늘의 이야기" 섹션을 포함하세요.
        3. 사용자의 고민을 꿰뚫어 보는 듯한 날카롭지만 따뜻한 조언을 제공하세요.
        4. 마크다운 형식을 사용하여 세련된 보고서 형태로 작성하세요.
      `;
    }

    // --- Fallback & Retry Logic for Stability ---
    // 2026년 4월 기준 최신 플래시 모델 라인업으로 마이그레이션 (3.1 및 2.5 시리즈)
    const modelsToTry = [
      { name: 'gemini-3.1-flash', version: 'v1', maxRetries: 3 },      // 2026년 최신 주력 모델
      { name: 'gemini-3.1-flash-lite', version: 'v1', maxRetries: 2 }, // 저지연/저비용 모델
      { name: 'gemini-2.5-flash', version: 'v1', maxRetries: 3 },      // 안정적인 2.5 시리즈
      { name: 'gemini-2.5-flash-lite', version: 'v1', maxRetries: 1 }  // 가벼운 대안
    ];
    let result;
    let lastError;
    let success = false;

    for (const config of modelsToTry) {
      if (success) break;
      
      const { name: modelName, version: apiVersion, maxRetries: maxAttemptsPerModel } = config;
      // getGenerativeModel의 두 번째 인자로 apiVersion을 명시합니다.
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
      let attempts = 0;

      while (attempts < maxAttemptsPerModel) {
        try {
          console.log(`Attempting interpretation with model: ${modelName} (${apiVersion}, Attempt ${attempts + 1})`);
          // 60초 타임아웃 설정 (복잡한 해석을 위해 시간 연장) 및 콘텐츠 생성
          result = await model.generateContent(prompt, { timeout: 60000 } as any);
          if (result) {
            success = true;
            break;
          }
        } catch (err: any) {
          attempts++;
          lastError = err;
          console.warn(`Gemini API [${modelName}] Attempt ${attempts} failed:`, err.message);
          
          // 404 에러(모델 없음) 발생 시 즉시 다음 모델로 전환
          const isNotFound = err.message?.includes('404') || err.message?.includes('not found');
          if (isNotFound) {
            console.warn(`Model ${modelName} not found (404), skipping immediately.`);
            break; 
          }

          const isRateLimit = err.message?.includes('429') || err.message?.includes('Quota');
          if (isRateLimit) {
            console.warn(`Rate limit (429) hit for ${modelName}, switching model immediately.`);
            break; 
          }

          if (attempts < maxAttemptsPerModel) {
            // 503(Service Unavailable)의 경우 조금 더 긴 대기 시간을 가짐
            const isServiceBusy = err.message?.includes('503') || err.message?.includes('Service Unavailable');
            const waitTime = isServiceBusy ? (attempts * 2000) : (attempts * 1000);
            await new Promise(res => setTimeout(res, waitTime));
          }
        }
      }
      
      if (!success) {
        console.warn(`Model ${modelName} failed. Trying next available model...`);
      }
    }

    if (!success || !result) {
      throw lastError || new Error('Failed to generate content after trying all models');
    }

    const text = result.response.text();
    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Gemini API Final Error:', error);
    
    // 에러 유형별 사용자 안내 메시지 최적화
    const isRateLimit = error.message?.includes('429') || error.message?.includes('Quota');
    const isServiceUnavailable = error.message?.includes('503') || error.message?.includes('Service Unavailable');
    
    let displayMessage = '사주 해석 중 일시적인 오류가 발생했습니다. 다시 시도해 주세요.';
    if (isRateLimit) {
      displayMessage = '오늘의 무료 이용 한도에 도달했습니다. 잠시 후 혹은 내일 다시 시도해 주세요.';
    } else if (isServiceUnavailable) {
      displayMessage = '현재 접속자가 많아 서비스가 지연되고 있습니다. 1~2분 후 다시 시도해 주세요.';
    } else {
      displayMessage = error.message || displayMessage;
    }
      
    return NextResponse.json({ error: displayMessage }, { status: 500 });
  }
}
