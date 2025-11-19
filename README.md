# meeting_fe · TransNote AI 前端

一个基于 React + Vite 的语音转录与任务管理前端。支持本地与 Vercel 部署；提供无后端依赖的 Mock 登录/注册/验证码，便于快速联调与演示。

## 技术栈
- React 18、React Router
- Vite 6、TypeScript
- Zustand 状态管理
- Axios 请求与拦截器
- React Hook Form 表单、Sonner 提示
- Recharts 图表
- js-cookie、crypto-js、jsencrypt
- Tailwind CSS（样式）

## 快速开始
1. 安装依赖
   ```bash
   npm install
   ```
2. 本地开发（启用 Mock 登录）
   ```bash
   VITE_USE_MOCK=true npm run dev
   ```
   访问：`http://localhost:5173/`
3. 构建与本地预览
   ```bash
   npm run build
   npm run preview
   ```

## Mock 说明
- 目的：在没有后端的情况下完成登录/注册与邮箱验证码流程
- 开关：
  - 本地：`VITE_USE_MOCK=true`
  - Vercel：自动检测 `*.vercel.app` 域名并启用 Mock
  - 自定义域名部署到 Vercel：在项目环境变量设置 `VITE_USE_MOCK=true`
- 行为覆盖：
  - 登录：短路返回 `access_token` 与 `refresh_token`
  - 注册：直接返回成功并跳转登录
  - 邮箱验证码：返回 60 秒倒计时与过期时间
- 示例账户：
  - 用户名：`mockuser`
  - 密码：`Test12345`

## 部署到 Vercel
- 导入仓库：`kingming-sun/meeting_fe`
- 框架：`Vite`
- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量（可选）：
  - `VITE_USE_MOCK=true`（自定义域名时启用 Mock）
  - `VITE_API_BASE_URL`（接入真实后端时配置，如 `https://api.example.com/api/v1`）

## 环境变量
- `VITE_API_BASE_URL`：后端 API 基地址，默认 `http://localhost:3000/api/v1`
- `VITE_USE_MOCK`：是否启用 Mock（`true`/`false`）

## 认证与拦截
- Axios 客户端与拦截器：`src/services/api.ts`
  - `baseURL` 从 `VITE_API_BASE_URL` 读取；未设置时默认 `http://localhost:3000/api/v1`
  - 请求拦截器：如存在 `access_token`，注入 `Authorization: Bearer <token>`
  - 响应拦截器：`401` 清理 Cookies 并跳转 `/login`
- 认证服务：`src/services/auth.ts`
  - Mock 开关与自动检测：根据 `VITE_USE_MOCK` 或 `vercel.app` 主机启用
  - `login`：Mock 模式直接生成令牌并写入 Cookies；真实模式先获取公钥加密密码后再登录
  - `register`：Mock 模式返回成功；真实模式按接口注册
  - `sendEmailCode`：Mock 模式返回倒计时与过期时间
- 页面调用：
  - 登录页：`src/pages/Login.tsx`
  - 注册页：`src/pages/Register.tsx`

## 开发脚本
- `npm run dev`：开发服务器
- `npm run build`：编译产物到 `dist`
- `npm run preview`：本地预览构建产物
- `npm run lint`：ESLint 检查
- `npm run check`：TypeScript 项目检查

## 目录结构（关键文件）
```
src/
  services/
    api.ts        # Axios 实例与拦截器
    auth.ts       # 认证服务与 Mock 开关
  pages/
    Login.tsx     # 登录页
    Register.tsx  # 注册页
    Dashboard.tsx # 仪表盘（如有）
  store/          # Zustand 状态
  App.tsx         # 路由与守卫
```

## 接入真实后端
1. 在 Vercel 或本地环境配置：`VITE_USE_MOCK=false`
2. 设置 `VITE_API_BASE_URL` 指向后端，如 `https://api.example.com/api/v1`
3. 后端需提供：
   - `GET /auth/crypto/public-key` 获取 RSA 公钥
   - `POST /auth/login` 使用加密后的密码登录
   - `POST /auth/register` 用户注册
   - `POST /auth/send-email-code` 发送邮箱验证码

## 常见问题
- 登录失败：检查是否启用 Mock；密码需 ≥ 8 位（前端校验）
- 刷新后登录态丢失：依赖 Cookies 中的 `access_token`；如浏览器禁用了 Cookie，需启用后重试

## 许可证
本项目用于演示与交接，未附加开源许可证。若需开源发布请补充许可证文件。
