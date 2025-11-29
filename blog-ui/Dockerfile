# =================================
# DeepVeir Blog - Frontend Dockerfile
# =================================
# 多阶段构建：依赖安装 + 构建 + 运行

# ---- 依赖阶段 ----
FROM node:18-alpine AS deps

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci --only=production=false

# ---- 构建阶段 ----
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量（构建时）
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 构建应用
RUN npm run build

# ---- 运行阶段 ----
FROM node:18-alpine AS runner

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置文件所有者
RUN chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
