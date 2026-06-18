import React, { useState } from "react";
import { SajuReport, SajuInput } from "../types";
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Mail, 
  Bookmark, 
  Plus, 
  ArrowLeft,
  PenTool,
  BookmarkCheck,
  Heart,
  Briefcase,
  Coins,
  Calendar,
  Braces,
  Printer
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

interface SajuResultProps {
  input: SajuInput;
  report: SajuReport;
  user: User | null;
  onReset: () => void;
  onSaveSuccess?: () => void;
  signInWithGoogle: () => Promise<User | null>;
}

const ELEMENT_STYLES: Record<string, { bg: string, text: string, name: string, colorClass: string }> = {
  wood: { bg: "bg-[#141416] border-emerald-950", text: "text-emerald-400", name: "목 (木 - 나무)", colorClass: "bg-emerald-500" },
  fire: { bg: "bg-[#141416] border-rose-950", text: "text-rose-400", name: "화 (火 - 불)", colorClass: "bg-rose-500" },
  earth: { bg: "bg-[#141416] border-[#C5A059]/20", text: "text-[#C5A059]", name: "토 (土 - 흙)", colorClass: "bg-[#C5A059]" },
  metal: { bg: "bg-[#141416] border-zinc-800", text: "text-zinc-300", name: "금 (金 - 쇠)", colorClass: "bg-zinc-400" },
  water: { bg: "bg-[#141416] border-sky-950", text: "text-sky-400", name: "수 (水 - 물)", colorClass: "bg-sky-600" },
};

