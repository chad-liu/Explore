'use client';

import { useEffect, useRef } from 'react';
import { Message } from './hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import TopicCard from './TopicCard';
import InputArea from './InputArea';

interface Props {
  messages: Message[];
  isStreaming: boolean;
  topicConfirmed: boolean;
  confirmedTopic: string;
  onRestart: () => void;
  onSaveTxt: () => void;
  onSaveHtml: () => void;
  onSend: (text: string) => void;
  inputDisabled: boolean;
}

export default function ChatContainer({
  messages,
  isStreaming,
  topicConfirmed,
  confirmedTopic,
  onRestart,
  onSaveTxt,
  onSaveHtml,
  onSend,
  inputDisabled,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, topicConfirmed]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[700px] mx-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((msg, idx) =>
          msg.role === 'ai' && msg.content === '' && idx === messages.length - 1 ? (
            <TypingIndicator key={msg.id} />
          ) : (
            <MessageBubble key={msg.id} message={msg} />
          )
        )}
        {topicConfirmed && (
          <TopicCard
            topic={confirmedTopic}
            onSaveTxt={onSaveTxt}
            onSaveHtml={onSaveHtml}
            onRestart={onRestart}
          />
        )}
        {!topicConfirmed && (
          <InputArea onSend={onSend} disabled={inputDisabled} />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
