import { Message } from './hooks/useChat';

interface Props {
  message: Message;
}

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

export default function MessageBubble({ message }: Props) {
  const isAI = message.role === 'ai';

  return (
    <div className={`flex gap-2.5 animate-fadeIn ${isAI ? '' : 'flex-row-reverse'}`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
          isAI ? 'bg-[#4a90d9]' : 'bg-[#5cb85c]'
        }`}
      >
        {isAI ? '🤖' : '🙋'}
      </div>
      <div
        className={`max-w-[78%] px-4 py-3 rounded-[18px] text-[0.95rem] leading-relaxed ${
          isAI
            ? 'bg-white shadow-sm text-gray-800 rounded-bl-[4px]'
            : 'bg-[#4a90d9] text-white rounded-br-[4px]'
        }`}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
      />
    </div>
  );
}