export default function SajuResult({ input, report, user, onReset, onSaveSuccess, signInWithGoogle }: SajuResultProps) {
  const [copied, setCopied] = useState(false);
  const [personalNote, setPersonalNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCopy = async () => {
    try {
      const summaryText = `
✨ 나를 돌아보자 - 성찰 리포트 (사주 & 내면 거울) ✨
-----------------------------------------
👤 대상자: ${input.name} 님
📅 태어난 일시: ${input.birthDate} (${input.isSolar === 'solar' ? '양력' : '음력'}) ${input.birthTime || ""}
💖 현재 내 안의 감정: ${input.emotion}
🌱 오늘 돌아보고 싶은 영역: ${input.areasToReflect.join(', ')}

[사주 사주원국 기운]
- 연주(조상/소년): ${report.pillars.year.pillar} (${report.pillars.year.element})
- 월주(부모/청년): ${report.pillars.month.pillar} (${report.pillars.month.element})
- 일주(본인/중년): ${report.pillars.day.pillar} (${report.pillars.day.element})
- 시주(자녀/말년): ${report.pillars.hour.pillar} (${report.pillars.hour.element})

[오행(五行) 기운 밸런스]
- 목(木): ${report.fiveElements.wood}
- 화(火): ${report.fiveElements.fire}
- 토(土): ${report.fiveElements.earth}
- 금(金): ${report.fiveElements.metal}
- 수(水): ${report.fiveElements.water}

[한 줄의 지혜]
"${report.coreAdvice}"

[전체 리포트 성찰 본문]
${report.mainReport}

-----------------------------------------
"나를 더 깊이 사랑하고 올바르게 세우는 시간"
"나를 돌아보자 (Reflect on Myself)"
      `;
      await navigator.clipboard.writeText(summaryText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("복사에 실패했습니다.", err);
    }
  };

  const handleSaveToJournal = async () => {
    let activeUser = user;
    if (!activeUser) {
      // Prompt OAuth or sign in
      try {
        const loggedUser = await signInWithGoogle();
        if (!loggedUser) return;
        activeUser = loggedUser;
      } catch (err) {
        setErrorMsg("기록장에 담기 위해 로그인이 필요합니다.");
        return;
      }
    }

    setSaving(true);
    setErrorMsg("");
    try {
      // Store to Firestore under standard "journals" collection
      await addDoc(collection(db, "journals"), {
        userId: activeUser.uid,
        input,
        report,
        notes: personalNote.trim(),
        createdAt: serverTimestamp(),
      });

      setSaved(true);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err: any) {
      console.error("Firestore Save Error:", err);
      setErrorMsg("성찰 기록 저상에 실패했습니다. 규칙 설정 또는 통신 에러 가능성이 있습니다.");
      handleFirestoreError(err, OperationType.CREATE, "journals");
    } finally {
      setSaving(false);
    }
  };

  const getFormattedDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const downloadTxt = () => {
    const solarText = input.isSolar === 'solar' ? '양력' : input.isSolar === 'lunar_uninterp' ? '음력(평달)' : '음력(윤달)';
    const categories = input.areasToReflect.join(', ');
    const timeText = input.birthTime || "시간 모름";
    
    const textContent = `===========================================
[사이트명] 나를 돌아보자 - 사주 & 마음 위무 성찰 리포트
===========================================

■ 사용자 기본 정보
-------------------------------------------
- 이름: ${input.name}
- 생년월일: ${input.birthDate} (${solarText})
- 태어난 시간: ${timeText}
- 오늘의 감정: ${input.emotion}
- 돌아보고 싶은 영역: ${categories}

■ 전체 사주/성찰 리포트
-------------------------------------------
${report.mainReport}

■ 연애운 (인연과 마음의 연결)
-------------------------------------------
${report.loveLuck || "자신을 사랑하고 신뢰하는 데서 시작합니다. 마음을 잔잔히 비우면 영혼의 기운이 온화한 인연을 비춥니다."}

■ 직업운 (일과 세상으로의 온건한 전진)
-------------------------------------------
${report.jobLuck || "꾸준하고 우직한 정성이 사주의 부족함을 채워 줍니다. 고집보다 성실함이 재능의 만개로 인도합니다."}

■ 재물운 (물질의 다스림과 마음의 여유)
-------------------------------------------
${report.wealthLuck || "진정한 부는 외부의 축적이 아닌 내면의 든든함에서 시작됩니다. 급한 욕심을 내려놓으면 흐름이 안정을 찾습니다."}

■ 올해운 (올해 흐르는 시기적인 지혜)
-------------------------------------------
${report.yearLuck || "스스로를 성찰하고 성숙하게 하기에 참 좋은 시기입니다. 겉보기와는 무관하게 단단한 성장의 밑거름이 될 것입니다."}

■ 오늘의 조언
-------------------------------------------
"${report.coreAdvice}"

===========================================
나를 돌아보며 기르는 시간. 언제나 당신의 정원을 응원합니다.
사이트 주소: https://ai.studio/build
===========================================
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${input.name}_나를돌아보자_사주리포트_${getFormattedDate()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const jsonContent = JSON.stringify({
      siteName: "나를 돌아보자",
      downloadDate: getFormattedDate(),
      input: {
        name: input.name,
        birthDate: input.birthDate,
        birthTime: input.birthTime || "시간 모름",
        isSolar: input.isSolar,
        emotion: input.emotion,
        areasToReflect: input.areasToReflect
      },
      report: {
        pillars: report.pillars,
        fiveElements: report.fiveElements,
        balanceScores: report.balanceScores,
        mainReport: report.mainReport,
        coreAdvice: report.coreAdvice,
        loveLuck: report.loveLuck || "자신을 사랑하고 신뢰하는 데서 시작합니다. 마음을 잔잔히 비우면 영혼의 기운이 온화한 인연을 비춥니다.",
        jobLuck: report.jobLuck || "꾸준하고 우직한 정성이 사주의 �  return (
    <div id="saju-result-container" className="space-y-8 animate-fade-in fade-in">
      
      {/* 
        This is the main printable area. 
        On normal media, this displays according to the dark theme layout.
        When window.print() is called, our @media print custom rules in index.css isolates this div,
        rendering it beautifully as an elegant high-contrast document on white background.
      */}
      <div id="printable-saju-report" className="space-y-8">
        
        {/* Upper banner advise */}
        <div className="rounded-3xl bg-neutral-950 p-6 text-white border border-[#2A2A2A] shadow-xl sm:p-8">
          <div className="flex items-center justify-between">
            <button
              id="btn-back-to-form"
              onClick={onReset}
              className="flex items-center space-x-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:bg-white/20 active:scale-95 no-print"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>돌아가기</span>
            </button>
            
            <span className="flex items-center space-x-1 text-xs font-mono font-bold tracking-widest text-[#C5A059] uppercase">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-[#C5A059]" />
              <span>Heavenly Elements</span>
            </span>
          </div>

          <div className="mt-6 font-serif">
            <p className="text-xs tracking-wider text-neutral-400">우주가 전하는 한 줄기 비춤</p>
            <h3 className="mt-2 text-xl font-bold leading-relaxed text-[#C5A059] sm:text-2xl">
              "{report.coreAdvice}"
            </h3>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-[#2A2A2A] pt-4 text-xs text-neutral-300">
            <span>성찰 신청자: <strong>{input.name}</strong> 님</span>
            <span className="text-[#666666]">•</span>
            <span>출생기록: {input.birthDate} ({input.isSolar === 'solar' ? '양력' : '음력'}) {input.birthTime || "시간미기재"}</span>
          </div>
        </div>

        {/* Saju Pillars Sheet */}
        <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md">
          <h4 className="font-serif text-base font-bold text-white flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#C5A059]"></span>
            <span>타고난 사주 원국 (사주팔자 4개 기둥)</span>
          </h4>
          <p className="mt-1 text-xs text-[#666666]">시간의 흐름 속에서 자리 잡은 탄생 시점의 네 가지 기둥입니다.</p>

          <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
            
            {/* Hour */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#0A0A0B] p-2.5 sm:p-4">
              <span className="text-[10px] text-[#666666] font-bold block">시주(時柱)</span>
              <span className="text-[10px] text-[#444444] block mt-0.5">자녀/노년</span>
              <div className="my-2.5 font-serif text-lg font-black tracking-tight text-white sm:text-xl">
                {report.pillars.hour.pillar.split(" ")[0]}
              </div>
              <span className="text-[10px] bg-[#141416] border border-[#2A2A2A] text-[#C5A059] px-2 py-0.5 rounded-full font-serif font-semibold">
                {report.pillars.hour.pillar.split("(")[1]?.replace(")", "") || ""}
              </span>
            </div>

            {/* Day */}
            <div className="rounded-2xl border border-[#C5A059]/40 bg-[#C5A059]/5 p-2.5 sm:p-4 ring-2 ring-[#C5A059]/10">
              <span className="text-[10px] text-[#C5A059] font-extrabold block">일주(日柱)</span>
              <span className="text-[10px] text-[#C5A059]/70 font-medium block mt-0.5">나 자신/중년</span>
              <div className="my-2.5 font-serif text-lg font-black tracking-tight text-[#C5A059] sm:text-xl">
                {report.pillars.day.pillar.split(" ")[0]}
              </div>
              <span className="text-[10px] bg-[#C5A059] text-black px-2 py-0.5 rounded-full font-serif font-bold">
                {report.pillars.day.pillar.split("(")[1]?.replace(")", "") || ""}
              </span>
            </div>

            {/* Month */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#0A0A0B] p-2.5 sm:p-4">
              <span className="text-[10px] text-[#666666] font-bold block">월주(月柱)</span>
              <span className="text-[10px] text-[#444444] block mt-0.5">부모/청년</span>
              <div className="my-2.5 font-serif text-lg font-black tracking-tight text-white sm:text-xl">
                {report.pillars.month.pillar.split(" ")[0]}
              </div>
              <span className="text-[10px] bg-[#141416] border border-[#2A2A2A] text-[#C5A059] px-2 py-0.5 rounded-full font-serif font-semibold">
                {report.pillars.month.pillar.split("(")[1]?.replace(")", "") || ""}
              </span>
            </div>

            {/* Year */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#0A0A0B] p-2.5 sm:p-4">
              <span className="text-[10px] text-[#666666] font-bold block">년주(年柱)</span>
              <span className="text-[10px] text-[#444444] block mt-0.5">조상/소년</span>
              <div className="my-2.5 font-serif text-lg font-black tracking-tight text-white sm:text-xl">
                {report.pillars.year.pillar.split(" ")[0]}
              </div>
              <span className="text-[10px] bg-[#141416] border border-[#2A2A2A] text-[#C5A059] px-2 py-0.5 rounded-full font-serif font-semibold">
                {report.pillars.year.pillar.split("(")[1]?.replace(")", "") || ""}
              </span>
            </div>

          </div>
        </div>

        {/* Five Elements & Mind Balance Side-by-Side */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Five Elements Balance (오행) */}
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md">
            <h4 className="font-serif text-base font-bold text-white flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>오행(五行) 에너지 밸런스</span>
            </h4>
            <p className="mt-1 text-xs text-[#666666]">탄생의 우주적 배치를 구성하는 8가지 성향 분포입니다 (합 8개).</p>

            <div className="mt-5 space-y-3.5">
              {[
                { key: "wood", label: "목 (木 - 나무)", val: report.fiveElements.wood, color: "bg-emerald-500", labelKr: "기지, 유연성, 추진" },
                { key: "fire", label: "화 (火 - 불)", val: report.fiveElements.fire, color: "bg-rose-500", labelKr: "열정, 사교성, 활기" },
                { key: "earth", label: "토 (土 - 흙)", val: report.fiveElements.earth, color: "bg-[#C5A059]", labelKr: "수용, 안정, 신용" },
                { key: "metal", label: "금 (金 - 쇠)", val: report.fiveElements.metal, color: "bg-zinc-400", labelKr: "결단, 분별, 통제" },
                { key: "water", label: "수 (水 - 물)", val: report.fiveElements.water, color: "bg-sky-600", labelKr: "지혜, 수용성, 사색" },
              ].map((el) => {
                const weight = (el.val / 8) * 100;
                return (
                  <div key={el.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#E0E0E0]">{el.label}</span>
                      <span className="text-[#666666] font-normal text-[10px]">{el.labelKr}</span>
                      <span className="text-white font-mono font-bold">{el.val} 개 ({Math.round(weight)}%)</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0A0A0B] border border-[#2A2A2A]">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${el.color}`}
                        style={{ width: `${Math.max(4, weight)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Life/Spirit Balance (마음 밸런스) */}
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md">
            <h4 className="font-serif text-base font-bold text-white flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              <span>인생 주기 성찰 밸런스 지표</span>
            </h4>
            <p className="mt-1 text-xs text-[#666666]">오늘 성찰한 영역들과 사주 기운을 연동한 현재 균형 지표입니다.</p>

            <div className="mt-5 space-y-3.5">
              {[
                { id: "mind", label: "마음 & 내면 성찰", val: report.balanceScores.mind, color: "from-emerald-400 to-teal-500" },
                { id: "relationship", label: "관계 & 상생 조화", val: report.balanceScores.relationship, color: "from-pink-400 to-rose-500" },
                { id: "work", label: "일 & 자아의 성취", val: report.balanceScores.work, color: "from-indigo-400 to-blue-500" },
                { id: "reality", label: "현실 & 생활 안정", val: report.balanceScores.reality, color: "from-amber-400 to-yellow-500" },
                { id: "growth", label: "성장 & 변혁 도약", val: report.balanceScores.growth, color: "from-purple-400 to-fuchsia-500" },
              ].map((bal) => {
                const activeArea = input.areasToReflect.includes(bal.id === "mind" ? "마음" : bal.id === "relationship" ? "관계" : bal.id === "work" ? "일" : bal.id === "reality" ? "현실" : "성장");
                return (
                  <div key={bal.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[#E0E0E0]">{bal.label}</span>
                        {activeArea && (
                          <span className="text-[8px] bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 rounded px-1">
                            주요성찰
                          </span>
                        )}
                      </div>
                      <span className="text-white font-mono font-bold">{bal.val} / 100</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0A0A0B] border border-[#2A2A2A]">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${bal.color}`}
                        style={{ width: `${bal.val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Main Therapeutic Report content */}
        <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md sm:p-8">
          <div className="mb-4 border-b border-[#2A2A2A] pb-4">
            <span className="text-[10px] font-bold tracking-widest text-[#666666] uppercase font-mono">Detailed Analysis</span>
            <h4 className="font-serif text-lg font-bold text-[#C5A059] mt-1 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-[#C5A059]" />
              <span>나를 알아가는 전인적 성찰 서한</span>
            </h4>
          </div>
          
          <div className="markdown-body text-[#CCCCCC] leading-relaxed max-w-none text-sm space-y-4">
            <ReactMarkdown>{report.mainReport}</ReactMarkdown>
          </div>
        </div>

        {/* Four Core Fortunes Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          {/* Love Luck */}
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] flex items-center space-x-2">
              <Heart className="h-4.5 w-4.5 text-red-500 shrink-0" />
              <span>연애운 (인연과 마음의 연결)</span>
            </h5>
            <p className="mt-2.5 text-xs text-[#CCCCCC] leading-relaxed font-serif">
              {report.loveLuck || "자신을 사랑하고 신뢰하는 데서 시작합니다. 마음을 잔잔히 비우면 영혼의 기운이 온화한 인연을 비춥니다."}
            </p>
          </div>

          {/* Job Luck */}
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] flex items-center space-x-2">
              <Briefcase className="h-4.5 w-4.5 text-blue-500 shrink-0" />
              <span>직업운 (일과 세상으로의 온건한 전진)</span>
            </h5>
            <p className="mt-2.5 text-xs text-[#CCCCCC] leading-relaxed font-serif">
              {report.jobLuck || "꾸준하고 우직한 정성이 사주의 부족함을 채워 줍니다. 고집보다 성실함이 재능의 만개로 인도합니다."}
            </p>
          </div>

          {/* Wealth Luck */}
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] flex items-center space-x-2">
              <Coins className="h-4.5 w-4.5 text-yellow-500 shrink-0" />
              <span>재물운 (물질의 다스림과 마음의 여유)</span>
            </h5>
            <p className="mt-2.5 text-xs text-[#CCCCCC] leading-relaxed font-serif">
              {report.wealthLuck || "진정한 부는 외부의 축적이 아닌 내면의 든든함에서 시작됩니다. 급한 욕심을 내려놓으면 흐름이 안정을 찾습니다."}
            </p>
          </div>

          {/* Year Luck */}
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] flex items-center space-x-2">
              <Calendar className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
              <span>올해운 (오늘 흐르는 일 년의 은혜)</span>
            </h5>
            <p className="mt-2.5 text-xs text-[#CCCCCC] leading-relaxed font-serif">
              {report.yearLuck || "스스로를 성찰하고 성숙하게 하기에 참 좋은 시기입니다. 겉보기와는 무관하게 단단한 성장의 밑거름이 될 것입니다."}
            </p>
          </div>

        </div>

      </div>

      {/* Downloader Widget Zone (Not Printed) */}
      <div id="btn-downloader-container" className="no-print rounded-3xl border border-[#2A2A2A]/60 bg-[#141416]/40 p-6 space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="h-2 w-2 rounded-full bg-[#C5A059]"></div>
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold">
            리포트 영구 보관 및 인쇄하기
          </h4>
        </div>
        <p className="text-xs text-[#666666] leading-relaxed">
          오늘 만난 마음 성찰 분석과 세세한 운세 흐름을 파일로 다운로드하여 기억에 깊이 보관해 보세요. 인쇄하기 버튼으로 예쁜 명리학 서신 종이 리포트를 출력해 실물로 남길 수 있습니다.
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 pt-1">
          {/* TXT Download button */}
          <button
            id="btn-download-txt"
            onClick={downloadTxt}
            className="flex items-center justify-center space-x-2 rounded-2xl border border-[#2A2A2A] bg-[#141416] py-3.5 text-xs font-semibold text-[#E0E0E0] hover:bg-[#E0E0E0] hover:text-black transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-[#C5A059]" />
            <span>TXT 파일 다운로드</span>
          </button>
          
          {/* JSON Download button */}
          <button
            id="btn-download-json"
            onClick={downloadJson}
            className="flex items-center justify-center space-x-2 rounded-2xl border border-[#2A2A2A] bg-[#141416] py-3.5 text-xs font-semibold text-[#E0E0E0] hover:bg-[#E0E0E0] hover:text-black transition-all cursor-pointer"
          >
            <Braces className="h-4 w-4 text-[#C5A059]" />
            <span>JSON 구조화 다운로드</span>
          </button>
          
          {/* PDF/Print button */}
          <button
            id="btn-download-pdf"
            onClick={downloadPdfOrPrint}
            className="flex items-center justify-center space-x-2 rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/10 py-3.5 text-xs font-bold text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>PDF 저장 / 인쇄</span>
          </button>
        </div>
      </div>

      {/* Diary retrospective user comment box */}
      <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6">
        <h5 className="font-serif text-sm font-semibold text-[#C5A059] flex items-center space-x-1.5">
          <PenTool className="h-4 w-4 text-[#C5A059]" />
          <span>오늘의 다짐 & 사색 기록장 추가 메모 (선택)</span>
        </h5>
        <p className="mt-1 text-xs text-[#666666]">리포트를 보고 느낀 다짐이나 오늘의 생각들을 남겨 함께 기록해 보세요.</p>
        
        <textarea
          id="personal-notes"
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          placeholder="오늘 온 마음 성찰 리포트를 읽고 어떤 생각이나 각오가 들어왔나요? 내면의 목소리를 솔직히 남겨보세요..."
          className="mt-3.5 h-24 w-full rounded-2xl border border-[#2A2A2A] bg-[#0A0A0B] p-3.5 text-xs text-white outline-none focus:border-[#C5A059]"
          maxLength={500}
        />
      </div>

      {/* Error block */}
      {errorMsg && (
        <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl p-3 text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Action Footer Button Rails */}             </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${bal.color}`}
                      style={{ width: `${bal.val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Therapeutic Report content */}
      <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md sm:p-8">
        <div className="mb-4 border-b border-[#2A2A2A] pb-4">
          <span className="text-[10px] font-bold tracking-widest text-[#666666] uppercase font-mono">Detailed Analysis</span>
          <h4 className="font-serif text-lg font-bold text-[#C5A059] mt-1 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#C5A059]" />
            <span>나를 알아가는 전인적 성찰 서한</span>
          </h4>
        </div>
        
        <div className="markdown-body text-[#CCCCCC] leading-relaxed max-w-none text-sm space-y-4">
          <ReactMarkdown>{report.mainReport}</ReactMarkdown>
        </div>
      </div>

      {/* Diary retrospective user comment box */}
      <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6">
        <h5 className="font-serif text-sm font-semibold text-[#C5A059] flex items-center space-x-1.5">
          <PenTool className="h-4 w-4 text-[#C5A059]" />
          <span>오늘의 다짐 & 사색 기록장 추가 메모 (선택)</span>
        </h5>
        <p className="mt-1 text-xs text-[#666666]">리포트를 보고 느낀 다짐이나 오늘의 생각들을 남겨 함께 기록해 보세요.</p>
        
        <textarea
          id="personal-notes"
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          placeholder="오늘 온 마음 성찰 리포트를 읽고 어떤 생각이나 각오가 들어왔나요? 내면의 목소리를 솔직히 남겨보세요..."
          className="mt-3.5 h-24 w-full rounded-2xl border border-[#2A2A2A] bg-[#0A0A0B] p-3.5 text-xs text-white outline-none focus:border-[#C5A059]"
          maxLength={500}
        />
      </div>

      {/* Error block */}
      {errorMsg && (
        <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl p-3 text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Action Footer Button Rails */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        
        {/* Copy Result */}
        <button
          id="btn-copy-result"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center space-x-2 rounded-2xl border border-[#2A2A2A] bg-[#141416] py-3.5 text-sm font-semibold text-[#E0E0E0] shadow-sm hover:bg-[#E0E0E0] hover:text-black transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">리포트 전체 복사 완료!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-[#666666]" />
              <span>성찰 리포트 복사하기</span>
            </>
          )}
        </button>

        {/* Save to Log */}
        <button
          id="btn-save-to-log"
          onClick={handleSaveToJournal}
          disabled={saving || saved}
          className={`flex-1 flex items-center justify-center space-x-2 rounded-2xl py-3.5 text-sm font-bold shadow-md transition-all active:scale-98 disabled:opacity-80 ${
            saved
              ? "bg-[#141416] border border-emerald-900/40 text-emerald-400 cursor-not-allowed"
              : "bg-[#C5A059] text-black hover:bg-[#D4B577]"
          }`}
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"></div>
              <span>저장 중...</span>
            </>
          ) : saved ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-emerald-400" />
              <span>오늘의 성찰 기록 저장 완료</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 text-black/50" />
              <span>{user ? "나의 기록장에 이 기운 담기" : "로그인하고 기록장에 담기"}</span>
            </>
          )}
        </button>

        {/* 1:1 Professional Mail Inquiry */}
        <a
          id="btn-email-consultation"
          href={emailInquiryUrl}
          className="flex items-center justify-center space-x-2 rounded-2xl border border-[#2A2A2A] bg-[#141416] px-5 py-3.5 text-sm font-semibold text-[#C5A059] shadow-sm hover:bg-[#C5A059]/10 transition-all active:scale-98"
        >
          <Mail className="h-4 w-4 text-[#C5A059]" />
          <span>1:1 심층 상담 신청</span>
        </a>

      </div>

    </div>
  );
}
