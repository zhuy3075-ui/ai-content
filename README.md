# AI Content

AI Content 是一个本地部署的内容生产后台，包含素材采集、选题挖掘、文章生成、图文管理、发布账号配置和模型配置。当前版本仅保留浅色界面，登录页和模型设置页已针对可读性与安全性做过整理。

## 功能范围

- 素材管理：采集、筛选、查看、批量删除素材。
- 选题管理：基于素材生成候选选题和商业转化分析。
- 文章管理：生成文章、小红书笔记、封面图和正文配图。
- 模板与风格：维护文章模板、写作风格和内容策略。
- 模型配置：支持平台预设、DeepSeek 在线拉取模型列表、模型批量导入和默认模型分配。
- 发布配置：发布账号需要显式填写第三方 API 地址，不再内置默认外链。

## 目录结构

```text
.
├── backend          # NestJS API、Prisma、队列与后台任务
├── frontend         # Next.js 管理后台
├── scripts          # 初始化与首轮检查脚本
├── docker-compose.yml
└── LICENSE
```

## 本地部署

### 1. 获取代码

```bash
git clone https://github.com/zhuy3075-ui/ai-content.git
cd ai-content
```

### 2. 启动数据库和 Redis

```bash
docker compose up -d postgres redis
```

默认开发数据库连接为：

```text
postgresql://postgres:postgres@localhost:5432/ai_content
```

### 3. 配置并启动后端

```bash
cd backend
cp .env.example .env
npm ci
npm run db:init
npm run db:bootstrap-admin -- --username admin --password '<至少8位密码>' --email admin@example.com --name 管理员
npm run start:dev
```

后端默认监听 `3001` 端口。开发环境默认开放 Swagger；生产环境默认关闭，只有设置 `ENABLE_SWAGGER=true` 才会启用。

### 4. 配置并启动前端

另开一个终端：

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

前端默认监听 `3000` 端口，`.env.example` 中的 `NEXT_PUBLIC_API_BASE` 指向本机后端。

### 5. 首次运行检查

```bash
./scripts/check-first-run.sh
```

检查项包括管理员账号、AI 平台、AI 模型、默认模型和信息源配置。

## 模型配置

1. 登录后台后进入「配置管理」。
2. 在「AI 平台」中点击预设平台，选择 DeepSeek、OpenAI 兼容平台或自定义平台。
3. 填写平台名称、Base URL 和 API Key。平台列表只显示脱敏后的密钥，不会把明文密钥返回前端。
4. 在「AI 模型」中点击「在线拉取模型」，选择已配置 API Key 的平台。
5. DeepSeek 等 OpenAI 兼容平台会由后端调用 `/models`，前端只接收模型 ID 列表。
6. 勾选模型并批量导入；已存在的模型会自动跳过。
7. 在「默认模型」中为文章创作、选题推荐等功能分配模型。

## 生产环境注意事项

- 不要提交 `.env`、数据库备份、API Key 或 Cookie。
- 生产环境必须显式设置 `CORS_ORIGIN`，不再默认放行本地调试地址。
- 生产环境 Swagger 默认关闭。如需临时排查，设置 `ENABLE_SWAGGER=true` 后再开启，并在排查后关闭。
- 后台没有默认管理员。必须用初始化脚本创建首个账号。
- 登录失败按 `IP + username` 做 15 分钟 5 次失败限流。
- API Key 只在创建或更新时写入后端；更新平台时留空会保留旧密钥。

## 常用命令

```bash
# 后端
cd backend
npm test -- --runInBand --forceExit
npm run build
npm audit --omit=dev

# 前端
cd frontend
npm run lint
npm run build
npm audit --omit=dev
```

## 许可

分发或二次开发时请保留仓库中的 `LICENSE` 文件。
