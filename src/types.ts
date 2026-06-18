export interface SajuInput {
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  birthTime: string; // "HH:MM" or ""
  isSolar: 'solar' | 'lunar_uninterp' | 'lunar_interp'; // 양력, 음력 평달, 음력 윤달
  emotion: string; // 오늘의 감정 (e.g. 편안함, 피로함, 설렘, 불안함, 혼란스러움, 열정적)
  areasToReflect: string[]; // 마음, 관계, 일, 현실, 성장
}

export interface FiveElementsCount {
  wood: number;  // 木 (목)
  fire: number;  // 火 (화)
  earth: number; // 土 (토)
  metal: number; // 金 (금)
  water: number; // 水 (수)
}

export interface LifeBalanceScores {
  mind: number;        // 마음/정신성
  relationship: number; // 관계/사회성
  work: number;         // 일/목표
  reality: number;      // 현실/안정
  growth: number;       // 성장/학습
}

export interface SajuPillar {
  pillar: string; // e.g. "갑진 (甲辰)"
  element: string; // e.g. "목/토"
  meaning: string; // 의미 설명
}

export interface SajuReport {
  pillars: {
    year: SajuPillar;
    month: SajuPillar;
    day: SajuPillar;
    hour: SajuPillar;
  };
  fiveElements: FiveElementsCount;
  balanceScores: LifeBalanceScores;
  mainReport: string; // Markdown formatted detailed healing report
  coreAdvice: string; // 1-sentence healing advice
  createdAt: string; // ISO String
}

export interface Journal {
  id?: string;
  userId: string;
  input: SajuInput;
  report: SajuReport;
  notes?: string; // 개인 회고 메모
  createdAt: any; // Firestore Timestamp
}
