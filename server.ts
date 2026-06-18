import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { calculateSaju } from "./src/lib/sajuCalculator";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit for any large JSON
  app.use(express.json({ limit: "10mb" }));

  // Helper to lazy-load and get GoogleGenAI client safely
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoint to handle Saju calculation & Gemini Enrichment
  app.post("/api/saju", async (req, res) => {
    try {
      const input = req.body;
      if (!input || !input.name || !input.birthDate) {
        res.status(400).json({ error: "필수 입력값(이름, 생년월일)이 누락되었습니다." });
        return;
      }

      // 1. Calculate Saju pillars and element balance deterministically
      const sajuReport = calculateSaju(input);

      // 2. Prepare visual guidance variables
      const woodCount = sajuReport.fiveElements.wood;
      const fireCount = sajuReport.fiveElements.fire;
      const earthCount = sajuReport.fiveElements.earth;
      const metalCount = sajuReport.fiveElements.metal;
      const waterCount = sajuReport.fiveElements.water;

      const solarText = input.isSolar === 'solar' ? '양력' : input.isSolar === 'lunar_uninterp' ? '음력(평달)' : '음력(윤달)';
      const timeText = input.birthTime || "시간 모름";

      // 3. Prompt engineering for therapeutic & insightful Korean Saju reading
      const prompt = `
당신은 사주명리학과 임상 심리학을 가르치고 연구하는 따뜻하고 깊이 있는 '마음 상담사'이자 '인생 가이드'입니다.
사주(사주팔자)를 통해 드러나는 기운의 강약을 단순한 길흉화복(吉凶禍福)이 아닌, '자신의 내면을 비추는 거울'이자 '스스로를 돌아보고 위로하는 심리 성찰의 도구'로 해석합니다.

아래 입력받은 사람의 정보를 바탕으로, 사주와 심리성찰이 어우러진 깊이 있고 따뜻한 맞춤형 '나를 돌아보는 성찰 리포트'를 한글로 가득 정성스럽게 작성해 주세요.

## 대상자 정보:
- 이름: ${input.name}
- 생년월일: ${input.birthDate} (${solarText})
- 태어난 시간: ${timeText}
- 현재 느끼는 주된 감정: ${input.emotion}
- 가장 성찰하고 돌아보고 싶은 인생의 영역: ${input.areasToReflect.join(", ")}

## 계산된 사주 원국 (사주팔자):
- 연주(년주): ${sajuReport.pillars.year.pillar} [요소: ${sajuReport.pillars.year.element}]
- 월주(월주): ${sajuReport.pillars.month.pillar} [요소: ${sajuReport.pillars.month.element}]
- 일주(일주): ${sajuReport.pillars.day.pillar} [요소: ${sajuReport.pillars.day.element}]
- 시주(시주): ${sajuReport.pillars.hour.pillar} [요소: ${sajuReport.pillars.hour.element}]

## 계산된 오행(五行) 밸런스 점수 (총 8개 기운):
- 목(木) (나무 - 시작, 유연성, 직관): ${woodCount}개
- 화(火) (불 - 열정, 표현력, 연결): ${fireCount}개
- 토(土) (흙 - 신뢰, 여유, 현실적 균형): ${earthCount}개
- 금(金) (쇠 - 결단, 성찰, 분별): ${metalCount}개
- water(水) (물 - 지혜, 심연, 수용): ${waterCount}개

---

## 리포트 작성 가이드라인 (반드시 지킬 것):
1. **어조와 목소리**: 아주 다정하고, 심오하며, 시적이고 위로가 되는 문체(반말이 아닌 '~합니다', '~하세요', '~입니다'체)를 사용합니다. 무속인이나 점술가가 아닌 영혼의 도반이자 차분한 인생 조언자의 어조여야 합니다.
2. **독창적인 해석 구성**:
   - **[1. 타고난 내면의 기운 (사주와 오행)]**: 주인공의 태어난 날 일주(${sajuReport.pillars.day.pillar})와 오행 분석 결과를 사유합니다. 오행 중 가장 풍부한 기운을 다루는 지혜와, 결핍되거나 부족한 기운을 내 삶에 채우는 실천적 조언을 포함해 주세요.
   - **[2. 감정의 흐름과 사주의 지혜 (심리 성찰)]**: 주인공이 오늘 가져온 감정인'${input.emotion}'이 사주 오행의 기운 배치와 어떻게 공명하고 있는지 설명하세요. (예: 물이 많아 감정이 가라앉았거나, 불이 부족해 피로를 느낀다거나 등 깊이 있고 감동적인 유기적 결합).
   - **[3. 선택한 영역('${input.areasToReflect.join(", ")}')에 대한 영적 조언 및 나 자신을 채우는 처방전]**: 주인공이 집중적으로 성찰하고 싶어 한 '${input.areasToReflect.join(", ")}' 영역에 맞게 삶의 방향성을 온화한 시선으로 다잡아 줍니다. 구체적인 일상 행동 처방(어떤 옷 색상, 행동, 생각의 습관)을 주면 더 신비롭고 현실적인 공감을 얻습니다.
3. **Markdown**: 구조화와 멋진 레이아웃을 위해 적극적으로 볼드, 인용구(>), 단락 등을 활용해 Markdown을 정성스럽게 작성해야 합니다.

출력 데이터는 아래 JSON 스키마에 완전히 부합해야 합니다.
`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mainReport: {
                type: Type.STRING,
                description: "The beautifully written Korean Markdown report blending Saju philosophy, psychological reflection, emotional comforting, and personalized guidance."
              },
              coreAdvice: {
                type: Type.STRING,
                description: "A single, highly elegant, poetic healing sentence summarizing the core heart message for the user (within 50-80 chars)."
              }
            },
            required: ["mainReport", "coreAdvice"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText.trim());

      sajuReport.mainReport = parsed.mainReport || "리포트를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      sajuReport.coreAdvice = parsed.coreAdvice || "때로는 비우는 것이 새로운 시작을 이끕니다. 오늘의 기운에 마음을 맡겨보세요.";

      res.json(sajuReport);
    } catch (error: any) {
      console.error("Gemini Saju API Error:", error);
      res.status(500).json({ error: error.message || "서버 통신 중 서버 측에 에러가 발생했습니다." });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Fallback all SPA routes to index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[나를 돌아보자 Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
