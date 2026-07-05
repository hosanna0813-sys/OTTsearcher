# 台灣 OTT 搜尋平台

搜尋電影與影集，在台灣哪裡可以看。

輸入片名、影集名或關鍵字，系統透過 [TMDB API](https://www.themoviedb.org/)（查詢地區固定為 `TW`）顯示該作品目前在台灣可觀看的 OTT 平台（Netflix、Disney+、CATCHPLAY+、friDay 影音、MyVideo、Hami Video、KKTV、LINE TV…等）。

- ✅ 不使用爬蟲
- ✅ 不登入任何 OTT 平台
- ✅ API Key 只存在後端，前端不直接呼叫 TMDB
- ✅ 手機版體驗優先、簡約設計
- ✅ 可一鍵部署到 Render

---

## 功能列表

- 🔍 搜尋電影與影集（支援中文片名、英文片名、部分關鍵字）
- 🎬 搜尋結果卡片：海報、中英文名稱、年份、電影／影集標示、TMDB 評分、簡介、台灣可觀看平台摘要
- 📄 作品詳細頁：劇情介紹、類型、片長／季數集數、主要演員、導演／創作者、YouTube 預告片
- 📺 台灣 OTT 平台依「訂閱觀看／免費觀看／租借／購買」分類顯示，含平台 Logo 與前往觀看連結
- ⚡ 效能：後端 API 快取、前端快取與重複請求去重、搜尋 debounce、圖片 lazy loading
- 🛡️ 狀態處理：Loading Skeleton、「找不到符合的作品」、「目前暫時無法取得資料，請稍後再試。」

## 技術架構

| 層 | 技術 |
|---|---|
| 前端 | React 18 + Vite 5 + TypeScript + Tailwind CSS + React Router |
| 後端 | Node.js + Express 4 + TypeScript |
| 資料來源 | TMDB API（Search / Movie & TV Details / Watch Providers / Videos / Credits / Images） |
| 部署 | Render Web Service（單一服務：Express 同時提供 `/api` 與前端靜態檔） |

```
/
├── client/          # React + Vite 前端
│   └── src/
│       ├── components/   # SearchBar、ResultCard、ProviderSection…
│       ├── pages/        # 首頁、搜尋頁、詳細頁
│       ├── services/     # /api 存取層（含快取）
│       ├── hooks/        # useDebounce
│       ├── types/        # API 回應型別
│       └── styles/
├── server/          # Express 後端（TMDB 代理）
│   └── src/
│       ├── routes/       # /api/search、/api/movie/:id、/api/tv/:id
│       ├── services/     # TMDB 存取與資料轉換
│       ├── types/
│       └── utils/        # 記憶體 TTL 快取
├── render.yaml      # Render Blueprint
├── package.json     # root scripts
├── .env.example
└── README.md
```

架構重點：前端只呼叫自家後端的 `/api/*`，所有 TMDB 請求（含 API Key）都在後端完成，Key 不會外洩到瀏覽器。

## 本機安裝方式

需求：Node.js 18.18 以上（建議 20+）與 npm。

```bash
# 1. 取得程式碼
git clone https://github.com/<你的帳號>/OTTsearcher.git
cd OTTsearcher

# 2. 安裝根目錄工具（concurrently）
npm install

# 3. 安裝前後端相依套件
npm run install:all

# 4. 設定環境變數（見下方「.env 設定方式」）
cp .env.example .env
# 編輯 .env，填入你的 TMDB_API_KEY
```

## 本機啟動方式

```bash
# 同時啟動後端（http://localhost:3001）與前端（http://localhost:5173）
npm run dev
```

打開 <http://localhost:5173> 即可使用。Vite dev server 會自動把 `/api` 轉發到後端。

其他常用指令：

```bash
npm run build   # 建置前後端（Render 也用這個指令）
npm start       # 以 production 模式啟動（需先 build；由 Express 直接服務前端）
npm run lint    # ESLint 檢查前後端
```

## 如何申請 TMDB API Key

1. 到 <https://www.themoviedb.org/signup> 註冊帳號（免費）
2. 登入後進入 [設定 → API](https://www.themoviedb.org/settings/api)
3. 點「Create」申請 Developer API Key，用途選擇個人／學習用途即可
4. 填寫基本資料送出後，即可在同一頁看到：
   - **API Key（v3 auth）**：一串 32 字元英數字
   - **API Read Access Token（v4 auth）**：`eyJ` 開頭的長字串
5. 兩種都可以填入 `TMDB_API_KEY`，本專案會自動判斷格式

## .env 設定方式

複製範本並填入金鑰：

```bash
cp .env.example .env
```

`.env` 內容：

```env
TMDB_API_KEY=你的_TMDB_API_KEY
NODE_ENV=development
```

注意事項：

- `.env` 已列入 `.gitignore`，**不會**（也不可以）被 commit 到 GitHub
- API Key 只會被後端讀取，不會出現在前端程式碼或瀏覽器中

## GitHub 上傳方式

```bash
# 在 GitHub 建立新 repository 後：
git init
git add .
git commit -m "台灣 OTT 搜尋平台 V1.0"
git branch -M main
git remote add origin https://github.com/<你的帳號>/OTTsearcher.git
git push -u origin main
```

## Render 部署方式

本專案使用單一 **Web Service**（後端同時服務前端靜態檔）。

### 方式一：Blueprint（推薦，讀取 render.yaml）

1. 把專案推上 GitHub（見上一節）
2. 登入 [Render](https://render.com/)，點 **New → Blueprint**
3. 連結你的 GitHub repository，Render 會自動讀取根目錄的 `render.yaml`
4. 部署前 Render 會要求填入環境變數 **`TMDB_API_KEY`**（`sync: false` 的欄位），貼上你的金鑰
5. 按下 **Apply**，Render 會自動執行 build 與 start
6. 完成後 Render 會提供公開網址（例如 `https://taiwan-ott-searcher.onrender.com`）

### 方式二：手動建立 Web Service

1. Render Dashboard → **New → Web Service**，連結 GitHub repository
2. 設定：
   - **Runtime**：Node
   - **Build Command**：`npm run build`
   - **Start Command**：`npm start`
3. 在 **Environment** 加入：
   - `TMDB_API_KEY` = 你的金鑰
   - `NODE_ENV` = `production`
4. 按 **Create Web Service** 開始部署

> 免費方案（free plan）的服務閒置一段時間後會休眠，下次開啟需等待數十秒喚醒，屬正常現象。

## 常見錯誤排除

| 症狀 | 原因與解法 |
|---|---|
| 頁面顯示「目前暫時無法取得資料」，後端 log 出現「尚未設定 TMDB_API_KEY」 | 沒有設定環境變數。本機：確認根目錄有 `.env` 且已填 key；Render：到服務的 Environment 頁面補上 `TMDB_API_KEY` 後重新部署 |
| 後端 log 出現「TMDB API Key 無效」 | Key 貼錯或多了空白。重新從 TMDB 設定頁複製；v3 Key 與 v4 Token 都支援 |
| 本機 `npm run dev` 前端打 `/api` 回 500/ECONNREFUSED | 後端沒起來（通常是 3001 被占用）。關掉占用 3001 的程式，或設 `PORT` 後同步修改 `client/vite.config.ts` 的 proxy |
| Render build 失敗 | 查看 build log。常見原因：Node 版本過舊（本專案需 18.18+，Render 預設已符合）、`render.yaml` 被改壞 |
| Render 部署成功但打開網頁 404 | Start Command 必須是 `npm start`（會執行 `node server/dist/index.js` 並服務 `client/dist`），且 Build Command 必須是 `npm run build` |
| 搜尋結果的平台是空的 | 該作品目前在 TMDB/JustWatch 資料庫中沒有台灣上架資訊，屬正常情況，會顯示「目前未找到台灣串流平台資訊」 |
| 部署後第一次開很慢 | Render 免費方案休眠喚醒中，等待數十秒即可 |

## 資料來源與版權

- 影片資料與圖片來自 [TMDB](https://www.themoviedb.org/)；本產品使用 TMDB API 但未經 TMDB 背書或認證
- 觀看平台資料由 TMDB 整合 [JustWatch](https://www.justwatch.com/) 提供，實際上架情況可能隨時變動

## V1.0 範圍說明

本版為 MVP，暫不包含：使用者登入、收藏片單、會員系統、付費功能、廣告、多國切換、AI 推薦、即將下架通知、自建資料庫、OTT 爬蟲。
