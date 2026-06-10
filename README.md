# check-banwords

电商违禁词检测工具，支持淘宝、拼多多、抖音、小红书多平台检测。前端使用 Next.js 14 App Router、TypeScript、Tailwind CSS 和 shadcn/ui 风格组件，后端通过 `/api/detect` 调用 OpenAI 兼容接口，默认可配置为 DeepSeek。

## 本地运行

1. 安装 Node.js 18.18 或更高版本。
2. 安装依赖：

```bash
npm install
```

3. 复制环境变量文件：

```bash
cp .env.example .env.local
```

4. 在 `.env.local` 中填写。DeepSeek 示例：

```bash
AI_API_KEY=sk-your-deepseek-api-key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-v4-flash
```

5. 启动开发服务器：

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 可用脚本

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
```

## API

`POST /api/detect`

请求体：

```json
{
  "text": "用户粘贴的文案",
  "platforms": ["taobao", "pdd"]
}
```

返回：

```json
{
  "riskLevel": "high",
  "totalWords": 20,
  "violationCount": 1,
  "violations": [
    {
      "word": "最好",
      "type": "极限词",
      "reason": "绝对化用语，存在违规风险",
      "suggestion": "很不错",
      "position": 4
    }
  ],
  "optimizedText": "替换后的合规文案"
}
```

## 部署到 Vercel

1. 将 `check-banwords` 推送到 GitHub 仓库。
2. 登录 [Vercel](https://vercel.com)，选择 `Add New Project`。
3. 导入 GitHub 仓库。
4. Framework Preset 选择 `Next.js`。
5. 在 `Environment Variables` 中添加：

```bash
AI_API_KEY=sk-your-deepseek-api-key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-v4-flash
```

6. 点击 `Deploy`。
7. 部署完成后，在 Vercel 项目的 `Settings -> Environment Variables` 中确认生产、预览、开发环境都配置了 `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`。
8. 后续推送到主分支后，Vercel 会自动重新部署。
