import { SajuInput, SajuReport, SajuPillar, FiveElementsCount, LifeBalanceScores } from "../types";

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const BRANCHES_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const ELEMENT_MAP: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  "갑": "wood", "을": "wood", "인": "wood", "묘": "wood",
  "병": "fire", "정": "fire", "사": "fire", "오": "fire",
  "무": "earth", "기": "earth", "축": "earth", "진": "earth", "미": "earth", "술": "earth",
  "경": "metal", "신": "metal", "유": "metal",
  "임": "water", "계": "water", "자": "water", "해": "water"
};

// Also handle the extra cases where English characters are mapped or specific Korean names
const ELEMENT_NAMES_KO = {
  wood: "목 (木 - 나무)",
  fire: "화 (火 - 불)",
  earth: "토 (土 - 흙)",
  metal: "금 (金 - 쇠)",
  water: "수 (水 - 물)"
};

const ELEMENT_MEANING = {
  "갑": "큰 나무처럼 뻗어나가는 성장과 개척의 기운",
  "을": "어려움 속에서도 피어나는 유연한 화초와 적응의 기운",
  "병": "태양처럼 누리를 밝히는 정의롭고 정열적인 에너지",
  "정": "밤하늘의 별빛이나 촛불처럼 따뜻하고 사려 깊은 포용",
  "무": "드넓은 대지와 광활한 대산처럼 굳건하고 흔들림 없는 신뢰",
  "기": "기름진 텃밭과 정원처럼 다정하고 생명을 길러내는 포용력",
  "경": "가공되지 않은 단단한 암석과 검처럼 결단력 있고 단단한 정의감",
  "신": "가공된 보석처럼 내면 지향적이고 정교하며 빛나는 감수성",
  "임": "도도하게 흐르는 강물과 바다처럼 깊은 지혜와 포용력",
  "계": "촉촉이 내리는 봄비나 이슬처럼 맑고 여리며 영적인 지혜",
  "자": "지혜롭고 영특하며 차분하고 내면에 집중하는 물의 기운",
  "축": "느리지만 성실하게 한 걸음씩 내디디며 단단히 다지는 흙의 기운",
  "인": "진취적이고 모험적이며 새로운 씨앗을 틔우고자 하는 역동적인 기운",
  "묘": "유연하며 상상력이 풍부하고 감각적인 예술가적 기운",
  "진": "웅장하게 비상하고 다재다능하며 조화를 이루는 변화무쌍한 기운",
  "사": "번뜩이는 지성, 예리한 통찰력과 화려하게 꽃피는 빛의 기운",
  "오": "솔직하고 열정적이며 앞을 향해 힘차게 도약하는 불꽂 같은 발산",
  "미": "내면에 단단한 결실을 기르고 평화를 추구하는 다정함",
  "신(申)": "순발력 있고 재치 넘치며 냉정한 자기 제어와 창조의 기운",
  "유": "청결하고 완벽함을 추구하며 가을의 수확처럼 예리한 분별력",
  "술": "진실되고 충직하며 내면의 안식처를 찾아가는 은둔과 성찰의 기운",
  "해": "경계 없는 드넓은 내적 수용력과 사색을 즐기는 지혜"
};

function getStemElement(stem: string): string {
  const el = ELEMENT_MAP[stem];
  if (el === "wood") return "목(木)";
  if (el === "fire") return "화(火)";
  if (el === "earth") return "토(土)";
  if (el === "metal") return "금(金)";
  return "수(水)";
}

function getBranchElement(branch: string): string {
  const el = ELEMENT_MAP[branch];
  if (el === "wood") return "목(木)";
  if (el === "fire") return "화(火)";
  if (el === "earth") return "토(土)";
  if (el === "metal") return "금(金)";
  return "수(水)";
}

