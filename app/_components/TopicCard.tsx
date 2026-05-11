interface Props {
  lastAiMessage: string;
  onSave: () => void;
  onRestart: () => void;
}

function extractTopic(text: string): string {
  const lines = text.split('\n').filter(l => l.trim());
  const found = lines.find(
    l =>
      l.includes('？') &&
      (l.includes('影響') ||
        l.includes('原因') ||
        l.includes('如何') ||
        l.includes('差異') ||
        l.includes('為什麼') ||
        l.includes('變化'))
  );
  return (found ?? lines[lines.length - 2] ?? '你的探究題目')
    .replace(/[「」『』【】]/g, '')
    .trim();
}

export default function TopicCard({ lastAiMessage, onSave, onRestart }: Props) {
  const topic = extractTopic(lastAiMessage);

  return (
    <div className="bg-gradient-to-br from-[#f0fff4] to-[#e6f4ea] border-2 border-[#5cb85c] rounded-2xl p-5 my-2 animate-fadeIn">
      <h3 className="text-[#3a7d44] font-semibold mb-2">✅ 你的探究題目確認完成！</h3>
      <p className="text-[#2d6a4f] font-bold text-[1.05rem] leading-relaxed">{topic}</p>
      <div className="mt-3.5 flex gap-2 flex-wrap">
        <button
          onClick={onSave}
          className="bg-[#4a90d9] text-white rounded-full px-5 py-2 text-sm hover:bg-[#357abd] transition-colors cursor-pointer"
        >
          💾 儲存對話記錄
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
