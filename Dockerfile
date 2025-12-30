# ===== Base =====
FROM oven/bun:1.3.5 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

# ===== Development =====
FROM base AS dev
ENV NODE_ENV=development
COPY ./src ./src
EXPOSE 3002
CMD ["bun", "run", "src/index.ts"]

# ===== Build =====
FROM base AS build
ENV NODE_ENV=production
COPY ./src ./src

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --outfile server \
  src/index.ts

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --outfile healthcheck \
  src/healthcheck.ts

# ===== Production =====
FROM gcr.io/distroless/base AS prod
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/server ./server
COPY --from=build /app/healthcheck ./healthcheck

EXPOSE 3002
CMD ["./server"]
