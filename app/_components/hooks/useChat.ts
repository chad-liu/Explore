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

// ── helpers ──────────────────────────────────────────────

export function extractTopicFromText(text: string): string {
  const lines = text.split('\n').filter(l => l.trim());
  const found = lines.find(l =>
    l.includes('？') &&
    (l.includes('影響') || l.includes('原因') || l.includes('如何') ||
     l.includes('差異') || l.includes('為什麼') || l.includes('變化'))
  );
  return (found ?? lines[lines.length - 2] ?? '探究題目')
    .replace(/[「」『』【】*]/g, '')
    .trim();
}

function buildFilename(topic: string, date: string, ext: string): string {
  const safe = topic.replace(/[\\/:*?"<>|]/g, '').slice(0, 30);
  return `${safe || '探究題目'}_${date}.${ext}`;
}

function markdownToHtml(text: string): string {
  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // markdown table → <table>
  html = html.replace(/(\|.+\|\r?\n)+/g, match => {
    const rows = match.trim().split('\n').filter(r => !/^\|[-| :]+\|$/.test(r.trim()));
    if (rows.length === 0) return match;
    const [header, ...body] = rows;
    const ths = header.split('|').filter(Boolean).map(c => `<th>${c.trim()}</th>`).join('');
    const trs = body.map(r =>
      '<tr>' + r.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
    ).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });

  return html.replace(/\n/g, '<br>');
}

function dateNow() {
  const now = new Date();
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return { dateStr: d, timeStr: t };
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── hook ─────────────────────────────────────────────────

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'ai', content: WELCOME_MESSAGE },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  const [topicConfirmed, setTopicConfirmed] = useState(false);
  const [confirmedTopic, setConfirmedTopic] = useState('');

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
                const topic = extractTopicFromText(cleanText);
                setTimeout(() => {
                  setTopicConfirmed(true);
                  setConfirmedTopic(topic);
                }, 500);
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
    setConfirmedTopic('');
    setIsStreaming(false);
  }, []);

  const saveTxt = useCallback(() => {
    if (conversationHistory.current.length === 0) {
      alert('目前沒有對話可以儲存。');
      return;
    }
    const { dateStr, timeStr } = dateNow();
    let content = `探究題目引導對話記錄\n日期：${dateStr} ${timeStr}\n${'='.repeat(40)}\n\n`;
    conversationHistory.current.forEach(msg => {
      const role = msg.role === 'user' ? '【學生】' : '【AI老師】';
      content += `${role}\n${msg.content}\n\n`;
    });
    triggerDownload(content, buildFilename(confirmedTopic, dateStr, 'txt'), 'text/plain;charset=utf-8');
  }, [confirmedTopic]);

  const saveHtml = useCallback(() => {
    if (conversationHistory.current.length === 0) {
      alert('目前沒有對話可以儲存。');
      return;
    }
    const { dateStr, timeStr } = dateNow();
    const title = confirmedTopic || '探究題目對話記錄';

    const messagesHtml = conversationHistory.current.map(msg => {
      const isAI = msg.role === 'assistant';
      const roleLabel = isAI ? '🤖 AI老師' : '🙋 學生';
      const roleClass = isAI ? 'ai' : 'user';
      const contentHtml = isAI ? markdownToHtml(msg.content) : msg.content.replace(/\n/g, '<br>');
      return `
  <div class="msg ${roleClass}">
    <div class="role">${roleLabel}</div>
    <div class="content">${contentHtml}</div>
  </div>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif;
           max-width: 700px; margin: 0 auto; padding: 20px 16px;
           background: #f0f4f8; color: #333; }
    h1 { font-size: 1.3rem; color: #2d6a4f; margin-bottom: 4px; }
    .meta { font-size: .85rem; color: #888; margin-bottom: 16px; }
    .msg { margin-bottom: 16px; }
    .role { font-size: .8rem; font-weight: bold; margin-bottom: 4px; }
    .ai .role  { color: #4a90d9; }
    .user .role { color: #5cb85c; }
    .content { background: white; padding: 14px 16px; border-radius: 12px;
               line-height: 1.7; border-left: 4px solid; }
    .ai .content   { border-color: #4a90d9; }
    .user .content { border-color: #5cb85c; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background: #f0f4f8; font-weight: bold; }
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 12px 0; }
    h1, h2, h3 { margin: 8px 0 4px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">探究題目引導對話記錄｜日期：${dateStr} ${timeStr}</p>
  <hr>
${messagesHtml}
</body>
</html>`;

    triggerDownload(html, buildFilename(confirmedTopic, dateStr, 'html'), 'text/html;charset=utf-8');
  }, [confirmedTopic]);

  return { messages, isStreaming, stepCount, topicConfirmed, confirmedTopic, sendMessage, restartChat, saveTxt, saveHtml };
}
