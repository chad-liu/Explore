export default function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fadeIn">
      <div className="w-9 h-9 rounded-full bg-[#4a90d9] flex items-center justify-center text-lg flex-shrink-0">
        🤖
      </div>
      <div className="bg-white shadow-sm rounded-[18px] rounded-bl-[4px] px-4 py-3.5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-typingBounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
