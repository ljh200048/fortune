import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signInWithGoogle } from "./lib/firebase";
import Navbar from "./components/Navbar";
import SajuForm from "./components/SajuForm";
import SajuResult from "./components/SajuResult";
import JournalList from "./components/JournalList";
import { SajuInput, SajuReport } from "./types";
import { Sparkles, Compass, History, Heart, Feather, Quote, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'saju' | 'journals'>('saju');
  
  // Saju and Result States
  const [inputForm, setInputForm] = useState<SajuInput | null>(null);
  const [generatedReport, setGeneratedReport] = useState<SajuReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  
  // Refresh tracking
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Authentication State Monitor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Submit form and request to backend
  const handleFormSubmit = async (input: SajuInput) => {
    setLoadingReport(true);
    setReportError("");
    setInputForm(input);
    setGeneratedReport(null);

    try {
      const response = await fetch("/api/saju", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        let serverErrorMsg = "";
        try {
          const errData = await response.json();
          serverErrorMsg = errData.error || errData.message;
        } catch (e) {
          // Ignore parsing error
        }
        throw new Error(serverErrorMsg || "우주의 흐름을 가져오는 도중 연결 지연이 발생했습니다. 다시 한 번 제출해 주세요.");
      }

      const data: SajuReport = await response.json();
      setGeneratedReport(data);
    } catch (err: any) {
      console.error("Saju Generation Error:", err);
      setReportError(err.message || "서버 통신 오류가 발생했습니다. 잠시 후 동시 접속량이 밀릴 수 있으니 다시 시도해 주세요.");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleReset = () => {
    setInputForm(null);
    setGeneratedReport(null);
    setReportError("");
  };

  const handleSaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div id="full-app-root" className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] flex flex-col selection:bg-[#C5A059]/30 selection:text-[#C5A059] font-sans">
      
      {/* Header / Nav */}
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        loadingAuth={loadingAuth} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6">
        
        {/* Banner with quote if in saju input mode */}
        {activeTab === 'saju' && !generatedReport && !loadingReport && (
          <div className="mb-8 text-center sm:text-left fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#2A2A2A] pb-5">
              <div>
                <h2 className="font-serif text-3xl font-black mt-2 tracking-tight text-[#C5A059] sm:text-4xl">
                  나를 돌아보자
                </h2>
                <p className="mt-2 text-sm text-[#666666] max-w-lg leading-relaxed">
                  바쁜 일상 속에서 나를 기르는 시간. 나의 탄생 기틀과 오행적 조화를 살피고, 따뜻한 자기 위무와 마음 성찰 리포트를 만나보세요.
                </p>
              </div>
              
              <div className="hidden lg:flex flex-col items-end max-w-xs text-right text-xs text-[#666666] italic font-serif">
                <Quote className="h-4.5 w-4.5 text-[#2A2A2A] transform rotate-180 mb-1" />
                <p>"우리는 하늘의 기운을 품고 내려와, 매 순간 저마다의 정원을 가꾸어 나갑니다."</p>
                <span className="text-[10px] text-[#444444] mt-1 font-sans font-semibold">- 나를 돌아보자 명리학서 중 -</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* Active Tab: 오늘의 기운 & 성찰 */}
          {activeTab === 'saju' && (
            <motion.div
              key="saju"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {!generatedReport && !loadingReport ? (
                // Input form
                <div className="max-w-2xl mx-auto">
                  <SajuForm 
                    onSubmit={handleFormSubmit} 
                    loading={loadingReport} 
                    userDisplayName={user?.displayName} 
                  />
                </div>
              ) : loadingReport ? (
                // Cinematic immersive loading state
                <div className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#C5A059]/10 blur-xl animate-pulse"></div>
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-[#141416] border border-[#2A2A2A] shadow-xl ring-8 ring-[#2A2A2A]/40">
                      <Sparkles className="h-10 w-10 text-[#C5A059] animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-white">당신의 탄생 기틀을 해석하는 중</h3>
                    <p className="text-xs text-[#C5A059] font-mono font-bold tracking-widest uppercase">Aligning Five Elements & Star Spheres</p>
                  </div>

                  <div className="rounded-2xl border border-[#C5A059]/20 bg-[#141416] p-4 font-serif text-xs text-[#C5A059] italic leading-relaxed shadow-sm">
                    "물(水)은 지혜를 품고, 나무(木)는 자란나갑니다. 불(火)은 피어나고, 흙(土)은 만물을 품어 안으며, 쇠(金)는 서늘히 성찰하게 합니다. 당신의 마음 결이 오행으로 수놓이고 있습니다."
                  </div>
                </div>
              ) : reportError ? (
                // Error report fallback
                <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center max-w-md mx-auto space-y-4">
                  <h4 className="font-serif text-lg font-bold text-red-400">우주의 흐름을 읽지 못했습니다</h4>
                  <p className="text-xs text-red-300/80 leading-relaxed">{reportError}</p>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-red-950 border border-red-900/40 hover:bg-neutral-900 font-semibold text-red-400 px-4 py-2 text-xs transition-all active:scale-95 shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>다시 작성장으로 가기</span>
                  </button>
                </div>
              ) : (
                // Saju results display
                generatedReport && inputForm && (
                  <SajuResult
                    input={inputForm}
                    report={generatedReport}
                    user={user}
                    onReset={handleReset}
                    onSaveSuccess={handleSaveSuccess}
                    signInWithGoogle={signInWithGoogle}
                  />
                )
              )}
            </motion.div>
          )}

          {/* Active Tab: 나의 기록장 */}
          {activeTab === 'journals' && (
            <motion.div
              key="journals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {user ? (
                <JournalList 
                  user={user} 
                  onSelectResult={(journal) => {
                    setInputForm(journal.input);
                    setGeneratedReport(journal.report);
                    setActiveTab('saju');
                  }}
                  refreshTrigger={refreshTrigger}
                />
              ) : (
                // Call-out to log in specifically for journals history
                <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-12 text-center max-w-md mx-auto shadow-lg space-y-5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A0A0B] border border-[#2A2A2A] text-[#C5A059]">
                    <History className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-lg font-black text-white">나의 성찰 기록첩지</h3>
                    <p className="text-xs text-[#666666] leading-relaxed">
                      구글 계정으로 로그인하시면 과거에 기록한 본인의 사주 원국과 우주적인 내면 조언들을 저장하고 회고하실 수 있습니다.
                    </p>
                  </div>
                  <button
                    onClick={signInWithGoogle}
                    className="w-full inline-flex items-center justify-center space-x-2 rounded-2xl bg-[#C5A059] hover:bg-[#D4B577] text-black font-bold py-3 text-sm transition-all shadow-md cursor-pointer"
                  >
                    <span>구글 로그인하고 성찰 보관하기</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Elegant minimalist footer */}
      <footer id="app-footer" className="mt-16 border-t border-[#2A2A2A] bg-[#141416]/20 py-8 text-xs text-[#666666]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#CCCCCC]">나를 돌아보자</span>
            <span className="text-[#2A2A2A]">•</span>
            <span>© 2026. 사주 & 마음 위무 성찰 리포터. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-0.5">
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-950 shrink-0" />
              <span>영혼의 성장을 위해 정교히 조율됨</span>
            </span>
            <span className="text-[#2A2A2A]">•</span>
            <span className="flex items-center space-x-0.5">
              <Feather className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
              <span>학술가 & 심리 연구자 전용</span>
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
