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
    confirmedTopic,
    sendMessage,
    restartChat,
    saveTxt,
    saveHtml,
  } = useChat();

  return (
    <div className="h-screen flex flex-col bg-[#f0f4f8] overflow-hidden">
      <div className="flex-none">
        <ChatHeader onSaveTxt={saveTxt} onSaveHtml={saveHtml} />
        <ProgressBar stepCount={stepCount} />
      </div>
      <ChatContainer
        messages={messages}
        isStreaming={isStreaming}
        topicConfirmed={topicConfirmed}
        confirmedTopic={confirmedTopic}
        onRestart={restartChat}
        onSaveTxt={saveTxt}
        onSaveHtml={saveHtml}
        onSend={sendMessage}
        inputDisabled={isStreaming || topicConfirmed}
      />
    </div>
  );
}