export function calculateSaju(input: SajuInput): SajuReport {
  const birthDate = new Date(input.birthDate);
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();
  
  // 1. Year Pillar (연주)
  // Let 1984 be "갑자(甲子)" (Stem index 0, Branch index 0)
  // 1984-4 = 1980 % 10 = 0 (갑), % 12 = 0 (자)
  let yStemIdx = (year - 4) % 10;
  if (yStemIdx < 0) yStemIdx += 10;
  let yBranchIdx = (year - 4) % 12;
  if (yBranchIdx < 0) yBranchIdx += 12;
  
  const yearStem = STEMS[yStemIdx];
  const yearStemHanja = STEMS_HANJA[yStemIdx];
  const yearBranch = BRANCHES[yBranchIdx];
  const yearBranchHanja = BRANCHES_HANJA[yBranchIdx];
  
  // 2. Month Pillar (월주)
  // Standard solar month stems are determined by Year Stem (yStemIdx)
  // and the Month. Standard calculation:
  // Month Branch: Month of lunar/solar. Let's approximate: Month index:
  // January (approx Tiger 寅, Branch 2), February (Rabbit 卯, Branch 3) etc.
  // We use (month + 1) % 12
  const mBranchIdx = (month + 1) % 12;
  const monthBranch = BRANCHES[mBranchIdx];
  const monthBranchHanja = BRANCHES_HANJA[mBranchIdx];
  
  // Month Stem: (Year Stem index * 2 + (month + 1)) % 10 or standard table
  // Traditional rule: 
  // - 甲己 Year starts with 丙寅 (index 2)
  // - 乙庚 Year starts with 戊寅 (index 4)
  // - 丙辛 Year starts with 庚寅 (index 6)
  // - 丁壬 Year starts with 壬寅 (index 8)
  // - 戊癸 Year starts with 甲寅 (index 0)
  let baseMonthStem = 0;
  if (yStemIdx === 0 || yStemIdx === 5) baseMonthStem = 2; // 丙
  else if (yStemIdx === 1 || yStemIdx === 6) baseMonthStem = 4; // 戊
  else if (yStemIdx === 2 || yStemIdx === 7) baseMonthStem = 6; // 庚
  else if (yStemIdx === 3 || yStemIdx === 8) baseMonthStem = 8; // 壬
  else if (yStemIdx === 4 || yStemIdx === 9) baseMonthStem = 0; // 甲
  
  const mStemIdx = (baseMonthStem + (month - 1)) % 10;
  const monthStem = STEMS[mStemIdx];
  const monthStemHanja = STEMS_HANJA[mStemIdx];

  // 3. Day Pillar (일주)
  // Days elapsed from a known reference date.
  // Reference date: Jan 1, 1980 was "계해(癸亥)" (Stem: 계[9], Branch: 해[11])
  // Or let's use exact millis difference.
  const refDate = new Date(Date.UTC(1980, 0, 1));
  const currentDate = new Date(Date.UTC(year, month - 1, day));
  const diffTime = Math.abs(currentDate.getTime() - refDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Jan 1, 1980 stem: 계 (9), branch: 해 (11)
  let dStemIdx = (9 + (currentDate.getTime() >= refDate.getTime() ? diffDays : -diffDays)) % 10;
  if (dStemIdx < 0) dStemIdx += 10;
  let dBranchIdx = (11 + (currentDate.getTime() >= refDate.getTime() ? diffDays : -diffDays)) % 12;
  if (dBranchIdx < 0) dBranchIdx += 12;
  
  const dayStem = STEMS[dStemIdx];
  const dayStemHanja = STEMS_HANJA[dStemIdx];
  const dayBranch = BRANCHES[dBranchIdx];
  const dayBranchHanja = BRANCHES_HANJA[dBranchIdx];

  // 4. Hour Pillar (시주)
  // Hour Branch is fixed based on time range 
  let hBranchIdx = 0;
  if (input.birthTime) {
    const [hoursStr, minutesStr] = input.birthTime.split(":");
    const hours = parseInt(hoursStr) || 0;
    const minutes = parseInt(minutesStr) || 0;
    const totalMinutes = hours * 60 + minutes;
    
    // Saju double hours shift at half hours (e.g. 23:30 to 01:29 is Rat 자)
    // 23:30 is 1410 minutes, 1:30 is 90 mins, etc.
    // Shift all by 30 mins to make ranges align with multiples of 120 minutes.
    const shiftedMins = (totalMinutes + 30) % 1440;
    hBranchIdx = Math.floor(shiftedMins / 120);
  } else {
    // If no birth time, default to '진' (center of day) or deterministic index based on name
    hBranchIdx = (input.name.charCodeAt(0) || 0) % 12;
  }
  
  const hourBranch = BRANCHES[hBranchIdx];
  const hourBranchHanja = BRANCHES_HANJA[hBranchIdx];
  
  // Hour Stem: Traditional Saju rule based on Day Stem
  // - 甲己 Day starts with 甲子 (index 0)
  // - 乙庚 Day starts with 丙子 (index 2)
  // - 丙辛 Day starts with 戊子 (index 4)
  // - 丁壬 Day starts with 庚子 (index 6)
  // - 戊癸 Day starts with 壬子 (index 8)
  let baseHourStem = 0;
  if (dStemIdx === 0 || dStemIdx === 5) baseHourStem = 0; // 甲
  else if (dStemIdx === 1 || dStemIdx === 6) baseHourStem = 2; // 丙
  else if (dStemIdx === 2 || dStemIdx === 7) baseHourStem = 4; // 戊
  else if (dStemIdx === 3 || dStemIdx === 8) baseHourStem = 6; // 庚
  else if (dStemIdx === 4 || dStemIdx === 9) baseHourStem = 8; // 壬
  
  const hStemIdx = (baseHourStem + hBranchIdx) % 10;
  const hourStem = STEMS[hStemIdx];
  const hourStemHanja = STEMS_HANJA[hStemIdx];

  // 5. Gather character values and meanings
  const yearPillar: SajuPillar = {
    pillar: `${yearStem}${yearBranch} (${yearStemHanja}${yearBranchHanja})`,
    element: `${getStemElement(yearStem)} / ${getBranchElement(yearBranch)}`,
    meaning: `연주(조상의 덕/유년기): ${ELEMENT_MEANING[yearStem] || ""} 그리고 ${ELEMENT_MEANING[yearBranch] || ""}`
  };

  const monthPillar: SajuPillar = {
    pillar: `${monthStem}${monthBranch} (${monthStemHanja}${monthBranchHanja})`,
    element: `${getStemElement(monthStem)} / ${getBranchElement(monthBranch)}`,
    meaning: `월주(부모 형제/청년기): ${ELEMENT_MEANING[monthStem] || ""} 그리고 ${ELEMENT_MEANING[monthBranch] || ""}`
  };

  const dayPillar: SajuPillar = {
    pillar: `${dayStem}${dayBranch} (${dayStemHanja}${dayBranchHanja})`,
    element: `${getStemElement(dayStem)} / ${getBranchElement(dayBranch)}`,
    meaning: `일주(본인 자신/중년기): ${ELEMENT_MEANING[dayStem] || ""} 그리고 ${ELEMENT_MEANING[dayBranch] || ""}`
  };

  const hourPillar: SajuPillar = {
    pillar: `${hourStem}${hourBranch} (${hourStemHanja}${hourBranchHanja})`,
    element: `${getStemElement(hourStem)} / ${getBranchElement(hourBranch)}`,
    meaning: `시주(자녀/노년기): ${ELEMENT_MEANING[hourStem] || ""} 그리고 ${ELEMENT_MEANING[hourBranch] || ""}`
  };

  // Convert "신" branch to "신(申)" to find correct element meaning mapping
  const branchKeyFix = (b: string) => b === "신" ? "신(申)" : b;

  // 6. Five Elements Balance (오행 점수 분배 - 8글자 계수)
  const elements = [
    ELEMENT_MAP[yearStem], ELEMENT_MAP[yearBranch],
    ELEMENT_MAP[monthStem], ELEMENT_MAP[monthBranch],
    ELEMENT_MAP[dayStem], ELEMENT_MAP[dayBranch],
    ELEMENT_MAP[hourStem], ELEMENT_MAP[hourBranch]
  ];

  const fiveElements: FiveElementsCount = {
    wood: elements.filter(e => e === "wood").length,
    fire: elements.filter(e => e === "fire").length,
    earth: elements.filter(e => e === "earth").length,
    metal: elements.filter(e => e === "metal").length,
    water: elements.filter(e => e === "water").length
  };

  // 7. Life Balance Scores (마음, 관계, 일, 현실, 성장)
  // Deterministic scores based on Five Elements counts and chosen areas
  // Primary elements affect balances:
  // - 마음(mind): Wood + Water
  // - 관계(relationship): Fire + Earth
  // - 일(work): Metal + Fire
  // - 현실(reality): Earth + Metal
  // - 성장(growth): Wood + Water
  // Introduce a slight shift based on birth month/day & name to make it unique per person
  const nameHash = Array.from(input.name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  const scoreBase = (primaryCount: number, secondaryCount: number, offset: number) => {
    const computed = 50 + (primaryCount * 10) + (secondaryCount * 5) + (nameHash % 25) + offset;
    return Math.min(100, Math.max(30, computed));
  };

  const balanceScores: LifeBalanceScores = {
    mind: scoreBase(fiveElements.water, fiveElements.wood, (input.emotion === "편안함" ? 10 : input.emotion === "불안함" ? -15 : 0)),
    relationship: scoreBase(fiveElements.fire, fiveElements.earth, (input.areasToReflect.includes("관계") ? 5 : 0)),
    work: scoreBase(fiveElements.metal, fiveElements.fire, (input.areasToReflect.includes("일") ? 8 : 0)),
    reality: scoreBase(fiveElements.earth, fiveElements.metal, (input.areasToReflect.includes("현실") ? 5 : 0)),
    growth: scoreBase(fiveElements.wood, fiveElements.water, (input.areasToReflect.includes("성장") ? 10 : 0))
  };

  return {
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    },
    fiveElements,
    balanceScores,
    mainReport: "", // Back-end will generate or populate this
    coreAdvice: "", // Back-end will generate or populate this
    createdAt: new Date().toISOString()
  };
}
