import React, { useState } from "react";
import { SajuInput } from "../types";
import { Sparkles, Calendar, Clock, Smile, Compass, AlertCircle } from "lucide-react";

interface SajuFormProps {
  onSubmit: (input: SajuInput) => void;
  loading: boolean;
  userDisplayName?: string | null;
}

const EMOTIONS = [
  { id: "편안함", name: "편안함", emoji: "🌿", desc: "차분하고 안정된 마음", color: "hover:border-[#C5A059] text-[#E0E0E0]" },
  { id: "피로함", name: "피로함", emoji: "🔋", desc: "비움과 휴식이 필요한 상태", color: "hover:border-[#C5A059] text-[#E0E0E0]" },
  { id: "설렘", name: "설렘", emoji: "🌸", desc: "새로운 시작에 부푼 마음", color: "hover:border-[#C5A059] text-[#E0E0E0]" },
  { id: "불안함", name: "불안함", emoji: "🌊", desc: "생각이 많고 일렁이는 밤", color: "hover:border-[#C5A059] text-[#E0E0E0]" },
  { id: "혼란스러움", name: "혼란스러움", emoji: "🌀", desc: "방향과 답을 찾고 싶을 때", color: "hover:border-[#C5A059] text-[#E0E0E0]" },
  { id: "열정적", name: "열정적", emoji: "🔥", desc: "동기부여와 야망이 넘칠 때", color: "hover:border-[#C5A059] text-[#E0E0E0]" },
];

const AREAS = [
  { id: "마음", label: "마음 & 내면", desc: "내적인 평화와 지혜로운 감정 조율" },
  { id: "관계", label: "관계 & 소통", desc: "타인과의 공감, 사랑, 우정과 조화" },
  { id: "일", label: "일 & 실현", desc: "과업의 주체성, 직업적 자아와 소명" },
  { id: "현실", label: "현실 & 풍요", desc: "재물, 주거, 단단하고 흔들림 없는 일상" },
  { id: "성장", label: "성장 & 변혁", desc: "새로운 배움, 한 단계 도약하는 변화" },
];

