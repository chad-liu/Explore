'use client';

import { useState, useRef, useCallback } from 'react';

export type Role = 'ai' | 'user';

export interface Message {
  id: string;
  role: Role;
  content: string;
}

const WELCOME_MESSAGE = `你好！我是你的探究題目小幫手 😊

我會陪你一步一步，把你感興趣的方向，變成一個適合深入研究的探究問題。

整個過程大約 5~10 分鐘，我會問你幾個問題，幫助你找到最棒的題目！

先告訴我：**你對什麼主題感興趣，或是有什麼想研究的方向？**（不用想太多，任何想法都可以說說看）`;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'ai', content: WELCOME_MESSAGE },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  const [topicConfirmed, setTopicConfirmed] = useState(false);

  // useRef avoids stale closure during async SSE reads
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    conversationHistory.current.push({ role: 'user', content: text });
    setStepCount(prev => Math.min(prev + 1, 5));
    setIsStreaming(true);

    // Insert empty AI message — ChatContainer renders it as TypingIndicator
    const aiMsgId = `ai-${Date.now() + 1}`;
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory.current }),
      });

      if (!response.ok || !response.body) throw new Error('伺服器錯誤');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.text) {
              fullText += data.text;
              setMessages(prev =>
                prev.map(m => (m.id === aiMsgId ? { ...m, content: fullText } : m))
              );
            }

            if (data.done) {
              const cleanText = fullText.replace('[探究題目確認完成]', '').trim();
              setMessages(prev =>
                prev.map(m => (m.id === aiMsgId ? { ...m, content: cleanText } : m))
              );
              conversationHistory.current.push({ role: 'assistant', content: cleanText });

              if (data.topicConfirmed) {
                setTimeout(() => setTopicConfirmed(true), 500);
              }
            }

            if (data.error) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMsgId ? { ...m, content: data.error as string } : m
                )
              );
            }
          } catch {
            // ignore JSON parse errors
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: '抱歉，發生了一些問題，請重新整理頁面後再試試看 🙏' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const restartChat = useCallback(() => {
    conversationHistory.current = [];
    setMessages([{ id: 'welcome', role: 'ai', content: WELCOME_MESSAGE }]);
    setStepCount(1);
    setTopicConfirmed(false);
    setIsStreaming(false);
  }, []);

  const saveConversation = useCallback(() => {
    if (conversationHistory.current.length === 0) {
      alert('目前沒有對話可以儲存。');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let content = `探究題目引導對話記錄\n日期：${dateStr} ${timeStr}\n${'='.repeat(40)}\n\n`;
    conversationHistory.current.forEach(msg => {
      const role = msg.role === 'user' ? '【學生】' : '【AI老師】';
      content += `${role}\n${msg.content}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `探究題目對話_${dateStr}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  return { messages, isStreaming, stepCount, topicConfirmed, sendMessage, restartChat, saveConversation };
}
