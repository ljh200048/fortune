import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Journal } from "../types";
import { db } from "../lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { 
  History, 
  Calendar, 
  Trash2, 
  ChevronRight, 
  Eye, 
  BookOpen, 
  PenTool, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface JournalListProps {
  user: User | null;
  onSelectResult: (journal: Journal) => void;
  refreshTrigger: number;
}

export default function JournalList({ user, onSelectResult, refreshTrigger }: JournalListProps) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  useEffect(() => {
    async function fetchJournals() {
      if (!user) {
        setJournals([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, "journals"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const items: Journal[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Journal);
        });
        setJournals(items);
      } catch (error) {
        console.error("기록장에서 사주 성찰 이력을 가져오는 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJournals();
  }, [user, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("정말로 이 성찰 기록을 영구적으로 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "journals", id));
      setJournals(journals.filter((j) => j.id !== id));
      if (selectedJournal && selectedJournal.id === id) {
        setSelectedJournal(null);
      }
    } catch (error) {
      console.error("기록 삭제 오류:", error);
      alert("성찰 기록 삭제 중 오류가 발생했습니다.");
    }
  };

  const startEditNotes = (e: React.MouseEvent, journal: Journal) => {
    e.stopPropagation();
    setEditingId(journal.id || null);
    setEditNotes(journal.notes || "");
  };

  const handleUpdateNotes = async (e: React.FormEvent, journal: Journal) => {
    e.preventDefault();
    if (!journal.id) return;

    setUpdating(true);
    try {
      const docRef = doc(db, "journals", journal.id);
      await updateDoc(docRef, {
        notes: editNotes.trim()
      });

      setJournals(journals.map(j => j.id === journal.id ? { ...j, notes: editNotes.trim() } : j));
      if (selectedJournal && selectedJournal.id === journal.id) {
        setSelectedJournal({ ...selectedJournal, notes: editNotes.trim() });
      }
      setEditingId(null);
    } catch (error) {
      console.error("기록 수정 오류:", error);
      alert("메모 수정 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-800 border-t-[#C5A059]"></div>
        <p className="mt-4 text-xs text-[#666666] font-medium font-serif">나의 성찰 기록첩을 안전하게 꺼내는 중...</p>
      </div>
    );
  }

  if (journals.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#141416] p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A0A0B] border border-[#2A2A2A] text-[#C5A059]">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-serif text-lg font-bold text-[#C5A059]">기록첩이 비어 있습니다.</h3>
        <p className="mt-2 text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
          오늘의 기운을 분석하고 나만의 영혼 성장 리포트를 생성해 첫 페이지를 멋지게 채워보세요.
        </p>
      </div>
    );
  }

  return (
    <div id="journal-timeline-view" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* List Sidebar on Left */}
      <div className="lg:col-span-1 space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
          <h3 className="font-serif text-base font-bold text-[#C5A059] flex items-center space-x-2">
            <History className="h-4 w-4 text-[#C5A059]" />
            <span>나의 성찰 역사 ({journals.length})</span>
          </h3>
          <span className="text-[11px] font-mono font-semibold text-[#666666]">Past Letters</span>
        </div>

        <div className="h-[520px] overflow-y-auto pr-1 space-y-3">
          {journals.map((journal) => {
            const isSelected = selectedJournal?.id === journal.id;
            return (
              <div
                key={journal.id}
                onClick={() => setSelectedJournal(journal)}
                className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-[#C5A059]/10 border-[#C5A059] text-white shadow-md scale-[1.01]" 
                    : "border-[#2A2A2A] bg-[#141416] text-[#CCCCCC] hover:border-[#C5A059]/50 hover:bg-[#141416]/90"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-medium font-serif flex items-center space-x-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className={isSelected ? "text-[#C5A059]" : "text-[#666666]"}>{formatDate(journal.createdAt)}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isSelected ? "bg-[#C5A059]/20 text-[#C5A059]" : "bg-[#0A0A0B] text-[#999999] border border-[#2A2A2A]"
                    }`}>
                      {journal.input.emotion} {journal.input.isSolar === 'solar' ? '양력' : '음력'}
                    </span>
                  </div>

                  <h4 className="mt-2.5 text-sm font-bold tracking-tight text-white font-serif">
                    {journal.input.name}님의 성찰 기록
                  </h4>
                  <p className={`mt-1 line-clamp-1 text-[11px] ${isSelected ? "text-neutral-400" : "text-[#666666]"}`}>
                    오행 배치: 목{journal.report.fiveElements.wood} 화{journal.report.fiveElements.fire} 토{journal.report.fiveElements.earth} 금{journal.report.fiveElements.metal} 수{journal.report.fiveElements.water}
                  </p>
                  
                  {journal.notes && (
                    <div className={`mt-2.5 rounded-lg p-2 text-[10px] italic leading-relaxed line-clamp-2 ${
                      isSelected ? "bg-[#0A0A0B] text-neutral-200 border-l border-[#C5A059]" : "bg-[#0A0A0B] text-[#666666] border-[#2A2A2A] border-l-2"
                    }`}>
                      " {journal.notes} "
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#2A2A2A] pt-2.5 text-[10px]">
                  <span className={`flex items-center space-x-0.5 ${isSelected ? "text-[#C5A059]" : "text-[#CCCCCC] hover:text-[#C5A059]"}`} onClick={(e) => { e.stopPropagation(); onSelectResult(journal); }}>
                    <Eye className="h-3.5 w-3.5" />
                    <span className="font-semibold underline">상세 대시보드 보기</span>
                  </span>
                  
                  <button
                    id={`btn-delete-journal-${journal.id}`}
                    onClick={(e) => handleDelete(e, journal.id || "")}
                    className={`rounded p-1.5 transition-all ${
                      isSelected 
                        ? "text-red-400 hover:bg-white/5 hover:text-red-300" 
                        : "text-[#666666] hover:bg-[#0A0A0B] hover:text-red-400"
                    }`}
                    title="기록장 삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reader Panel on Right */}
      <div className="lg:col-span-2">
        {selectedJournal ? (
          <div className="rounded-3xl border border-[#2A2A2A] bg-[#141416] p-6 shadow-md h-full flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#C5A059] uppercase font-mono">My Reflect Diary</span>
                  <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                    {selectedJournal.input.name}님의 {selectedJournal.input.emotion} 가득했던 성찰 일기
                  </h3>
                  <p className="text-[11px] text-[#666666] mt-1">{formatDate(selectedJournal.createdAt)} 작성</p>
                </div>

                <button
                  id="btn-edit-result-view"
                  onClick={() => onSelectResult(selectedJournal)}
                  className="hidden sm:flex items-center space-x-1 rounded-xl bg-[#C5A059] text-black px-3 py-1.5 text-xs font-bold hover:bg-[#D4B577] transition-all shadow-sm"
                >
                  <span>결과 대시보드형식 열기</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Saju summary capsule */}
              <div className="mt-4 bg-[#0A0A0B] p-4 rounded-2xl border border-[#2A2A2A] text-xs text-[#999999] space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>연월일시:</strong> <span className="text-[#CCCCCC]">{selectedJournal.input.birthDate} ({selectedJournal.input.isSolar === 'solar' ? '양력' : '음력'}) {selectedJournal.input.birthTime || "시간미기재"}</span></div>
                  <div><strong>오늘의 감정:</strong> <span className="text-[#CCCCCC]">{selectedJournal.input.emotion}</span></div>
                  <div><strong>성찰 영역:</strong> <span className="text-[#CCCCCC]">{selectedJournal.input.areasToReflect.join(', ')}</span></div>
                  <div><strong>오행 배분:</strong> <span className="text-[#CCCCCC]">목{selectedJournal.report.fiveElements.wood} / 화{selectedJournal.report.fiveElements.fire} / 토{selectedJournal.report.fiveElements.earth} / 금{selectedJournal.report.fiveElements.metal} / 수{selectedJournal.report.fiveElements.water}</span></div>
                </div>
                <div className="border-t border-[#2A2A2A] pt-2 text-[#C5A059] font-serif font-semibold italic mt-2 text-center text-[12px]">
                  "{selectedJournal.report.coreAdvice}"
                </div>
              </div>

              {/* Scrollable markdown body */}
              <div className="mt-5 prose max-w-none text-xs sm:text-sm text-[#CCCCCC] leading-relaxed overflow-y-auto max-h-[340px] pr-2 border-b border-[#2A2A2A] pb-5 markdown-body">
                <ReactMarkdown>{selectedJournal.report.mainReport}</ReactMarkdown>
              </div>
            </div>

            {/* Note edits and details block */}
            <div className="mt-5 pt-3">
              {editingId === selectedJournal.id ? (
                <form onSubmit={(e) => handleUpdateNotes(e, selectedJournal)} className="space-y-2">
                  <label className="text-xs font-semibold text-[#CCCCCC] block">오늘의 기록장 추가 메모 편집</label>
                  <textarea
                    id="edit-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#2A2A2A] bg-[#0A0A0B] text-white p-3 outline-none focus:border-[#C5A059]"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-[#666666] hover:bg-[#0A0A0B] rounded-lg font-medium border border-[#2A2A2A]"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-3 py-1.5 text-xs bg-[#C5A059] hover:bg-[#D4B577] text-black rounded-lg font-bold flex items-center space-x-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>{updating ? "수정 중..." : "저장 완료"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-[#0A0A0B] rounded-2xl p-4 border border-[#2A2A2A] flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#C5A059] flex items-center space-x-1">
                      <PenTool className="h-3 w-3" />
                      <span>내가 남긴 사색과 다짐</span>
                    </span>
                    <p className="text-xs text-[#E0E0E0] italic">
                      {selectedJournal.notes ? `"${selectedJournal.notes}"` : "오늘의 다짐이나 생각을 아직 기록하지 않았습니다."}
                    </p>
                  </div>

                  <button
                    id="btn-edit-journal-notes"
                    onClick={(e) => startEditNotes(e, selectedJournal)}
                    className="text-[10px] underline text-[#666666] hover:text-white ml-3 font-semibold shrink-0 transition-colors"
                  >
                    {selectedJournal.notes ? "메모 수정" : "메모 쓰기"}
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#2A2A2A] bg-[#141416] p-16 text-center h-[520px] flex flex-col justify-center items-center">
            <div className="h-10 w-10 text-[#C5A059]/40 mb-3 animate-bounce">
              <Sparkles className="h-10 w-10" />
            </div>
            <h4 className="font-serif text-base font-bold text-white">기록첩 리포트 본문 리더기</h4>
            <p className="text-xs text-[#666666] max-w-xs mt-1.5 leading-relaxed">
              왼쪽 이력에서 성찰 내역을 클릭하시면, 오늘 우주가 보내준 영혼의 메시지를 다시 꺼내어 음미하실 수 있습니다.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
