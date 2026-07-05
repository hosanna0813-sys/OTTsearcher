/**
 * Express 進入點。
 * - 開發模式：只提供 /api，前端由 Vite dev server（proxy /api）負責
 * - production（Render）：同時 serve client/dist 靜態檔與 SPA fallback
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';

// 讀取 repo 根目錄的 .env（dev: server/src/../../，prod: server/dist/../../）
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import apiRouter from './routes/api';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.disable('x-powered-by');

app.use('/api', apiRouter);

// production：serve 前端 build 產物
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  // SPA fallback：非 /api 的路徑一律回 index.html，讓 React Router 接手
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 兜底錯誤處理：不讓未預期錯誤弄掛整個服務
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: '目前暫時無法取得資料，請稍後再試。' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  if (!process.env.TMDB_API_KEY) {
    console.warn('⚠️  尚未設定 TMDB_API_KEY，API 將回傳錯誤。請參考 .env.example 設定。');
  }
});
