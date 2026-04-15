# syntax=docker/dockerfile:1
# Monorepo：NestJS API（@apps/server）+ Prisma + workspace @packages/shared
# 构建上下文为仓库根目录：docker build -t zen-admin-api .

FROM node:18-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

# 先拷贝清单，利用层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/server/package.json apps/server/nest-cli.json apps/server/tsconfig.json apps/server/tsconfig.build.json ./apps/server/

RUN pnpm install --frozen-lockfile

# 源码与 Prisma schema
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# 生成 shared → Prisma Client → Nest 编译产物
RUN pnpm --filter @packages/shared build && \
    pnpm --filter @apps/server exec prisma generate && \
    pnpm --filter @apps/server build

# ------------ runtime ------------
FROM node:18-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# 仅保留构建产物与 Prisma 目录结构
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma

# 生产依赖（含 @prisma/client、@packages/shared 等）
RUN pnpm install --frozen-lockfile --prod

# prod 镜像未安装 prisma CLI，用全局 prisma 执行 generate（避免 npx 在 pnpm workspace 内调 pnpm add 失败）
ARG PRISMA_VERSION=6.19.2
RUN npm install -g prisma@${PRISMA_VERSION} && \
    cd apps/server && prisma generate && \
    npm uninstall -g prisma

WORKDIR /app/apps/server

EXPOSE 3000

# 数据库连接等请在运行时注入，例如 -e DATABASE_URL=...
CMD ["node", "dist/main.js"]
