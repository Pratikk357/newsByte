# One image, two processes: the REST API (dist/main) and the
# RabbitMQ consumer (dist/rabbit-mq). docker-compose.yml picks the command.
FROM node:20-alpine

# Prisma's query engine needs OpenSSL on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

ENV PRISMA_HIDE_UPDATE_MESSAGE=1

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate && pnpm run build

EXPOSE 3000

CMD ["node", "dist/main"]
