'use client';

import { useRef, useCallback } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function InputArea({ onSend, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const text = textareaRef.current?.value.trim() ?? '';
    if (!text || disabled) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
  }, [onSend, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  };

  return (
    <div className="w-full py-2 flex gap-2.5">
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="輸入你的想法，按 Enter 送出（Shift+Enter 換行）"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="flex-1 border-[1.5px] border-[#c0ccd8] rounded-3xl px-4 py-2.5 text-[0.95rem] outline-none resize-none max-h-[120px] overflow-y-auto leading-relaxed font-[inherit] transition-colors focus:border-[#4a90d9] disabled:bg-gray-100"
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        title="送出"
        className="bg-[#4a90d9] text-white rounded-full w-11 h-11 flex items-center justify-center text-xl flex-shrink-0 transition-all hover:bg-[#357abd] hover:scale-105 disabled:bg-[#a0b8d0] disabled:cursor-not-allowed cursor-pointer"
      >
        ▶
      </button>
    </div>
  );
}
