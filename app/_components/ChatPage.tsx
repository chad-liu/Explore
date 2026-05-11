'use client';

import { useChat } from './hooks/useChat';
import ChatHeader from './ChatHeader';
import ProgressBar from './ProgressBar';
import ChatContainer from './ChatContainer';

export default function ChatPage() {
  const {
    messages,
    isStreaming,
    stepCount,
    topicConfirmed,
    sendMessage,
    restartChat,
    saveConversation,
  } = useChat();

  return (
    <div className="h-screen flex flex-col bg-[#f0f4f8] overflow-hidden">
      <div className="flex-none">
        <ChatHeader onSave={saveConversation} />
        <ProgressBar stepCount={stepCount} />
      </div>
      <ChatContainer
        messages={messages}
        isStreaming={isStreaming}
        topicConfirmed={topicConfirmed}
        onRestart={restartChat}
        onSave={saveConversation}
        onSend={sendMessage}
        inputDisabled={isStreaming || topicConfirmed}
      />
    </div>
  );
}