export default function SajuForm({ onSubmit, loading, userDisplayName }: SajuFormProps) {
  const [name, setName] = useState(userDisplayName || "");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [knowTime, setKnowTime] = useState(true);
  const [isSolar, setIsSolar] = useState<'solar' | 'lunar_uninterp' | 'lunar_interp'>('solar');
  const [selectedEmotion, setSelectedEmotion] = useState("편안함");
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["마음"]);
  const [error, setError] = useState("");

  const handleAreaToggle = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      if (selectedAreas.length > 1) {
        setSelectedAreas(selectedAreas.filter(a => a !== areaId));
      } else {
        setError("최소 한 개의 성찰 영역을 선택해 주세요.");
        setTimeout(() => setError(""), 3000);
      }
    } else {
      if (selectedAreas.length < 3) {
        setSelectedAreas([...selectedAreas, areaId]);
      } else {
        setError("성찰 영역은 최대 3개까지 선택 가능합니다.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("이름(혹은 필명)을 입력해 주세요.");
      return;
    }
    if (!birthDate) {
      setError("태어난 생년월일을 선택해 주세요.");
      return;
    }

    onSubmit({
      name: name.trim(),
      birthDate,
      birthTime: knowTime ? birthTime : "",
      isSolar,
      emotion: selectedEmotion,
      areasToReflect: selectedAreas,
    });
  };

  // Sync logged-in name if they sign in later and haven't typed yet
  React.useEffect(() => {
    if (userDisplayName && !name) {
      setName(userDisplayName);
    }
  }, [userDisplayName]);

  return (
    <div id="saju-input-container" className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-2xl sm:p-8 text-[#E0E0E0]">
      <div className="mb-6 border-b border-[#2A2A2A] pb-5 text-center">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-[#0A0A0B] px-3 py-1 text-xs font-semibold text-[#C5A059] border border-[#C5A059]/25">
          <Compass className="h-3 w-3 text-[#C5A059]" />
          <span>성찰 리포트 신청장</span>
        </span>
        <h2 className="mt-2.5 font-serif text-2xl font-extrabold tracking-tight text-[#C5A059]">
          타고난 기운과 내면의 만남
        </h2>
        <p className="mt-1.5 text-sm text-[#999999]">
          이름과 탄생의 시간을 통해 성향을 알아보고, 오늘의 마음을 점검해 보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name Input */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#666666]" htmlFor="name">
            이름 또는 성찰용 필명
          </label>
          <div className="mt-1.5 relative rounded-xl">
            <input
              type="text"
              id="name"
              placeholder="예: 홍길동, 빛나는별"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0B] px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-[#444444] focus:border-[#C5A059] text-white"
              maxLength={12}
              required
            />
          </div>
          <span className="mt-1 block text-[#666666] text-[10px]">사주 결과 리포트에 쓰여질 정성 어린 이름입니다.</span>
        </div>

        {/* Birthdate & Lunar/Solar Picker */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#666666]" htmlFor="birth-date">
              생년월일
            </label>
            <div className="mt-1.5 relative">
              <input
                type="date"
                id="birth-date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0B] px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#C5A059] text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#666666]">
              달력의 기준
            </label>
            <div className="mt-1.5 flex h-[46px] rounded-xl border border-[#2A2A2A] bg-[#0A0A0B] p-1">
              <button
                type="button"
                onClick={() => setIsSolar('solar')}
                className={`flex-1 rounded-lg text-xs font-semibold py-1 transition-all ${
                  isSolar === 'solar'
                    ? 'bg-[#C5A059] text-black shadow-sm'
                    : 'text-[#666666] hover:text-[#999999]'
                }`}
              >
                양력
              </button>
              <button
                type="button"
                onClick={() => setIsSolar('lunar_uninterp')}
                className={`flex-1 rounded-lg text-xs font-semibold py-1 transition-all ${
                  isSolar === 'lunar_uninterp'
                    ? 'bg-[#C5A059] text-black shadow-sm'
                    : 'text-[#666666] hover:text-[#999999]'
                }`}
              >
                음력 평달
              </button>
              <button
                type="button"
                onClick={() => setIsSolar('lunar_interp')}
                className={`flex-1 rounded-lg text-xs font-semibold py-1 transition-all ${
                  isSolar === 'lunar_interp'
                    ? 'bg-[#C5A059] text-black shadow-sm'
                    : 'text-[#666666] hover:text-[#999999]'
                }`}
              >
                음력 윤달
              </button>
            </div>
          </div>

        </div>

        {/* Birth Time Section */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs uppercase tracking-wider text-[#666666]" htmlFor="birth-time">
              태어난 시간
            </label>
            <label className="flex cursor-pointer items-center space-x-1.5 text-xs text-[#666666] hover:text-[#999999]">
              <input
                type="checkbox"
                checked={!knowTime}
                onChange={() => setKnowTime(!knowTime)}
                className="rounded border-[#2A2A2A] bg-[#0A0A0B] text-[#C5A059] focus:ring-[#C5A059]"
              />
              <span>태어난 시간 모름</span>
            </label>
          </div>
          
          {knowTime && (
            <div className="mt-1.5 transition-all">
              <input
                type="time"
                id="birth-time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0B] px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#C5A059] text-white"
                required={knowTime}
              />
            </div>
          )}
          <span className="mt-1 block text-[#666666] text-[10px]">시간을 아신다면 '시주(時柱)' 기운까지 더 정밀한 해석이 이루어집니다.</span>
        </div>

        {/* Emotion Section */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#666666]">
            오늘 나의 마음 기후 (현재 감정)
          </label>
          <p className="mt-0.5 text-xs text-[#666666]">내 감정의 결을 오행 흐름과 이어드립니다.</p>
          
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {EMOTIONS.map((emo) => {
              const works = selectedEmotion === emo.id;
              return (
                <button
                  type="button"
                  key={emo.id}
                  onClick={() => setSelectedEmotion(emo.id)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all cursor-pointer ${
                    works 
                      ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059] scale-[1.02] shadow-md font-semibold' 
                      : 'border-[#2A2A2A] bg-[#0A0A0B] text-[#E0E0E0] hover:border-[#C5A059]/50'
                  }`}
                >
                  <span className="text-xl mb-1">{emo.emoji}</span>
                  <span className="text-xs mb-0.5">{emo.name}</span>
                  <span className="text-[9px] text-[#666666] leading-none">{emo.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Area of Reflection */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#666666]">
            오늘 깊이 성찰해보고 싶은 삶의 자리
          </label>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-[#666666]">오늘 깊게 점검하여 채우고 싶은 영역을 선택해 주세요 (1~3개 선택).</span>
            <span className="text-xs font-mono font-bold text-[#C5A059]">{selectedAreas.length}/3</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {AREAS.map((area) => {
              const active = selectedAreas.includes(area.id);
              return (
                <button
                  type="button"
                  key={area.id}
                  onClick={() => handleAreaToggle(area.id)}
                  className={`flex-1 min-w-[130px] rounded-xl border p-3.5 text-left transition-all ${
                    active
                      ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059] shadow-lg'
                      : 'border-[#2A2A2A] bg-[#0A0A0B] text-[#999999] hover:border-[#C5A059]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-none">{area.label}</span>
                    {active && <span className="text-[10px] bg-[#C5A059] text-black px-1.5 py-0.5 rounded font-extrabold">선택됨</span>}
                  </div>
                  <p className={`mt-1.5 text-[10px] leading-snug ${active ? 'text-[#CCCCCC]' : 'text-[#666666]'}`}>
                    {area.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error messaging */}
        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-red-950/20 border border-red-900/40 p-3.5 text-xs font-medium text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          id="btn-submit-saju"
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden rounded-2xl bg-[#C5A059] py-4 text-center text-sm font-bold text-black shadow-xl hover:bg-[#D4B577] transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"></div>
              <span>우주의 별의 흐름과 기운을 분석하는 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-4 w-4 text-black" />
              <span>나를 마주하기</span>
            </div>
          )}
        </button>

      </form>
    </div>
  );
}
