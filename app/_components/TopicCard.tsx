interface Props {
  topic: string;
  onSaveTxt: () => void;
  onSaveHtml: () => void;
  onRestart: () => void;
}

export default function TopicCard({ topic, onSaveTxt, onSaveHtml, onRestart }: Props) {
  return (
    <div className="bg-gradient-to-br from-[#f0fff4] to-[#e6f4ea] border-2 border-[#5cb85c] rounded-2xl p-5 my-2 animate-fadeIn">
      <h3 className="text-[#3a7d44] font-semibold mb-2">✅ 你的探究題目確認完成！</h3>
      <p className="text-[#2d6a4f] font-bold text-[1.05rem] leading-relaxed">{topic}</p>
      <div className="mt-3.5 flex gap-2 flex-wrap">
        <button
          onClick={onSaveTxt}
          className="bg-[#4a90d9] text-white rounded-full px-5 py-2 text-sm hover:bg-[#357abd] transition-colors cursor-pointer"
        >
          💾 儲存文字檔
        </button>
        <button
          onClick={onSaveHtml}
          className="bg-[#4a90d9] text-white rounded-full px-5 py-2 text-sm hover:bg-[#357abd] transition-colors cursor-pointer"
        >
          🌐 儲存網頁
        </button>
        <button
          onClick={onRestart}
          className="bg-[#5cb85c] text-white rounded-full px-5 py-2 text-sm hover:bg-[#4caa4c] transition-colors cursor-pointer"
        >
          重新開始新的題目
        </button>
      </div>
    </div>
  );
}
