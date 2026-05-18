'use client';

interface Props {
  onSaveTxt: () => void;
  onSaveHtml: () => void;
}

export default function ChatHeader({ onSaveTxt, onSaveHtml }: Props) {
  return (
    <header className="relative w-full bg-gradient-to-br from-[#4a90d9] to-[#357abd] text-white py-4 px-6 text-center shadow-md">
      <h1 className="text-xl font-bold">探究題目小幫手</h1>
      <p className="text-sm opacity-90 mt-1">讓 AI 陪你一步步找到最適合的探究問題</p>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5">
        <button
          onClick={onSaveTxt}
          className="bg-white/20 border border-white/40 text-white text-xs rounded-full px-3 py-1.5 hover:bg-white/35 transition-colors cursor-pointer"
        >
          💾 .txt
        </button>
        <button
          onClick={onSaveHtml}
          className="bg-white/20 border border-white/40 text-white text-xs rounded-full px-3 py-1.5 hover:bg-white/35 transition-colors cursor-pointer"
        >
          🌐 .html
        </button>
      </div>
    </header>
  );
}
