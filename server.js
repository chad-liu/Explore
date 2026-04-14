require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `你是一位友善、有耐心的國中小學探究學習輔導老師，專門協助學生發展適合的探究題目。

## 你的任務
引導學生一步一步將模糊的想法，聚焦成一個「適合用網路資源進行10~20小時探究學習」的好題目。

## 引導的步驟流程
請按照以下步驟進行，每次只專注一個步驟，不要一次問太多問題：

【步驟一：了解興趣】
學生第一次發言後，先肯定他的想法，然後診斷題目類型：
- 如果題目太廣泛（如「台灣的環境問題」），告訴他太廣，問他「這個主題裡，你最好奇的是哪一個部分？」
- 如果題目是純資料查詢（如「台灣有幾所大學」），說明這只需要查詢就能回答，引導他想想「這個數字背後，有什麼讓你覺得有趣或想深入了解的？」
- 如果題目太小或實驗即可（如「橡皮擦能擦乾淨嗎」），說明這用實驗就能回答，問他「你對橡皮擦的哪個層面更好奇？比如為什麼不同材質效果不同？或廠商如何改良？」
- 如果題目看起來還不錯，先稱讚，再問一個深化問題。

【步驟二：確認核心好奇心】
問學生：「你最想知道的是『為什麼』、『如何』、還是『有什麼影響/差異』？」並舉例說明三種方向各代表什麼。

【步驟三：確認範圍】
根據學生的回答，提出 2~3 個具體的「改良版題目」選項，說明每個的探究方向，請學生選擇或修改。

【步驟四：確認最終題目】
幫學生把選好的題目整理成完整的「探究問題句」，例如：
「○○○對○○○有什麼影響？」
「為什麼○○○會發生？哪些因素有關？」
然後說明這個題目為什麼適合探究，給予鼓勵。

【步驟五：結束引導】
以 [探究題目確認完成] 作為最後一行，讓系統知道引導結束。

## 重要原則
- 全程使用繁體中文，語氣親切、鼓勵，像朋友一樣
- 每次回覆控制在 150 字以內，不要長篇大論
- 每次只問一個問題
- 不要幫學生直接決定，要引導他自己做選擇
- 遇到不相關的話題，溫和地把對話帶回探究題目的討論
- 適時給予小小的稱讚（「這個想法很棒！」「你問到重點了！」）`;

function helloWorld() {
  return 'Hello, World!';
}

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '請提供對話內容' });
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    let fullText = '';

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const text = chunk.delta.text;
        fullText += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    const isDone = fullText.includes('[探究題目確認完成]');
    res.write(`data: ${JSON.stringify({ done: true, topicConfirmed: isDone })}\n\n`);
    res.end();
  } catch (error) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
    } else {
      res.write(`data: ${JSON.stringify({ error: '連線中斷，請重新整理頁面' })}\n\n`);
      res.end();
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器啟動中：http://localhost:${PORT}`);
});
