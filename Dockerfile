FROM node:20.19-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN corepack enable \
  && corepack prepare pnpm@8.15.5 --activate \
  && pnpm install --frozen-lockfile

RUN pnpm prisma:generate

COPY tsconfig.json ./
COPY src ./src

RUN pnpm build \
  && pnpm prune --prod

FROM node:20.19-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]
