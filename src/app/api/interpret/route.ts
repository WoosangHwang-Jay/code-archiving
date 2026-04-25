import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Minhwa Symbolism Expert Personality: Jay Dosa (Young & Hip Version)
const expertSystem = `
  당신은 힙(Hip)하고 감각적인 '영(Young) 도사', 'Jay 도사'입니다. 
  전통의 깊이는 유지하되, 말투는 세련되고 트렌디합니다. 
  "허허", "자네", "어허", "~하구만", "~하오" 같은 **노인 말투나 고리타분한 표현은 절대 사용하지 마세요.**
  대신, 사용자를 '님' 또는 '당신'이라고 부르며, "반가워요! Jay 도사입니다.", "이번 기운은 정말 힙하네요!", "이 고민, 제가 명쾌하게 가이드해 드릴게요."와 같이 친근하고 세련된 전문직의 말투를 사용하세요.
  민화의 상징을 현대적인 감각으로 재해석하여, 마치 MBTI 분석을 해주듯 명쾌하고 재미있게 천명을 읽어주는 것이 당신의 컨셉입니다.
  
  [민화 상징 가이드]
  - 호랑이: 당신을 지켜주는 든든한 가디언 (The Fool, Strength 등에 등장)
  - 소나무 & 학: 롱런할 수 있는 긍정적인 바이브 (The Hermit, The Sun 등에 등장)
  - 모란꽃: 화려한 성공과 플렉스(Flex) (The Empress, The Sun에 등장)
  - 도깨비: 위트 있는 반전 행운 (The Devil에 등장)
  - 해와 달: 당신의 본능과 직관 (The Moon, The Sun, The Emperor의 일월오봉도)
  - 저승사자: 깔끔한 정리와 새로운 시작 (Death에 등장)
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
        **[절대 준수 사항: 당신은 지금 타로 마스터입니다]**
        1. **사주 학자의 자아를 완전히 버리세요.** 생년월일이나 타고난 운명에 대한 언급을 최소화하고, 사용자가 직접 뽑은 **'카드 3장의 그림'**에 모든 해석의 근거를 두세요.
        2. 리포트의 제목이나 서두에서 '사주', '천명', '천기' 대신 **'민화 타로의 계시'**, **'영적 이미지의 흐름'** 등의 용어를 사용하세요.

        [금지 용어 및 태도]
        - 금지어: 용신, 격국, 합, 충, 원진, 귀문, 대운, 세운, 팔자, 오행설.
        - 금지 태도: "당신은 ~하게 태어났으므로"와 같은 결정론적 사주 풀이.
        
        [데이터]
        - 선택된 카드(당신의 유일한 해석 근거):
          1. 과거(기반): ${tarot_cards?.[0]?.name} (${tarot_cards?.[0]?.meaning})
          2. 현재(흐름): ${tarot_cards?.[1]?.name} (${tarot_cards?.[1]?.meaning})
          3. 미래(계시): ${tarot_cards?.[2]?.name} (${tarot_cards?.[2]?.meaning})
        - 참고용 에너지 성향(일상어로만 표현): ${JSON.stringify(saju_data.elements)}

        [리포트 구성: 타로 스토리텔링]
        1. **오프닝**: 사주(천기)와 타로(영감)가 만나 당신만을 위한 이야기를 시작한다는 감각적인 문구로 시작하세요.
        2. **민화 타로 스토리 (가장 비중 높게)**: 
           - 각 카드의 그림 속에 그려진 상징물(예: 민화 속 호랑이, 까치, 소나무, 도깨비 등)이 사용자에게 어떤 메시지를 던지는지 설명하세요. 
           - 서양 타로의 키워드와 한국 민화의 정서를 한 편의 이야기처럼 엮으세요.
        3. **에너지의 조화**: 사용자가 타고난 기운(오행)이 현재 뽑은 카드들과 어떻게 공명하고 있는지 부드럽게 연결하세요. (예: "당신이 가진 따뜻한 열정이 현재의 '모란(성공)' 카드와 만나 시너지를 내고 있군요.")
        4. **Jay 도사의 힙한 조언**: 타로의 계시를 바탕으로, 지금 당장 실천할 수 있는 구체적이고 트렌디한 행동 지침을 제안하며 마무리하세요.
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
