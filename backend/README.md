# AI Content Backend

后端基于 NestJS、Prisma、PostgreSQL 和 Redis，提供认证、素材采集、选题、文章、模型配置、发布配置和对象存储接口。

## 环境变量

复制示例文件：

```bash
cp .env.example .env
```

主要变量：

```text
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_content
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
ENABLE_SWAGGER=false
AUTH_COOKIE_NAME=ai_content_session
AUTH_SESSION_DAYS=14
```

生产环境建议：

- `NODE_ENV=production`
- `CORS_ORIGIN` 只填写真实前端域名
- `ENABLE_SWAGGER=false`
- 使用强数据库密码和独立 Redis 实例

## 初始化

```bash
npm ci
npm run db:init
npm run db:bootstrap-admin -- --username admin --password '<至少8位密码>' --email admin@example.com --name 管理员
npm run setup:check
```

`db:bootstrap-admin` 只允许在系统没有任何用户时创建首个后台账号。

## 启动

```bash
npm run start:dev
```

构建生产包：

```bash
npm run build
npm run start:prod
```

## 模型接口

- `GET /api/ai-platforms/presets`：返回平台、协议和能力预设，不包含密钥。
- `GET /api/ai-platforms/:id/remote-models`：使用后端保存的密钥拉取远端模型列表。
- `POST /api/ai-models/bulk`：批量导入模型，已存在的 `(platformId, modelId)` 会跳过。

平台列表和模型列表中的平台对象只返回 `hasApiKey` 和 `apiKeyMasked`。更新平台时如果 `apiKey` 为空字符串，后端会保留原密钥。

## 安全默认值

- 全局 `ValidationPipe` 开启 `whitelist` 和 `forbidNonWhitelisted`。
- 登录失败按 `IP + username` 做 15 分钟 5 次失败限流。
- 生产环境 Swagger 默认关闭，需显式设置 `ENABLE_SWAGGER=true`。
- 生产环境 CORS 不再默认放行本地调试地址。
- 发布账号不再内置默认第三方 API 地址，必须由用户显式配置。

## 验证命令

```bash
npm test -- --runInBand --forceExit
npm run build
npm audit --omit=dev
```

`--forceExit` 用于规避原有测试中的开放句柄等待；测试断言本身应全部通过。
