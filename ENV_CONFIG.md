# 环境变量配置说明

## 如何配置

1. 在项目根目录创建 `.env` 文件（本地开发）
2. 在项目根目录创建 `.env.production` 文件（生产环境）
3. 复制以下配置并根据实际情况修改

## 环境变量列表

### API配置

```bash
# 后端API基础URL
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**说明**：后端服务的基础URL地址
- 开发环境示例：`http://localhost:3000/api/v1`
- 测试环境示例：`https://test-api.example.com/api/v1`
- 生产环境示例：`https://api.example.com/api/v1`

### Mock数据配置

```bash
# 是否使用Mock数据（开发环境）
VITE_USE_MOCK=false
```

**说明**：是否使用Mock数据代替真实后端接口
- `true`：使用Mock数据，不调用真实后端接口（适合前端独立开发）
- `false`：调用真实后端接口

### 应用信息

```bash
# 应用名称
VITE_APP_NAME=TransNote AI

# 应用版本
VITE_APP_VERSION=1.0.0
```

### 文件上传配置

```bash
# 单个文件最大大小（字节），默认3GB
VITE_MAX_FILE_SIZE=3221225472

# 分块上传大小（字节），默认20MB
VITE_CHUNK_SIZE=20971520
```

**说明**：
- `VITE_MAX_FILE_SIZE`：单个文件允许上传的最大大小（字节）
  - 3GB = 3 × 1024 × 1024 × 1024 = 3221225472 字节
- `VITE_CHUNK_SIZE`：大文件分块上传时每块的大小（字节）
  - 20MB = 20 × 1024 × 1024 = 20971520 字节

### 开发环境配置

```bash
# 是否启用开发工具
VITE_ENABLE_DEV_TOOLS=true

# 日志级别：debug, info, warn, error
VITE_LOG_LEVEL=info
```

## 完整配置示例

### .env（本地开发环境）

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_USE_MOCK=false
VITE_APP_NAME=TransNote AI
VITE_APP_VERSION=1.0.0
VITE_MAX_FILE_SIZE=3221225472
VITE_CHUNK_SIZE=20971520
VITE_ENABLE_DEV_TOOLS=true
VITE_LOG_LEVEL=debug
```

### .env.production（生产环境）

```bash
VITE_API_BASE_URL=https://api.transnote.ai/api/v1
VITE_USE_MOCK=false
VITE_APP_NAME=TransNote AI
VITE_APP_VERSION=1.0.0
VITE_MAX_FILE_SIZE=3221225472
VITE_CHUNK_SIZE=20971520
VITE_ENABLE_DEV_TOOLS=false
VITE_LOG_LEVEL=error
```

## 注意事项

1. **环境变量前缀**：Vite要求所有环境变量必须以 `VITE_` 开头才能在客户端代码中访问
2. **敏感信息**：不要在环境变量中存储敏感信息（如密钥、Token等）
3. **版本控制**：`.env` 文件不应提交到Git仓库，已在 `.gitignore` 中配置忽略
4. **重启服务**：修改环境变量后需要重启开发服务器才能生效

## 在代码中使用

```typescript
// 获取API基础URL
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// 获取是否使用Mock
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

// 获取应用名称
const appName = import.meta.env.VITE_APP_NAME;
```

