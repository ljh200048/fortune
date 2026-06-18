import React from "react";
import { User } from "firebase/auth";
import { signInWithGoogle, logout } from "../lib/firebase";
import { Sparkles, History, Compass, LogIn, LogOut, User as UserIcon } from "lucide-react";

interface NavbarProps {
  user: User | null;
  activeTab: 'saju' | 'journals';
  setActiveTab: (tab: 'saju' | 'journals') => void;
  loadingAuth: boolean;
}

export default function Navbar({ user, activeTab, setActiveTab, loadingAuth }: NavbarProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-[#2A2A2A] bg-[#0A0A0B]/90 backdrop-blur-md text-[#E0E0E0]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => setActiveTab('saju')} 
          className="flex cursor-pointer items-center space-x-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#141416] text-[#C5A059] border border-[#C5A059]/30 shadow-md">
            <Sparkles className="h-5 w-5 animate-pulse text-[#C5A059]" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-[0.1em] text-[#C5A059] sm:text-xl uppercase">
              나를 돌아보자
            </h1>
            <p className="hidden text-[10px] uppercase tracking-[0.2em] font-medium text-[#666666] sm:block">
              Reflect & Introspect
            </p>
          </div>
        </div>

        {/* Center: Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            id="tab-saju"
            onClick={() => setActiveTab('saju')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'saju'
                ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10'
                : 'text-[#999999] hover:bg-[#141416] hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">오늘의 기운 & 성찰</span>
            <span className="sm:hidden">성찰하기</span>
          </button>

          <button
            id="tab-journals"
            onClick={() => {
              if (!user) {
                // If not logged in, prompt sign in first or alert
                alert("나의 성찰 기록장은 로그인 후 이용 가능합니다. 상단의 로그인 버튼을 눌러주세요.");
                return;
              }
              setActiveTab('journals');
            }}
            className={`relative flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'journals'
                ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10'
                : 'text-[#999999] hover:bg-[#141416] hover:text-white'
            } ${!user ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={!user ? "로그인이 필요합니다" : "나의 성찰 기록장"}
          >
            <History className="h-4 w-4" />
            <span>기록장</span>
            {user && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C5A059] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C5A059]"></span>
              </span>
            )}
          </button>
        </nav>

        {/* Right: Authentication */}
        <div className="flex items-center space-x-3">
          {loadingAuth ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-[#C5A059]"></div>
          ) : user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User profile dropdown or icon */}
              <div className="hidden flex-col items-end sm:flex text-right">
                <span className="text-xs font-semibold text-[#E0E0E0]">{user.displayName || "영혼 도반"}</span>
                <span className="text-[9px] text-[#666666] font-mono tracking-wider">{user.email?.split('@')[0]}</span>
              </div>
              <img
                src={user.photoURL || undefined}
                alt={user.displayName || "Profile"}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-[#C5A059]/40 object-cover shadow-sm ring-2 ring-[#141416]"
              />
              <button
                id="btn-logout"
                onClick={logout}
                className="flex items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#141416] p-2 text-[#999999] hover:border-red-900/40 hover:bg-red-950/20 hover:text-red-400 transition-all shadow-sm"
                title="로그아웃"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-login"
              onClick={signInWithGoogle}
              className="flex items-center space-x-1.5 rounded-xl border border-[#C5A059]/40 bg-[#141416] px-3 py-1.5 text-xs font-semibold text-[#C5A059] shadow-sm transition-all hover:bg-[#C5A059]/10 active:scale-95 sm:px-4 sm:py-2"
            >
              <LogIn className="h-4 w-4" />
              <span>로그인</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
